import { describe, it, expect } from 'vitest';
import {
  parseVariables,
  getInstanceKey,
  resolvePrompt,
  resolveAndCleanPrompt,
  countStats,
  extractVariableKeys,
} from '../utils/promptEngine';
import { INITIAL_DEFAULTS } from '../data/banks';

describe('promptEngine', () => {
  it('PE-01: parseVariables basic', () => {
    expect(parseVariables('Hello {{name}}')).toEqual(['name']);
  });

  it('PE-02: parseVariables duplicate', () => {
    expect(parseVariables('{{a}} and {{a}}')).toEqual(['a', 'a']);
  });

  it('PE-03/04: getInstanceKey', () => {
    expect(getInstanceKey('color', 0)).toBe('color-0');
    expect(getInstanceKey('color', 1)).toBe('color-1');
  });

  it('PE-05: resolvePrompt string option', () => {
    const result = resolvePrompt('Hi {{name}}', { 'name-0': 'World' }, {}, 'zh-tw');
    expect(result).toBe('Hi World');
  });

  it('PE-06: resolvePrompt bilingual option', () => {
    const result = resolvePrompt(
      '{{role}}',
      { 'role-0': { 'zh-tw': '畫師', en: 'Artist' } },
      {},
      'en'
    );
    expect(result).toBe('Artist');
  });

  it('resolves legacy Chinese defaults to English bank options', () => {
    const result = resolvePrompt(
      '{{subject}} | {{duration}} | {{negative_prompt}}',
      {},
      INITIAL_DEFAULTS,
      'en'
    );

    expect(result).toBe('A young woman | 10 seconds | blurry, low quality, deformed, extra fingers');
  });

  it('preserves custom string defaults in English mode', () => {
    const result = resolvePrompt('{{subject}}', {}, { subject: '自訂角色' }, 'en');

    expect(result).toBe('自訂角色');
  });

  it('localizes legacy string selections in both directions', () => {
    expect(resolvePrompt('{{subject}}', { 'subject-0': '一位年輕女性' }, {}, 'en')).toBe(
      'A young woman'
    );
    expect(resolvePrompt('{{subject}}', { 'subject-0': 'A young woman' }, {}, 'zh-tw')).toBe(
      '一位年輕女性'
    );
  });

  it('PE-07: resolvePrompt multi instance', () => {
    const result = resolvePrompt('{{x}} {{x}}', { 'x-0': 'A', 'x-1': 'B' }, {}, 'zh-tw');
    expect(result).toBe('A B');
  });

  it('PE-08: resolvePrompt missing selection keeps placeholder', () => {
    const result = resolvePrompt('{{missing}}', {}, {}, 'zh-tw');
    expect(result).toBe('{{missing}}');
  });

  it('PE-09/10: countStats', () => {
    expect(countStats('abcd')).toEqual({ chars: 4, tokensEstimate: 1 });
    expect(countStats('你好世界').chars).toBe(4);
  });

  it('extractVariableKeys from bilingual content', () => {
    const keys = extractVariableKeys({ 'zh-tw': '{{a}}', en: '{{b}}' });
    expect(keys).toContain('a');
    expect(keys).toContain('b');
  });

  it('resolveAndCleanPrompt strips markdown', () => {
    const result = resolveAndCleanPrompt('### Title\n**bold**', {}, {}, 'zh-tw');
    expect(result).toContain('Title');
    expect(result).not.toContain('**');
  });
});
