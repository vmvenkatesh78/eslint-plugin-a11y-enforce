/**
 * Rule: focusable-has-interaction
 *
 * Elements with tabIndex={0} must have at least one keyboard event
 * handler (onKeyDown, onKeyUp, or onKeyPress).
 *
 * tabIndex={0} places an element in the sequential focus order.
 * A keyboard user can Tab to it, which implies it's interactive.
 * If there's no keyboard handler, the element is a dead end in the
 * Tab sequence: reachable but inert.
 *
 * This differs from jsx-a11y's click-events-have-key-events, which
 * checks onClick. We check tabIndex directly, catching cases where
 * developers add tabIndex for "focus styling" without understanding
 * the keyboard interaction contract it creates.
 *
 * tabIndex={-1} is excluded: it makes an element programmatically
 * focusable (via .focus()) but does not add it to the Tab sequence.
 */

import type { Rule } from 'eslint';
import type { JSXOpeningElement } from '../types';
import {
  getNumericValue,
  hasAnyEventHandler,
  isInteractiveElement,
  getElementType,
} from '../utils/ast-helpers';

const KEYBOARD_HANDLERS: ReadonlyArray<string> = [
  'onKeyDown', 'onKeyUp', 'onKeyPress',
];

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce that elements with tabIndex={0} have keyboard event handlers.',
      url: 'https://github.com/vmvenkatesh78/eslint-plugin-a11y-enforce/blob/main/README.md#focusable-has-interaction',
    },
    messages: {
      missingKeyboardHandler:
        'Element with tabIndex={0} is focusable but has no keyboard event handler ' +
        '(onKeyDown, onKeyUp, or onKeyPress). Keyboard users can Tab to this ' +
        'element but cannot interact with it. Add an onKeyDown handler, or ' +
        'remove tabIndex if the element is not meant to be interactive.',
    },
    schema: [],
  },

  create(context) {
    return {
      JSXOpeningElement(astNode: Rule.Node) {
        const node = astNode as unknown as JSXOpeningElement;
        const tabIndex = getNumericValue(node, 'tabIndex');

        // Only check tabIndex={0}. Negative values are programmatic-only.
        if (tabIndex !== 0) return;

        // Native interactive elements (button, input, a with href) already
        // have built-in keyboard behavior. Adding tabIndex={0} to them is
        // redundant but not a violation.
        const tagName = getElementType(node);
        if (isInteractiveElement(tagName, node)) return;

        if (!hasAnyEventHandler(node, KEYBOARD_HANDLERS)) {
          context.report({ node: astNode, messageId: 'missingKeyboardHandler' });
        }
      },
    };
  },
};

export default rule;
