import { describe, it, expect } from 'vitest';
import { mergeTemplatesWithSystem, mergeBanksWithSystem, needsSystemDataSync } from '../utils/merge';
import { INITIAL_TEMPLATES_CONFIG, SYSTEM_DATA_VERSION } from '../data/templates';

describe('merge', () => {
  it('MG-01: mergeTemplates preserves selections', () => {
    const current = [
      {
        id: 'tpl_seedance_general',
        name: 'Changed',
        content: 'Changed content {{x}}',
        selections: { 'x-0': 'custom' },
      },
    ];

    const { templates } = mergeTemplatesWithSystem(current, { backupSuffix: ' (backup)' });
    const merged = templates.find((t) => t.id === 'tpl_seedance_general');
    expect(merged?.selections?.['x-0']).toBe('custom');
  });

  it('MG-02: mergeTemplates backs up user-modified system template', () => {
    const current = [
      {
        id: 'tpl_seedance_general',
        name: 'User Edit',
        content: 'User content',
        selections: {},
      },
    ];

    const { templates, notes } = mergeTemplatesWithSystem(current, { backupSuffix: ' (backup)' });
    const hasBackup = templates.some((t) => {
      if (t.id === 'tpl_seedance_general') return false;
      const nameStr = typeof t.name === 'string' ? t.name : JSON.stringify(t.name);
      return nameStr.includes('User Edit');
    });
    expect(hasBackup).toBe(true);
    expect(notes.length).toBeGreaterThan(0);
  });

  it('MG-03: mergeTemplates keeps custom templates', () => {
    const current = [
      {
        id: 'tpl_custom_abc',
        name: 'My Template',
        content: 'Custom',
        selections: {},
      },
    ];

    const { templates } = mergeTemplatesWithSystem(current, { backupSuffix: '' });
    expect(templates.some((t) => t.id === 'tpl_custom_abc')).toBe(true);
  });

  it('MG-04: mergeBanks keeps custom options', () => {
    const customOption = { 'zh-tw': '自訂選項', en: 'Custom Option' };
    const currentBanks = {
      subject: {
        label: { 'zh-tw': '主體', en: 'Subject' },
        category: 'subject',
        options: [...[], customOption],
      },
    };

    const { banks, notes } = mergeBanksWithSystem(currentBanks, {}, { backupSuffix: '' });
    const hasCustom = banks.subject.options.some(
      (opt) => typeof opt === 'object' && opt['zh-tw'] === '自訂選項'
    );
    expect(hasCustom).toBe(true);
    expect(notes.some((n) => n.includes('自訂義選項'))).toBe(true);
  });

  it('MG-06: needsSystemDataSync detects missing system templates', () => {
    const partial = INITIAL_TEMPLATES_CONFIG.slice(0, 5);
    expect(needsSystemDataSync(partial, SYSTEM_DATA_VERSION)).toBe(true);
    expect(needsSystemDataSync(INITIAL_TEMPLATES_CONFIG, SYSTEM_DATA_VERSION)).toBe(false);
  });

  it('MG-07: mergeTemplates preserves user cover images during system updates', () => {
    const systemTemplate = INITIAL_TEMPLATES_CONFIG[0];
    const current = [
      {
        ...systemTemplate,
        imageUrl: 'data:image/jpeg;base64,user-cover',
        imageUrls: ['data:image/jpeg;base64,user-cover', 'https://example.com/second.jpg'],
      },
    ];

    const { templates } = mergeTemplatesWithSystem(current, { backupSuffix: ' (backup)' });
    const merged = templates.find((template) => template.id === systemTemplate.id);

    expect(merged.imageUrl).toBe('data:image/jpeg;base64,user-cover');
    expect(merged.imageUrls).toEqual([
      'data:image/jpeg;base64,user-cover',
      'https://example.com/second.jpg',
    ]);
  });

  it('MG-08: mergeTemplates replaces legacy bundled covers with current generated covers', () => {
    const systemTemplate = INITIAL_TEMPLATES_CONFIG[0];
    const current = [
      {
        ...systemTemplate,
        imageUrl: './template-covers/agent-system.jpg',
      },
    ];

    const { templates } = mergeTemplatesWithSystem(current, { backupSuffix: ' (backup)' });
    const merged = templates.find((template) => template.id === systemTemplate.id);

    expect(merged.imageUrl).toBe(systemTemplate.imageUrl);
  });

  it('MG-05: mergeBanks keeps new custom bank', () => {
    const currentBanks = {
      my_custom_bank: {
        label: 'Custom',
        category: 'other',
        options: ['one'],
      },
    };

    const { banks } = mergeBanksWithSystem(currentBanks, {}, { backupSuffix: '' });
    expect(banks.my_custom_bank).toBeDefined();
  });
});
