import { RuleTester } from 'eslint';
import rule from '../../src/rules/accordion-trigger-heading';

const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

tester.run('accordion-trigger-heading', rule, {
  valid: [
    { code: '<h3><button aria-expanded="true" aria-controls="p1">Section</button></h3>' },
    { code: '<h2><button aria-expanded="false">Section</button></h2>' },
    { code: '<h1><button aria-expanded="true">Section</button></h1>' },
    { code: '<h4><button aria-expanded="false">Section</button></h4>' },
    { code: '<h5><button aria-expanded="true">Section</button></h5>' },
    { code: '<h6><button aria-expanded="false">Section</button></h6>' },
    { code: '<div role="heading" aria-level="3"><button aria-expanded="true">Section</button></div>' },
    { code: '<div><button>Not accordion</button></div>' },
    { code: '<button onClick={fn}>Regular button</button>' },
  ],
  invalid: [
    { code: '<div><button aria-expanded="true" aria-controls="p1">Section</button></div>', errors: [{ messageId: 'missingHeading' }] },
    { code: '<button aria-expanded="true">Section</button>', errors: [{ messageId: 'missingHeading' }] },
    { code: '<span><button aria-expanded="false">Section</button></span>', errors: [{ messageId: 'missingHeading' }] },
    { code: '<li><button aria-expanded="true">Section</button></li>', errors: [{ messageId: 'missingHeading' }] },
  ],
});
