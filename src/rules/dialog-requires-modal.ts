/**
 * Rule: dialog-requires-modal
 *
 * Elements with role="dialog" or role="alertdialog" must include
 * aria-modal="true". Without it, screen readers allow virtual cursor
 * navigation outside the dialog, letting users interact with content
 * that should be blocked by the modal overlay.
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
 */

import type { Rule } from 'eslint';
import type { JSXOpeningElement } from '../types';
import { getAttributeValue } from '../utils/ast-helpers';

const DIALOG_ROLES: ReadonlyArray<string> = ['dialog', 'alertdialog'];

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce that elements with role="dialog" have aria-modal="true".',
      url: 'https://github.com/vmvenkatesh78/eslint-plugin-a11y-enforce/blob/main/docs/rules/dialog-requires-modal.md',
    },
    messages: {
      missingAriaModal:
        'Elements with role="{{ role }}" must have aria-modal="true". ' +
        'Without aria-modal, screen readers will not restrict navigation ' +
        'to the dialog content, allowing users to accidentally interact ' +
        'with the page behind it. Add aria-modal="true" to this element.',
    },
    schema: [],
  },

  create(context) {
    return {
      JSXOpeningElement(astNode: Rule.Node) {
        const node = astNode as unknown as JSXOpeningElement;
        const role = getAttributeValue(node, 'role');

        if (!role || !DIALOG_ROLES.includes(role)) return;

        const ariaModal = getAttributeValue(node, 'aria-modal');
        if (ariaModal !== 'true') {
          context.report({ node: astNode, messageId: 'missingAriaModal', data: { role } });
        }
      },
    };
  },
};

export default rule;
