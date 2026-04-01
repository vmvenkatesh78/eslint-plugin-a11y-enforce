/**
 * Rule: haspopup-role-match
 *
 * Validates that aria-haspopup uses a value from the ARIA spec's
 * allowed set: menu, listbox, tree, grid, dialog, true, false.
 *
 * Screen readers announce the popup type based on this value. An
 * invalid value (e.g. "tooltip", "dropdown") is silently treated
 * as "false" by user agents, which means the popup existence is
 * never announced at all.
 *
 * @see https://www.w3.org/TR/wai-aria-1.2/#aria-haspopup
 */

import type { Rule } from 'eslint';
import type { JSXOpeningElement } from '../types';
import { getAttributeValue } from '../utils/ast-helpers';

const VALID_HASPOPUP_VALUES: ReadonlySet<string> = new Set([
  'menu', 'listbox', 'tree', 'grid', 'dialog', 'true', 'false',
]);

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce that aria-haspopup has a valid ARIA value.',
      url: 'https://github.com/vmvenkatesh78/eslint-plugin-a11y-enforce/blob/main/docs/rules/haspopup-role-match.md',
    },
    messages: {
      invalidHaspopup:
        'aria-haspopup value "{{ value }}" is not valid. ' +
        'Allowed values are: menu, listbox, tree, grid, dialog, true, false. ' +
        'The value must match the role of the popup content it triggers. ' +
        'Screen readers use this value to announce the type of popup that will appear.',
    },
    schema: [],
  },

  create(context) {
    return {
      JSXOpeningElement(astNode: Rule.Node) {
        const node = astNode as unknown as JSXOpeningElement;
        const haspopup = getAttributeValue(node, 'aria-haspopup');

        if (haspopup === undefined) return;

        if (!VALID_HASPOPUP_VALUES.has(haspopup)) {
          context.report({ node: astNode, messageId: 'invalidHaspopup', data: { value: haspopup } });
        }
      },
    };
  },
};

export default rule;
