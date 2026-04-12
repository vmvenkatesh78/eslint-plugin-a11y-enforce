/**
 * Rule: radio-group-requires-grouping
 *
 * <input type="radio"> must be inside a <fieldset> or an element
 * with role="radiogroup".
 *
 * Ungrouped radio buttons are one of the most common form
 * accessibility failures. Without a grouping container, screen
 * readers announce each option independently: "radio button, Red"
 * followed by "radio button, Blue" with no indication that they
 * belong to the same question.
 *
 * A <fieldset> with <legend> provides: "Color, group. Radio button,
 * Red. Radio button, Blue." The user immediately understands the
 * options are related and what question they answer.
 *
 * @see https://www.w3.org/WAI/tutorials/forms/grouping/
 */

import type { Rule } from 'eslint';
import type { JSXOpeningElement } from '../types';
import {
  getElementType,
  getAttributeValue,
  hasMatchingAncestor,
} from '../utils/ast-helpers';

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce that radio buttons are inside a fieldset or role="radiogroup".',
      url: 'https://github.com/vmvenkatesh78/eslint-plugin-a11y-enforce/blob/main/docs/rules/radio-group-requires-grouping.md',
    },
    messages: {
      missingGrouping:
        'Radio buttons must be grouped inside a <fieldset> with <legend> ' +
        'or an element with role="radiogroup" and aria-label. Without ' +
        'grouping, screen readers announce each radio button independently ' +
        'with no indication they belong to a set.',
    },
    schema: [],
  },

  create(context) {
    return {
      JSXOpeningElement(astNode: Rule.Node) {
        const node = astNode as unknown as JSXOpeningElement;
        const tagName = getElementType(node);

        if (tagName.toLowerCase() !== 'input') return;

        const inputType = getAttributeValue(node, 'type');
        if (inputType !== 'radio') return;

        const hasGroupingAncestor = hasMatchingAncestor(node, (ancestor) => {
          const ancestorTag = getElementType(ancestor);
          if (ancestorTag.toLowerCase() === 'fieldset') return true;
          if (getAttributeValue(ancestor, 'role') === 'radiogroup') return true;
          return false;
        });

        if (!hasGroupingAncestor) {
          context.report({ node: astNode, messageId: 'missingGrouping' });
        }
      },
    };
  },
};

export default rule;
