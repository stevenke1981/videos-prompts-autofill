import { describe, it, expect } from 'vitest';
import { withDeliverables, DELIVERABLES_SECTION } from '../constants/deliverables';

describe('video specs deliverables', () => {
  it('appends section to bilingual content', () => {
    const result = withDeliverables({ 'zh-tw': '### Subject\n內容', en: '### Subject\nContent' });
    expect(result['zh-tw']).toContain('影片技術規格');
    expect(result['zh-tw']).toContain('{{duration}}');
    expect(result.en).toContain('Video Specs');
    expect(result.en).toContain('{{aspect_ratio}}');
  });

  it('does not duplicate if section already exists', () => {
    const existing = { 'zh-tw': `### Subject\n\n${DELIVERABLES_SECTION['zh-tw']}`, en: '### Subject' };
    const result = withDeliverables(existing);
    expect((result['zh-tw'].match(/影片技術規格/g) || []).length).toBe(1);
  });

  it('appends to string content', () => {
    const result = withDeliverables('Hello prompt');
    expect(result).toContain('影片技術規格');
  });
});