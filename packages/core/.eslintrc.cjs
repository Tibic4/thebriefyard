module.exports = {
  root: true,
  extends: ['@briefyard/eslint-config'],
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: "MemberExpression[object.name='Math'][property.name='random']",
        message: 'Math.random is forbidden in @briefyard/core (ADR-004). Use the seeded PRNG.',
      },
    ],
  },
};
