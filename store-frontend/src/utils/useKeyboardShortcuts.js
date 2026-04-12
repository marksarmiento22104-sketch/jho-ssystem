import { useEffect, useCallback } from "react";

/**
 * Custom hook for keyboard shortcuts
 * @param {Array} shortcuts - Array of { key, ctrl, shift, alt, handler, description }
 * @param {boolean} enabled - Whether shortcuts are active
 */
export default function useKeyboardShortcuts(shortcuts, enabled = true) {
  const handleKeyDown = useCallback(
    (e) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in input fields (unless explicitly allowed)
      const target = e.target;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;

      for (const shortcut of shortcuts) {
        const keyMatch =
          e.key.toLowerCase() === shortcut.key.toLowerCase() ||
          e.code === shortcut.key;

        const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          // Allow Escape to always work, even in inputs
          if (shortcut.key === "Escape" || !isInput || shortcut.allowInInput) {
            e.preventDefault();
            shortcut.handler(e);
            return;
          }
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
