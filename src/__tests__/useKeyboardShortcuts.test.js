import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  it('KB-01: Ctrl+Shift+C triggers onCopy', () => {
    const onCopy = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onCopy }, true));

    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'c', ctrlKey: true, shiftKey: true })
    );

    expect(onCopy).toHaveBeenCalledTimes(1);
  });

  it('KB-02: Escape triggers onEscape', () => {
    const onEscape = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onEscape }, true));

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it('KB-03: disabled shortcuts do not fire', () => {
    const onCopy = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onCopy }, false));

    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'c', ctrlKey: true, shiftKey: true })
    );

    expect(onCopy).not.toHaveBeenCalled();
  });
});