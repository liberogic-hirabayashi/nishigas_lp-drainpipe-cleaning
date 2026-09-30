import * as astroEslintParser from 'astro-eslint-parser';
import typescriptEslintParser from '@typescript-eslint/parser';
import pluginAstro from 'eslint-plugin-astro';
import pluginImport from 'eslint-plugin-import-x';
import pluginPrettier from 'eslint-plugin-prettier';

export default [
  // jsx-a11y のルールを Astro コンポーネントに適用（eslint-plugin-jsx-a11y が必要）
  ...pluginAstro.configs['flat/jsx-a11y-recommended'],
  {
    files: ['**/*.astro'],
    plugins: {
      astro: pluginAstro,
      import: pluginImport,
      prettier: pluginPrettier,
    },
    languageOptions: {
      parser: astroEslintParser,
      parserOptions: {
        parser: typescriptEslintParser,
        extraFileExtensions: ['.astro'],
        sourceType: 'module',
      },
    },
    rules: {
      'prettier/prettier': 'warn',
      'astro/no-conflict-set-directives': 'error',
      'astro/no-unused-define-vars-in-style': 'error',
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
          pathGroupsExcludedImportTypes: ['builtin'],
          alphabetize: { order: 'asc', caseInsensitive: true },
          // 'newlines-between': 'always', // import groups の間 1行あける
          pathGroups: [
            {
              pattern: '@/lib/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '@/layouts/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '@/components/templates/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '@/components/base/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '@/components/features/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '@/components/patterns/**',
              group: 'internal',
              position: 'before',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.js'],
    // .astro 内 <script> の仮想ファイル（jsx-a11y設定のプロセッサが生成）は対象外。
    // .astro 全体は prettier-plugin-astro が script 含めて整形済みのため二重チェック不要
    ignores: ['**/*.astro/*.js'],
    plugins: {
      prettier: pluginPrettier,
    },
    languageOptions: {
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2020,
      },
    },
    rules: {
      'prettier/prettier': 'warn',
    },
  },
  {
    files: ['**/*.ts'],
    ignores: ['**/*.astro/*.ts'],
    plugins: {
      prettier: pluginPrettier,
    },
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2020,
      },
    },
    rules: {
      'prettier/prettier': 'warn',
    },
  },
  {
    ignores: ['node_modules/**', 'dist/**', '**/*.d.ts'],
  },
];
