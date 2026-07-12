import { getLocalized } from './helpers';
import { getLocalizedBankValue } from '../data/banks';

const VARIABLE_REGEX = /{{(.*?)}}/g;

export const parseVariables = (content) => {
  if (!content || typeof content !== 'string') return [];
  const keys = [];
  let match;
  const regex = new RegExp(VARIABLE_REGEX.source, 'g');
  while ((match = regex.exec(content)) !== null) {
    keys.push(match[1].trim());
  }
  return keys;
};

export const getInstanceKey = (varName, occurrenceIndex) => `${varName}-${occurrenceIndex}`;

export const extractVariableKeys = (content) => {
  const keys = new Set();
  const localizedContent =
    typeof content === 'object' ? Object.values(content).join(' ') : content;
  const regex = new RegExp(VARIABLE_REGEX.source, 'g');
  let match;
  while ((match = regex.exec(localizedContent)) !== null) {
    keys.add(match[1].trim());
  }
  return Array.from(keys);
};

export const resolvePrompt = (content, selections = {}, defaults = {}, language = 'zh-tw') => {
  const localizedContent = getLocalized(content, language);
  const counters = {};

  return localizedContent.replace(VARIABLE_REGEX, (match, key) => {
    const k = key.trim();
    const idx = counters[k] || 0;
    counters[k] = idx + 1;

    const uniqueKey = getInstanceKey(k, idx);
    const selectedValue = selections[uniqueKey] ?? selections[k];
    const value = selectedValue !== undefined && selectedValue !== null
      ? getLocalizedBankValue(k, selectedValue, language)
      : getLocalizedBankValue(k, defaults[k], language);
    return getLocalized(value, language) || match;
  });
};

export const cleanPromptText = (text) =>
  text
    .replace(/###\s/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\n\s*\n/g, '\n\n');

export const resolveAndCleanPrompt = (content, selections, defaults, language) =>
  cleanPromptText(resolvePrompt(content, selections, defaults, language));

export const countStats = (text) => {
  const chars = text?.length ?? 0;
  return {
    chars,
    tokensEstimate: Math.max(1, Math.ceil(chars / 4)),
  };
};
