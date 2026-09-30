module.exports = {
  extends: ['stylelint-config-standard-scss', 'stylelint-config-recess-order', 'stylelint-config-html/astro'],
  rules: {
    'at-rule-no-unknown': null,
    'at-rule-empty-line-before': null,
    'color-function-notation': 'modern',
    'custom-property-pattern': null,
    'declaration-empty-line-before': 'never',
    'function-name-case': null,
    'keyframes-name-pattern': null,
    'no-descending-specificity': null,
    'rule-empty-line-before': null,
    'selector-class-pattern': null,
    'selector-id-pattern': null,
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global'],
      },
    ],
    'scss/at-rule-no-unknown': [
      true,
      {
        // Tailwind 4 のディレクティブを許可
        ignoreAtRules: ['theme', 'plugin', 'custom-variant', 'utility', 'apply', 'layer', 'config', 'source', 'variant', 'reference'],
      },
    ],
    'custom-property-empty-line-before': null,
    'scss/at-function-pattern': null,
    'scss/comment-no-empty': null,
    'scss/double-slash-comment-whitespace-inside': 'always',
    'scss/double-slash-comment-empty-line-before': null,
    'scss/no-global-function-names': null,
    'scss/dollar-variable-pattern': null,
  },
  ignoreFiles: ['**/*.js', '**/*.ts', '**/node_modules/**'],
};
