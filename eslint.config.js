import pluginJs from '@eslint/js';
import airbnb from 'eslint-config-airbnb';
import pluginImport from 'eslint-plugin-import';
import pluginPrettier from 'eslint-plugin-prettier';
import pluginReact from 'eslint-plugin-react';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  pluginImport.flatConfigs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: {
      airbnb,
      prettier: pluginPrettier,
    },
    rules: {
      'import/no-unresolved': 'off',
      'import/order': [
        'error',
        {
          groups: [
            ['builtin', 'external'],
            'internal',
            ['parent', 'sibling', 'index'],
          ],
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          'newlines-between': 'always',
        },
      ],

      'react/jsx-indent-props': ['error', 2],

      'prettier/prettier': [
        'error',
        {
          printWidth: 80,
          singleQuote: true,
          jsxSingleQuote: false,
          trailingComma: 'all',
          bracketSameLine: false,
          endOfLine: 'lf',
        },
      ],
    },
  },

  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat['jsx-runtime'],
];
