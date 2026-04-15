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
          readonly operator?: string;
          readonly argument?: {
            readonly type: string;
            readonly value?: number;
          };
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
  readonly parent: JSXElement | ASTParentNode | null;
}

/**
 * Minimal interface for the ESLint AST parent chain.
 *
 * ESLint sets a `parent` property on every node during traversal.
 * The parent chain extends beyond JSX nodes into the full ESTree
 * (ExpressionStatement, Program, etc.). We type only the fields
 * we inspect during ancestor walking: `type`, `openingElement`
 * (present on JSXElement nodes), and `parent` (the next ancestor).
 *
 * This replaces the previous `Record<string, unknown>` cast,
 * which was correct but fragile — a parser change that restructured
 * the parent chain would silently break without a type error.
 */
export interface ASTParentNode {
  readonly type: string;
  readonly openingElement?: JSXOpeningElement;
  readonly parent?: ASTParentNode | null;
}
