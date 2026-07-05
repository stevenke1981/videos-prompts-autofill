import { useEffect } from 'react';

export const useKeyboardShortcuts = (handlers = {}, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event) => {
      const key = event.key.toLowerCase();
      const withCtrl = event.ctrlKey || event.metaKey;

      if (key === 'escape' && handlers.onEscape) {
        handlers.onEscape();
        return;
      }

      if (!withCtrl || !event.shiftKey) return;

      if (key === 'c' && handlers.onCopy) {
        event.preventDefault();
        handlers.onCopy();
      } else if (key === 'e' && handlers.onExportJson) {
        event.preventDefault();
        handlers.onExportJson();
      } else if (key === 's' && handlers.onExportImage) {
        event.preventDefault();
        handlers.onExportImage();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, handlers]);
};