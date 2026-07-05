import React, { useMemo, useState } from 'react';
import { Search, Copy, Download, ExternalLink, Flame, FolderOpen } from 'lucide-react';
import { getLocalized } from '../utils/helpers';
import {
  searchCommunityPrompts,
  getCommunityPlatforms,
  getPlatformCategories,
  getPlatformCategoryLabel,
} from '../services/communitySearch';
import {
  GROK_IMAGINE_COUNT,
  SEEDANCE_COUNT,
  KLING_COUNT,
  RUNWAY_COUNT,
  SORA_COUNT,
  PIKA_COUNT,
  MINIMAX_COUNT,
  LUMA_COUNT,
  HAILUO_COUNT,
} from '../data/communityPrompts';

const PLATFORM_LABELS = {
  all: { 'zh-tw': '全部', en: 'All' },
  seedance: { 'zh-tw': 'Seedance 2.0', en: 'Seedance 2.0' },
  kling: { 'zh-tw': 'Kling', en: 'Kling' },
  grok: { 'zh-tw': 'Grok Imagine', en: 'Grok Imagine' },
  runway: { 'zh-tw': 'Runway', en: 'Runway' },
  sora: { 'zh-tw': 'Sora', en: 'Sora' },
  pika: { 'zh-tw': 'Pika', en: 'Pika' },
  minimax: { 'zh-tw': 'Minimax', en: 'Minimax' },
  luma: { 'zh-tw': 'Luma', en: 'Luma' },
  hailuo: { 'zh-tw': '海螺 AI', en: 'Hailuo AI' },
  general: { 'zh-tw': '通用', en: 'General' },
};

const PLATFORM_COUNTS = {
  seedance: SEEDANCE_COUNT,
  kling: KLING_COUNT,
  grok: GROK_IMAGINE_COUNT,
  runway: RUNWAY_COUNT,
  sora: SORA_COUNT,
  pika: PIKA_COUNT,
  minimax: MINIMAX_COUNT,
  luma: LUMA_COUNT,
  hailuo: HAILUO_COUNT,
};

const PLATFORM_COLORS = {
  seedance: 'bg-violet-100 text-violet-700 border-violet-200',
  kling: 'bg-blue-100 text-blue-700 border-blue-200',
  grok: 'bg-slate-100 text-slate-700 border-slate-200',
  runway: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  sora: 'bg-amber-100 text-amber-700 border-amber-200',
  pika: 'bg-pink-100 text-pink-700 border-pink-200',
  minimax: 'bg-red-100 text-red-700 border-red-200',
  luma: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  hailuo: 'bg-teal-100 text-teal-700 border-teal-200',
  general: 'bg-gray-100 text-gray-600 border-gray-200',
};

const CATEGORY_COLORS = {
  surreal: 'bg-purple-50 text-purple-600 border-purple-100',
  scifi: 'bg-cyan-50 text-cyan-600 border-cyan-100',
  nature: 'bg-green-50 text-green-600 border-green-100',
  urban: 'bg-orange-50 text-orange-600 border-orange-100',
  portrait: 'bg-rose-50 text-rose-600 border-rose-100',
  abstract: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  humor: 'bg-yellow-50 text-yellow-700 border-yellow-100',
  fantasy: 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100',
  horror: 'bg-gray-800 text-gray-100 border-gray-700',
  product: 'bg-amber-50 text-amber-700 border-amber-100',
  animal: 'bg-lime-50 text-lime-700 border-lime-100',
  space: 'bg-blue-50 text-blue-700 border-blue-100',
  retro: 'bg-stone-50 text-stone-600 border-stone-100',
  anime: 'bg-pink-50 text-pink-600 border-pink-100',
  food: 'bg-red-50 text-red-600 border-red-100',
  sports: 'bg-sky-50 text-sky-700 border-sky-100',
  music: 'bg-violet-50 text-violet-700 border-violet-100',
  underwater: 'bg-teal-50 text-teal-700 border-teal-100',
  seasonal: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  minimal: 'bg-neutral-50 text-neutral-600 border-neutral-100',
  multimodal: 'bg-violet-50 text-violet-700 border-violet-100',
  'video-edit': 'bg-orange-50 text-orange-700 border-orange-100',
  'text-overlay': 'bg-yellow-50 text-yellow-700 border-yellow-100',
  dialogue: 'bg-sky-50 text-sky-700 border-sky-100',
  i2v: 'bg-lime-50 text-lime-700 border-lime-100',
  'camera-ref': 'bg-cyan-50 text-cyan-700 border-cyan-100',
  extend: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  effects: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100',
  storyboard: 'bg-rose-50 text-rose-700 border-rose-100',
  character: 'bg-pink-50 text-pink-700 border-pink-100',
  cinematic: 'bg-slate-50 text-slate-700 border-slate-100',
  commercial: 'bg-amber-50 text-amber-700 border-amber-100',
  landscape: 'bg-green-50 text-green-700 border-green-100',
  slowmo: 'bg-blue-50 text-blue-700 border-blue-100',
  timelapse: 'bg-teal-50 text-teal-700 border-teal-100',
  macro: 'bg-rose-50 text-rose-700 border-rose-100',
  romance: 'bg-pink-50 text-pink-700 border-pink-100',
  documentary: 'bg-stone-50 text-stone-700 border-stone-100',
  aerial: 'bg-cyan-50 text-cyan-700 border-cyan-100',
  night: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  fight: 'bg-red-50 text-red-700 border-red-100',
  pet: 'bg-yellow-50 text-yellow-700 border-yellow-100',
  travel: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  fashion: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100',
  action: 'bg-orange-50 text-orange-700 border-orange-100',
  motion: 'bg-cyan-50 text-cyan-700 border-cyan-100',
  physics: 'bg-sky-50 text-sky-700 border-sky-100',
  creative: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100',
};

