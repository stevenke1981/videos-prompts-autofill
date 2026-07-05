import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Copy,
  Plus,
  X,
  Settings,
  Check,
  Edit3,
  Eye,
  Trash2,
  FileText,
  Pencil,
  Copy as CopyIcon,
  Globe,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  GripVertical,
  Download,
  Upload,
  Image as ImageIcon,
  List,
  Undo,
  Redo,
  Maximize2,
  RotateCcw,
  LayoutGrid,
  Sidebar,
  Search,
  ArrowRight,
  User,
  ArrowUpRight,
  ArrowUpDown,
  RefreshCw,
  Sparkles,
  Share2,
  Loader2,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import LZString from 'lz-string';

// ====== 匯入資料設定 ======
import { INITIAL_TEMPLATES_CONFIG, TEMPLATE_TAGS, SYSTEM_DATA_VERSION } from './data/templates';
import { INITIAL_BANKS, INITIAL_DEFAULTS, INITIAL_CATEGORIES } from './data/banks';
import { communityPromptToTemplate } from './services/communitySearch';

// ====== 匯入常數設定 ======
import { TRANSLATIONS } from './constants/translations';
import { PREMIUM_STYLES, CATEGORY_STYLES, TAG_STYLES, TAG_LABELS } from './constants/styles';
import { MASONRY_STYLES } from './constants/masonryStyles';

// ====== 匯入工具函式 ======
import { deepClone, makeUniqueKey, waitForImageLoad, getLocalized } from './utils/helpers';
import { compressImage } from './utils/imageUtils';
import { mergeTemplatesWithSystem, mergeBanksWithSystem, needsSystemDataSync } from './utils/merge';
import { resolveAndCleanPrompt, extractVariableKeys } from './utils/promptEngine';
import { createImportBackup } from './utils/backup';
import { initStorage, persistImageIfLarge } from './services/storage';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';


// ====== 匯入自訂 Hooks ======
import { useStickyState } from './hooks/useStickyState';
import { useToast } from './contexts/ToastContext';

// Initialize IndexedDB image storage
initStorage();

// ====== 匯入 UI 元件 ======
import {
  Variable,
  VisualEditor,
  PremiumButton,
  EditorToolbar,
  Lightbox,
  TemplatePreview,
  TemplatesSidebar,
  BanksSidebar,
  CategoryManager,
  InsertVariableModal,
  AddBankModal,
  DiscoveryView,
  MobileSettingsView,
  ImagePreviewModal,
  AnimatedSlogan,
  MobileAnimatedSlogan,
} from './components';
import MobileTabBar from './components/MobileTabBar';
import { useTheme } from './hooks/useTheme';
import { usePromptStats } from './hooks/usePromptStats';

