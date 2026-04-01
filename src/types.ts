/**
 * JSX AST node type definitions for ESLint rule visitors.
 *
 * ESLint's built-in parser (espree) supports JSX syntax, but
 * @types/estree does not include JSX node types. This is a known
 * gap - eslint-plugin-jsx-a11y defines its own types the same way.
 *
 * These types model the subset of the ESTree JSX extension that
 * our rules inspect. They are intentionally narrow: we only type
 * what we read, not the full spec.
 *
 * @see https://github.com/facebook/jsx/blob/main/AST.md
 */

export interface JSXIdentifier {
  readonly type: 'JSXIdentifier';
  readonly name: string;
}

export interface JSXAttribute {
  readonly type: 'JSXAttribute';
  readonly name: JSXIdentifier;
  readonly value:
    | { readonly type: 'Literal'; readonly value: string | number | boolean | null }
    | {
        readonly type: 'JSXExpressionContainer';
        readonly expression: {
          readonly type: string;
          readonly value?: string | number | boolean | null;
        };
      }
    | null;
}

export interface JSXSpreadAttribute {
  readonly type: 'JSXSpreadAttribute';
}

export interface JSXOpeningElement {
  readonly type: 'JSXOpeningElement';
  readonly name: JSXIdentifier | { readonly type: string; readonly name?: string };
  readonly attributes: ReadonlyArray<JSXAttribute | JSXSpreadAttribute>;
  readonly parent: JSXElement;
}

export interface JSXElement {
  readonly type: 'JSXElement';
  readonly openingElement: JSXOpeningElement;
  readonly children: ReadonlyArray<unknown>;
  readonly parent: JSXElement | unknown;
}
