import { RuleTester } from 'eslint';
import rule from '../../src/rules/menuitem-not-button';

const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

tester.run('menuitem-not-button', rule, {
  valid: [
    { code: '<div role="menuitem" tabIndex={-1}>Edit</div>' },
    { code: '<li role="menuitem">Delete</li>' },
    { code: '<div role="menuitem" tabIndex={-1}>Copy</div>' },
    { code: '<li role="menuitemcheckbox">Toggle</li>' },
    { code: '<li role="menuitemradio">Option</li>' },
    { code: '<button>Click</button>' },
    { code: '<button role="tab">Tab</button>' },
  ],
  invalid: [
    { code: '<button role="menuitem">Edit</button>', errors: [{ messageId: 'menuitemOnButton' }] },
    { code: '<button role="menuitemcheckbox">Toggle</button>', errors: [{ messageId: 'menuitemOnButton' }] },
    { code: '<button role="menuitemradio">Option A</button>', errors: [{ messageId: 'menuitemOnButton' }] },
  ],
});
