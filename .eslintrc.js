module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'airbnb-typescript/base',
  ],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-plusplus': 'off',
    'no-restricted-syntax': ['off'
    ],
    'no-param-reassign': ['off'
    ],
    'prefer-destructuring': ['off'
    ],
    'max-len': 'off',
    'import/prefer-default-export': 'off',
    'no-use-before-define': 'off',
    'space-infix-ops': 'off',
    'comma-spacing': 'off',
    'linebreak-style': 0,
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts'
        ],
      },
    },
  },
};
