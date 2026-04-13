# Changelog

All notable changes to this project will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - Unreleased

### Fixed
- `input-requires-label`: no longer fires false positives on `<input type="submit">`,
  `<input type="reset">`, `<input type="button" value="...">`, and
  `<input type="image" alt="...">`. These input types derive their accessible name
  from `value` or `alt` attributes, not from `aria-label` or `<label>` association.

### Added
- Self-linting: `eslint.config.js` now applies TypeScript strict rules to the plugin's
  own source code.
- Edge case test suite: spread attributes, dynamic values, boolean JSX expressions,
  string numeric tabIndex, custom components, deep nesting.
- Multi-rule integration tests: validates rules coexist without conflict and a
  well-structured dialog component produces zero false positives.
- GitHub Actions CI: typecheck, lint, test, build across Node 18, 20, 22.
- `CHANGELOG.md` (this file).
- `homepage` and `bugs` fields in `package.json`.

### Changed
- Confidence threshold in documentation raised to 90%.
- Removed `package-lock.json` — project uses pnpm exclusively.
- Copyright year updated to 2025-2026.

## [0.1.0] - 2026-04-12

### Added
- Initial release with 10 rules (6 component pattern, 4 general interaction).
- 149 tests across unit and flintwork integration suites.
- Zero runtime dependencies.
- ESM + CJS dual output via tsup.
- ESLint 8 (legacy) and ESLint 9+ (flat config) support.
- TypeScript source with `strict: true`, `noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes`.

#### Rules
- `dialog-requires-modal` — role="dialog" must have aria-modal="true"
- `dialog-requires-title` — role="dialog" must have aria-labelledby or aria-label
- `haspopup-role-match` — aria-haspopup must be a valid ARIA value
- `tooltip-no-interactive` — role="tooltip" must not contain focusable children
- `accordion-trigger-heading` — accordion triggers must be inside headings
- `menuitem-not-button` — role="menuitem" should not be on button elements
- `focusable-has-interaction` — tabIndex={0} requires keyboard event handler
- `input-requires-label` — form inputs must have accessible labels
- `radio-group-requires-grouping` — radio buttons must be in fieldset/radiogroup
- `no-positive-tabindex` — tabIndex must not be greater than 0
