import { RuleTester } from 'eslint';
import rule from '../../src/rules/input-requires-label';

const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

tester.run('input-requires-label', rule, {
  valid: [
    { code: '<input aria-label="Search" type="text" />' },
    { code: '<input aria-labelledby="name-label" type="text" />' },
    { code: '<input id="email" type="email" />' },
    { code: '<select aria-label="Country"><option>India</option></select>' },
    { code: '<textarea aria-label="Comments" />' },
    { code: '<textarea id="bio" />' },
    { code: '<select id="region"><option>Asia</option></select>' },
    { code: '<input type="hidden" name="csrf" value="token" />' },
    { code: '<div>Not an input</div>' },
    { code: '<button>Click</button>' },
  ],
  invalid: [
    { code: '<input type="text" />', errors: [{ messageId: 'missingLabel' }] },
    { code: '<input type="text" placeholder="Enter name" />', errors: [{ messageId: 'missingLabel' }] },
    { code: '<select><option>India</option></select>', errors: [{ messageId: 'missingLabel' }] },
    { code: '<textarea />', errors: [{ messageId: 'missingLabel' }] },
    { code: '<input type="email" placeholder="Email" />', errors: [{ messageId: 'missingLabel' }] },
    { code: '<input type="password" />', errors: [{ messageId: 'missingLabel' }] },
  ],
});
