/**
 * Rule: dialog-requires-title
 *
 * Elements with role="dialog" or role="alertdialog" must have an
 * accessible name via aria-labelledby or aria-label.
 *
 * Without a name, screen readers announce "dialog" with no context.
 * The user has no idea what the dialog is about until they read its
 * entire content. aria-labelledby pointing to a heading inside the
 * dialog gives an immediate announcement: "Confirm deletion, dialog."
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
 */

import type { Rule } from 'eslint';
import type { JSXOpeningElement } from '../types';
import { getAttributeValue, hasAttribute } from '../utils/ast-helpers';

const DIALOG_ROLES: ReadonlyArray<string> = ['dialog', 'alertdialog'];

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce that dialogs have an accessible name via aria-labelledby or aria-label.',
      url: 'https://github.com/vmvenkatesh78/eslint-plugin-a11y-enforce/blob/main/docs/rules/dialog-requires-title.md',
    },
    messages: {
      missingDialogTitle:
        'Dialog (role="{{ role }}") must have an accessible name via ' +
        'aria-labelledby or aria-label. Without a name, screen readers ' +
        'announce "dialog" with no context. Add aria-labelledby pointing ' +
        'to a heading inside the dialog, or aria-label with a descriptive name.',
    },
    schema: [],
  },

  create(context) {
    return {
      JSXOpeningElement(astNode: Rule.Node) {
        const node = astNode as unknown as JSXOpeningElement;
        const role = getAttributeValue(node, 'role');

        if (!role || !DIALOG_ROLES.includes(role)) return;

        const hasAccessibleName =
          hasAttribute(node, 'aria-labelledby') ||
          hasAttribute(node, 'aria-label');

        if (!hasAccessibleName) {
          context.report({ node: astNode, messageId: 'missingDialogTitle', data: { role } });
        }
      },
    };
  },
};

export default rule;
