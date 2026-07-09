import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TRANSLATIONS } from '../constants/translations';
import { DiscoveryView } from '../components/DiscoveryView';

const seedancePayload = {
  platformId: 'seedance',
  prompts: [
    {
      id: 'seedance-community-cinematic',
      title: { en: 'Cinematic Seedance shot', 'zh-tw': '電影感 Seedance 鏡頭' },
      prompt: { en: 'A cinematic camera move', 'zh-tw': '電影感運鏡' },
      platform: 'seedance',
      category: 'cinematic',
      tags: ['cinematic', 'camera'],
      likes: 12,
      author: 'Community',
      source: 'Community',
    },
  ],
  categories: [{ id: 'cinematic', label: { en: 'Cinematic', 'zh-tw': '電影感' } }],
  count: 1,
};

vi.mock('../services/communityCatalogLoader', async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    communityCatalogLoader: {
      loadAll: vi.fn(async ({ onPlatformLoaded } = {}) => {
        onPlatformLoaded?.(seedancePayload);
        return { loaded: [seedancePayload], errors: [] };
      }),
      loadPlatform: vi.fn(async () => seedancePayload),
    },
  };
});

const t = (key) => TRANSLATIONS.en[key] || key;

const defaultProps = {
  filteredTemplates: [
    {
      id: 'builtin-seedance',
      name: { en: 'Built-in Seedance', 'zh-tw': '內建 Seedance' },
      content: 'A ready-to-use AI video prompt',
      tags: ['seedance', 'cinematic'],
      imageUrl: './template-covers/video/seedance-general.webp',
    },
  ],
  setActiveTemplateId: vi.fn(),
  setDiscoveryView: vi.fn(),
  posterScrollRef: { current: null },
  setIsPosterAutoScrollPaused: vi.fn(),
  currentMasonryStyle: null,
  AnimatedSlogan: () => <p>Video prompt discovery</p>,
  isSloganActive: true,
  t,
  handleRefreshSystemData: vi.fn(),
  language: 'en',
  setLanguage: vi.fn(),
  setIsSettingsOpen: vi.fn(),
  isSortMenuOpen: false,
  setIsSortMenuOpen: vi.fn(),
  sortOrder: 'newest',
  setSortOrder: vi.fn(),
  setRandomSeed: vi.fn(),
  onImportCommunityTemplate: vi.fn(),
};

describe('DiscoveryView accessibility', () => {
  it('exposes named controls and live loading status for keyboard and assistive tech users', async () => {
    render(<DiscoveryView {...defaultProps} />);

    expect(
      screen.getByRole('searchbox', { name: 'Search templates and community...' })
    ).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Source filters' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Platform filters' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Sort templates: Newest' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back to editor' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '繁體中文' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Force update built-ins, keep user data' })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument();

    const status = screen.getByRole('status', { name: 'Community load status' });
    expect(status).toHaveAttribute('aria-live', 'polite');

    fireEvent.click(screen.getByRole('button', { name: 'seedance' }));
    await screen.findByRole('group', { name: 'Category filters' });
    expect(screen.getByRole('button', { name: 'Cinematic' })).toBeInTheDocument();
  });
});
