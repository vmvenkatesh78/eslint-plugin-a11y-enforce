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
 * Excluded input types:
 * - type="hidden": no visual or accessible representation.
 * - type="submit": browser provides default accessible name ("Submit").
 * - type="reset": browser provides default accessible name ("Reset").
 *
 * Special input types:
 * - type="button": accessible name comes from `value` attribute.
 * - type="image": accessible name comes from `alt` attribute.
 *
 * These types derive their name differently than text inputs and
 * must not trigger false positives when labeled correctly via
 * their native mechanism.
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
      url: 'https://github.com/vmvenkatesh78/eslint-plugin-a11y-enforce/blob/main/README.md#input-requires-label',
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

        const inputType = getAttributeValue(node, 'type');

        // These types have browser-provided default accessible names
        // and do not require explicit labeling.
        if (inputType === 'hidden' || inputType === 'submit' || inputType === 'reset') return;

        // type="button" gets its name from the value attribute.
        // type="image" gets its name from the alt attribute.
        // Both also accept aria-label, aria-labelledby, and id.
        const hasAccessibleLabel =
          hasAttribute(node, 'aria-label') ||
          hasAttribute(node, 'aria-labelledby') ||
          hasAttribute(node, 'id') ||
          (inputType === 'button' && hasAttribute(node, 'value')) ||
          (inputType === 'image' && hasAttribute(node, 'alt'));

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
