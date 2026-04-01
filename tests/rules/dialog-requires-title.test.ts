import { RuleTester } from 'eslint';
import rule from '../../src/rules/dialog-requires-title';

const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

tester.run('dialog-requires-title', rule, {
  valid: [
    { code: '<div role="dialog" aria-modal="true" aria-labelledby="t1">Content</div>' },
    { code: '<div role="dialog" aria-modal="true" aria-label="Settings">Content</div>' },
    { code: '<div role="alertdialog" aria-modal="true" aria-labelledby="t1">Alert</div>' },
    { code: '<div role="alertdialog" aria-modal="true" aria-label="Warning">Alert</div>' },
    { code: '<div role="dialog" aria-label="Confirm" aria-labelledby="t1">Content</div>' },
    { code: '<div role="menu">Menu</div>' },
    { code: '<div>No role</div>' },
  ],
  invalid: [
    { code: '<div role="dialog" aria-modal="true">Content</div>', errors: [{ messageId: 'missingDialogTitle' }] },
    { code: '<div role="alertdialog" aria-modal="true">Alert</div>', errors: [{ messageId: 'missingDialogTitle' }] },
    { code: '<div role="dialog">Content</div>', errors: [{ messageId: 'missingDialogTitle' }] },
    { code: '<section role="dialog" aria-modal="true">Content</section>', errors: [{ messageId: 'missingDialogTitle' }] },
  ],
});
