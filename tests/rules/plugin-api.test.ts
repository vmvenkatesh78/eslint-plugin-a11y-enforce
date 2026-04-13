/**
 * Public API type contract test.
 *
 * Validates that the plugin's default export has the shape consumers
 * expect: meta with name/version, rules as a record of RuleModules,
 * and configs with recommended/flat/legacy presets.
 *
 * This test catches breaking changes to the public API surface that
 * would not be caught by rule-level unit tests.
 */

import { describe, it, expect } from 'vitest';
import plugin, { rules } from '../../src/index';

describe('plugin public API', () => {
  it('exports plugin as default with meta, rules, and configs', () => {
    expect(plugin.meta).toBeDefined();
    expect(plugin.meta.name).toBe('eslint-plugin-a11y-enforce');
    expect(plugin.meta.version).toBe('0.2.0');
    expect(plugin.rules).toBeDefined();
    expect(plugin.configs).toBeDefined();
  });

  it('exports exactly 10 rules', () => {
    const ruleNames = Object.keys(plugin.rules);
    expect(ruleNames).toHaveLength(10);
  });

  it('exports all expected rule names', () => {
    const expected = [
      'dialog-requires-modal',
      'dialog-requires-title',
      'haspopup-role-match',
      'tooltip-no-interactive',
      'accordion-trigger-heading',
      'menuitem-not-button',
      'focusable-has-interaction',
      'input-requires-label',
      'radio-group-requires-grouping',
      'no-positive-tabindex',
    ];

    for (const name of expected) {
      expect(plugin.rules[name]).toBeDefined();
      expect(plugin.rules[name]?.meta).toBeDefined();
      expect(plugin.rules[name]?.create).toBeTypeOf('function');
    }
  });

  it('named export { rules } matches plugin.rules', () => {
    expect(rules).toBe(plugin.rules);
  });

  it('every rule has meta.type, meta.docs, meta.messages, and meta.schema', () => {
    for (const [name, rule] of Object.entries(plugin.rules)) {
      expect(rule.meta?.type, `${name} missing meta.type`).toBe('problem');
      expect(rule.meta?.docs?.description, `${name} missing description`).toBeTypeOf('string');
      expect(rule.meta?.docs?.url, `${name} missing url`).toContain('github.com');
      expect(rule.meta?.messages, `${name} missing messages`).toBeDefined();
      expect(rule.meta?.schema, `${name} missing schema`).toEqual([]);
    }
  });

  it('recommended config sets all rules to error', () => {
    const recommended = plugin.configs['recommended'] as Record<string, unknown>;
    expect(recommended).toBeDefined();

    const configRules = recommended['rules'] as Record<string, string>;
    const ruleNames = Object.keys(plugin.rules);

    for (const name of ruleNames) {
      expect(configRules[`a11y-enforce/${name}`]).toBe('error');
    }
  });

  it('flat/recommended and recommended are the same object', () => {
    expect(plugin.configs['flat/recommended']).toBe(plugin.configs['recommended']);
  });

  it('legacy/recommended uses string plugin reference', () => {
    const legacy = plugin.configs['legacy/recommended'] as Record<string, unknown>;
    expect(legacy).toBeDefined();

    const plugins = legacy['plugins'] as string[];
    expect(plugins).toContain('a11y-enforce');
  });

  it('doc URLs do not point to nonexistent files', () => {
    for (const [, rule] of Object.entries(plugin.rules)) {
      const url = rule.meta?.docs?.url;
      // Must point to README anchors, not docs/rules/ which doesn't exist
      expect(url).not.toContain('docs/rules/');
      expect(url).toContain('README.md#');
    }
  });
});