const CATEGORIZED_PLATFORMS = ['seedance', 'kling', 'grok', 'runway', 'sora'];

export const CommunitySearchPanel = React.memo(
  ({ language, t, onImportTemplate, onCopyPrompt, addToast }) => {
    const [query, setQuery] = useState('');
    const [platform, setPlatform] = useState('all');
    const [category, setCategory] = useState('all');

    const platforms = useMemo(() => getCommunityPlatforms(), []);

    const activeCategoryPlatform =
      platform !== 'all' && CATEGORIZED_PLATFORMS.includes(platform)
        ? platform
        : CATEGORIZED_PLATFORMS.includes(platform)
          ? platform
          : category !== 'all'
            ? CATEGORIZED_PLATFORMS.find((p) =>
                getPlatformCategories(p).some((c) => c.id === category)
              )
            : null;

    const platformCategories = useMemo(
      () => (activeCategoryPlatform ? getPlatformCategories(activeCategoryPlatform) : []),
      [activeCategoryPlatform, platform]
    );

    const results = useMemo(
      () => searchCommunityPrompts(query, { platform, category }, language),
      [query, platform, category, language]
    );

    const handlePlatformChange = (p) => {
      setPlatform(p);
      if (!CATEGORIZED_PLATFORMS.includes(p)) setCategory('all');
    };

    const handleCopy = async (item) => {
      const text = getLocalized(item.prompt, language);
      try {
        await navigator.clipboard.writeText(text);
        addToast?.(t('copied'), 'success');
        onCopyPrompt?.(text);
      } catch {
        addToast?.(t('copy_failed') || 'Copy failed', 'error');
      }
    };

    const showCategoryFilter =
      platform === 'all' || CATEGORIZED_PLATFORMS.includes(platform);

    const categoryFilterLabel =
      platform === 'seedance'
        ? t('seedance_category_filter')
        : platform === 'kling'
          ? t('kling_category_filter')
          : platform === 'grok'
            ? t('grok_category_filter')
            : platform === 'runway'
              ? t('runway_category_filter')
              : platform === 'sora'
                ? t('sora_category_filter')
                : t('platform_category_filter');

    return (
      <div className="flex flex-col gap-4 w-full">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search_community')}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {platforms.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handlePlatformChange(p)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${
                platform === p
                  ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-orange-200 hover:text-orange-500'
              }`}
            >
              {getLocalized(PLATFORM_LABELS[p] || { 'zh-tw': p, en: p }, language)}
              {PLATFORM_COUNTS[p] != null && (
                <span className="ml-1 opacity-80">({PLATFORM_COUNTS[p]})</span>
              )}
            </button>
          ))}
        </div>

        {showCategoryFilter && platformCategories.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 px-1">
              <FolderOpen className="w-3 h-3" />
              {categoryFilterLabel} ({platformCategories.length})
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => setCategory('all')}
                className={`px-2.5 py-1 rounded-full text-[9px] font-bold transition-all border ${
                  category === 'all'
                    ? 'bg-slate-700 text-white border-slate-700'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-slate-300'
                }`}
              >
                {t('all_templates')}
              </button>
              {platformCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    const catPlatform = CATEGORIZED_PLATFORMS.find((p) =>
                      getPlatformCategories(p).some((c) => c.id === cat.id)
                    );
                    if (catPlatform) setPlatform(catPlatform);
                    setCategory(cat.id);
                  }}
                  className={`px-2.5 py-1 rounded-full text-[9px] font-bold transition-all border ${
                    category === cat.id
                      ? 'bg-slate-700 text-white border-slate-700'
                      : CATEGORY_COLORS[cat.id] || 'bg-gray-50 text-gray-500 border-gray-200'
                  }`}
                >
                  {getLocalized(cat.label, language)}
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-gray-500 px-1">
          {t('community_results_prefix')} {results.length} {t('community_results_suffix')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {results.map((item) => {
            const title = getLocalized(item.title, language);
            const prompt = getLocalized(item.prompt, language);
            const platformClass = PLATFORM_COLORS[item.platform] || PLATFORM_COLORS.general;
            const categoryClass = item.category
              ? CATEGORY_COLORS[item.category] || 'bg-gray-50 text-gray-500 border-gray-100'
              : null;

            return (
              <div
                key={item.id}
                className="flex flex-col gap-3 p-4 rounded-2xl border border-gray-100 bg-white/90 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-gray-800 leading-snug">{title}</h3>
                  <span
                    className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase ${platformClass}`}
                  >
                    {item.platform}
                  </span>
                </div>

                {item.category && (
                  <span
                    className={`self-start px-2 py-0.5 rounded-full text-[9px] font-bold border ${categoryClass}`}
                  >
                    {getPlatformCategoryLabel(item.platform, item.category, language)}
                  </span>
                )}

                <p className="text-xs text-gray-600 line-clamp-4 leading-relaxed">{prompt}</p>

                <div className="flex flex-wrap gap-1">
                  {item.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full text-[9px] bg-gray-50 text-gray-500 border border-gray-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[10px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-400" />
                    {item.likes}
                  </span>
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-orange-500 transition-colors"
                  >
                    {item.source}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleCopy(item)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {t('copy_result')}
                  </button>
                  <button
                    type="button"
                    onClick={() => onImportTemplate?.(item)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-orange-500 text-white hover:bg-orange-600 shadow-sm transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {t('import_as_template')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {results.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            <p>{t('community_no_results')}</p>
            <p className="text-xs mt-2">{t('community_suggestions')}</p>
          </div>
        )}
      </div>
    );
  }
);

CommunitySearchPanel.displayName = 'CommunitySearchPanel';