/**
 * Rule: menuitem-not-button
 *
 * Elements with role="menuitem", "menuitemcheckbox", or "menuitemradio"
 * should not be <button> elements.
 *
 * <button> has an implicit role of "button". Adding role="menuitem"
 * overrides it at the ARIA level, but some screen readers (notably
 * NVDA with Firefox) announce both: "button, menuitem, Edit."
 * This double announcement confuses users about the element's purpose.
 *
 * The correct pattern is a <div> or <li> with role="menuitem" and
 * tabIndex={-1} for programmatic focus via roving tabindex.
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/
 */

import type { Rule } from 'eslint';
import type { JSXOpeningElement } from '../types';
import { getElementType, getAttributeValue } from '../utils/ast-helpers';

const MENUITEM_ROLES: ReadonlyArray<string> = [
  'menuitem', 'menuitemcheckbox', 'menuitemradio',
];

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce that role="menuitem" is not used on button elements.',
      url: 'https://github.com/vmvenkatesh78/eslint-plugin-a11y-enforce/blob/main/docs/rules/menuitem-not-button.md',
    },
    messages: {
      menuitemOnButton:
        'role="{{ role }}" should not be used on <button> elements. ' +
        'Buttons have an implicit "button" role, which causes some screen ' +
        'readers to double-announce: "button, menuitem." Use a <div> or ' +
        '<li> with role="{{ role }}" and tabIndex={-1} instead.',
    },
    schema: [],
  },

  create(context) {
    return {
      JSXOpeningElement(astNode: Rule.Node) {
        const node = astNode as unknown as JSXOpeningElement;
        const role = getAttributeValue(node, 'role');

        if (!role || !MENUITEM_ROLES.includes(role)) return;

        const tagName = getElementType(node);
        if (tagName.toLowerCase() !== 'button') return;

        context.report({ node: astNode, messageId: 'menuitemOnButton', data: { role } });
      },
    };
  },
};

export default rule;
