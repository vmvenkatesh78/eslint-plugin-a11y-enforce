# eslint-plugin-a11y-enforce

ESLint plugin that catches accessibility composition errors that element-level tools miss.

`eslint-plugin-jsx-a11y` checks individual elements: "does this img have alt text?" `a11y-enforce` checks how elements relate to each other: "does this trigger's `aria-haspopup` match its content's role?" "Is this accordion trigger inside a heading?"

Use both. They complement each other.

## What this catches that jsx-a11y does not

| Pattern | jsx-a11y | a11y-enforce |
|---------|----------|--------------|
| `role="dialog"` without `aria-modal="true"` | No | Yes |
| `aria-haspopup` with invalid value | No | Yes |
| Interactive elements inside `role="tooltip"` | No | Yes |
| Accordion trigger not inside a heading | No | Yes |
| `role="menuitem"` on a `<button>` | No | Yes |
| `role="dialog"` without accessible name | No | Yes |
| `tabIndex={0}` without keyboard handler | No | Yes |
| Form input without accessible label | Unreliable | Yes |
| Radio buttons without grouping container | No | Yes |
| `tabIndex` greater than 0 | Warning | Error |

## Install

```bash
npm install --save-dev eslint-plugin-a11y-enforce
```

## Usage

### ESLint 9+ (flat config)

```js
// eslint.config.js
import a11yEnforce from 'eslint-plugin-a11y-enforce';

export default [
  a11yEnforce.configs.recommended,
];
```

### ESLint 8 (legacy config)

```json
{
  "extends": ["plugin:a11y-enforce/legacy/recommended"]
}
```

## Rules

All rules are set to `error` in the recommended config.

### Component pattern rules

These validate ARIA relationships in compound components like Dialog, Menu, Select, Accordion, and Tooltip. No other public ESLint plugin checks these patterns.

#### `dialog-requires-modal`

Elements with `role="dialog"` or `role="alertdialog"` must have `aria-modal="true"`. Without it, screen readers allow users to navigate outside the dialog using virtual cursor.

```jsx
// Bad: screen reader can read content behind the dialog
<div role="dialog">Content</div>

// Good: navigation restricted to dialog
<div role="dialog" aria-modal="true" aria-labelledby="title">Content</div>
```

#### `haspopup-role-match`

`aria-haspopup` must be one of: `menu`, `listbox`, `tree`, `grid`, `dialog`, `true`, `false`. Invalid values are silently treated as `false` by browsers, meaning the popup is never announced.

```jsx
// Bad: "dropdown" is not a valid value
<button aria-haspopup="dropdown">Open</button>

// Good: matches the popup's role
<button aria-haspopup="menu">Actions</button>
```

#### `tooltip-no-interactive`

`role="tooltip"` must not contain focusable elements (buttons, links, inputs, elements with `tabIndex >= 0`). Tooltips disappear on blur, making interactive content inside them unreachable by keyboard users.

```jsx
// Bad: keyboard user cannot reach the link
<div role="tooltip"><a href="/help">Learn more</a></div>

// Good: text-only content
<div role="tooltip">Save your changes (Ctrl+S)</div>
```

#### `accordion-trigger-heading`

A `<button>` with `aria-expanded` (accordion trigger) should be inside a heading element (`h1`-`h6` or `role="heading"`). Screen reader users navigate pages by headings. Without a heading wrapper, accordion sections are invisible to heading navigation.

```jsx
// Bad: invisible to heading navigation
<div><button aria-expanded="true">Section</button></div>

// Good: discoverable via heading navigation
<h3><button aria-expanded="true">Section</button></h3>
```

#### `menuitem-not-button`

`role="menuitem"` (including `menuitemcheckbox` and `menuitemradio`) should not be on `<button>` elements. Buttons have an implicit "button" role, causing some screen readers to double-announce: "button, menuitem, Edit."

```jsx
// Bad: double announcement in some screen readers
<button role="menuitem">Edit</button>

// Good: single role, programmatically focusable
<div role="menuitem" tabIndex={-1}>Edit</div>
```

