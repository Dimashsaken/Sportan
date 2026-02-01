## 1. Tooling Setup
- [x] 1.1 Install ESLint and related dependencies (`eslint`, `typescript`, `@react-native/eslint-config`, etc.).
- [x] 1.2 Create `eslint.config.js` with React Native recommended rules.
- [x] 1.3 Add `"lint": "eslint ."` and `"type-check": "tsc --noEmit"` scripts to `package.json`.

## 2. CI Workflow
- [x] 2.1 Create `.github/workflows/frontend-ci.yml` to run `npm install`, `npm run lint`, and `npm run type-check` on PRs targeting `Sportan-front/**`.

## 3. Verification
- [x] 3.1 Run `npm run lint` locally to verify configuration.
- [x] 3.2 Run `npm run type-check` locally to verify configuration.
