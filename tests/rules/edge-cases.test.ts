/**
 * Edge case tests covering patterns that appear in real codebases
 * but are absent from the per-rule unit tests:
 *
 * - Spread attributes: {...props} may contain the required attribute
 * - Dynamic values: role={variable} cannot be statically analyzed
 * - Boolean JSX expressions: aria-modal={true} vs aria-modal="true"
 * - String numeric values: tabIndex="0" vs tabIndex={0}
 * - Custom/uppercase components: <CustomDialog role="dialog">
 * - Nested depth: button inside nested divs inside heading
 * - Multiple violations on same element
 */

import { RuleTester } from 'eslint';
import dialogRequiresModal from '../../src/rules/dialog-requires-modal';
import dialogRequiresTitle from '../../src/rules/dialog-requires-title';
import focusableHasInteraction from '../../src/rules/focusable-has-interaction';
import noPositiveTabindex from '../../src/rules/no-positive-tabindex';
import tooltipNoInteractive from '../../src/rules/tooltip-no-interactive';
import accordionTriggerHeading from '../../src/rules/accordion-trigger-heading';
import inputRequiresLabel from '../../src/rules/input-requires-label';

const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

// ── Dynamic values: rules must not fire on expressions they cannot resolve ──

tester.run('dialog-requires-modal (dynamic role)', dialogRequiresModal, {
  valid: [
    // Dynamic role value — cannot determine if it's "dialog", so skip
    { code: '<div role={dynamicRole}>Content</div>' },
  ],
  invalid: [
    // Spread might contain aria-modal, but role="dialog" is static.
    // The rule correctly fires because it cannot see through spreads.
    // This is conservative behavior: if you set role statically, set
    // aria-modal statically too. Spreads are opaque to static analysis.
    {
      code: '<div role="dialog" {...dialogProps}>Content</div>',
      errors: [{ messageId: 'missingAriaModal' }],
    },
  ],
});

tester.run('focusable-has-interaction (dynamic tabIndex)', focusableHasInteraction, {
  valid: [
    // Dynamic tabIndex — cannot determine value, so skip
    { code: '<div tabIndex={computedIndex}>Content</div>' },
  ],
  invalid: [],
});

// ── Boolean JSX expressions vs string values ────────────────────────────────

tester.run('dialog-requires-modal (boolean expression)', dialogRequiresModal, {
  valid: [
    // aria-modal="true" (string) — this is the standard form
    { code: '<div role="dialog" aria-modal="true">Content</div>' },
  ],
  invalid: [
    // aria-modal without "true" string value — boolean shorthand
    // <div role="dialog" aria-modal /> sets value to null in AST,
    // which getAttributeValue returns as "true" — this SHOULD pass
    // But aria-modal="false" should fail
    { code: '<div role="dialog" aria-modal="false">Content</div>', errors: [{ messageId: 'missingAriaModal' }] },
  ],
});

// ── String numeric values ───────────────────────────────────────────────────

tester.run('no-positive-tabindex (string values)', noPositiveTabindex, {
  valid: [
    { code: '<div tabIndex="0">In order</div>' },
    { code: '<div tabIndex="-1">Programmatic</div>' },
  ],
  invalid: [
    // String "3" should be parsed as numeric 3 and flagged
    { code: '<div tabIndex="3">Out of order</div>', errors: [{ messageId: 'positiveTabindex' }] },
  ],
});

// ── Custom/uppercase components: rules fire on role, not tag name ────────────

tester.run('dialog-requires-modal (custom component)', dialogRequiresModal, {
  valid: [
    { code: '<CustomDialog role="dialog" aria-modal="true">Content</CustomDialog>' },
  ],
  invalid: [
    { code: '<CustomDialog role="dialog">Content</CustomDialog>', errors: [{ messageId: 'missingAriaModal' }] },
  ],
});

tester.run('dialog-requires-title (custom component)', dialogRequiresTitle, {
  valid: [
    { code: '<Modal role="dialog" aria-modal="true" aria-label="Settings">Content</Modal>' },
  ],
  invalid: [
    { code: '<Modal role="dialog" aria-modal="true">Content</Modal>', errors: [{ messageId: 'missingDialogTitle' }] },
  ],
});

// ── Tooltip with tabIndex={-1}: NOT interactive, should pass ────────────────

