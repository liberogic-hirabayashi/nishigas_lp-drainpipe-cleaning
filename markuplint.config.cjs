module.exports = {
  extends: ['markuplint:recommended'],
  rules: {
    'character-reference': false,
  },
  overrides: {
    '.astro$': {
      parser: '@markuplint/astro-parser',
      rules: {
        'parse-error': false,
      },
    },
  },
  nodeRules: [
    {
      selector: 'head',
      rules: {
        'permitted-contents': false,
        'required-element': false,
      },
    },
  ],
};
// module.exports = {
//   rules: { 'character-reference': false, 'parse-error': false },
//   parser: {
//     '.astro$': '@markuplint/astro-parser',
//   },
//   extends: ['markuplint:recommended'],
//   nodeRules: [
//     {
//       selector: 'head',
//       rules: {
//         'permitted-contents': false,
//         'required-element': false,
//       },
//     },
//   ],
// };
