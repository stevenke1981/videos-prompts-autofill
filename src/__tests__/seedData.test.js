import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { INITIAL_TEMPLATES_CONFIG, SYSTEM_DATA_VERSION } from '../data/templates';
import { INITIAL_BANKS, INITIAL_DEFAULTS } from '../data/banks';
import { extractVariableKeys } from '../utils/promptEngine';
import { getLocalized } from '../utils/helpers';

describe('video seed data', () => {
  it('has at least 15 templates', () => {
    expect(INITIAL_TEMPLATES_CONFIG.length).toBeGreaterThanOrEqual(15);
  });

  it('bumps the system data version for generated cover migration', () => {
    expect(SYSTEM_DATA_VERSION).toBe('1.1.0');
  });

  it('all system templates have a bundled cover image', () => {
    const imageUrls = new Set();

    INITIAL_TEMPLATES_CONFIG.forEach((template) => {
      expect(template.imageUrl, `Missing cover for ${template.id}`).toMatch(
        /^\.\/template-covers\/video\/.+\.webp$/
      );
      imageUrls.add(template.imageUrl);
      const coverPath = resolve(process.cwd(), 'public', template.imageUrl.slice(2));
      expect(existsSync(coverPath), `Cover file not found for ${template.id}`).toBe(true);
    });

    expect(imageUrls.size).toBe(INITIAL_TEMPLATES_CONFIG.length);
  });

  it('has at least 40 banks', () => {
    expect(Object.keys(INITIAL_BANKS).length).toBeGreaterThanOrEqual(40);
  });

  it('all template variables exist in banks or defaults', () => {
    const bankKeys = new Set(Object.keys(INITIAL_BANKS));
    const defaultKeys = new Set(Object.keys(INITIAL_DEFAULTS));

    INITIAL_TEMPLATES_CONFIG.forEach((template) => {
      const content = getLocalized(template.content, 'zh-tw');
      const keys = extractVariableKeys(content);
      keys.forEach((key) => {
        expect(
          bankKeys.has(key) || defaultKeys.has(key),
          `Missing bank/default for {{${key}}} in ${template.id}`
        ).toBe(true);
      });
    });
  });

  it('all system templates have distinct bilingual copy with matching variables', () => {
    INITIAL_TEMPLATES_CONFIG.forEach((template) => {
      const zhContent = getLocalized(template.content, 'zh-tw');
      const enContent = getLocalized(template.content, 'en');

      expect(zhContent.trim(), `Missing zh-tw content for ${template.id}`).not.toBe('');
      expect(enContent.trim(), `Missing en content for ${template.id}`).not.toBe('');
      expect(zhContent, `Unlocalized zh-tw content for ${template.id}`).not.toBe(enContent);
      expect(extractVariableKeys(zhContent).sort()).toEqual(extractVariableKeys(enContent).sort());
    });
  });
});
