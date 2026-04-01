import { RuleTester } from 'eslint';
import rule from '../../src/rules/haspopup-role-match';

const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

tester.run('haspopup-role-match', rule, {
  valid: [
    { code: '<button aria-haspopup="menu">Actions</button>' },
    { code: '<button aria-haspopup="listbox">Select</button>' },
    { code: '<button aria-haspopup="dialog">Settings</button>' },
    { code: '<button aria-haspopup="tree">Tree</button>' },
    { code: '<button aria-haspopup="grid">Grid</button>' },
    { code: '<button aria-haspopup="true">Menu</button>' },
    { code: '<button aria-haspopup="false">Nothing</button>' },
    { code: '<button>Click</button>' },
    { code: '<div role="menu">Menu</div>' },
  ],
  invalid: [
    { code: '<button aria-haspopup="tooltip">Help</button>', errors: [{ messageId: 'invalidHaspopup' }] },
    { code: '<button aria-haspopup="">Open</button>', errors: [{ messageId: 'invalidHaspopup' }] },
    { code: '<button aria-haspopup="popup">Show</button>', errors: [{ messageId: 'invalidHaspopup' }] },
    { code: '<button aria-haspopup="dropdown">Menu</button>', errors: [{ messageId: 'invalidHaspopup' }] },
  ],
});