#### `dialog-requires-title`

`role="dialog"` or `role="alertdialog"` must have `aria-labelledby` or `aria-label`. Without a name, screen readers announce "dialog" with no context about its purpose.

```jsx
// Bad: "dialog" with no context
<div role="dialog" aria-modal="true">Are you sure?</div>

// Good: "Confirm deletion, dialog"
<div role="dialog" aria-modal="true" aria-labelledby="title">
  <h2 id="title">Confirm deletion</h2>
</div>
```

### General interaction rules

These catch common accessibility mistakes in everyday React code. They fire on patterns every developer writes.

#### `focusable-has-interaction`

Elements with `tabIndex={0}` must have a keyboard event handler (`onKeyDown`, `onKeyUp`, or `onKeyPress`). Making an element focusable implies it's interactive. Without a keyboard handler, it's a dead end in the Tab sequence.

```jsx
// Bad: reachable by Tab but inert
<div tabIndex={0}>Card</div>

// Good: keyboard interaction supported
<div tabIndex={0} onKeyDown={handleKeyDown}>Card</div>
```

#### `input-requires-label`

`<input>`, `<select>`, and `<textarea>` must have an accessible label via `aria-label`, `aria-labelledby`, or `id` (implying a `<label htmlFor>` association). Placeholder text is not a label.

```jsx
// Bad: screen reader says "edit text" with no context
<input type="text" placeholder="Enter name" />

// Good: screen reader says "Full name, edit text"
<input type="text" aria-label="Full name" />
```

#### `radio-group-requires-grouping`

`<input type="radio">` must be inside a `<fieldset>` or an element with `role="radiogroup"`. Without grouping, screen readers announce each radio independently with no indication they form a set.

```jsx
// Bad: "radio button, Red" then "radio button, Blue" (no relationship)
<div>
  <input type="radio" name="color" value="red" /> Red
  <input type="radio" name="color" value="blue" /> Blue
</div>

// Good: "Color, group. Radio button, Red. Radio button, Blue."
<fieldset>
  <legend>Color</legend>
  <input type="radio" name="color" value="red" /> Red
  <input type="radio" name="color" value="blue" /> Blue
</fieldset>
```

#### `no-positive-tabindex`

`tabIndex` must not be greater than 0. Positive values override the natural DOM tab order, creating unpredictable keyboard navigation. `jsx-a11y` has this as a warning. This plugin makes it an error because there is no legitimate use case.

```jsx
// Bad: receives focus before all tabIndex={0} elements
<div tabIndex={5}>Out of order</div>

// Good: focusable in DOM order
<div tabIndex={0} onKeyDown={handleKey}>In order</div>
```

## Why these rules exist

Accessibility lawsuits in the US increased 37% in 2025, with over 5,000 federal cases filed. The European Accessibility Act started enforcement in June 2025. India's Supreme Court declared digital access a fundamental right, and SEBI mandated accessibility compliance for the financial sector with deadlines through 2026.

The most common issues cited in audits and lawsuits are WCAG 4.1.2 (Name, Role, Value) and 1.3.1 (Info and Relationships). These are exactly the composition errors this plugin catches: mismatched ARIA relationships, missing modal semantics, unlabeled dialogs, and broken focus patterns.

Your linter should catch these before they ship. `jsx-a11y` catches the element-level issues. `a11y-enforce` catches the composition-level issues.

## Design decisions

- **Zero runtime dependencies.** The plugin uses only ESLint's built-in AST APIs.
- **ESLint 8 and 9 support.** Rules are version-agnostic. Only the config export format differs.
- **Educational error messages.** Every violation includes what is wrong, why it matters for users, and how to fix it.
- **Single recommended preset.** All 10 rules as errors. No strict/recommended split until real-world usage data justifies one.
- **Complements jsx-a11y.** No rule overlap. Install both.

## Stats

- 10 rules (6 component pattern, 4 general interaction)
- 149 tests
- Zero runtime dependencies
- ESM + CJS dual output
- TypeScript source with full type safety

## License

MIT
