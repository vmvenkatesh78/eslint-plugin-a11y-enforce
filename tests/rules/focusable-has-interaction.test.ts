import { RuleTester } from 'eslint';
import rule from '../../src/rules/focusable-has-interaction';

const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

tester.run('focusable-has-interaction', rule, {
  valid: [
    { code: '<div tabIndex={0} onKeyDown={handleKey}>Interactive</div>' },
    { code: '<div tabIndex={0} onKeyUp={handleKey}>Interactive</div>' },
    { code: '<div tabIndex={0} onKeyPress={handleKey}>Interactive</div>' },
    { code: '<div tabIndex={0} role="button" onKeyDown={handleKey}>Action</div>' },
    { code: '<div tabIndex={-1}>Programmatic</div>' },
    { code: '<div>Regular div</div>' },
    { code: '<button tabIndex={0}>Button</button>' },
    { code: '<input tabIndex={0} />' },
    { code: '<a tabIndex={0} href="/">Link</a>' },
    { code: '<select tabIndex={0}><option>A</option></select>' },
    { code: '<textarea tabIndex={0} />' },
  ],
  invalid: [
    { code: '<div tabIndex={0}>Focusable but no handler</div>', errors: [{ messageId: 'missingKeyboardHandler' }] },
    { code: '<div tabIndex={0} onClick={handleClick}>Click only</div>', errors: [{ messageId: 'missingKeyboardHandler' }] },
    { code: '<span tabIndex={0} role="button">No keyboard</span>', errors: [{ messageId: 'missingKeyboardHandler' }] },
    { code: '<li tabIndex={0}>Focusable list item</li>', errors: [{ messageId: 'missingKeyboardHandler' }] },
  ],
});
