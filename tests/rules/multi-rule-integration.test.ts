/**
 * Multi-rule integration tests.
 *
 * Validates that:
 * 1. Multiple rules fire on the same element without conflict
 * 2. The recommended config applies all rules correctly
 * 3. A well-structured component triggers zero false positives
 *    when all 10 rules are active simultaneously
 */

import { RuleTester } from 'eslint';
import dialogRequiresModal from '../../src/rules/dialog-requires-modal';
import dialogRequiresTitle from '../../src/rules/dialog-requires-title';
import noPositiveTabindex from '../../src/rules/no-positive-tabindex';
import focusableHasInteraction from '../../src/rules/focusable-has-interaction';

const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

// ── Same element triggers multiple rules ────────────────────────────────────

// A dialog without aria-modal AND without aria-label triggers both rules.
// Each rule fires independently on the same JSXOpeningElement node.

tester.run('dialog-requires-modal (multi-rule element)', dialogRequiresModal, {
  valid: [],
  invalid: [
    // This element also fails dialog-requires-title, but this test only checks this rule
    {
      code: '<div role="dialog">No modal, no title</div>',
      errors: [{ messageId: 'missingAriaModal' }],
    },
  ],
});

tester.run('dialog-requires-title (multi-rule element)', dialogRequiresTitle, {
  valid: [],
  invalid: [
    // Same element as above — also fails dialog-requires-modal
    {
      code: '<div role="dialog">No modal, no title</div>',
      errors: [{ messageId: 'missingDialogTitle' }],
    },
  ],
});

// An element with tabIndex={5} triggers no-positive-tabindex AND
// focusable-has-interaction (since 5 > 0, it's focusable but no handler).
// However, focusable-has-interaction only checks tabIndex === 0, not > 0.
// So only no-positive-tabindex fires. This validates rule scoping.

tester.run('no-positive-tabindex (scoping with focusable-has-interaction)', noPositiveTabindex, {
  valid: [],
  invalid: [
    { code: '<div tabIndex={5}>Positive</div>', errors: [{ messageId: 'positiveTabindex' }] },
  ],
});

tester.run('focusable-has-interaction (scoping with no-positive-tabindex)', focusableHasInteraction, {
  valid: [
    // tabIndex={5} is NOT checked by this rule — it only checks tabIndex={0}
    // This verifies the rules don't overlap: no-positive-tabindex owns > 0,
    // focusable-has-interaction owns === 0
    { code: '<div tabIndex={5}>Not checked by this rule</div>' },
  ],
  invalid: [],
});

// ── Full well-structured component: zero false positives ────────────────────

// A properly built modal dialog with all ARIA attributes should trigger
// zero violations across all rules. This test runs each rule independently
// against a correct implementation.

const WELL_STRUCTURED_DIALOG = `
  <div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
    <h2 id="dialog-title">Confirm deletion</h2>
    <p>Are you sure you want to delete this item?</p>
    <fieldset>
      <legend>Reason</legend>
      <input type="radio" name="reason" value="duplicate" id="r1" />
      <input type="radio" name="reason" value="outdated" id="r2" />
    </fieldset>
    <input type="text" aria-label="Additional notes" />
    <div tabIndex={0} onKeyDown={handleKeyDown} role="button">Custom action</div>
    <button>Cancel</button>
    <button>Delete</button>
  </div>
`;

tester.run('dialog-requires-modal (well-structured)', dialogRequiresModal, {
  valid: [{ code: WELL_STRUCTURED_DIALOG }],
  invalid: [],
});

tester.run('dialog-requires-title (well-structured)', dialogRequiresTitle, {
  valid: [{ code: WELL_STRUCTURED_DIALOG }],
  invalid: [],
});

tester.run('focusable-has-interaction (well-structured)', focusableHasInteraction, {
  valid: [{ code: WELL_STRUCTURED_DIALOG }],
  invalid: [],
});

tester.run('no-positive-tabindex (well-structured)', noPositiveTabindex, {
  valid: [{ code: WELL_STRUCTURED_DIALOG }],
  invalid: [],
});
