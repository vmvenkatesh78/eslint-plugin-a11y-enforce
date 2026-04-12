/**
 * Integration tests: validate rules against real ARIA patterns from
 * flintwork's component library (Dialog, Menu, Select, Accordion,
 * Tooltip, Popover, Tabs, Button).
 *
 * These are not synthetic test strings. They mirror the actual JSX
 * output of flintwork's primitives to verify the plugin does not
 * produce false positives on well-structured component code, and
 * does catch violations when patterns are misused.
 */

import { RuleTester } from 'eslint';
import dialogRequiresModal from '../../src/rules/dialog-requires-modal';
import dialogRequiresTitle from '../../src/rules/dialog-requires-title';
import haspopupRoleMatch from '../../src/rules/haspopup-role-match';
import menuitemNotButton from '../../src/rules/menuitem-not-button';
import tooltipNoInteractive from '../../src/rules/tooltip-no-interactive';
import accordionTriggerHeading from '../../src/rules/accordion-trigger-heading';
import focusableHasInteraction from '../../src/rules/focusable-has-interaction';
import noPositiveTabindex from '../../src/rules/no-positive-tabindex';
import inputRequiresLabel from '../../src/rules/input-requires-label';
import radioGroupRequiresGrouping from '../../src/rules/radio-group-requires-grouping';

const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

// ── Dialog primitive ─────────────────────────────────────────────────
// flintwork's Dialog.Content renders role="dialog" aria-modal="true"
// with aria-labelledby pointing to Dialog.Title's id.

tester.run('dialog-requires-modal (flintwork Dialog)', dialogRequiresModal, {
  valid: [
    {
      code: `
        <div role="dialog" aria-modal="true" aria-labelledby="fw-dialog-title">
          <h2 id="fw-dialog-title">Confirm deletion</h2>
          <p>Are you sure?</p>
        </div>
      `,
    },
  ],
  invalid: [
    // Consumer forgets aria-modal when building custom dialog wrapper
    {
      code: '<div role="dialog" aria-labelledby="title">Content</div>',
      errors: [{ messageId: 'missingAriaModal' }],
    },
  ],
});

tester.run('dialog-requires-title (flintwork Dialog)', dialogRequiresTitle, {
  valid: [
    {
      code: `
        <div role="dialog" aria-modal="true" aria-labelledby="fw-dialog-title">
          <h2 id="fw-dialog-title">Settings</h2>
        </div>
      `,
    },
  ],
  invalid: [
    // Consumer renders dialog without Title component
    {
      code: '<div role="dialog" aria-modal="true"><p>Some content</p></div>',
      errors: [{ messageId: 'missingDialogTitle' }],
    },
  ],
});

// ── Menu primitive ───────────────────────────────────────────────────
// flintwork's Menu.Trigger renders aria-haspopup="menu".
// Menu.Content renders role="menu".
// Menu.Item renders <div role="menuitem" tabIndex={-1}>.

tester.run('haspopup-role-match (flintwork Menu)', haspopupRoleMatch, {
  valid: [
    { code: '<button aria-haspopup="menu" aria-expanded="false">Actions</button>' },
  ],
  invalid: [],
});

tester.run('menuitem-not-button (flintwork Menu)', menuitemNotButton, {
  valid: [
    // flintwork uses div with role="menuitem", not button
    { code: '<div role="menuitem" tabIndex={-1} onKeyDown={handleKey}>Edit</div>' },
    { code: '<div role="menuitem" tabIndex={-1} onKeyDown={handleKey}>Delete</div>' },
  ],
  invalid: [
    // Common mistake: wrapping menuitem in button
    { code: '<button role="menuitem">Edit</button>', errors: [{ messageId: 'menuitemOnButton' }] },
  ],
});

// ── Select primitive ─────────────────────────────────────────────────
// flintwork's Select.Trigger renders aria-haspopup="listbox".

tester.run('haspopup-role-match (flintwork Select)', haspopupRoleMatch, {
  valid: [
    { code: '<button aria-haspopup="listbox" aria-expanded="false">Choose</button>' },
  ],
  invalid: [],
});

