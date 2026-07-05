const DB_NAME = 'videos-prompts-autofill';
const DB_VERSION = 1;
const IMAGE_STORE = 'images';
const IDB_PREFIX = 'idb://';
const LARGE_THRESHOLD = 200 * 1024;

let dbPromise = null;

const openImageDB = () => {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not available'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(IMAGE_STORE)) {
        db.createObjectStore(IMAGE_STORE);
      }
    };
  });

  return dbPromise;
};

export const isLargeDataUrl = (dataUrl) => {
  if (!dataUrl || typeof dataUrl !== 'string') return false;
  return dataUrl.length > LARGE_THRESHOLD;
};

export const isIdbReference = (url) =>
  typeof url === 'string' && url.startsWith(IDB_PREFIX);

export const toIdbReference = (key) => `${IDB_PREFIX}${key}`;

export const initStorage = async () => {
  try {
    await openImageDB();
  } catch (error) {
    console.warn('Image storage init failed:', error);
  }
};

export const saveImage = async (key, dataUrl) => {
  const db = await openImageDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([IMAGE_STORE], 'readwrite');
    const store = transaction.objectStore(IMAGE_STORE);
    const request = store.put({ dataUrl, updatedAt: Date.now() }, key);
    request.onsuccess = () => resolve(toIdbReference(key));
    request.onerror = () => reject(request.error);
  });
};

export const loadImage = async (key) => {
  const db = await openImageDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([IMAGE_STORE], 'readonly');
    const store = transaction.objectStore(IMAGE_STORE);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result?.dataUrl ?? null);
    request.onerror = () => reject(request.error);
  });
};

export const removeImage = async (key) => {
  const db = await openImageDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([IMAGE_STORE], 'readwrite');
    const store = transaction.objectStore(IMAGE_STORE);
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const resolveImageUrl = async (url) => {
  if (!url) return url;
  if (!isIdbReference(url)) return url;

  const key = url.slice(IDB_PREFIX.length);
  try {
    const dataUrl = await loadImage(key);
    return dataUrl || url;
  } catch (error) {
    console.error('Failed to resolve image from IndexedDB:', error);
    return url;
  }
};

export const persistImageIfLarge = async (templateId, index, dataUrl) => {
  if (!isLargeDataUrl(dataUrl)) return dataUrl;

  const key = `${templateId}-${index}-${Date.now()}`;
  return saveImage(key, dataUrl);
};