/**
 * Rule: input-requires-label
 *
 * <input>, <select>, and <textarea> elements must have an accessible
 * label via aria-label, aria-labelledby, or an id (which implies a
 * <label htmlFor> association may exist).
 *
 * Without a label, screen readers announce "edit text" or "combobox"
 * with no context. The user has to guess what to type. Placeholder
 * text is NOT a label: screen readers may not announce it, and it
 * disappears on input.
 *
 * The id check is intentionally lenient: if the input has an id, we
 * assume a label[htmlFor] exists somewhere. Cross-file label
 * association requires type-aware analysis that ESLint's per-file
 * visitor cannot do. False positives from an overly strict rule cause
 * developers to disable it entirely.
 *
 * Hidden inputs (type="hidden") are excluded because they have no
 * visual or accessible representation.
 */

import type { Rule } from 'eslint';
import type { JSXOpeningElement } from '../types';
import {
  getElementType,
  getAttributeValue,
  hasAttribute,
  isFormInput,
} from '../utils/ast-helpers';

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce that form inputs have an accessible label.',
      url: 'https://github.com/vmvenkatesh78/eslint-plugin-a11y-enforce/blob/main/docs/rules/input-requires-label.md',
    },
    messages: {
      missingLabel:
        'Form input ({{ element }}) must have an accessible label. ' +
        'Screen readers announce inputs by their label. Without one, ' +
        'users hear "edit text" with no context. Add aria-label, ' +
        'aria-labelledby, or associate a <label> element using htmlFor. ' +
        'Note: placeholder is not a substitute for a label.',
    },
    schema: [],
  },

  create(context) {
    return {
      JSXOpeningElement(astNode: Rule.Node) {
        const node = astNode as unknown as JSXOpeningElement;
        const tagName = getElementType(node);

        if (!isFormInput(tagName)) return;

        // Hidden inputs have no visual or accessible representation
        const inputType = getAttributeValue(node, 'type');
        if (inputType === 'hidden') return;

        const hasAccessibleLabel =
          hasAttribute(node, 'aria-label') ||
          hasAttribute(node, 'aria-labelledby') ||
          hasAttribute(node, 'id');

        if (!hasAccessibleLabel) {
          context.report({
            node: astNode,
            messageId: 'missingLabel',
            data: { element: `<${tagName}>` },
          });
        }
      },
    };
  },
};

export default rule;
