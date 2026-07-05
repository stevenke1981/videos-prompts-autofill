import { describe, it, expect } from 'vitest';
import { deepClone, makeUniqueKey, getLocalized } from '../utils/helpers';

describe('helpers', () => {
  it('HL-01: deepClone nested object', () => {
    const original = { a: { b: 1 } };
    const cloned = deepClone(original);
    cloned.a.b = 2;
    expect(original.a.b).toBe(1);
  });

  it('HL-02: makeUniqueKey collision', () => {
    const existing = new Set(['foo', 'foo_custom_1']);
    const key = makeUniqueKey('foo', existing, 'custom');
    expect(existing.has(key)).toBe(false);
    expect(key).toContain('foo');
  });

  it('HL-03: getLocalized string', () => {
    expect(getLocalized('plain', 'zh-tw')).toBe('plain');
  });

  it('HL-04/05: getLocalized object', () => {
    const obj = { 'zh-tw': '中文', en: 'English' };
    expect(getLocalized(obj, 'zh-tw')).toBe('中文');
    expect(getLocalized(obj, 'en')).toBe('English');
  });

  it('HL-06: getLocalized fallback', () => {
    const obj = { 'zh-tw': '中文' };
    expect(getLocalized(obj, 'en')).toBe('中文');
  });
});