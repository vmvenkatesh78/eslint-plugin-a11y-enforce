/**
 * eslint-plugin-a11y-enforce
 *
 * Catches accessibility composition errors that element-level tools
 * miss. Validates ARIA relationships in compound components (Dialog,
 * Menu, Select, Accordion, Tooltip) and common interaction patterns
 * (form labels, focus management, tab order).
 *
 * Designed to complement eslint-plugin-jsx-a11y, not replace it.
 *
 * @see https://github.com/vmvenkatesh78/eslint-plugin-a11y-enforce
 */

import type { Rule } from 'eslint';

import dialogRequiresModal from './rules/dialog-requires-modal';
import haspopupRoleMatch from './rules/haspopup-role-match';
import tooltipNoInteractive from './rules/tooltip-no-interactive';
import accordionTriggerHeading from './rules/accordion-trigger-heading';
import menuitemNotButton from './rules/menuitem-not-button';
import dialogRequiresTitle from './rules/dialog-requires-title';
import focusableHasInteraction from './rules/focusable-has-interaction';
import inputRequiresLabel from './rules/input-requires-label';
import radioGroupRequiresGrouping from './rules/radio-group-requires-grouping';
import noPositiveTabindex from './rules/no-positive-tabindex';

const rules: Record<string, Rule.RuleModule> = {
  'dialog-requires-modal': dialogRequiresModal,
  'haspopup-role-match': haspopupRoleMatch,
  'tooltip-no-interactive': tooltipNoInteractive,
  'accordion-trigger-heading': accordionTriggerHeading,
  'menuitem-not-button': menuitemNotButton,
  'dialog-requires-title': dialogRequiresTitle,
  'focusable-has-interaction': focusableHasInteraction,
  'input-requires-label': inputRequiresLabel,
  'radio-group-requires-grouping': radioGroupRequiresGrouping,
  'no-positive-tabindex': noPositiveTabindex,
};

/** All rules set to "error" for the recommended preset. */
const recommendedRules: Record<string, string> = Object.fromEntries(
  Object.keys(rules).map((name) => [`a11y-enforce/${name}`, 'error']),
);

// ESLint.Plugin's configs type is too narrow for dual ESLint 8/9 support.
// Flat config uses { plugins: Record<string, Plugin> }, legacy uses
// { plugins: string[] }. Both are valid but the union type doesn't satisfy
// ESLint's typed config interface. We use a broader record type here
// because the consumer picks one format based on their ESLint version.
const plugin = {
  meta: {
    name: 'eslint-plugin-a11y-enforce',
    version: '0.1.0',
  },
  rules,
  configs: {} as Record<string, Record<string, unknown>>,
} satisfies { meta: { name: string; version: string }; rules: Record<string, Rule.RuleModule>; configs: Record<string, unknown> };

// ESLint 9+ flat config: import and spread directly.
// eslint.config.js: import a11yEnforce from 'eslint-plugin-a11y-enforce';
//                   export default [a11yEnforce.configs.recommended];
const flatRecommended = {
  plugins: { 'a11y-enforce': plugin },
  rules: recommendedRules,
};

// ESLint 8 legacy config: extend the preset.
// .eslintrc: { "extends": ["plugin:a11y-enforce/recommended"] }
const legacyRecommended = {
  plugins: ['a11y-enforce'],
  rules: recommendedRules,
};

plugin.configs = {
  recommended: flatRecommended,
  'flat/recommended': flatRecommended,
  'legacy/recommended': legacyRecommended,
};

export default plugin;
export { rules, plugin };