const App = () => {
  // 當前應用程式版本（必須與 package.json 與 version.json 一致）
  const APP_VERSION = '1.0.0';

  const { addToast } = useToast();
  const { theme, setTheme } = useTheme();
  // 臨時功能：瀑布流樣式管理
  const [masonryStyleKey, setMasonryStyleKey] = useState('poster');
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);
  const currentMasonryStyle = MASONRY_STYLES[masonryStyleKey] || MASONRY_STYLES.default;

  // Global State with Persistence
  // bump version keys 以強制刷新新增詞庫與預設值
  const [banks, setBanks] = useStickyState(INITIAL_BANKS, 'app_banks_v9');
  const [defaults, setDefaults] = useStickyState(INITIAL_DEFAULTS, 'app_defaults_v9');
  const [language, setLanguage] = useStickyState('zh-tw', 'app_language_v1'); // 全域 UI 語言
  const [templateLanguage, setTemplateLanguage] = useStickyState('zh-tw', 'app_template_language_v1'); // 模板內容語言
  const [categories, setCategories] = useStickyState(INITIAL_CATEGORIES, 'app_categories_v1'); // 新狀態

  const [templates, setTemplates] = useStickyState(INITIAL_TEMPLATES_CONFIG, 'app_templates_v10');
  const [activeTemplateId, setActiveTemplateId] = useStickyState(
    'tpl_default',
    'app_active_template_id_v4'
  );

  const [lastAppliedDataVersion, setLastAppliedDataVersion] = useStickyState(
    '',
    'app_data_version_v1'
  );
  const [showDataUpdateNotice, setShowDataUpdateNotice] = useState(false);
  const [showAppUpdateNotice, setShowAppUpdateNotice] = useState(false);

  // UI State
  const [bankSidebarWidth, setBankSidebarWidth] = useStickyState(420, 'app_bank_sidebar_width_v1'); // Default width increased to 420px for 2-column layout
  const [isResizing, setIsResizing] = useState(false);

  // 檢測是否為行動裝置
  const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 768;
  const [mobileTab, setMobileTab] = useState(isMobileDevice ? 'home' : 'editor'); // 'home', 'editor', 'settings'
  const [isTemplatesDrawerOpen, setIsTemplatesDrawerOpen] = useState(false);
  const [isBanksDrawerOpen, setIsBanksDrawerOpen] = useState(false);
  const [touchDraggingVar, setTouchDraggingVar] = useState(null); // { key, x, y } 用於行動端模擬拖曳
  const touchDragRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [activePopover, setActivePopover] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false); // 新 UI 狀態
  const [isInsertModalOpen, setIsInsertModalOpen] = useState(false); // 新 UI 狀態：插入選擇器
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false); // 新 UI 狀態：Lightbox

  // Add Bank State
  const [isAddingBank, setIsAddingBank] = useState(false);
  const [newBankLabel, setNewBankLabel] = useState('');
  const [newBankKey, setNewBankKey] = useState('');
  const [newBankCategory, setNewBankCategory] = useState('other');

  // Template Management UI State
  const [editingTemplateNameId, setEditingTemplateNameId] = useState(null);
  const [tempTemplateName, setTempTemplateName] = useState('');
  const [tempTemplateAuthor, setTempTemplateAuthor] = useState('');
  const [zoomedImage, setZoomedImage] = useState(null);
  // 移除這一行，將狀態移入獨立的 Modal 元件
  // const [modalMousePos, setModalMousePos] = useState({ x: 0, y: 0 });
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageUpdateMode, setImageUpdateMode] = useState('replace'); // 'replace' 或 'add'
  const [currentImageEditIndex, setCurrentImageEditIndex] = useState(0);
  const [showImageUrlInput, setShowImageUrlInput] = useState(false);
  const [showImageActionMenu, setShowImageActionMenu] = useState(false);

  // File System Access API 狀態
  const [storageMode, setStorageMode] = useState(() => {
    return localStorage.getItem('app_storage_mode') || 'browser';
  });
  const [directoryHandle, setDirectoryHandle] = useState(null);
  const [isFileSystemSupported, setIsFileSystemSupported] = useState(false);

  // 模板標籤管理狀態
  const [selectedTags, setSelectedTags] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTemplateTags, setEditingTemplateTags] = useState(null); // {id, tags}
  const [isDiscoveryView, setDiscoveryView] = useState(true); // 首次載入預設顯示發現（海報）視圖

  // 分享/匯入功能狀態
  const [sharedTemplate, setSharedTemplate] = useState(null); // 儲存從 URL 解析的模板
  const [sharedBanks, setSharedBanks] = useState({}); // 儲存從 URL 解析的詞庫
  const [sharedDefaults, setSharedDefaults] = useState({}); // 儲存從 URL 解析的預設值
  const [isShareMode, setIsShareMode] = useState(false); // 分享模式狀態
  const [isImporting, setIsImporting] = useState(false); // 匯入中狀態

  // Zoom 圖片：按下 ESC 關閉
  useEffect(() => {
    if (!zoomedImage) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setZoomedImage(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [zoomedImage]);

  // 統一的發現頁切換處理器
  const handleSetDiscoveryView = React.useCallback(
    (val) => {
      setDiscoveryView(val);
      // 行動端：側邊欄的「回到發現頁」按鈕需同步切回 mobileTab
      if (isMobileDevice && val) {
        setMobileTab('home');
      } else if (isMobileDevice && !val && mobileTab === 'home') {
        setMobileTab('editor');
      }
    },
    [isMobileDevice, mobileTab]
  );

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 行動端：首頁是否顯示由 mobileTab 控制，避免 isDiscoveryView 殘留導致其他 Tab 白屏
  // 桌面端：維持現有 isDiscoveryView 行為（不影響桌面端）
  const showDiscoveryOverlay = isMobileDevice ? mobileTab === 'home' : isDiscoveryView;

  // Template Sort State
  const [sortOrder, setSortOrder] = useState('newest'); // newest, oldest, a-z, z-a, random
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [randomSeed, setRandomSeed] = useState(Date.now()); // 用於隨機排序的種子

  const autoSyncDoneRef = useRef(false);

  // 檢查應用程式版本與資料版本更新
  useEffect(() => {
    const checkUpdates = async () => {
      try {
        const response = await fetch('/version.json?t=' + Date.now());
        if (response.ok) {
          const data = await response.json();

          // 檢查應用版本更新：使用程式碼內常量 APP_VERSION 比對
          if (data.appVersion && data.appVersion !== APP_VERSION) {
            setShowAppUpdateNotice(true);
          }

          // 檢查資料版本更新（模板與詞庫）
          const remoteDataVersion = data.systemDataVersion || data.dataVersion;
          if (remoteDataVersion && remoteDataVersion !== lastAppliedDataVersion) {
            setShowDataUpdateNotice(true);
          }
        }
      } catch (e) {
        // 靜默忽略失敗
      }
    };

    checkUpdates();
    const timer = setInterval(checkUpdates, 5 * 60 * 1000); // 每 5 分鐘檢查一次

    return () => clearInterval(timer);
  }, [lastAppliedDataVersion]); // 移除 lastAppliedAppVersion 依賴

  // History State for Undo/Redo
  const [historyPast, setHistoryPast] = useState([]);
  const [historyFuture, setHistoryFuture] = useState([]);
  const historyLastSaveTime = useRef(0);

  const popoverRef = useRef(null);
  const textareaRef = useRef(null);
  const sidebarRef = useRef(null);
  const posterScrollRef = useRef(null);

  // Poster Mode Auto Scroll State
  const [isPosterAutoScrollPaused, setIsPosterAutoScrollPaused] = useState(false);

  // Helper: Translate
  const t = (key, params = {}) => {
    let str = TRANSLATIONS[language][key] || key;
    Object.keys(params).forEach((k) => {
      str = str.replace(`{{${k}}}`, params[k]);
    });
    return str;
  };

  const displayTag = React.useCallback(
    (tag) => {
      return TAG_LABELS[language]?.[tag] || tag;
    },
    [language]
  );

  // 確保有有效的 activeTemplateId - 自動選擇第一個模板
  useEffect(() => {
    if (templates.length > 0) {
      // 檢查當前 activeTemplateId 是否有效
      const currentTemplateExists = templates.some((t) => t.id === activeTemplateId);
      if (!currentTemplateExists || !activeTemplateId) {
        // 若當前選中的模板不存在或為空，選擇第一個模板
        console.log('[自動選擇] 選擇第一個模板:', templates[0].id);
        setActiveTemplateId(templates[0].id);
      }
    }
  }, [templates, activeTemplateId]); // 依賴 templates 與 activeTemplateId

  // 行動端：切換 Tab 時的狀態保障
  useEffect(() => {
    // 模板 Tab：強制收起模式 + 清單視圖
    if (mobileTab === 'templates') {
      setMasonryStyleKey('list');
    }

    // 編輯／詞庫 Tab：確保有選中的模板
    if (
      (mobileTab === 'editor' || mobileTab === 'banks') &&
      templates.length > 0 &&
      !activeTemplateId
    ) {
      console.log('[tab 切換] 自動選擇第一個模板:', templates[0].id);
      setActiveTemplateId(templates[0].id);
    }
  }, [mobileTab, templates, activeTemplateId]);

  // Check File System Access API support and restore directory handle
  useEffect(() => {
    const checkSupport = async () => {
      const supported = 'showDirectoryPicker' in window;
      setIsFileSystemSupported(supported);

      // Try to restore directory handle from IndexedDB
      if (supported && storageMode === 'folder') {
        try {
          const db = await openDB();
          const handle = await getDirectoryHandle(db);
          if (handle) {
            // Verify permission
            const permission = await handle.queryPermission({ mode: 'readwrite' });
            if (permission === 'granted') {
              setDirectoryHandle(handle);
              // Load data from file system
              await loadFromFileSystem(handle);
            } else {
              // Permission not granted, switch back to browser storage
              setStorageMode('browser');
              localStorage.setItem('app_storage_mode', 'browser');
            }
          }
        } catch (error) {
          console.error('恢復資料夾控制代碼失敗:', error);
        }
      }
    };

    checkSupport();
  }, []);

  // IndexedDB helper functions for storing directory handle
  const openDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PromptFillDB', 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('handles')) {
          db.createObjectStore('handles');
        }
      };
    });
  };

  const saveDirectoryHandle = async (handle) => {
    try {
      const db = await openDB();
      const transaction = db.transaction(['handles'], 'readwrite');
      const store = transaction.objectStore('handles');
      await store.put(handle, 'directory');
    } catch (error) {
      console.error('儲存資料夾控制代碼失敗:', error);
    }
  };

  const getDirectoryHandle = async (db) => {
    try {
      const transaction = db.transaction(['handles'], 'readonly');
      const store = transaction.objectStore('handles');
      return new Promise((resolve, reject) => {
        const request = store.get('directory');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('取得資料夾控制代碼失敗:', error);
      return null;
    }
  };

  // Fix initial categories if empty (migration safety)
  useEffect(() => {
    if (!categories || Object.keys(categories).length === 0) {
      setCategories(INITIAL_CATEGORIES);
    }
  }, []);

  // Ensure all templates have tags field and sync default templates' tags (migration safety)
  useEffect(() => {
    let needsUpdate = false;
    const updatedTemplates = templates.map((t) => {
      // Find if this is a default template
      const defaultTemplate = INITIAL_TEMPLATES_CONFIG.find((dt) => dt.id === t.id);

      if (defaultTemplate) {
        // Sync tags from default template if it's a built-in one
        if (JSON.stringify(t.tags) !== JSON.stringify(defaultTemplate.tags)) {
          needsUpdate = true;
          return { ...t, tags: defaultTemplate.tags || [] };
        }
      } else if (!t.tags) {
        // User-created template without tags
        needsUpdate = true;
        return { ...t, tags: [] };
      }

      return t;
    });

    if (needsUpdate) {
      setTemplates(updatedTemplates);
    }
  }, []);

  // Derived State: Current Active Template
  const activeTemplate = templates.find((t) => t.id === activeTemplateId) || templates[0];

  const promptStats = usePromptStats(activeTemplate, defaults, templateLanguage);

  // --- Effects ---
  // Reset history when template changes
  useEffect(() => {
    setHistoryPast([]);
    setHistoryFuture([]);
    historyLastSaveTime.current = 0;
  }, [activeTemplateId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setActivePopover(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Poster Mode Auto Scroll Animation with Ping-Pong Effect
  // Poster Mode Auto Scroll - Optimized with requestAnimationFrame
  useEffect(() => {
    if (
      masonryStyleKey !== 'poster' ||
      !posterScrollRef.current ||
      isPosterAutoScrollPaused ||
      !isDiscoveryView
    ) {
      return;
    }

    const scrollContainer = posterScrollRef.current;
    let scrollDirection = 1; // 1 = down, -1 = up
    const scrollSpeed = 0.5; // 每次滾動的像素數
    let animationFrameId;

    const performScroll = () => {
      if (!scrollContainer) return;

      const currentScroll = scrollContainer.scrollTop;
      const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;

      // 到達底部，變更方向向上
      if (scrollDirection === 1 && currentScroll >= maxScroll - 1) {
        scrollDirection = -1;
      }
      // 到達頂部，變更方向向下
      else if (scrollDirection === -1 && currentScroll <= 1) {
        scrollDirection = 1;
      }

      // 執行滾動
      scrollContainer.scrollTop += scrollSpeed * scrollDirection;
      animationFrameId = requestAnimationFrame(performScroll);
    };

    animationFrameId = requestAnimationFrame(performScroll);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [masonryStyleKey, isPosterAutoScrollPaused, isDiscoveryView]);

  // Resizing Logic
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      // New Layout: Bank Sidebar is on the Right.
      // Width = Window Width - Mouse X
      const newWidth = window.innerWidth - e.clientX;

      if (newWidth > 280 && newWidth < 800) {
        // Min/Max constraints
        setBankSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none'; // Prevent text selection while resizing
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, setBankSidebarWidth]);

  const startResizing = () => {
    setIsResizing(true);
  };

  // --- Template Actions ---

  const handleAddTemplate = () => {
    const newId = `tpl_${Date.now()}`;
    const newTemplate = {
      id: newId,
      name: t('new_template_name'),
      author: '',
      content: t('new_template_content'),
      selections: {},
      tags: [],
    };
    setTemplates([...templates, newTemplate]);
    setActiveTemplateId(newId);
    setIsEditing(true);
    // 在行動端自動切換到編輯 Tab
    if (isMobileDevice) {
      setMobileTab('editor');
    }
  };

  const handleImportCommunityTemplate = React.useCallback(
    (communityItem) => {
      const newTemplate = communityPromptToTemplate(communityItem, language);
      setTemplates((prev) => [...prev, newTemplate]);
      setActiveTemplateId(newTemplate.id);
      setIsEditing(false);
      setDiscoveryView(false);
      if (isMobileDevice) {
        setMobileTab('editor');
      }
      addToast(t('import_community_success'), 'success');
    },
    [language, isMobileDevice, addToast, t]
  );

  const handleDuplicateTemplate = (t_item, e) => {
    e.stopPropagation();
    const newId = `tpl_${Date.now()}`;

    const duplicateName = (name) => {
      if (typeof name === 'string') return `${name}${t('copy_suffix')}`;
      const newName = { ...name };
      Object.keys(newName).forEach((lang) => {
        const suffix = TRANSLATIONS[lang]?.copy_suffix || ' (Copy)';
        newName[lang] = `${newName[lang]}${suffix}`;
      });
      return newName;
    };

    const newTemplate = {
      ...t_item,
      id: newId,
      name: duplicateName(t_item.name),
      author: t_item.author || '',
      selections: { ...t_item.selections },
    };
    setTemplates([...templates, newTemplate]);
    setActiveTemplateId(newId);
    // 在行動端自動切換到編輯 Tab
    if (isMobileDevice) {
      setMobileTab('editor');
    }
  };

  const handleDeleteTemplate = (id, e) => {
    e.stopPropagation();
    if (templates.length <= 1) {
      addToast(t('alert_keep_one'));
      return;
    }
    if (window.confirm(t('confirm_delete_template'))) {
      const newTemplates = templates.filter((t) => t.id !== id);
      setTemplates(newTemplates);
      if (activeTemplateId === id) {
        setActiveTemplateId(newTemplates[0].id);
      }
    }
  };

  const handleResetTemplate = (id, e) => {
    e.stopPropagation();
    if (!window.confirm(t('confirm_reset_template'))) return;

    const original = INITIAL_TEMPLATES_CONFIG.find((t) => t.id === id);
    if (!original) return;

    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? JSON.parse(JSON.stringify(original)) : t))
    );
  };

  const startRenamingTemplate = (t_item, e) => {
    e.stopPropagation();
    setEditingTemplateNameId(t_item.id);
    setTempTemplateName(getLocalized(t_item.name, language));
    setTempTemplateAuthor(t_item.author || '');
  };

  const saveTemplateName = () => {
    if (tempTemplateName.trim()) {
      setTemplates((prev) =>
        prev.map((t_item) => {
          if (t_item.id === editingTemplateNameId) {
            const newName =
              typeof t_item.name === 'object'
                ? { ...t_item.name, [language]: tempTemplateName }
                : tempTemplateName;
            return { ...t_item, name: newName, author: tempTemplateAuthor };
          }
          return t_item;
        })
      );
    }
    setEditingTemplateNameId(null);
  };

  // 刷新系統模板與詞庫，保留使用者資料
  const handleRefreshSystemData = React.useCallback(() => {
    const backupSuffix = t('refreshed_backup_suffix') || '';

    // 遷移舊格式的 selections：將字串值轉換為物件格式
    const migratedTemplates = templates.map((tpl) => {
      const newSelections = {};
      Object.entries(tpl.selections || {}).forEach(([key, value]) => {
        if (typeof value === 'string' && banks[key.split('-')[0]]) {
          // 查找對應的詞庫選項
          const bankKey = key.split('-')[0];
          const bank = banks[bankKey];
          if (bank && bank.options) {
            const matchedOption = bank.options.find(
              (opt) =>
                (typeof opt === 'string' && opt === value) ||
                (typeof opt === 'object' && (opt['zh-tw'] === value || opt.en === value))
            );
            newSelections[key] = matchedOption || value;
          } else {
            newSelections[key] = value;
          }
        } else {
          newSelections[key] = value;
        }
      });
      return { ...tpl, selections: newSelections };
    });

    const templateResult = mergeTemplatesWithSystem(migratedTemplates, { backupSuffix });
    const bankResult = mergeBanksWithSystem(banks, defaults, { backupSuffix });

    setTemplates(templateResult.templates);
    setBanks(bankResult.banks);
    setDefaults(bankResult.defaults);
    setActiveTemplateId((prev) =>
      templateResult.templates.some((t) => t.id === prev) ? prev : 'tpl_agent_system'
    );

    const notes = [...templateResult.notes, ...bankResult.notes];
    if (notes.length > 0) {
      addToast(`${t('refresh_done_with_conflicts')}\n- ${notes.join('\n- ')}`, 'info');
    } else {
      addToast(t('refresh_done_no_conflict'), 'success');
    }
  }, [banks, defaults, templates, t]);

  const handleAutoUpdate = () => {
    handleRefreshSystemData();
    setLastAppliedDataVersion(SYSTEM_DATA_VERSION);
    setShowDataUpdateNotice(false);
  };

  // 啟動時自動同步系統模板（修復 localStorage 舊資料缺少新模板）
  useEffect(() => {
    if (autoSyncDoneRef.current) return;
    if (!needsSystemDataSync(templates, lastAppliedDataVersion)) {
      if (!lastAppliedDataVersion) {
        setLastAppliedDataVersion(SYSTEM_DATA_VERSION);
      }
      return;
    }

    autoSyncDoneRef.current = true;
    handleRefreshSystemData();
    setLastAppliedDataVersion(SYSTEM_DATA_VERSION);
    setShowDataUpdateNotice(false);
  }, [templates, lastAppliedDataVersion, handleRefreshSystemData]);

  // Template Tags Management
  const handleUpdateTemplateTags = (templateId, newTags) => {
    setTemplates((prev) => prev.map((t) => (t.id === templateId ? { ...t, tags: newTags } : t)));
  };

  const toggleTag = (tag) => {
    setSelectedTags((prevTag) => (prevTag === tag ? '' : tag));
  };

  // Filter templates based on search and tags
  const filteredTemplates = React.useMemo(() => {
    return templates
      .filter((t) => {
        // Search filter
        const templateName = getLocalized(t.name, language);
        const matchesSearch =
          !searchQuery || templateName.toLowerCase().includes(searchQuery.toLowerCase());

        // Tag filter
        const matchesTags = selectedTags === '' || (t.tags && t.tags.includes(selectedTags));

        // 語言過濾：若模板指定語言且不包含當前語言則隱藏
        // 若未指定語言屬性，預設顯示（向下相容）
        const templateLangs = t.language
          ? Array.isArray(t.language)
            ? t.language
            : [t.language]
          : ['zh-tw', 'en'];
        const matchesLanguage = templateLangs.includes(language);

        return matchesSearch && matchesTags && matchesLanguage;
      })
      .sort((a, b) => {
        // Sort templates based on sortOrder
        const nameA = getLocalized(a.name, language);
        const nameB = getLocalized(b.name, language);
        switch (sortOrder) {
          case 'newest':
            // Assuming templates array index as chronological order (newer = later in array)
            return templates.indexOf(b) - templates.indexOf(a);
          case 'oldest':
            return templates.indexOf(a) - templates.indexOf(b);
          case 'a-z':
            return nameA.localeCompare(nameB, language === 'zh-tw' ? 'zh-TW' : 'en');
          case 'z-a':
            return nameB.localeCompare(nameA, language === 'zh-tw' ? 'zh-TW' : 'en');
          case 'random':
            // 使用模板 ID 與隨機種子生成偽隨機數排序
            const hashA = (a.id + randomSeed)
              .split('')
              .reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const hashB = (b.id + randomSeed)
              .split('')
              .reduce((acc, char) => acc + char.charCodeAt(0), 0);
            return hashA - hashB;
          default:
            return 0;
        }
      });
  }, [templates, searchQuery, selectedTags, sortOrder, randomSeed, language]);

  const fileInputRef = useRef(null);

  const handleUploadImage = async (e) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      // 驗證檔案類型
      if (!file.type.startsWith('image/')) {
        if (storageMode === 'browser') {
          addToast('請選擇圖片檔案', 'error');
        }
        return;
      }

      // 壓縮圖片；大圖自動存入 IndexedDB
      const compressedDataUrl = await compressImage(file);
      const storedUrl = await persistImageIfLarge(
        activeTemplateId,
        currentImageEditIndex,
        compressedDataUrl
      );

      try {
        setTemplates((prev) =>
          prev.map((t) => {
            if (t.id !== activeTemplateId) return t;

            if (imageUpdateMode === 'add') {
              const newUrls = [...(t.imageUrls || [t.imageUrl]), storedUrl];
              return { ...t, imageUrls: newUrls, imageUrl: newUrls[0] };
            } else {
              // Replace current index
              if (t.imageUrls && Array.isArray(t.imageUrls)) {
                const newUrls = [...t.imageUrls];
                newUrls[currentImageEditIndex] = storedUrl;
                return { ...t, imageUrls: newUrls, imageUrl: newUrls[0] };
              }
              return { ...t, imageUrl: storedUrl };
            }
          })
        );
      } catch (error) {
        console.error('圖片上傳失敗:', error);
        if (storageMode === 'browser' && error.name === 'QuotaExceededError') {
          addToast(
            '儲存空間不足！圖片過大。\n建議：\n1. 使用圖片連結（URL）方式\n2. 壓縮圖片（tinypng.com）\n3. 匯出備份後清空資料',
            'error'
          );
        } else {
          if (storageMode === 'browser') {
            addToast('圖片上傳失敗，請重試', 'error');
          }
        }
      }
    } catch (error) {
      console.error('上傳圖片出錯:', error);
      if (storageMode === 'browser') {
        addToast('上傳圖片出錯，請重試', 'error');
      }
    } finally {
      // 重置 input，允許重複選擇同一檔案
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleResetImage = () => {
    const defaultUrl = INITIAL_TEMPLATES_CONFIG.find((t) => t.id === activeTemplateId)?.imageUrl;
    const defaultUrls = INITIAL_TEMPLATES_CONFIG.find((t) => t.id === activeTemplateId)?.imageUrls;

    setTemplates((prev) =>
      prev.map((t) =>
        t.id === activeTemplateId ? { ...t, imageUrl: defaultUrl, imageUrls: defaultUrls } : t
      )
    );
  };

  const handleSetImageUrl = () => {
    if (!imageUrlInput.trim()) return;

    setTemplates((prev) =>
      prev.map((t) => {
        if (t.id !== activeTemplateId) return t;

        if (imageUpdateMode === 'add') {
          const newUrls = [...(t.imageUrls || [t.imageUrl]), imageUrlInput];
          return { ...t, imageUrls: newUrls, imageUrl: newUrls[0] };
        } else {
          // Replace current index
          if (t.imageUrls && Array.isArray(t.imageUrls)) {
            const newUrls = [...t.imageUrls];
            newUrls[currentImageEditIndex] = imageUrlInput;
            return { ...t, imageUrls: newUrls, imageUrl: newUrls[0] };
          }
          return { ...t, imageUrl: imageUrlInput };
        }
      })
    );
    setImageUrlInput('');
    setShowImageUrlInput(false);
  };

  // --- 匯出／匯入功能 ---
  const handleExportTemplate = async (template) => {
    try {
      const templateName = getLocalized(template.name, language);
      const dataStr = JSON.stringify(template, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const filename = `${templateName.replace(/\s+/g, '_')}_template.json`;

      // 檢測是否為行動裝置（尤其是 iOS）
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) || window.innerWidth < 768;
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

      if (isMobileDevice && navigator.share) {
        // 行動端：使用 Web Share API
        try {
          const file = new File([dataBlob], filename, { type: 'application/json' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: templateName,
              text: '匯出的提示詞模板',
            });
            showToastMessage('✅ 模板已分享／儲存');
            return;
          }
        } catch (shareError) {
          console.log('Web Share API 失敗，使用降級方案', shareError);
        }
      }

      // 桌面端或降級方案：使用傳統下載方式
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;

      // iOS Safari 特殊處理
      if (isIOS) {
        link.target = '_blank';
      }

      document.body.appendChild(link);
      link.click();

      // 延遲清理，確保 iOS 有足夠時間處理
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      showToastMessage('✅ 模板已匯出');
    } catch (error) {
      console.error('匯出失敗:', error);
      addToast('匯出失敗，請重試', 'error');
    }
  };

  const handleExportAllTemplates = async () => {
    try {
      const exportData = {
        templates,
        banks,
        categories,
        version: 'v9',
        exportDate: new Date().toISOString(),
      };
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const filename = `prompt_fill_backup_${Date.now()}.json`;

      // 檢測是否為行動裝置（尤其是 iOS）
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) || window.innerWidth < 768;
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

      if (isMobileDevice && navigator.share) {
        // 行動端：使用 Web Share API
        try {
          const file = new File([dataBlob], filename, { type: 'application/json' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'Video Prompts Autofill 備份',
              text: '所有模板和詞庫的完整備份',
            });
            showToastMessage('✅ 備份已分享／儲存');
            return;
          }
        } catch (shareError) {
          console.log('Web Share API 失敗，使用降級方案', shareError);
        }
      }

      // 桌面端或降級方案：使用傳統下載方式
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;

      // iOS Safari 特殊處理
      if (isIOS) {
        link.target = '_blank';
      }

      document.body.appendChild(link);
      link.click();

      // 延遲清理，確保 iOS 有足夠時間處理
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      showToastMessage('✅ 備份已匯出');
    } catch (error) {
      console.error('匯出失敗:', error);
      addToast('匯出失敗，請重試', 'error');
    }
  };

  const handleImportTemplate = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        // 檢查是單個模板還是完整備份
        if (data.templates && Array.isArray(data.templates)) {
          // 完整備份
          if (window.confirm('偵測到完整備份檔案。是否要覆蓋目前所有資料？')) {
            const backupKey = createImportBackup({
              templates,
              banks,
              categories,
              defaults,
              version: 'v9',
            });
            setTemplates(data.templates);
            if (data.banks) setBanks(data.banks);
            if (data.categories) setCategories(data.categories);
            if (data.defaults) setDefaults(data.defaults);
            const backupMsg = backupKey ? `（已自動備份至 ${backupKey}）` : '';
            addToast(`匯入成功！${backupMsg}`, 'success');
          }
        } else if (data.id && data.name) {
          // 單個模板
          const newId = `tpl_${Date.now()}`;
          const newTemplate = { ...data, id: newId };
          setTemplates((prev) => [...prev, newTemplate]);
          setActiveTemplateId(newId);
          addToast('模板匯入成功！', 'success');
        } else {
          addToast('檔案格式不正確', 'error');
        }
      } catch (error) {
        console.error('匯入失敗:', error);
        addToast('匯入失敗，請檢查檔案格式', 'error');
      }
    };
    reader.readAsText(file);

    // 重置 input
    event.target.value = '';
  };

  // --- File System Access API Functions ---
  const handleSelectDirectory = async () => {
    try {
      if (!isFileSystemSupported) {
        addToast(t('browser_not_supported'), 'error');
        return;
      }

      const handle = await window.showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'documents',
      });

      setDirectoryHandle(handle);
      setStorageMode('folder');
      localStorage.setItem('app_storage_mode', 'folder');

      // Save handle to IndexedDB for future use
      await saveDirectoryHandle(handle);

      // 嘗試將當前資料儲存到資料夾
      await saveToFileSystem(handle);
      addToast(t('auto_save_enabled'), 'success');
    } catch (error) {
      console.error('選擇資料夾失敗:', error);
      if (error.name !== 'AbortError') {
        addToast(t('folder_access_denied'), 'error');
      }
    }
  };

  const saveToFileSystem = async (handle) => {
    if (!handle) return;

    try {
      const data = {
        templates,
        banks,
        categories,
        defaults,
        version: 'v9',
        lastSaved: new Date().toISOString(),
      };

      const fileHandle = await handle.getFileHandle('prompt_fill_data.json', { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(data, null, 2));
      await writable.close();

      console.log('資料已儲存到本機資料夾');
    } catch (error) {
      console.error('儲存到檔案系統失敗:', error);
    }
  };

  const loadFromFileSystem = async (handle) => {
    if (!handle) return;

    try {
      const fileHandle = await handle.getFileHandle('prompt_fill_data.json');
      const file = await fileHandle.getFile();
      const text = await file.text();
      const data = JSON.parse(text);

      if (data.templates) setTemplates(data.templates);
      if (data.banks) setBanks(data.banks);
      if (data.categories) setCategories(data.categories);
      if (data.defaults) setDefaults(data.defaults);

      console.log('從本機資料夾載入資料成功');
    } catch (error) {
      console.error('從檔案系統讀取失敗:', error);
    }
  };

  // Auto-save to file system when data changes
  useEffect(() => {
    if (storageMode === 'folder' && directoryHandle) {
      const timeoutId = setTimeout(() => {
        saveToFileSystem(directoryHandle);
      }, 1000); // Debounce 1 second

      return () => clearTimeout(timeoutId);
    }
  }, [templates, banks, categories, defaults, storageMode, directoryHandle]);

  // 存储空间管理
  const getStorageSize = () => {
    try {
      let total = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }
      return (total / 1024).toFixed(2); // KB
    } catch (error) {
      return '0';
    }
  };

  function handleClearAllData() {
    if (window.confirm(t('confirm_clear_all'))) {
      try {
        // 只清除應用相關的資料
        const keysToRemove = Object.keys(localStorage).filter((key) => key.startsWith('app_'));
        keysToRemove.forEach((key) => localStorage.removeItem(key));

        // 重新整理頁面
        window.location.reload();
      } catch (error) {
        console.error('清除資料失敗:', error);
        addToast('清除資料失敗', 'error');
      }
    }
  }

  function handleCompleteBackup() {
    handleExportAllTemplates();
  }

  function handleImportAllData(event) {
    handleImportTemplate(event);
  }

  function handleResetSystemData() {
    if (window.confirm('確定要重置系統資料嗎？這將清除所有本地修改並重新載入初始模板。')) {
      localStorage.removeItem('app_templates');
      localStorage.removeItem('app_banks');
      localStorage.removeItem('app_categories');
      window.location.reload();
    }
  }

  const handleSwitchToLocalStorage = async () => {
    setStorageMode('browser');
    setDirectoryHandle(null);
    localStorage.setItem('app_storage_mode', 'browser');

    // Clear directory handle from IndexedDB
    try {
      const db = await openDB();
      const transaction = db.transaction(['handles'], 'readwrite');
      const store = transaction.objectStore('handles');
      await store.delete('directory');
    } catch (error) {
      console.error('清除資料夾控制代碼失敗:', error);
    }
  };

  const handleManualLoadFromFolder = async () => {
    if (directoryHandle) {
      try {
        await loadFromFileSystem(directoryHandle);
        addToast('從資料夾載入成功！', 'success');
      } catch (error) {
        addToast('從資料夾載入失敗，請檢查檔案是否存在', 'error');
      }
    }
  };

  const updateActiveTemplateContent = React.useCallback(
    (newContent, forceSaveHistory = false) => {
      // History Management
      const now = Date.now();
      const shouldSave = forceSaveHistory || now - historyLastSaveTime.current > 1000;

      if (shouldSave) {
        setHistoryPast((prev) => [...prev, activeTemplate.content]);
        setHistoryFuture([]); // Clear redo stack on new change
        historyLastSaveTime.current = now;
      }

      setTemplates((prev) =>
        prev.map((t) => (t.id === activeTemplateId ? { ...t, content: newContent } : t))
      );
    },
    [activeTemplate.content, activeTemplateId, setTemplates]
  );

  const handleUndo = React.useCallback(() => {
    if (historyPast.length === 0) return;

    const previous = historyPast[historyPast.length - 1];
    const newPast = historyPast.slice(0, -1);

    setHistoryFuture((prev) => [activeTemplate.content, ...prev]);
    setHistoryPast(newPast);

    // Direct update without saving history again
    setTemplates((prev) =>
      prev.map((t) => (t.id === activeTemplateId ? { ...t, content: previous } : t))
    );
  }, [activeTemplate.content, activeTemplateId, historyPast, setTemplates]);

  const handleRedo = React.useCallback(() => {
    if (historyFuture.length === 0) return;

    const next = historyFuture[0];
    const newFuture = historyFuture.slice(1);

    setHistoryPast((prev) => [...prev, activeTemplate.content]);
    setHistoryFuture(newFuture);

    // Direct update without saving history again
    setTemplates((prev) =>
      prev.map((t) => (t.id === activeTemplateId ? { ...t, content: next } : t))
    );
  }, [activeTemplate.content, activeTemplateId, historyFuture, setTemplates]);

  const updateActiveTemplateSelection = React.useCallback(
    (uniqueKey, value) => {
      setTemplates((prev) =>
        prev.map((t) => {
          if (t.id === activeTemplateId) {
            return {
              ...t,
              selections: { ...t.selections, [uniqueKey]: value },
            };
          }
          return t;
        })
      );
    },
    [activeTemplateId, setTemplates]
  );

  // --- Bank Actions ---

  const handleSelect = React.useCallback(
    (key, index, value) => {
      const uniqueKey = `${key}-${index}`;
      updateActiveTemplateSelection(uniqueKey, value);
      setActivePopover(null);
    },
    [updateActiveTemplateSelection]
  );

  const handleAddCustomAndSelect = React.useCallback(
    (key, index, newValue) => {
      if (!newValue || !newValue.trim()) return;

      // 1. Add to bank if not exists
      if (!banks[key].options.includes(newValue)) {
        handleAddOption(key, newValue);
      }

      // 2. Select it
      handleSelect(key, index, newValue);
    },
    [banks, handleSelect]
  );

  const handleAddOption = React.useCallback(
    (key, newOption) => {
      if (!newOption.trim()) return;
      setBanks((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          options: [...prev[key].options, newOption],
        },
      }));
    },
    [setBanks]
  );

  const handleDeleteOption = React.useCallback(
    (key, optionToDelete) => {
      setBanks((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          options: prev[key].options.filter((opt) => opt !== optionToDelete),
        },
      }));
    },
    [setBanks]
  );

  const handleStartAddBank = (catId) => {
    setNewBankCategory(catId);
    setIsAddingBank(true);
  };

  const handleAddBank = () => {
    if (!newBankLabel.trim() || !newBankKey.trim()) return;
    const safeKey = newBankKey
      .trim()
      .replace(/[^a-zA-Z0-9_]/g, '_')
      .toLowerCase();

    if (banks[safeKey]) {
      addToast(t('alert_id_exists'), 'error');
      return;
    }

    setBanks((prev) => ({
      ...prev,
      [safeKey]: {
        label: newBankLabel,
        category: newBankCategory,
        options: [],
      },
    }));
    setDefaults((prev) => ({ ...prev, [safeKey]: '' }));
    setNewBankLabel('');
    setNewBankKey('');
    setNewBankCategory('other');
    setIsAddingBank(false);
  };

  const handleDeleteBank = (key) => {
    const bankLabel = getLocalized(banks[key].label, language);
    if (window.confirm(t('confirm_delete_bank', { name: bankLabel }))) {
      const newBanks = { ...banks };
      delete newBanks[key];
      setBanks(newBanks);
    }
  };

  const handleUpdateBankCategory = (key, newCategory) => {
    setBanks((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        category: newCategory,
      },
    }));
  };

  // --- Editor Actions ---

  const insertVariableToTemplate = (key, dropPoint = null) => {
    const textToInsert = ` {{${key}}} `;
    const currentContent = activeTemplate.content || '';
    const isMultilingual = typeof currentContent === 'object';
    const text = isMultilingual ? currentContent[templateLanguage] || '' : currentContent;

    if (!isEditing) {
      setIsEditing(true);
      setTimeout(() => {
        const updatedText = text + textToInsert;
        if (isMultilingual) {
          updateActiveTemplateContent({ ...currentContent, [templateLanguage]: updatedText }, true);
        } else {
          updateActiveTemplateContent(updatedText, true);
        }
        if (textareaRef.current) textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
      }, 50);
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) return;

    let start = textarea.selectionStart;
    let end = textarea.selectionEnd;

    // 行動端模擬拖曳的特殊處理：計算落點位置
    if (dropPoint) {
      const { x, y } = dropPoint;
      let range;
      if (document.caretRangeFromPoint) {
        range = document.caretRangeFromPoint(x, y);
      } else if (document.caretPositionFromPoint) {
        const pos = document.caretPositionFromPoint(x, y);
        if (pos) {
          range = document.createRange();
          range.setStart(pos.offsetNode, pos.offset);
          range.collapse(true);
        }
      }

      if (range && range.startContainer) {
        // 對於 textarea，需要手動計算偏移，較為困難
        // 簡化方案：若在 textarea 區域內釋放，則插入到最後或保持當前游標
        // 若在編輯器內，一般已經聚焦
      }
    }

    const safeText = String(text);
    const before = safeText.substring(0, start);
    const after = safeText.substring(end, safeText.length);
    const updatedText = `${before}${textToInsert}${after}`;

    if (isMultilingual) {
      updateActiveTemplateContent({ ...currentContent, [templateLanguage]: updatedText }, true);
    } else {
      updateActiveTemplateContent(updatedText, true);
    }

    setTimeout(() => {
      textarea.focus();
      const newPos = start + textToInsert.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleCopy = () => {
    const cleanText = resolveAndCleanPrompt(
      activeTemplate.content,
      activeTemplate.selections,
      defaults,
      templateLanguage
    );

    navigator.clipboard
      .writeText(cleanText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  };

  // ====== 分享/匯入功能 ======

  // 生成分享 URL（圖片直接用 lzstring 編碼，不上傳）
  const generateShareUrl = () => {
    const templateToShare = isShareMode && sharedTemplate ? sharedTemplate : activeTemplate;

    // 提取模板使用到的變數 keys
    const usedKeys = extractVariableKeys(templateToShare.content);

    // 只包含使用到的詞庫和預設值
    const usedBanks = {};
    const usedDefaults = {};
    usedKeys.forEach(key => {
      if (banks[key]) {
        usedBanks[key] = banks[key];
      }
      if (defaults[key]) {
        usedDefaults[key] = defaults[key];
      }
    });

    // 確保分享資料包含「社群」標籤（複製陣列避免修改原樣板）
    const shareTags = [...(templateToShare.tags || [])];
    if (!shareTags.includes('社群')) {
      shareTags.push('社群');
    }

    // 構建分享資料（圖片直接包含 base64）
    const shareData = {
      name: templateToShare.name,
      content: templateToShare.content,
      selections: templateToShare.selections || {},
      tags: shareTags,
      author: templateToShare.author || '',
      banks: usedBanks,
      defaults: usedDefaults,
      ...(templateToShare.imageUrl && { imageUrl: templateToShare.imageUrl }),
      ...(templateToShare.imageUrls && { imageUrls: templateToShare.imageUrls }),
    };

    try {
      const jsonStr = JSON.stringify(shareData);
      // 使用 LZ-String 壓縮
      const compressed = LZString.compressToEncodedURIComponent(jsonStr);
      const baseUrl = window.location.origin + window.location.pathname;
      return `${baseUrl}#template=${compressed}`;
    } catch (err) {
      console.error('Failed to generate share URL:', err);
      return null;
    }
  };

  // 解析分享 URL
  const parseShareUrl = () => {
    const hash = window.location.hash;
    if (!hash || !hash.includes('template=')) {
      return null;
    }

    try {
      const params = new URLSearchParams(hash.substring(1));
      const templateParam = params.get('template');
      if (!templateParam) return null;

      // 使用 LZ-String 解壓縮
      const jsonStr = LZString.decompressFromEncodedURIComponent(templateParam);
      if (!jsonStr) return null;

      const templateData = JSON.parse(jsonStr);

      return {
        template: {
          id: `shared_${Date.now()}`,
          name: templateData.name || t('shared_template') || '分享的模板',
          content: templateData.content || '',
          selections: templateData.selections || {},
          author: templateData.author || t('from_share') || '分享',
          tags: templateData.tags || [],
          ...(templateData.imageUrl && { imageUrl: templateData.imageUrl }),
          ...(templateData.imageUrls && { imageUrls: templateData.imageUrls }),
        },
        banks: templateData.banks || {},
        defaults: templateData.defaults || {},
      };
    } catch (err) {
      console.error('Failed to parse share URL:', err);
      return null;
    }
  };

  // 處理分享按鈕點擊
  const handleShare = async () => {
    try {
      const shareUrl = generateShareUrl();
      if (!shareUrl) {
        addToast(t('share_failed') || '分享失敗', 'error');
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      addToast(t('share_copied') || '✅ 分享連結已複製');
    } catch (err) {
      console.error('Share failed:', err);
      addToast(t('share_failed') || '分享失敗', 'error');
    }
  };

  // 處理匯入分享的模板
  const handleImportShared = async () => {
    if (!sharedTemplate) return;

    setIsImporting(true);
    addToast(t('importing_template') || '📥 匯入模板中...', 'info');

    try {
      const newTemplate = {
        ...sharedTemplate,
        id: `tpl_${Date.now()}`,
      };

      // 提取模板中使用的所有變數 keys
      const usedKeys = extractVariableKeys(sharedTemplate.content);

      // 合併詞庫（只加入本地不存在的）
      const mergedBanks = { ...banks };
      Object.keys(sharedBanks).forEach(key => {
        if (!mergedBanks[key]) {
          mergedBanks[key] = sharedBanks[key];
        }
      });

      // 合併預設值（只加入本地不存在的）
      const mergedDefaults = { ...defaults };
      Object.keys(sharedDefaults).forEach(key => {
        if (!mergedDefaults[key]) {
          mergedDefaults[key] = sharedDefaults[key];
        }
      });

      // 自動產生未定義變數的詞庫與預設值
      usedKeys.forEach(key => {
        // 如果詞庫不存在，自動產生
        if (!mergedBanks[key]) {
          // 嘗試從 selections 中獲取預設值
          let defaultValue = null;
          const selections = sharedTemplate.selections || {};
          // selections 的 key 格式為 "varName-0", "varName-1" 等
          const selectionKey = Object.keys(selections).find(k => k.startsWith(`${key}-`));
          if (selectionKey) {
            defaultValue = selections[selectionKey];
          }

          // 產生詞庫選項
          const option = defaultValue || { "zh-tw": key, en: key };
          mergedBanks[key] = {
            label: { "zh-tw": key, en: key },
            category: "other",
            options: [option]
          };
        }

        // 如果預設值不存在，自動產生
        if (!mergedDefaults[key]) {
          // 嘗試從 selections 中獲取預設值
          const selections = sharedTemplate.selections || {};
          const selectionKey = Object.keys(selections).find(k => k.startsWith(`${key}-`));
          if (selectionKey && selections[selectionKey]) {
            mergedDefaults[key] = selections[selectionKey];
          } else {
            // 使用變數名稱作為預設值
            mergedDefaults[key] = { "zh-tw": key, en: key };
          }
        }
      });

      setBanks(mergedBanks);
      setDefaults(mergedDefaults);

      // 新增模板並切換到該模板
      setTemplates([...templates, newTemplate]);
      setActiveTemplateId(newTemplate.id);

      // 清除分享模式狀態和 URL hash
      setSharedTemplate(null);
      setSharedBanks({});
      setSharedDefaults({});
      setIsShareMode(false);
      window.history.replaceState(null, '', window.location.pathname);

      addToast(t('import_success') || '✅ 模板已匯入');
    } catch (err) {
      console.error('Import failed:', err);
      addToast(t('import_failed') || '匯入失敗', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  // 退出分享模式（不匯入）
  const exitShareMode = () => {
    if (!isShareMode) return;
    setSharedTemplate(null);
    setSharedBanks({});
    setSharedDefaults({});
    setIsShareMode(false);
    // 清除 URL hash
    window.history.replaceState(null, '', window.location.pathname);
  };

  // 頁面載入時解析分享 URL
  useEffect(() => {
    const parsed = parseShareUrl();
    if (parsed) {
      setSharedTemplate(parsed.template);
      setSharedBanks(parsed.banks);
      setSharedDefaults(parsed.defaults);
      setIsShareMode(true);
      setDiscoveryView(false);
    }
  }, []);

  // 當使用者選擇其他模板時，退出分享模式
  useEffect(() => {
    if (isShareMode) {
      exitShareMode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTemplateId]);

  const handleExportImage = async () => {
    setIsExporting(true);

    try {
      const cleanText = resolveAndCleanPrompt(
        activeTemplate.content,
        activeTemplate.selections,
        defaults,
        templateLanguage
      );

      // URL 編碼提示詞
      const encodedPrompt = encodeURIComponent(cleanText);

      // 開啟 Gemini 網頁
      const geminiUrl = `https://gemini.google.com/app#autoSubmit=false&pasteImage=1&tool=image&prompt=${encodedPrompt}`;
      window.open(geminiUrl, '_blank');

    } catch (err) {
      console.error('Failed to open Gemini:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // 行動端模擬拖曳處理器
  const onTouchDragStart = (key, x, y) => {
    setTouchDraggingVar({ key, x, y });
    setIsBanksDrawerOpen(false); // 開始拖曳立即收起抽屜
  };

  const onTouchDragMove = (x, y) => {
    if (touchDraggingVar) {
      setTouchDraggingVar((prev) => ({ ...prev, x, y }));
    }
  };

  const onTouchDragEnd = (x, y) => {
    if (touchDraggingVar) {
      insertVariableToTemplate(touchDraggingVar.key, { x, y });
      setTouchDraggingVar(null);
    }
  };

  useKeyboardShortcuts(
    {
      onCopy: () => {
        if (!isEditing) handleCopy();
      },
      onExportJson: handleExportAllTemplates,
      onExportImage: () => {
        if (!isEditing && !isExporting) handleExportImage();
      },
      onEscape: () => {
        setIsSettingsOpen(false);
        setZoomedImage(null);
        setIsCategoryManagerOpen(false);
        setIsInsertModalOpen(false);
        setIsAddingBank(false);
        setShowImageUrlInput(false);
        setIsTemplatesDrawerOpen(false);
        setIsBanksDrawerOpen(false);
      },
    },
    true
  );

  // --- Renderers ---

  return (
    <div
      className="flex flex-col md:flex-row h-screen w-screen bg-gradient-to-br from-[#F3F4F6] to-[#E5E7EB] dark:from-slate-900 dark:to-slate-950 font-sans text-slate-800 dark:text-slate-100 overflow-hidden md:p-4 md:gap-4 relative select-none transition-colors duration-300"
      onTouchMove={(e) =>
        touchDraggingVar && onTouchDragMove(e.touches[0].clientX, e.touches[0].clientY)
      }
      onTouchEnd={(e) =>
        touchDraggingVar && onTouchDragEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY)
      }
    >
      {/* 行動端拖曳浮層 */}
      {touchDraggingVar && (
        <div
          className="fixed z-[9999] pointer-events-none px-3 py-1.5 bg-orange-500 text-white rounded-lg shadow-2xl text-xs font-bold font-mono animate-in zoom-in-50 duration-200"
          style={{
            left: touchDraggingVar.x,
            top: touchDraggingVar.y,
            transform: 'translate(-50%, -150%)',
            boxShadow: '0 0 20px rgba(249,115,22,0.4)',
          }}
        >
          {` {{${touchDraggingVar.key}}} `}
        </div>
      )}

      {/* Discovery View (Full Screen Overlay) */}
      {showDiscoveryOverlay ? (
        <div style={{ display: zoomedImage ? 'none' : 'block' }}>
          <DiscoveryView
            filteredTemplates={filteredTemplates}
            setActiveTemplateId={setActiveTemplateId}
            setDiscoveryView={handleSetDiscoveryView}
            setZoomedImage={setZoomedImage}
            posterScrollRef={posterScrollRef}
            setIsPosterAutoScrollPaused={setIsPosterAutoScrollPaused}
            currentMasonryStyle={MASONRY_STYLES[masonryStyleKey]}
            AnimatedSlogan={isMobileDevice ? MobileAnimatedSlogan : AnimatedSlogan}
            isSloganActive={!zoomedImage}
            t={t}
            TAG_STYLES={TAG_STYLES}
            displayTag={displayTag}
            handleRefreshSystemData={handleRefreshSystemData}
            language={language}
            setLanguage={setLanguage}
            setIsSettingsOpen={setIsSettingsOpen}
            isSortMenuOpen={isSortMenuOpen}
            setIsSortMenuOpen={setIsSortMenuOpen}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            setRandomSeed={setRandomSeed}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            TEMPLATE_TAGS={TEMPLATE_TAGS}
            templates={templates}
            onImportCommunityTemplate={handleImportCommunityTemplate}
            addToast={addToast}
          />
        </div>
      ) : (
        <>
          <TemplatesSidebar
            mobileTab={mobileTab}
            isTemplatesDrawerOpen={isTemplatesDrawerOpen}
            setIsTemplatesDrawerOpen={setIsTemplatesDrawerOpen}
            setDiscoveryView={handleSetDiscoveryView}
            activeTemplateId={activeTemplateId}
            setActiveTemplateId={setActiveTemplateId}
            filteredTemplates={filteredTemplates}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            TEMPLATE_TAGS={TEMPLATE_TAGS}
            displayTag={displayTag}
            handleRefreshSystemData={handleRefreshSystemData}
            language={language}
            setLanguage={setLanguage}
            setIsSettingsOpen={setIsSettingsOpen}
            t={t}
            isSortMenuOpen={isSortMenuOpen}
            setIsSortMenuOpen={setIsSortMenuOpen}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            setRandomSeed={setRandomSeed}
            handleResetTemplate={handleResetTemplate}
            startRenamingTemplate={startRenamingTemplate}
            handleDuplicateTemplate={handleDuplicateTemplate}
            handleExportTemplate={handleExportTemplate}
            handleDeleteTemplate={handleDeleteTemplate}
            handleAddTemplate={handleAddTemplate}
            INITIAL_TEMPLATES_CONFIG={INITIAL_TEMPLATES_CONFIG}
            templates={templates}
            editingTemplateNameId={editingTemplateNameId}
            tempTemplateName={tempTemplateName}
            setTempTemplateName={setTempTemplateName}
            tempTemplateAuthor={tempTemplateAuthor}
            setTempTemplateAuthor={setTempTemplateAuthor}
            saveTemplateName={saveTemplateName}
            setEditingTemplateNameId={setEditingTemplateNameId}
          />

          {/* --- 2. Main Editor (Middle) --- */}
          <div
            className={`
          ${mobileTab === 'editor' || mobileTab === 'settings' ? 'flex fixed inset-0 z-50 bg-white md:static md:bg-white/80' : 'hidden'}
          md:flex flex-1 flex-col h-full overflow-hidden relative
          md:rounded-3xl border border-white/40 shadow-xl
          origin-left
      `}
          >
            {/* Mobile Side Drawer Triggers */}
            {isMobileDevice && (
              <>
                <div
                  className={`md:hidden absolute left-0 top-1/2 -translate-y-1/2 z-40 transition-all duration-300 ${mobileTab === 'editor' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                >
                  <button
                    onClick={() => setIsTemplatesDrawerOpen(true)}
                    className="p-3 bg-white/60 backdrop-blur-md rounded-r-2xl shadow-lg border border-l-0 border-white/40 text-gray-400 active:scale-95 transition-all"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                <div
                  className={`md:hidden absolute right-0 top-1/2 -translate-y-1/2 z-40 transition-all duration-300 ${mobileTab === 'editor' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                >
                  <button
                    onClick={() => setIsBanksDrawerOpen(true)}
                    className="p-3 bg-white/60 backdrop-blur-md rounded-l-2xl shadow-lg border border-r-0 border-white/40 text-gray-400 active:scale-95 transition-all"
                  >
                    <ChevronLeft size={20} />
                  </button>
                </div>
              </>
            )}

            {/* 頂部工具列 */}
            {(!isMobileDevice || mobileTab !== 'settings') && (
              <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100/50 flex justify-between items-center z-20 h-auto min-h-[60px] md:min-h-[72px] bg-white/50 backdrop-blur-sm">
                <div className="min-w-0 flex-1 mr-2 flex flex-col justify-center">
                  <h1 className="text-base md:text-lg font-bold text-gray-800 truncate">
                    {getLocalized(activeTemplate.name, language)}
                  </h1>

                  {/* 標籤與狀態列 */}
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {/* 狀態指示器 */}
                    <div className="hidden md:flex items-center gap-1.5 border-r border-gray-200 pr-2 mr-0.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${isEditing ? 'bg-amber-400 animate-pulse' : 'bg-green-400'}`}
                      ></span>
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                        {isEditing ? t('editing_status') : t('preview_status')}
                      </p>
                    </div>

                    {!isEditing && (
                      <div className="hidden sm:flex items-center gap-1.5 border-r border-gray-200 pr-2 mr-0.5 text-[10px] text-gray-400 font-medium tabular-nums">
                        <span>{promptStats.chars} {t('prompt_chars')}</span>
                        <span className="text-gray-300">·</span>
                        <span>~{promptStats.tokensEstimate} {t('prompt_tokens')}</span>
                      </div>
                    )}

                    {/* Tags */}
                    {(activeTemplate.tags || []).map((tag) => (
                      <span
                        key={tag}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${TAG_STYLES[tag] || TAG_STYLES['default']}`}
                      >
                        {displayTag(tag)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3 self-start md:self-center">
                  <div className="flex bg-gray-100/80 p-1 rounded-xl border border-gray-200 shadow-inner">
                    <button
                      onClick={() => setIsEditing(false)}
                      className={`
                          p-1.5 md:px-3 md:py-1.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-1.5
                          ${
                            !isEditing
                              ? 'bg-white text-orange-600 shadow-sm ring-1 ring-black/5'
                              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                          }
                      `}
                      title={t('preview_mode')}
                    >
                      <Eye size={16} />{' '}
                      <span className="hidden md:inline">{t('preview_mode')}</span>
                    </button>
                    <button
                      onClick={() => setIsEditing(true)}
                      className={`
                          p-1.5 md:px-3 md:py-1.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-1.5
                          ${
                            isEditing
                              ? 'bg-white text-orange-600 shadow-sm ring-1 ring-black/5'
                              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                          }
                      `}
                      title={t('edit_mode')}
                    >
                      <Edit3 size={16} /> <span className="hidden md:inline">{t('edit_mode')}</span>
                    </button>
                  </div>

                  <div className="h-6 w-px bg-gray-200 mx-1 hidden md:block"></div>

                  <PremiumButton
                    onClick={handleCopy}
                    title={copied ? t('copied') : t('copy_result')}
                    icon={copied ? Check : CopyIcon}
                    color={copied ? 'emerald' : 'orange'}
                    active={true} // Always active look for CTA
                    className="transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    <span className="hidden md:inline">
                      {copied ? t('copied') : t('copy_result')}
                    </span>
                  </PremiumButton>
                  <PremiumButton
                    onClick={handleExportImage}
                    disabled={isEditing || isExporting}
                    title={isExporting ? t('exporting') : t('export_image')}
                    color="orange"
                  >
                    <img src="./gemini.svg" alt="Gemini" className="w-4 h-4 flex-shrink-0" />
                  </PremiumButton>
                  {isShareMode ? (
                    <PremiumButton
                      onClick={handleImportShared}
                      disabled={isImporting}
                      title={isImporting ? (t('importing_template') || '匯入中...') : (t('import_shared') || '匯入模板')}
                      color="emerald"
                    >
                      {isImporting ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Download size={16} />
                      )}
                    </PremiumButton>
                  ) : (
                    <PremiumButton
                      onClick={handleShare}
                      title={t('share') || '分享'}
                      color="blue"
                    >
                      <Share2 size={16} />
                    </PremiumButton>
                  )}
                </div>
              </div>
            )}

            {/* 核心內容區 */}
            <div
              className={`flex-1 overflow-hidden relative pb-24 md:pb-0 flex flex-col bg-gradient-to-br from-white/60 to-gray-50/60 ${mobileTab === 'settings' ? 'pt-0' : ''}`}
            >
              {mobileTab === 'settings' ? (
                <div className="flex-1 flex flex-col overflow-hidden bg-white">
                  <MobileSettingsView
                    language={language}
                    setLanguage={setLanguage}
                    storageMode={storageMode}
                    setStorageMode={setStorageMode}
                    handleImportTemplate={handleImportTemplate}
                    handleExportAllTemplates={handleExportAllTemplates}
                    handleCompleteBackup={handleCompleteBackup}
                    handleImportAllData={handleImportAllData}
                    handleResetSystemData={handleRefreshSystemData}
                    handleClearAllData={handleClearAllData}
                    SYSTEM_DATA_VERSION={SYSTEM_DATA_VERSION}
                    t={t}
                  />
                </div>
              ) : (
                <>
                  {isEditing && (
                    <EditorToolbar
                      onInsertClick={() => setIsInsertModalOpen(true)}
                      canUndo={historyPast.length > 0}
                      canRedo={historyFuture.length > 0}
                      onUndo={handleUndo}
                      onRedo={handleRedo}
                      t={t}
                    />
                  )}

                  {isEditing ? (
                    <div className="flex-1 relative overflow-hidden">
                      <VisualEditor
                        ref={textareaRef}
                        value={getLocalized(activeTemplate.content, templateLanguage)}
                        onChange={(e) => {
                          const newText = e.target.value;
                          if (typeof activeTemplate.content === 'object') {
                            updateActiveTemplateContent({
                              ...activeTemplate.content,
                              [templateLanguage]: newText,
                            });
                          } else {
                            updateActiveTemplateContent(newText);
                          }
                        }}
                        banks={banks}
                        categories={categories}
                      />
                    </div>
                  ) : (
                    <TemplatePreview
                      activeTemplate={isShareMode && sharedTemplate ? sharedTemplate : activeTemplate}
                      banks={banks}
                      defaults={defaults}
                      categories={categories}
                      activePopover={activePopover}
                      setActivePopover={setActivePopover}
                      handleSelect={handleSelect}
                      handleAddCustomAndSelect={handleAddCustomAndSelect}
                      popoverRef={popoverRef}
                      t={t}
                      displayTag={displayTag}
                      TAG_STYLES={TAG_STYLES}
                      setZoomedImage={setZoomedImage}
                      fileInputRef={fileInputRef}
                      setShowImageUrlInput={setShowImageUrlInput}
                      handleResetImage={handleResetImage}
                      language={templateLanguage}
                      setLanguage={setTemplateLanguage}
                      // 標籤編輯相關
                      TEMPLATE_TAGS={['社群', ...TEMPLATE_TAGS]}
                      handleUpdateTemplateTags={handleUpdateTemplateTags}
                      editingTemplateTags={editingTemplateTags}
                      setEditingTemplateTags={setEditingTemplateTags}
                      // 多圖編輯相關
                      setImageUpdateMode={setImageUpdateMode}
                      setCurrentImageEditIndex={setCurrentImageEditIndex}
                      // 標題編輯相關
                      editingTemplateNameId={editingTemplateNameId}
                      tempTemplateName={tempTemplateName}
                      setTempTemplateName={setTempTemplateName}
                      saveTemplateName={saveTemplateName}
                      startRenamingTemplate={startRenamingTemplate}
                      setEditingTemplateNameId={setEditingTemplateNameId}
                    />
                  )}
                </>
              )}

              {/* Image URL Input Modal */}
              {showImageUrlInput && (
                <div
                  className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                  onClick={() => {
                    setShowImageUrlInput(false);
                    setImageUrlInput('');
                  }}
                >
                  <div
                    className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Globe size={20} className="text-blue-500" />
                      {t('image_url')}
                    </h3>
                    <input
                      autoFocus
                      type="text"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder={t('image_url_placeholder')}
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onKeyDown={(e) => e.key === 'Enter' && handleSetImageUrl()}
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleSetImageUrl}
                        disabled={!imageUrlInput.trim()}
                        className="flex-1 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      >
                        {t('use_url')}
                      </button>
                      <button
                        onClick={() => {
                          setShowImageUrlInput(false);
                          setImageUrlInput('');
                        }}
                        className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-all"
                      >
                        {t('cancel')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <BanksSidebar
            mobileTab={mobileTab}
            isBanksDrawerOpen={isBanksDrawerOpen}
            setIsBanksDrawerOpen={setIsBanksDrawerOpen}
            bankSidebarWidth={bankSidebarWidth}
            sidebarRef={sidebarRef}
            startResizing={startResizing}
            setIsCategoryManagerOpen={setIsCategoryManagerOpen}
            categories={categories}
            banks={banks}
            insertVariableToTemplate={insertVariableToTemplate}
            handleDeleteOption={handleDeleteOption}
            handleAddOption={handleAddOption}
            handleDeleteBank={handleDeleteBank}
            handleUpdateBankCategory={handleUpdateBankCategory}
            handleStartAddBank={handleStartAddBank}
            t={t}
            language={templateLanguage}
            onTouchDragStart={onTouchDragStart}
          />
        </>
      )}

      {/* --- Add Bank Modal --- */}
      <AddBankModal
        isOpen={isAddingBank}
        onClose={() => setIsAddingBank(false)}
        t={t}
        categories={categories}
        newBankLabel={newBankLabel}
        setNewBankLabel={setNewBankLabel}
        newBankKey={newBankKey}
        setNewBankKey={setNewBankKey}
        newBankCategory={newBankCategory}
        setNewBankCategory={setNewBankCategory}
        onConfirm={handleAddBank}
      />

      {/* 隐藏的图片选择器 */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleUploadImage}
      />

      {/* --- Settings Modal - Enhanced UI --- */}
      {isSettingsOpen && (
        <div
          className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200"
          onClick={() => setIsSettingsOpen(false)}
        >
          <div
            className="bg-gradient-to-br from-white via-white to-gray-50/30 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border-2 border-white/60 animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with gradient background */}
            <div className="relative flex items-center justify-between px-6 py-5 border-b border-gray-100/80 bg-gradient-to-r from-orange-50/50 via-white to-blue-50/30 backdrop-blur">
              {/* Decorative gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-blue-500/5"></div>

              <div className="relative flex items-center gap-3 text-gray-800">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/30">
                  <Settings size={20} />
                </div>
                <div>
                  <p className="text-base font-bold tracking-tight">{t('settings')}</p>
                  <p className="text-xs text-gray-500 font-medium">{t('app_title')}</p>
                </div>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="relative p-2.5 text-gray-400 hover:text-gray-700 hover:bg-white/80 rounded-xl transition-all duration-200 hover:shadow-md hover:scale-110"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-8 max-h-[75vh] overflow-y-auto dark:text-slate-200">
              {/* Appearance / Theme */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-gradient-to-b from-violet-400 to-violet-600 rounded-full"></div>
                  <p className="text-sm font-bold tracking-tight text-gray-700 dark:text-slate-200">
                    {t('appearance')}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'light', label: t('theme_light'), icon: Sun },
                    { id: 'dark', label: t('theme_dark'), icon: Moon },
                    { id: 'system', label: t('theme_system'), icon: Monitor },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setTheme(id)}
                      className={`px-4 py-3 text-sm font-semibold rounded-2xl transition-all duration-300 border-2 flex flex-col items-center gap-2 ${
                        theme === id
                          ? 'bg-gradient-to-br from-violet-500 to-violet-600 text-white border-violet-500 shadow-lg shadow-violet-500/30'
                          : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border-gray-200 dark:border-slate-600 hover:border-violet-300'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Import / Export - Enhanced */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full"></div>
                  <p className="text-sm font-bold tracking-tight text-gray-700">
                    {t('import_template')} / {t('export_all_templates')}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportTemplate}
                      className="hidden"
                      id="import-template-input-modal"
                    />
                    <div
                      onClick={() => document.getElementById('import-template-input-modal').click()}
                      className="cursor-pointer w-full text-center px-5 py-4 text-sm font-semibold bg-gradient-to-br from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 text-gray-700 rounded-2xl transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg hover:scale-[1.02]"
                    >
                      <Download size={18} />
                      <span>{t('import_template')}</span>
                    </div>
                  </label>
                  <button
                    onClick={handleExportAllTemplates}
                    className="w-full text-center px-5 py-4 text-sm font-semibold bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl transition-all duration-300 border-2 border-orange-500 hover:border-orange-600 flex items-center justify-center gap-2.5 shadow-md shadow-orange-500/30 hover:shadow-lg hover:shadow-orange-500/40 hover:scale-[1.02]"
                  >
                    <Upload size={18} />
                    <span>{t('export_all_templates')}</span>
                  </button>
                </div>
              </div>

              {/* Data Refresh */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full"></div>
                  <p className="text-sm font-bold tracking-tight text-gray-700">
                    {t('refresh_system')}
                  </p>
                </div>
                <button
                  onClick={handleRefreshSystemData}
                  className="w-full text-center px-5 py-4 text-sm font-semibold bg-white hover:bg-orange-50 text-orange-600 rounded-2xl transition-all duration-300 border-2 border-orange-100 hover:border-orange-200 flex items-center justify-center gap-2.5 shadow-sm"
                >
                  <RefreshCw size={18} />
                  <span>{t('refresh_system')}</span>
                </button>
              </div>

              {/* Storage - Enhanced */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
                  <p className="text-sm font-bold tracking-tight text-gray-700">
                    {t('storage_mode')}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={handleSwitchToLocalStorage}
                    className={`relative w-full px-5 py-4 text-sm font-semibold rounded-2xl transition-all duration-300 border-2 flex items-center justify-between overflow-hidden group ${
                      storageMode === 'browser'
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/30'
                        : 'bg-gradient-to-br from-white to-gray-50 text-gray-700 border-gray-200 hover:border-blue-300 hover:shadow-md hover:scale-[1.02]'
                    }`}
                  >
                    <div className="flex items-center gap-3 relative z-10">
                      <Globe size={18} />
                      <span>{t('use_browser_storage')}</span>
                    </div>
                    {storageMode === 'browser' && (
                      <div className="relative z-10">
                        <Check size={18} className="animate-in zoom-in duration-300" />
                      </div>
                    )}
                    {storageMode === 'browser' && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent"></div>
                    )}
                  </button>
                  <button
                    onClick={handleSelectDirectory}
                    disabled={!isFileSystemSupported || isMobileDevice}
                    className={`relative w-full px-5 py-4 text-sm font-semibold rounded-2xl transition-all duration-300 border-2 flex items-center justify-between overflow-hidden group ${
                      storageMode === 'folder'
                        ? 'bg-gradient-to-br from-green-500 to-green-600 text-white border-green-500 shadow-lg shadow-green-500/30'
                        : `bg-gradient-to-br from-white to-gray-50 text-gray-700 border-gray-200 ${!isFileSystemSupported || isMobileDevice ? 'opacity-50 cursor-not-allowed' : 'hover:border-green-300 hover:shadow-md hover:scale-[1.02]'}`
                    }`}
                    title={
                      isMobileDevice
                        ? t('use_browser_storage')
                        : !isFileSystemSupported
                          ? t('browser_not_supported')
                          : ''
                    }
                  >
                    <div className="flex items-center gap-3 relative z-10">
                      <Download size={18} />
                      <span>{t('use_local_folder')}</span>
                    </div>
                    {storageMode === 'folder' && (
                      <div className="relative z-10">
                        <Check size={18} className="animate-in zoom-in duration-300" />
                      </div>
                    )}
                    {storageMode === 'folder' && (
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-transparent"></div>
                    )}
                  </button>
                </div>

                {storageMode === 'folder' && directoryHandle && (
                  <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200/60 rounded-xl text-sm text-green-700 flex items-center justify-between gap-3 shadow-sm animate-in slide-in-from-top duration-300">
                    <div className="flex items-center gap-2.5 font-medium">
                      <div className="p-1 bg-green-500 rounded-lg text-white">
                        <Check size={14} />
                      </div>
                      <span>{t('auto_save_enabled')}</span>
                    </div>
                    <button
                      onClick={handleManualLoadFromFolder}
                      className="px-4 py-1.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg text-xs font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
                    >
                      {t('load_from_folder')}
                    </button>
                  </div>
                )}

                {storageMode === 'browser' && (
                  <div className="px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl">
                    <p className="text-xs text-blue-700 font-medium">
                      {t('storage_used')}: <span className="font-bold">{getStorageSize()} KB</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Danger Zone - Enhanced */}
              <div className="space-y-4 pt-4 border-t-2 border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-gradient-to-b from-red-400 to-red-600 rounded-full"></div>
                  <p className="text-sm font-bold tracking-tight text-red-600">
                    {t('clear_all_data')}
                  </p>
                </div>
                <button
                  onClick={handleClearAllData}
                  className="w-full text-center px-5 py-4 text-sm font-semibold bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 text-red-600 hover:text-red-700 rounded-2xl transition-all duration-300 border-2 border-red-200 hover:border-red-300 flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg hover:scale-[1.02] group"
                >
                  <Trash2 size={18} className="group-hover:animate-pulse" />
                  <span>{t('clear_all_data')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Image Action Menu (Portal) --- */}
      {showImageActionMenu &&
        (() => {
          const buttonEl = window.__imageMenuButtonRef;
          if (!buttonEl) return null;
          const rect = buttonEl.getBoundingClientRect();
          return (
            <>
              {/* 背景遮罩層 - 點擊關閉選單 */}
              <div
                className="fixed inset-0 z-[9998]"
                onClick={() => setShowImageActionMenu(false)}
              />
              {/* 選單內容 */}
              <div
                style={{
                  position: 'fixed',
                  top: `${rect.bottom + 8}px`,
                  left: `${rect.left}px`,
                  zIndex: 9999,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden min-w-[140px] animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => {
                      fileInputRef.current?.click();
                      setShowImageActionMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-orange-50 transition-colors flex items-center gap-2 text-gray-700"
                  >
                    <ImageIcon size={16} />
                    {t('upload_image')}
                  </button>
                  <div className="h-px bg-gray-100"></div>
                  <button
                    onClick={() => {
                      setShowImageUrlInput(true);
                      setShowImageActionMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 transition-colors flex items-center gap-2 text-gray-700"
                  >
                    <Globe size={16} />
                    {t('image_url')}
                  </button>
                </div>
              </div>
            </>
          );
        })()}

      {/* --- Image Lightbox --- */}
      {/* --- Image View Modal --- */}
      {zoomedImage && (
        <ImagePreviewModal
          zoomedImage={zoomedImage}
          template={
            INITIAL_TEMPLATES_CONFIG.find(
              (t) => t.imageUrl === zoomedImage || t.imageUrls?.includes(zoomedImage)
            ) ||
            templates.find(
              (t) => t.imageUrl === zoomedImage || t.imageUrls?.includes(zoomedImage)
            ) ||
            (activeTemplate.imageUrl === zoomedImage ||
            activeTemplate.imageUrls?.includes(zoomedImage)
              ? activeTemplate
              : null)
          }
          language={language}
          t={t}
          TAG_STYLES={TAG_STYLES}
          displayTag={displayTag}
          setActiveTemplateId={setActiveTemplateId}
          setDiscoveryView={setDiscoveryView}
          setZoomedImage={setZoomedImage}
          setMobileTab={setMobileTab}
        />
      )}

      {/* --- 行動版底部導覽（3 Tabs） --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/25 backdrop-blur-2xl border-t border-white/30 flex justify-around items-center z-[250] h-16 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.05)]">
        {/* 首頁 */}
        <button
          onClick={() => {
            setMobileTab('home');
            setDiscoveryView(true);
            setZoomedImage(null);
            setIsTemplatesDrawerOpen(false);
            setIsBanksDrawerOpen(false);
          }}
          className={`flex flex-col items-center justify-center w-full h-full transition-all active:scale-90 ${mobileTab === 'home' ? 'text-orange-600' : 'text-gray-700'}`}
          style={{ filter: 'drop-shadow(1px 1px 0px rgba(255,255,255,0.3))' }}
        >
          <div
            className={`p-2 rounded-xl transition-all ${mobileTab === 'home' ? 'bg-orange-50/50' : ''}`}
          >
            <LayoutGrid size={22} />
          </div>
        </button>

        {/* 模板詳情 (編輯器) */}
        <button
          onClick={() => {
            setDiscoveryView(false);
            setZoomedImage(null);
            setIsTemplatesDrawerOpen(false);
            setIsBanksDrawerOpen(false);
            // 強制確保有模板被選中
            if (templates.length > 0 && !activeTemplateId) {
              const firstId = templates[0].id;
              setActiveTemplateId(firstId);
            }
            setMobileTab('editor');
          }}
          className={`flex flex-col items-center justify-center w-full h-full transition-all active:scale-90 ${mobileTab === 'editor' ? 'text-orange-600' : 'text-gray-700'}`}
          style={{ filter: 'drop-shadow(1px 1px 0px rgba(255,255,255,0.3))' }}
        >
          <div
            className={`p-2 rounded-xl transition-all ${mobileTab === 'editor' ? 'bg-orange-50/50' : ''}`}
          >
            <Edit3 size={22} />
          </div>
        </button>

        {/* 設定 */}
        <button
          onClick={() => {
            setMobileTab('settings');
            setDiscoveryView(false);
            setZoomedImage(null);
            setIsTemplatesDrawerOpen(false);
            setIsBanksDrawerOpen(false);
          }}
          className={`flex flex-col items-center justify-center w-full h-full transition-all active:scale-90 ${mobileTab === 'settings' ? 'text-orange-600' : 'text-gray-700'}`}
          style={{ filter: 'drop-shadow(1px 1px 0px rgba(255,255,255,0.3))' }}
        >
          <div
            className={`p-2 rounded-xl transition-all ${mobileTab === 'settings' ? 'bg-orange-50/50' : ''}`}
          >
            <Settings size={22} />
          </div>
        </button>
      </div>

      {/* --- Category Manager Modal (Moved to bottom) --- */}
      <CategoryManager
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        categories={categories}
        setCategories={setCategories}
        banks={banks}
        setBanks={setBanks}
        t={t}
      />

      {/* --- Insert Variable Modal (Moved to bottom) --- */}
      <InsertVariableModal
        isOpen={isInsertModalOpen}
        onClose={() => setIsInsertModalOpen(false)}
        categories={categories}
        banks={banks}
        onSelect={(key) => {
          insertVariableToTemplate(key);
          setIsInsertModalOpen(false);
        }}
        t={t}
      />

      {/* --- 資料更新提示（模板與詞庫） --- */}
      {showDataUpdateNotice && (
        <div className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 transition-all">
            <div className="flex items-center gap-3 mb-4 text-orange-600">
              <div className="p-2 bg-orange-100 rounded-lg">
                <RefreshCw size={24} />
              </div>
              <h3 className="text-xl font-bold">{t('update_available_title')}</h3>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">{t('update_available_msg')}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDataUpdateNotice(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                {t('later')}
              </button>
              <button
                onClick={handleAutoUpdate}
                className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 font-bold"
              >
                {t('update_now')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- 應用刷新提示（應用版本更新） --- */}
      {showAppUpdateNotice && (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:bottom-8 z-[150]">
          <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-md ml-auto border border-blue-400">
            <div className="p-2 bg-white/20 rounded-xl">
              <Sparkles size={24} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium leading-snug">{t('app_update_available_msg')}</p>
            </div>
            <button
              onClick={() => {
                window.location.reload();
              }}
              className="px-4 py-2 bg-white text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors shadow-lg shadow-black/10 whitespace-nowrap"
            >
              {t('refresh_now')}
            </button>
            <button
              onClick={() => setShowAppUpdateNotice(false)}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

