import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowUpDown,
  ChevronDown,
  Edit3,
  Github,
  Globe,
  ImageIcon,
  Layers3,
  RotateCcw,
  Search,
  Settings,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  COMMUNITY_PLATFORM_COUNT,
  COMMUNITY_PLATFORM_MANIFEST,
} from '../data/communityPlatformManifest';
import {
  communityCatalogLoader,
  mergeCommunityPlatformPayload,
} from '../services/communityCatalogLoader';
import {
  buildDiscoveryFeed,
  DISCOVERY_PAGE_SIZE,
  filterDiscoveryFeed,
} from '../utils/discoveryFeed';
import { getLocalized } from '../utils/helpers';

const SOURCE_OPTIONS = [
  { value: 'all', labelKey: 'discovery_source_all', icon: Layers3 },
  { value: 'builtin', labelKey: 'discovery_source_builtin', icon: Sparkles },
  { value: 'community', labelKey: 'discovery_source_community', icon: Users },
];

const SORT_OPTIONS = [
  { value: 'newest', labelKey: 'sort_newest' },
  { value: 'oldest', labelKey: 'sort_oldest' },
  { value: 'a-z', labelKey: 'sort_az' },
  { value: 'z-a', labelKey: 'sort_za' },
  { value: 'random', labelKey: 'sort_random' },
];

