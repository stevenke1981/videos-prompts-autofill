import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import {
  isLargeDataUrl,
  saveImage,
  loadImage,
  removeImage,
  resolveImageUrl,
  toIdbReference,
} from '../services/storage';

describe('storage', () => {
  beforeEach(async () => {
    const dbs = await indexedDB.databases();
    await Promise.all(dbs.map((db) => indexedDB.deleteDatabase(db.name)));
  });

  it('ST-01: isLargeDataUrl small', () => {
    expect(isLargeDataUrl('data:image/png;base64,abc')).toBe(false);
  });

  it('ST-02: isLargeDataUrl large', () => {
    const large = 'x'.repeat(201 * 1024);
    expect(isLargeDataUrl(large)).toBe(true);
  });

  it('ST-03: saveImage + loadImage roundtrip', async () => {
    const dataUrl = 'data:image/png;base64,testdata';
    const ref = await saveImage('test-key', dataUrl);
    expect(ref).toBe(toIdbReference('test-key'));

    const loaded = await loadImage('test-key');
    expect(loaded).toBe(dataUrl);

    const resolved = await resolveImageUrl(ref);
    expect(resolved).toBe(dataUrl);
  });

  it('ST-04: removeImage', async () => {
    await saveImage('remove-me', 'data:image/png;base64,rm');
    await removeImage('remove-me');
    const loaded = await loadImage('remove-me');
    expect(loaded).toBeNull();
  });
});