tester.run('tooltip-no-interactive (tabIndex -1 inside tooltip)', tooltipNoInteractive, {
  valid: [
    // tabIndex={-1} is programmatic focus only, not user-interactive
    { code: '<div role="tooltip"><div tabIndex={-1}>Panel</div></div>' },
    // Nested non-interactive elements are fine
    { code: '<div role="tooltip"><div><span><em>Deep text</em></span></div></div>' },
  ],
  invalid: [
    // tabIndex={0} IS interactive — should fail
    { code: '<div role="tooltip"><div tabIndex={0}>Focusable</div></div>', errors: [{ messageId: 'interactiveInTooltip' }] },
  ],
});

// ── Accordion: deeply nested button still finds heading ancestor ────────────

tester.run('accordion-trigger-heading (deep nesting)', accordionTriggerHeading, {
  valid: [
    // Button nested inside heading through intermediate elements
    {
      code: `
        <h3>
          <div>
            <span>
              <button aria-expanded="true">Deep section</button>
            </span>
          </div>
        </h3>
      `,
    },
    // role="heading" with aria-level works too
    {
      code: `
        <div role="heading" aria-level="4">
          <div><button aria-expanded="false">Nested</button></div>
        </div>
      `,
    },
  ],
  invalid: [
    // Heading INSIDE the button parent, not wrapping it — should fail
    {
      code: `
        <div>
          <h3>Title</h3>
          <button aria-expanded="true">Not inside heading</button>
        </div>
      `,
      errors: [{ messageId: 'missingHeading' }],
    },
  ],
});

// ── Input: form inside different labeling contexts ──────────────────────────

tester.run('input-requires-label (edge cases)', inputRequiresLabel, {
  valid: [
    // Checkbox with aria-label
    { code: '<input type="checkbox" aria-label="Accept terms" />' },
    // Number input with id
    { code: '<input type="number" id="quantity" />' },
    // Search input with aria-labelledby
    { code: '<input type="search" aria-labelledby="search-label" />' },
  ],
  invalid: [
    // Checkbox without any label
    { code: '<input type="checkbox" />', errors: [{ messageId: 'missingLabel' }] },
    // Number input without any label
    { code: '<input type="number" />', errors: [{ messageId: 'missingLabel' }] },
  ],
});

// ── Accordion: role="button" elements also need heading wrapper ─────────────

tester.run('accordion-trigger-heading (role=button)', accordionTriggerHeading, {
  valid: [
    // role="button" with aria-expanded inside heading — correct
    {
      code: '<h3><div role="button" aria-expanded="true">Section</div></h3>',
    },
    // role="button" without aria-expanded — not an accordion trigger, skip
    {
      code: '<div><div role="button">Regular button</div></div>',
    },
  ],
  invalid: [
    // role="button" with aria-expanded outside heading — violation
    {
      code: '<div><div role="button" aria-expanded="true">Section</div></div>',
      errors: [{ messageId: 'missingHeading' }],
    },
    // span with role="button" and aria-expanded — also a violation
    {
      code: '<span role="button" aria-expanded="false">Toggle</span>',
      errors: [{ messageId: 'missingHeading' }],
    },
  ],
});

// ── <a> without href: not interactive ───────────────────────────────────────
// An <a> without href is a placeholder anchor with no implicit role and no
// keyboard behavior. It should NOT be treated as interactive.

tester.run('tooltip-no-interactive (<a> href handling)', tooltipNoInteractive, {
  valid: [
    // <a> without href inside tooltip: NOT interactive, should pass
    { code: '<div role="tooltip"><a>Placeholder link</a></div>' },
  ],
  invalid: [
    // <a> WITH href inside tooltip: IS interactive, should fail
    { code: '<div role="tooltip"><a href="/help">Help</a></div>', errors: [{ messageId: 'interactiveInTooltip' }] },
  ],
});

tester.run('focusable-has-interaction (<a> href handling)', focusableHasInteraction, {
  valid: [
    // <a> with href and tabIndex={0}: already interactive natively, skip
    { code: '<a tabIndex={0} href="/">Link</a>' },
  ],
  invalid: [
    // <a> WITHOUT href and tabIndex={0}: not natively interactive,
    // needs keyboard handler
    { code: '<a tabIndex={0}>Placeholder</a>', errors: [{ messageId: 'missingKeyboardHandler' }] },
  ],
});
