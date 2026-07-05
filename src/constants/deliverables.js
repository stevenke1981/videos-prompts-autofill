/**
 * 影片技術規格區段 — Video Specs
 */

export const DELIVERABLES_SECTION = {
  'zh-tw': `### Video Specs (影片技術規格)
請依以下參數生成影片：

**1. 時長**
- {{duration}}

**2. 畫幅**
- {{aspect_ratio}}

**3. 幀率**
- {{fps}}

**4. 負向提示**
- {{negative_prompt}}

**5. 平台建議**
- {{platform_hint}}`,

  en: `### Video Specs
Generate video with the following parameters:

**1. Duration**
- {{duration}}

**2. Aspect Ratio**
- {{aspect_ratio}}

**3. Frame Rate**
- {{fps}}

**4. Negative Prompt**
- {{negative_prompt}}

**5. Platform Hint**
- {{platform_hint}}`,
};

const HAS_SPECS = /###\s*Video Specs|影片技術規格/;

export const withDeliverables = (content) => {
  if (!content) return content;

  if (typeof content === 'string') {
    if (HAS_SPECS.test(content)) return content;
    return `${content.trim()}\n\n${DELIVERABLES_SECTION['zh-tw']}`;
  }

  return {
    'zh-tw': HAS_SPECS.test(content['zh-tw'] || '')
      ? content['zh-tw']
      : `${(content['zh-tw'] || '').trim()}\n\n${DELIVERABLES_SECTION['zh-tw']}`,
    en: HAS_SPECS.test(content.en || '')
      ? content.en
      : `${(content.en || '').trim()}\n\n${DELIVERABLES_SECTION.en}`,
  };
};