// ── Popover primitive ────────────────────────────────────────────────
// flintwork's Popover uses aria-haspopup="dialog" on trigger.
// Content does NOT have role="dialog" or aria-modal (non-modal).

tester.run('dialog-requires-modal (flintwork Popover)', dialogRequiresModal, {
  valid: [
    // Popover content has no role="dialog", so this rule does not fire
    { code: '<div>Popover content without dialog role</div>' },
  ],
  invalid: [],
});

// ── Accordion primitive ──────────────────────────────────────────────
// flintwork's Accordion.Trigger renders <h3><button aria-expanded>.

tester.run('accordion-trigger-heading (flintwork Accordion)', accordionTriggerHeading, {
  valid: [
    {
      code: `
        <h3>
          <button aria-expanded="true" aria-controls="fw-panel-1">
            Section title
          </button>
        </h3>
      `,
    },
    {
      code: `
        <div role="heading" aria-level="3">
          <button aria-expanded="false" aria-controls="fw-panel-2">
            Another section
          </button>
        </div>
      `,
    },
  ],
  invalid: [
    // Consumer forgets heading wrapper
    {
      code: '<div><button aria-expanded="true">Section</button></div>',
      errors: [{ messageId: 'missingHeading' }],
    },
  ],
});

// ── Tooltip primitive ────────────────────────────────────────────────
// flintwork's Tooltip.Content renders role="tooltip" with text only.

tester.run('tooltip-no-interactive (flintwork Tooltip)', tooltipNoInteractive, {
  valid: [
    { code: '<div role="tooltip" id="fw-tooltip-1">Save your changes (Ctrl+S)</div>' },
    { code: '<div role="tooltip"><span>Keyboard shortcut: Ctrl+S</span></div>' },
  ],
  invalid: [
    // Consumer puts a link inside tooltip
    {
      code: '<div role="tooltip"><a href="/help">Learn more</a></div>',
      errors: [{ messageId: 'interactiveInTooltip' }],
    },
  ],
});

// ── Tabs primitive ───────────────────────────────────────────────────
// flintwork's Tab items use tabIndex={0} on the active tab with
// onKeyDown for arrow key navigation.

tester.run('focusable-has-interaction (flintwork Tabs)', focusableHasInteraction, {
  valid: [
    { code: '<button tabIndex={0} role="tab" aria-selected="true" onKeyDown={handleKey}>Overview</button>' },
    // Inactive tabs use tabIndex={-1}, no keyboard handler needed
    { code: '<button tabIndex={-1} role="tab" aria-selected="false">Settings</button>' },
  ],
  invalid: [],
});

// ── General form patterns ────────────────────────────────────────────

tester.run('input-requires-label (form patterns)', inputRequiresLabel, {
  valid: [
    { code: '<input id="search" type="text" aria-label="Search components" />' },
    { code: '<select id="theme" aria-label="Theme"><option>Light</option></select>' },
  ],
  invalid: [
    { code: '<input type="text" placeholder="Search..." />', errors: [{ messageId: 'missingLabel' }] },
  ],
});

tester.run('radio-group-requires-grouping (form patterns)', radioGroupRequiresGrouping, {
  valid: [
    {
      code: `
        <fieldset>
          <legend>Theme</legend>
          <input type="radio" name="theme" value="light" id="t1" />
          <input type="radio" name="theme" value="dark" id="t2" />
        </fieldset>
      `,
    },
  ],
  invalid: [
    {
      code: '<div><input type="radio" name="theme" value="light" /></div>',
      errors: [{ messageId: 'missingGrouping' }],
    },
  ],
});

tester.run('no-positive-tabindex (general)', noPositiveTabindex, {
  valid: [
    { code: '<div tabIndex={0} onKeyDown={handleKey}>Card</div>' },
    { code: '<div tabIndex={-1}>Panel</div>' },
  ],
  invalid: [
    { code: '<div tabIndex={5}>Broken order</div>', errors: [{ messageId: 'positiveTabindex' }] },
  ],
});
