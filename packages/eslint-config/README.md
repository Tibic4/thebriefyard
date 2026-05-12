# @briefyard/eslint-config

Shared ESLint config for the thebriefyard monorepo. Extends `eslint:recommended`,
`@typescript-eslint/recommended`, `import`, and `prettier`. Bans `any`, enforces import
order, removes unused imports.

## Usage

In any package or app `.eslintrc.cjs`:

```js
module.exports = {
  root: true,
  extends: ['@briefyard/eslint-config'],
};
```
