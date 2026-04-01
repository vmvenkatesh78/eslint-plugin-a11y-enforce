import { RuleTester } from 'eslint';
import rule from '../../src/rules/dialog-requires-modal';

const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

tester.run('dialog-requires-modal', rule, {
  valid: [
    { code: '<div role="dialog" aria-modal="true">Content</div>' },
    { code: '<div role="alertdialog" aria-modal="true">Alert</div>' },
    { code: '<div role="dialog" aria-modal="true" aria-labelledby="t">Content</div>' },
    { code: '<div role="menu">Menu</div>' },
    { code: '<div role="listbox">Options</div>' },
    { code: '<div>No role</div>' },
    { code: '<button>Click</button>' },
  ],
  invalid: [
    { code: '<div role="dialog">Content</div>', errors: [{ messageId: 'missingAriaModal' }] },
    { code: '<div role="alertdialog">Alert</div>', errors: [{ messageId: 'missingAriaModal' }] },
    { code: '<div role="dialog" aria-modal="false">Content</div>', errors: [{ messageId: 'missingAriaModal' }] },
    { code: '<section role="dialog" aria-labelledby="title">Content</section>', errors: [{ messageId: 'missingAriaModal' }] },
  ],
});
