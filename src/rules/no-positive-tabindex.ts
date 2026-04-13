/**
 * Rule: no-positive-tabindex
 *
 * tabIndex must not be greater than 0.
 *
 * Positive tabIndex values override the natural DOM tab order.
 * An element with tabIndex={5} receives focus before all elements
 * with tabIndex={0}, regardless of its position in the document.
 * This creates an unpredictable navigation experience where the
 * focus jumps to seemingly random elements.
 *
 * jsx-a11y has this as a warning. We make it an error because there
 * is no legitimate use case for positive tabIndex in modern web
 * development. If you need an element to be focusable, use
 * tabIndex={0} (DOM order) or tabIndex={-1} (programmatic only).
 */

import type { Rule } from 'eslint';
import type { JSXOpeningElement } from '../types';
import { getNumericValue } from '../utils/ast-helpers';

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce that tabIndex is not greater than 0.',
      url: 'https://github.com/vmvenkatesh78/eslint-plugin-a11y-enforce/blob/main/README.md#no-positive-tabindex',
    },
    messages: {
      positiveTabindex:
        'tabIndex must not be greater than 0 (found tabIndex={{ value }}). ' +
        'Positive tabIndex values break the natural tab order, creating ' +
        'unpredictable keyboard navigation. Use tabIndex={0} to make an ' +
        'element focusable in DOM order, or tabIndex={-1} for programmatic ' +
        'focus only.',
    },
    schema: [],
  },

  create(context) {
    return {
      JSXOpeningElement(astNode: Rule.Node) {
        const node = astNode as unknown as JSXOpeningElement;
        const tabIndex = getNumericValue(node, 'tabIndex');

        if (tabIndex === undefined || tabIndex <= 0) return;

        context.report({
          node: astNode,
          messageId: 'positiveTabindex',
          data: { value: String(tabIndex) },
        });
      },
    };
  },
};

export default rule;
