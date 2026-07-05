import { useMemo } from 'react';
import { resolveAndCleanPrompt, countStats } from '../utils/promptEngine';

export const usePromptStats = (activeTemplate, defaults, templateLanguage) =>
  useMemo(() => {
    if (!activeTemplate) return { chars: 0, tokensEstimate: 0 };

    const resolved = resolveAndCleanPrompt(
      activeTemplate.content,
      activeTemplate.selections,
      defaults,
      templateLanguage
    );
    return countStats(resolved);
  }, [activeTemplate, defaults, templateLanguage]);