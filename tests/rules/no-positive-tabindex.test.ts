import { RuleTester } from 'eslint';
import rule from '../../src/rules/no-positive-tabindex';

const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

tester.run('no-positive-tabindex', rule, {
  valid: [
    { code: '<div tabIndex={0}>Focusable in DOM order</div>' },
    { code: '<div tabIndex={-1}>Programmatic focus</div>' },
    { code: '<button>Naturally focusable</button>' },
    { code: '<input type="text" />' },
    { code: '<div>Regular</div>' },
    { code: '<span>Text</span>' },
  ],
  invalid: [
    { code: '<div tabIndex={1}>Out of order</div>', errors: [{ messageId: 'positiveTabindex' }] },
    { code: '<div tabIndex={5}>Way out of order</div>', errors: [{ messageId: 'positiveTabindex' }] },
    { code: '<div tabIndex={100}>Extreme</div>', errors: [{ messageId: 'positiveTabindex' }] },
    { code: '<span tabIndex={2}>Span with positive</span>', errors: [{ messageId: 'positiveTabindex' }] },
    { code: '<button tabIndex={3}>Button with positive</button>', errors: [{ messageId: 'positiveTabindex' }] },
  ],
});
