import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';

const plugins = [
  typescript(),
];

/** @type {import('rollup').RollupOptions[]} */
const config = [
  // browser-friendly UMD build
  {
    input: 'src/index.ts',
    output: {
      name: 'microtesia',
      file: pkg.browser,
      format: 'umd',
    },
    plugins: [
      ...plugins,
    ],
  },

  // CommonJS (for Node) and ES module (for bundlers) build.
  {
    input: 'src/index.ts',
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' },
    ],
    plugins: [
      ...plugins,
    ],
  },
];
export default config;
