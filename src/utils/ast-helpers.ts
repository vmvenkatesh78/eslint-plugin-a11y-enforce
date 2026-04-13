/**
 * Shared AST utilities for JSX accessibility rule visitors.
 *
 * Handles the three value representations ESLint's parser produces:
 * 1. String literal:       role="dialog"     -> Literal node
 * 2. Expression literal:   tabIndex={0}      -> JSXExpressionContainer > Literal
 * 3. Boolean shorthand:    hidden            -> null (present, no value)
 *
 * Dynamic expressions (tabIndex={someVar}) return undefined because
 * static analysis cannot resolve runtime values.
 */

import type { JSXOpeningElement, JSXAttribute, ASTParentNode } from '../types';

// ── Element classification ───────────────────────────────────────────
// Module-level constants prevent per-visit allocation.

const INTERACTIVE_ELEMENTS: ReadonlySet<string> = new Set([
  'button', 'input', 'select', 'textarea',
]);

const HEADING_ELEMENTS: ReadonlySet<string> = new Set([
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
]);

const FORM_INPUT_ELEMENTS: ReadonlySet<string> = new Set([
  'input', 'select', 'textarea',
]);

/**
 * ARIA roles that make an element interactive.
 * Exported for use by tooltip-no-interactive.
 */
export const INTERACTIVE_ROLES: ReadonlySet<string> = new Set([
  'button', 'link', 'textbox', 'checkbox',
  'radio', 'combobox', 'menuitem', 'tab',
]);

// ── Attribute extraction ─────────────────────────────────────────────

/**
 * Find a JSXAttribute by name. Returns undefined for absent
 * attributes and skips spread attributes.
 */
function findAttribute(
  node: JSXOpeningElement,
  attrName: string,
): JSXAttribute | undefined {
  for (const attr of node.attributes) {
    if (
      attr.type === 'JSXAttribute' &&
      attr.name.type === 'JSXIdentifier' &&
      attr.name.name === attrName
    ) {
      return attr;
    }
  }
  return undefined;
}

/**
 * Extract a static string value from a JSX attribute.
 *
 * - `role="dialog"`     -> "dialog"
 * - `role={"dialog"}`   -> "dialog"
 * - `<div hidden />`    -> "true" (boolean shorthand)
 * - `role={variable}`   -> undefined (dynamic)
 */
export function getAttributeValue(
  node: JSXOpeningElement,
  attrName: string,
): string | undefined {
  const attr = findAttribute(node, attrName);
  if (!attr) return undefined;

  if (attr.value === null) return 'true';

  if (attr.value.type === 'Literal' && typeof attr.value.value === 'string') {
    return attr.value.value;
  }

  if (
    attr.value.type === 'JSXExpressionContainer' &&
    attr.value.expression.type === 'Literal' &&
    typeof attr.value.expression.value === 'string'
  ) {
    return attr.value.expression.value;
  }

  return undefined;
}

/**
 * Extract a static numeric value from a JSX attribute.
 *
 * - `tabIndex={0}`   -> 0
 * - `tabIndex="0"`   -> 0
 * - `tabIndex={x}`   -> undefined (dynamic)
 */
export function getNumericValue(
  node: JSXOpeningElement,
  attrName: string,
): number | undefined {
  const attr = findAttribute(node, attrName);
  if (!attr || attr.value === null) return undefined;

  if (
    attr.value.type === 'JSXExpressionContainer' &&
    attr.value.expression.type === 'Literal' &&
    typeof attr.value.expression.value === 'number'
  ) {
    return attr.value.expression.value;
  }

  if (attr.value.type === 'Literal' && typeof attr.value.value === 'string') {
    const parsed = parseInt(attr.value.value, 10);
    if (!Number.isNaN(parsed)) return parsed;
  }

  return undefined;
}

/** Check whether a JSX attribute exists on an element (ignores value). */
export function hasAttribute(
  node: JSXOpeningElement,
  attrName: string,
): boolean {
  return findAttribute(node, attrName) !== undefined;
}

/** Check whether any of the listed event handler props exist. */
export function hasAnyEventHandler(
  node: JSXOpeningElement,
  handlerNames: ReadonlyArray<string>,
): boolean {
  return handlerNames.some((name) => hasAttribute(node, name));
}

// ── Element type ─────────────────────────────────────────────────────

/**
 * Get the tag name from a JSXOpeningElement.
 * Returns empty string for member expressions (<Foo.Bar />)
 * which our rules don't need to inspect.
 */
export function getElementType(node: JSXOpeningElement): string {
  if (node.name.type === 'JSXIdentifier' && 'name' in node.name) {
    return node.name.name ?? '';
  }
  return '';
}

// ── Element classification ───────────────────────────────────────────

/**
 * Native HTML elements with built-in keyboard behavior.
 *
 * <a> is only interactive when it has an href attribute. Without href,
 * it's a placeholder anchor with no keyboard behavior and no implicit
 * role. This matters for tooltip-no-interactive (an <a> without href
 * inside a tooltip is not a violation) and focusable-has-interaction
 * (an <a> without href and tabIndex={0} SHOULD fire).
 */
export function isInteractiveElement(
  tagName: string,
  node?: JSXOpeningElement,
): boolean {
  const lower = tagName.toLowerCase();
  if (INTERACTIVE_ELEMENTS.has(lower)) return true;
  if (lower === 'a') {
    // If no node provided, assume interactive (conservative)
    if (!node) return true;
    return hasAttribute(node, 'href');
  }
  return false;
}

/**
 * Heading check: h1-h6 by tag name or role="heading".
 * WAI-ARIA requires accordion triggers inside headings
 * for document structure navigation.
 */
export function isHeadingElement(
  tagName: string,
  node?: JSXOpeningElement,
): boolean {
  if (HEADING_ELEMENTS.has(tagName.toLowerCase())) return true;
  if (node && getAttributeValue(node, 'role') === 'heading') return true;
  return false;
}

/** Form inputs that require accessible labels. */
export function isFormInput(tagName: string): boolean {
  return FORM_INPUT_ELEMENTS.has(tagName.toLowerCase());
}

// ── Ancestor traversal ───────────────────────────────────────────────

/**
 * Walk up the JSX tree checking ancestors against a predicate.
 *
 * Used instead of mutable state flags (e.g. `insideTooltip = true`)
 * because ancestor walking is stateless and handles nested components,
 * conditional rendering, and interleaved elements correctly.
 */
export function hasMatchingAncestor(
  node: JSXOpeningElement,
  predicate: (ancestor: JSXOpeningElement) => boolean,
): boolean {
  // ESLint's AST nodes have a `parent` property set during traversal.
  // We walk up until we hit the program root (parent is undefined/null).
  // ASTParentNode types the minimal shape we need from the parent chain.
  let current: ASTParentNode | null | undefined =
    node.parent as unknown as ASTParentNode | null;

  while (current) {
    if (current.type === 'JSXElement' && current.openingElement) {
      if (predicate(current.openingElement)) return true;
    }
    current = current.parent ?? null;
  }

  return false;
}
