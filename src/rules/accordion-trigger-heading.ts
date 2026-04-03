/**
 * Rule: accordion-trigger-heading
 *
 * A <button> with aria-expanded (the accordion trigger pattern)
 * should be wrapped in a heading element (h1-h6 or role="heading").
 *
 * Screen reader users commonly navigate pages by headings (the H key
 * in NVDA/JAWS). Without a heading wrapper, accordion sections are
 * invisible to heading-based navigation and can only be found by
 * reading the entire page sequentially.
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/accordion/
 */

import type { Rule } from 'eslint';
import type { JSXOpeningElement } from '../types';
import {
  getElementType,
  hasAttribute,
  hasMatchingAncestor,
  isHeadingElement,
} from '../utils/ast-helpers';

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce that accordion trigger buttons are inside heading elements.',
      url: 'https://github.com/vmvenkatesh78/eslint-plugin-a11y-enforce/blob/main/docs/rules/accordion-trigger-heading.md',
    },
    messages: {
      missingHeading:
        'Accordion trigger (button with aria-expanded) should be inside a heading ' +
        'element (h1-h6) or an element with role="heading". Without a heading, ' +
        'screen reader users navigating by headings will not discover this ' +
        'accordion section. Wrap the button in an appropriate heading element.',
    },
    schema: [],
  },

  create(context) {
    return {
      JSXOpeningElement(astNode: Rule.Node) {
        const node = astNode as unknown as JSXOpeningElement;
        const tagName = getElementType(node);

        // Only applies to <button> elements with aria-expanded.
        // Other elements with aria-expanded (e.g. combobox triggers)
        // have different structural requirements.
        if (tagName.toLowerCase() !== 'button') return;
        if (!hasAttribute(node, 'aria-expanded')) return;

        const hasHeadingAncestor = hasMatchingAncestor(node, (ancestor) => {
          const ancestorTag = getElementType(ancestor);
          return isHeadingElement(ancestorTag, ancestor);
        });

        if (!hasHeadingAncestor) {
          context.report({ node: astNode, messageId: 'missingHeading' });
        }
      },
    };
  },
};

export default rule;
