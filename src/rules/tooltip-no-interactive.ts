/**
 * Rule: tooltip-no-interactive
 *
 * Elements with role="tooltip" must not contain focusable children
 * (buttons, links, inputs, or elements with tabIndex >= 0).
 *
 * Tooltips disappear on blur/mouse-leave. A keyboard user cannot Tab
 * into a tooltip to reach interactive content inside it. Sighted mouse
 * users can click buttons in tooltips, but keyboard and screen reader
 * users cannot, creating an inequitable experience.
 *
 * If interactive content is needed in a popup, use role="dialog"
 * (Popover or Dialog) instead.
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/
 */

import type { Rule } from 'eslint';
import type { JSXOpeningElement } from '../types';
import {
  getAttributeValue,
  getElementType,
  getNumericValue,
  isInteractiveElement,
  hasMatchingAncestor,
  INTERACTIVE_ROLES,
} from '../utils/ast-helpers';

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce that tooltip content does not contain interactive elements.',
      url: 'https://github.com/vmvenkatesh78/eslint-plugin-a11y-enforce/blob/main/docs/rules/tooltip-no-interactive.md',
    },
    messages: {
      interactiveInTooltip:
        'Tooltip (role="tooltip") must not contain interactive elements. ' +
        'Tooltips are non-interactive by design. Users cannot Tab to content ' +
        'inside a tooltip because it disappears on blur. If you need ' +
        'interactive content in a popup, use a Popover or Dialog instead.',
    },
    schema: [],
  },

  create(context) {
    /**
     * Check if the current node is nested inside a role="tooltip" ancestor.
     * Uses stateless ancestor walking instead of a mutable boolean flag,
     * which would break with nested tooltips or interleaved elements.
     */
    function isInsideTooltip(node: JSXOpeningElement): boolean {
      return hasMatchingAncestor(
        node,
        (ancestor) => getAttributeValue(ancestor, 'role') === 'tooltip',
      );
    }

    return {
      JSXOpeningElement(astNode: Rule.Node) {
        const node = astNode as unknown as JSXOpeningElement;

        // Don't check the tooltip element itself, only its descendants
        if (getAttributeValue(node, 'role') === 'tooltip') return;
        if (!isInsideTooltip(node)) return;

        const tagName = getElementType(node);

        // Native interactive elements: button, a, input, select, textarea
        if (isInteractiveElement(tagName)) {
          context.report({ node: astNode, messageId: 'interactiveInTooltip' });
          return;
        }

        // Elements made focusable via tabIndex >= 0
        const tabIndex = getNumericValue(node, 'tabIndex');
        if (tabIndex !== undefined && tabIndex >= 0) {
          context.report({ node: astNode, messageId: 'interactiveInTooltip' });
          return;
        }

        // Elements with interactive ARIA roles
        const childRole = getAttributeValue(node, 'role');
        if (childRole && INTERACTIVE_ROLES.has(childRole)) {
          context.report({ node: astNode, messageId: 'interactiveInTooltip' });
        }
      },
    };
  },
};

export default rule;
