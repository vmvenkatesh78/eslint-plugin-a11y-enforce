import { RuleTester } from 'eslint';
import rule from '../../src/rules/radio-group-requires-grouping';

const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

tester.run('radio-group-requires-grouping', rule, {
  valid: [
    { code: '<fieldset><legend>Color</legend><input type="radio" name="color" value="red" /></fieldset>' },
    { code: '<fieldset><input type="radio" name="size" value="s" /><input type="radio" name="size" value="m" /></fieldset>' },
    { code: '<div role="radiogroup" aria-label="Color"><input type="radio" name="color" value="red" /></div>' },
    { code: '<fieldset><legend>Size</legend><div><input type="radio" name="size" value="s" /></div></fieldset>' },
    { code: '<div><input type="text" /></div>' },
    { code: '<div><input type="checkbox" /></div>' },
    { code: '<button>Click</button>' },
  ],
  invalid: [
    { code: '<div><input type="radio" name="color" value="red" /></div>', errors: [{ messageId: 'missingGrouping' }] },
    { code: '<input type="radio" name="color" value="red" />', errors: [{ messageId: 'missingGrouping' }] },
    { code: '<span><input type="radio" name="size" value="s" /></span>', errors: [{ messageId: 'missingGrouping' }] },
    { code: '<ul><li><input type="radio" name="opt" value="a" /></li></ul>', errors: [{ messageId: 'missingGrouping' }] },
  ],
});
