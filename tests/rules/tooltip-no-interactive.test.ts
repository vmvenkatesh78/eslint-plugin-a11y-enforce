import { RuleTester } from 'eslint';
import rule from '../../src/rules/tooltip-no-interactive';

const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

tester.run('tooltip-no-interactive', rule, {
  valid: [
    { code: '<div role="tooltip">Save your changes</div>' },
    { code: '<div role="tooltip"><strong>Shortcut:</strong> Ctrl+S</div>' },
    { code: '<div role="tooltip"><span>Help text</span></div>' },
    { code: '<div><button>Click</button></div>' },
    { code: '<div role="menu"><button>Item</button></div>' },
  ],
  invalid: [
    { code: '<div role="tooltip"><button>Learn more</button></div>', errors: [{ messageId: 'interactiveInTooltip' }] },
    { code: '<div role="tooltip"><a href="/help">Help</a></div>', errors: [{ messageId: 'interactiveInTooltip' }] },
    { code: '<div role="tooltip"><input type="text" /></div>', errors: [{ messageId: 'interactiveInTooltip' }] },
    { code: '<div role="tooltip"><select><option>A</option></select></div>', errors: [{ messageId: 'interactiveInTooltip' }] },
    { code: '<div role="tooltip"><textarea /></div>', errors: [{ messageId: 'interactiveInTooltip' }] },
    { code: '<div role="tooltip"><div tabIndex={0}>Focusable</div></div>', errors: [{ messageId: 'interactiveInTooltip' }] },
    { code: '<div role="tooltip"><div role="button">Action</div></div>', errors: [{ messageId: 'interactiveInTooltip' }] },
  ],
});