const TemplateCard = ({ item, categoryLabel, t, onSelect }) => {
  const isCommunity = item.source === 'community';

  return (
    <button
      type="button"
      data-testid={isCommunity ? 'community-template-card' : 'builtin-template-card'}
      onClick={() => onSelect(item)}
      className="group mb-5 block w-full break-inside-avoid overflow-hidden rounded-3xl border border-white/80 bg-white/90 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-300/50 dark:border-slate-700 dark:bg-slate-900/90"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-orange-950">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.hidden = true;
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-white/50">
            <ImageIcon className="h-12 w-12" aria-hidden="true" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/5 to-transparent" />

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span
            className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${
              isCommunity
                ? 'border-violet-300/50 bg-violet-500/80 text-white'
                : 'border-orange-300/50 bg-orange-500/85 text-white'
            }`}
          >
            {t(isCommunity ? 'discovery_community_badge' : 'discovery_builtin_badge')}
          </span>
          <span className="rounded-full border border-white/25 bg-black/35 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
            {item.platform}
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <h3 className="text-lg font-black leading-snug drop-shadow-lg">{item.title}</h3>
          {categoryLabel && (
            <p className="mt-1 text-[11px] font-bold text-orange-200">{categoryLabel}</p>
          )}
        </div>
      </div>

      <div className="space-y-3 p-4">
        <p className="line-clamp-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          {item.excerpt}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {item.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300"
            >
              {tag}
            </span>
          ))}
        </div>
        <span className="flex w-full items-center justify-center rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white transition-colors group-hover:bg-orange-500 dark:bg-orange-500 dark:group-hover:bg-orange-400">
          {t(isCommunity ? 'use_community_template' : 'use_builtin_template')}
        </span>
      </div>
    </button>
  );
};

export const DiscoveryView = React.memo(
  ({
    filteredTemplates,
    setActiveTemplateId,
    setDiscoveryView,
    posterScrollRef,
    setIsPosterAutoScrollPaused,
    currentMasonryStyle,
    AnimatedSlogan,
    isSloganActive = true,
    t,
    handleRefreshSystemData,
    language,
    setLanguage,
    setIsSettingsOpen,
    isSortMenuOpen,
    setIsSortMenuOpen,
    sortOrder,
    setSortOrder,
    setRandomSeed,
    onImportCommunityTemplate,
  }) => {
    const [query, setQuery] = useState('');
    const [source, setSource] = useState('all');
    const [platform, setPlatform] = useState('all');
    const [category, setCategory] = useState('all');
    const [visibleCount, setVisibleCount] = useState(DISCOVERY_PAGE_SIZE);
    const [communityPlatforms, setCommunityPlatforms] = useState({});
    const [loadingPlatforms, setLoadingPlatforms] = useState([]);
    const [platformErrors, setPlatformErrors] = useState({});

    const communityPrompts = useMemo(
      () =>
        COMMUNITY_PLATFORM_MANIFEST.flatMap(
          ({ id }) => communityPlatforms[id]?.prompts || []
        ),
      [communityPlatforms]
    );
    const feed = useMemo(
      () =>
        buildDiscoveryFeed({
          templates: filteredTemplates,
          community: communityPrompts,
          language,
        }),
      [filteredTemplates, communityPrompts, language]
    );

    const platforms = useMemo(
      () => ['all', ...COMMUNITY_PLATFORM_MANIFEST.map(({ id }) => id)],
      []
    );
    const categories = communityPlatforms[platform]?.categories || [];
    const categoryLabels = useMemo(() => {
      const labels = new Map();
      Object.values(communityPlatforms).forEach((payload) => {
        payload.categories.forEach((itemCategory) => {
          labels.set(
            `${payload.platformId}:${itemCategory.id}`,
            getLocalized(itemCategory.label, language)
          );
        });
      });
      return labels;
    }, [communityPlatforms, language]);
    const loadedPlatformCount = Object.keys(communityPlatforms).length;
    const catalogComplete = loadedPlatformCount === COMMUNITY_PLATFORM_COUNT;

    const result = useMemo(
      () =>
        filterDiscoveryFeed(feed, {
          query,
          source,
          platform,
          category,
          visibleCount,
        }),
      [feed, query, source, platform, category, visibleCount]
    );

    useEffect(() => {
      setVisibleCount(DISCOVERY_PAGE_SIZE);
    }, [query, source, platform, category, language]);

    const loadCommunityPlatform = useCallback(async (platformId) => {
      if (!platformId || platformId === 'all') return null;

      setLoadingPlatforms((current) =>
        current.includes(platformId) ? current : [...current, platformId]
      );
      setPlatformErrors((current) => {
        const next = { ...current };
        delete next[platformId];
        return next;
      });

      try {
        const payload = await communityCatalogLoader.loadPlatform(platformId);
        setCommunityPlatforms((current) => mergeCommunityPlatformPayload(current, payload));
        return payload;
      } catch (error) {
        setPlatformErrors((current) => ({
          ...current,
          [platformId]: error instanceof Error ? error.message : String(error),
        }));
        return null;
      } finally {
        setLoadingPlatforms((current) => current.filter((id) => id !== platformId));
      }
    }, []);

    useEffect(() => {
      let active = true;
      const timer = window.setTimeout(() => {
        communityCatalogLoader.loadAll({
          onPlatformLoaded: (payload) => {
            if (!active) return;
            setCommunityPlatforms((current) =>
              mergeCommunityPlatformPayload(current, payload)
            );
            setPlatformErrors((current) => {
              const next = { ...current };
              delete next[payload.platformId];
              return next;
            });
          },
          onPlatformError: (platformId, error) => {
            if (!active) return;
            setPlatformErrors((current) => ({
              ...current,
              [platformId]: error instanceof Error ? error.message : String(error),
            }));
          },
        });
      }, 0);

      return () => {
        active = false;
        window.clearTimeout(timer);
      };
    }, []);

    const handlePlatformChange = (nextPlatform) => {
      setPlatform(nextPlatform);
      setCategory('all');
      if (nextPlatform !== 'all') {
        loadCommunityPlatform(nextPlatform);
      }
    };

    const handleSelect = (item) => {
      if (item.source === 'community') {
        onImportCommunityTemplate(item.communityItem);
        return;
      }

      setActiveTemplateId(item.template.id);
      setDiscoveryView(false);
    };

    const handleSort = (value) => {
      setSortOrder(value);
      if (value === 'random') setRandomSeed(Date.now());
      setIsSortMenuOpen(false);
    };

    return (
      <div className="fixed inset-0 z-10 overflow-y-auto mesh-gradient-bg">
        <div
          ref={posterScrollRef}
          data-testid="unified-discovery"
          className="mx-auto flex min-h-full w-full max-w-[1720px] flex-col gap-7 px-5 pb-32 pt-7 md:px-10 md:pb-16"
          onMouseEnter={() => setIsPosterAutoScrollPaused?.(true)}
          onMouseLeave={() => setIsPosterAutoScrollPaused?.(false)}
        >
          <header className="grid gap-5 rounded-[2rem] border border-white/60 bg-white/55 p-5 shadow-sm backdrop-blur-2xl dark:border-slate-700/60 dark:bg-slate-900/60 md:grid-cols-[minmax(220px,340px)_1fr_auto] md:items-center md:p-7">
            <div className="flex items-center justify-center md:justify-start">
              <img
                src="./Title.svg"
                alt={t('app_title')}
                className="h-auto w-full max-w-[310px]"
              />
            </div>

            <div className="min-w-0">
              <AnimatedSlogan isActive={isSloganActive} language={language} />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 md:justify-end">
              <button
                type="button"
                onClick={() => setDiscoveryView(false)}
                className="flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-orange-500 dark:bg-orange-500 dark:hover:bg-orange-400"
                title={t('back_to_editor')}
              >
                <Edit3 className="h-4 w-4" />
                <span className="hidden xl:inline">{t('back_to_editor')}</span>
              </button>
              <button
                type="button"
                onClick={() => setLanguage(language === 'zh-tw' ? 'en' : 'zh-tw')}
                className="rounded-xl border border-white/70 bg-white/70 p-2.5 text-slate-600 shadow-sm transition-colors hover:text-orange-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                title={language === 'zh-tw' ? 'English' : '繁體中文'}
              >
                <Globe className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="rounded-xl border border-white/70 bg-white/70 p-2.5 text-slate-600 shadow-sm transition-colors hover:text-orange-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                title={t('settings')}
              >
                <Settings className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={handleRefreshSystemData}
                className="rounded-xl border border-white/70 bg-white/70 p-2.5 text-slate-600 shadow-sm transition-colors hover:text-orange-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                title={t('refresh_desc')}
              >
                <RotateCcw className="h-5 w-5" />
              </button>
              <a
                href="https://github.com/stevenke1981/videos-prompts-autofill"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-white/70 bg-white/70 p-2.5 text-slate-600 shadow-sm transition-colors hover:text-slate-950 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                title={t('github_link')}
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </header>

          <section className="sticky top-3 z-30 space-y-4 rounded-[2rem] border border-white/70 bg-white/80 p-4 shadow-lg backdrop-blur-2xl dark:border-slate-700 dark:bg-slate-900/85 md:p-5">
            <div className="grid gap-3 lg:grid-cols-[minmax(280px,1fr)_auto_auto]">
              <label className="relative block">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t('discovery_search_all')}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-orange-950"
                />
              </label>

              <div className="flex flex-wrap gap-2" aria-label={t('discovery_source_all')}>
                {SOURCE_OPTIONS.map(({ value, labelKey, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSource(value)}
                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                      source === value
                        ? 'border-orange-500 bg-orange-500 text-white shadow-md shadow-orange-500/20'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:text-orange-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {t(labelKey)}
                  </button>
                ))}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                  className="flex h-full min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 hover:border-orange-200 hover:text-orange-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                >
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  {t(SORT_OPTIONS.find((item) => item.value === sortOrder)?.labelKey || 'sort_newest')}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {isSortMenuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 min-w-40 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-950">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSort(option.value)}
                        className="block w-full rounded-xl px-3 py-2 text-left text-xs font-bold text-slate-600 hover:bg-orange-50 hover:text-orange-600 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        {t(option.labelKey)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {platforms.map((itemPlatform) => (
                <button
                  key={itemPlatform}
                  type="button"
                  data-testid={`platform-filter-${itemPlatform}`}
                  onClick={() => handlePlatformChange(itemPlatform)}
                  className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wide transition ${
                    platform === itemPlatform
                      ? 'border-slate-900 bg-slate-900 text-white dark:border-orange-400 dark:bg-orange-500'
                      : 'border-slate-200 bg-white/70 text-slate-500 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300'
                  }`}
                >
                  {itemPlatform === 'all' ? t('discovery_platform_all') : itemPlatform}
                </button>
              ))}
            </div>

            {categories.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCategory('all')}
                  className={`rounded-full border px-3 py-1 text-[10px] font-bold ${
                    category === 'all'
                      ? 'border-violet-500 bg-violet-500 text-white'
                      : 'border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300'
                  }`}
                >
                  {t('all_templates')}
                </button>
                {categories.map((itemCategory) => (
                  <button
                    key={itemCategory.id}
                    type="button"
                    onClick={() => setCategory(itemCategory.id)}
                    className={`rounded-full border px-3 py-1 text-[10px] font-bold ${
                      category === itemCategory.id
                        ? 'border-violet-500 bg-violet-500 text-white'
                        : 'border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300'
                    }`}
                  >
                    {categoryLabels.get(`${platform}:${itemCategory.id}`) ||
                      itemCategory.id}
                  </button>
                ))}
              </div>
            )}

            <p className="px-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              {result.all.length}{' '}
              {catalogComplete ? t('discovery_results') : t('community_partial_results')}
            </p>
            <div
              data-testid="community-load-status"
              aria-live="polite"
              className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-100/80 px-3 py-2 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              <span>
                {catalogComplete
                  ? t('community_load_complete')
                  : t('community_loading_progress')}{' '}
                {loadedPlatformCount}/{COMMUNITY_PLATFORM_COUNT}
              </span>
              {Object.keys(platformErrors).length > 0 && (
                <span className="text-red-600 dark:text-red-300">
                  {Object.keys(platformErrors).length} {t('community_platform_errors')}
                </span>
              )}
            </div>

            {platform !== 'all' && platformErrors[platform] && (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
                <span>{t('community_platform_load_failed')}</span>
                <button
                  type="button"
                  onClick={() => loadCommunityPlatform(platform)}
                  className="rounded-lg bg-red-600 px-3 py-1.5 font-bold text-white hover:bg-red-700"
                >
                  {t('retry')}
                </button>
              </div>
            )}

            {platform !== 'all' &&
              loadingPlatforms.includes(platform) &&
              !communityPlatforms[platform] && (
                <p className="text-xs font-bold text-orange-600">
                  {t('community_selected_platform_loading')}
                </p>
              )}
          </section>

          {result.visible.length > 0 ? (
            <main
              data-testid="unified-discovery-grid"
              className={currentMasonryStyle?.container || 'columns-1 gap-5 sm:columns-2 lg:columns-3'}
            >
              {result.visible.map((item) => (
                <TemplateCard
                  key={item.key}
                  item={item}
                  categoryLabel={categoryLabels.get(`${item.platform}:${item.category}`) || ''}
                  t={t}
                  onSelect={handleSelect}
                />
              ))}
            </main>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/50 px-6 py-16 text-center text-sm font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-900/50">
              {t('no_discovery_results')}
            </div>
          )}

          {result.hasMore && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + DISCOVERY_PAGE_SIZE)}
                className="rounded-2xl bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-orange-500 dark:bg-orange-500"
              >
                {t('load_more')}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
);

DiscoveryView.displayName = 'DiscoveryView';
