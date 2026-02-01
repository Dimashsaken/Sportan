# Change: Add Frontend CI Pipeline

## Why
The frontend project currently lacks automated quality checks. To ensure code quality and prevent regressions, we need a Continuous Integration (CI) pipeline that runs linting and type checking on every Pull Request.

## What Changes
- **Tooling:** Add ESLint and TypeScript checking scripts to `package.json`.
- **Configuration:** Create `eslint.config.js` for React Native linting rules.
- **Workflow:** Add a GitHub Actions workflow `.github/workflows/frontend-ci.yml` that triggers on PRs affecting the `Sportan-front` directory.

## Impact
- **Modified:** `package.json`.
- **Added:** `eslint.config.js`, `.github/workflows/frontend-ci.yml`.
- **Affected Specs:** `tooling`.
