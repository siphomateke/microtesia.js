/* Copyright (c) 2017, 2018 Ricardo Gladwell */
/* Copyright (c) 2020 Sipho Mateke */

export interface Microdata {
  '_type'?: string;
  [key: string]: Microdata | string | undefined;
}

class MicrodataItem {
  properties: Microdata = {};

  constructor(node?: Element) {
    if (node?.hasAttribute('itemtype')) {
      // eslint-disable-next-line no-underscore-dangle
      this.properties._type = node.getAttribute('itemtype')?.trim();
    }
  }

  addProperty(name: string, value: unknown) {
    const oldProperty = this.properties[name];
    const p: Record<string, unknown> = {};

    if (!oldProperty) {
      p[name] = value;
    } else if (Array.isArray(oldProperty)) {
      p[name] = [value].concat(oldProperty);
    } else {
      p[name] = [value, oldProperty];
    }
    Object.assign(this.properties, p);
    return this;
  }

  toJson(): Microdata {
    return this.properties;
  }
}

function toArray(nodeList?: NodeListOf<Element> | HTMLCollection) {
  if (nodeList) {
    return Array.from(nodeList);
  }
  return [];
}

interface ParsedProperty {
  name: string;
  value?: Microdata | string;
}

function parseProperty(property: Element) {
  const p: ParsedProperty = {
    name: '',
  };
  const itemprop = property.getAttribute('itemprop');
  if (itemprop) {
    p.name = itemprop.trim();
  }

  // TODO: [breaks OCP] split into separate functions
  if (property.hasAttribute('itemscope')) {
    p.value = parseItem(property);
  } else if (property.hasAttribute('href')) {
    p.value = property.getAttribute('href')?.trim();
  } else if (property.hasAttribute('src')) {
    p.value = property.getAttribute('src')?.trim();
  } else if (property.tagName === 'DATA' && property.hasAttribute('value')) {
    p.value = property.getAttribute('value')?.trim();
  } else if (property.tagName === 'METER' && property.hasAttribute('value')) {
    p.value = property.getAttribute('value')?.trim();
  } else if (property.tagName === 'TIME' && property.hasAttribute('datetime')) {
    p.value = property.getAttribute('datetime')?.trim();
  } else {
    p.value = property.textContent?.trim();
  }

  return p;
}

function parseProperties(properties: Element[], node?: Element, item?: MicrodataItem): Microdata {
  const is: MicrodataItem = item || new MicrodataItem(node);

  const lastProperty = properties.pop();
  if (!lastProperty) {
    return is.toJson();
  }
  const property = parseProperty(lastProperty);
  const itemWithProperty = is.addProperty(property.name, property.value);
  return parseProperties(properties, undefined, itemWithProperty);
}

function findProperties(nodes: Element[], properties: Element[] = []): Element[] {
  function notItems(node: Element) {
    return !node.hasAttribute('itemscope');
  }

  function areProperties(node: Element) {
    return node.hasAttribute('itemprop');
  }

  if (nodes.length === 0) {
    return properties;
  }

  const children = nodes
    .map((node) => toArray(node.children))
    .flat();

  const foundProperties = properties.concat(children.filter(areProperties));

  return findProperties(children.filter(notItems), foundProperties);
}

function refIsValid(ref: Element | undefined | null): ref is Element {
  return ref !== undefined && ref !== null;
}

function resolveReferences(node: Element): Element[] {
  if (node.hasAttribute('itemref')) {
    const refs = node.getAttribute('itemref')?.split(' ').map((id) => {
      const ref = node.ownerDocument.getElementById(id);

      if (ref === undefined || ref === null) {
        console.error(`itemref not found for id "${id}"`);
      }

      return ref;
    });
    if (refs) {
      return (refs.filter(refIsValid)) as Element[];
    }
  }
  return [];
}

function parseItem(node: Element) {
  const nodes = [node].concat(resolveReferences(node));
  const properties = findProperties(nodes);
  return parseProperties(properties, node);
}

function areNotProperties(node: Element) {
  return !node.hasAttribute('itemprop');
}

function findRootItems(node: Element) {
  const items = toArray(node.querySelectorAll('[itemscope]'));

  if (node.hasAttribute('itemscope')) {
    items.push(node);
  }

  return items.filter(areNotProperties);
}

function typeFilter(itemtype: string) {
  return (node: Element) => node.getAttribute('itemtype')?.trim() === itemtype;
}

type Filter = (node: Element) => boolean;

function parseNodes(nodes: Element[], filter: Filter = () => true) {
  return nodes
    .map((n) => findRootItems(n).filter(filter))
    .flat()
    .map(parseItem);
}

export function parseMicrodata(html: Element | Element[], itemtype?: string): Microdata[] {
  let filter: Filter | undefined;
  if (itemtype) {
    filter = typeFilter(itemtype);
  }
  if (Array.isArray(html)) {
    return parseNodes(html, filter);
  }
  return parseNodes([html], filter);
}
