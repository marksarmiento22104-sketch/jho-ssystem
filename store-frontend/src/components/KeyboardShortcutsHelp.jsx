import { useState, useEffect } from "react";
import { FaKeyboard, FaTimes } from "react-icons/fa";

export default function KeyboardShortcutsHelp({ shortcuts = [] }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Show help on F1
      if (e.key === "F1") {
        e.preventDefault();
        setShow((prev) => !prev);
      }
      // Close on Escape
      if (e.key === "Escape" && show) {
        setShow(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [show]);

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="fixed bottom-6 right-6 z-40 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg transition-all group"
        title="Keyboard Shortcuts (F1)"
      >
        <FaKeyboard className="text-lg" />
        <span className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Keyboard Shortcuts (F1)
        </span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FaKeyboard className="text-yellow-500" /> Keyboard Shortcuts
          </h3>
          <button
            onClick={() => setShow(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-5 overflow-y-auto max-h-[60vh]">
          <div className="space-y-2">
            {shortcuts.map((shortcut, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50"
              >
                <span className="text-sm text-gray-700">{shortcut.description}</span>
                <kbd className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 border border-gray-300 rounded-lg text-xs font-mono text-gray-700 shadow-sm">
                  {shortcut.keys}
                </kbd>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-400 text-center">
              Press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-[10px] font-mono">F1</kbd> to toggle this panel
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
