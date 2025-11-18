"use client";
import React, { useRef, useEffect, useState } from "react";
import { drawExcalidrawElements } from "./boardApi";
import { Eye, EyeOff, X, Save } from "lucide-react";

const ALLOWED_BLOCKS = [
  { label: "Heading", symbol: "#", shortcut: "Ctrl+1" },
  { label: "Quote", symbol: ">", shortcut: "Ctrl+Q" },
  { label: "Memo", symbol: ">>", shortcut: "Ctrl+M" },
  { label: "Divider", symbol: "---", shortcut: "Ctrl+D" },
];

export default function FloatingCard({ onClose, onSave, BOARD_DATA_KEY }) {
  const containerRef = useRef(null);
  const textareaRef = useRef(null);

  // We keep the "source of truth" in React state but treat the textarea as UNCONTROLLED
  // for DOM edits (so the browser undo stack works). We sync state on input events.
  const [markdownContent, setMarkdownContent] = useState(placeholderSafe());
  const [showPreview, setShowPreview] = useState(false);

  // 1. NEW STATE: To manage the container width based on preview state
  // w-1/2 is the default width, w-[60%] is the increased width
  const [containerWidth, setContainerWidth] = useState("w-1/2");

  // Initialize textarea value on mount
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) ta.value = markdownContent;
  }, []); // one-time

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        onClose?.();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Keyboard shortcuts: block insertion, save, close
  useEffect(() => {
    function onKeyDown(e) {
      const meta = e.ctrlKey || e.metaKey;

      // Save: Ctrl/Cmd + Enter
      if ((e.key === "Enter" || e.key === "\r") && meta) {
        e.preventDefault();
        handleSave();
        return;
      }

      // Close on Escape
      if (e.key === "Escape") {
        e.preventDefault();
        onClose?.();
        return;
      }

      // Block shortcuts when meta pressed
      if (meta) {
        if (e.key === "1") {
          e.preventDefault();
          applyBlock("#");
          return;
        }
        if (e.key.toLowerCase() === "q") {
          e.preventDefault();
          applyBlock(">");
          return;
        }
        if (e.key.toLowerCase() === "m") {
          e.preventDefault();
          applyBlock(">>");
          return;
        }
        if (e.key.toLowerCase() === "d") {
          e.preventDefault();
          applyBlock("---");
          return;
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [markdownContent, onClose]);

  // On input in textarea: sync React state
  const handleInput = (e) => {
    setMarkdownContent(e.target.value);
  };

  // Apply a block to the current line, using setRangeText to preserve undo stack
  const applyBlock = (symbol) => {
    const ta = textareaRef.current;
    if (!ta) return;

    // Use current value from DOM (uncontrolled)
    const value = ta.value;
    const selectionStart = ta.selectionStart;

    // Determine current line range
    const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
    const lineEnd = value.indexOf("\n", selectionStart);
    const actualEnd = lineEnd === -1 ? value.length : lineEnd;
    const currentLine = value.slice(lineStart, actualEnd);

    let newLine;
    switch (symbol) {
      case "#":
        newLine = `# ${currentLine.replace(/^#+\s*/, "").trimStart()}`;
        break;
      case ">":
        newLine = `> ${currentLine.replace(/^>\s*/, "").trimStart()}`;
        break;
      case ">>":
        newLine = `>> ${currentLine.replace(/^>>\s*/, "").trimStart()}`;
        break;
      case "---":
        newLine = `---`;
        break;
      case "para":
        newLine = currentLine.replace(/^(#|>|>>)+\s*/, "");
        break;
      default:
        newLine = currentLine;
    }

    // Use setRangeText to insert the newLine and preserve native undo
    try {
      // place caret at end of replaced text
      ta.focus();
      ta.setRangeText(newLine, lineStart, actualEnd, "end");
    } catch (err) {
      // Fallback: replace value directly (less ideal for undo but safe)
      const newValue =
        value.slice(0, lineStart) + newLine + value.slice(actualEnd);
      ta.value = newValue;
    }

    // Sync React state and keep caret after the inserted/new line
    setTimeout(() => {
      const updatedVal = ta.value;
      setMarkdownContent(updatedVal);

      // Move caret to end of the replaced line (user will press Enter manually to create a paragraph line)
      const cursorPos = lineStart + newLine.length;
      ta.selectionStart = ta.selectionEnd = cursorPos;
      ta.focus();
    }, 0);
  };

  // NEW HANDLER: Toggles preview and updates container width
  const handleTogglePreview = () => {
    setShowPreview((prev) => {
      const newState = !prev;
      // Set width based on the new state
      setContainerWidth(newState ? "w-[60%]" : "w-1/2");
      return newState;
    });
  };

  // Save handler: sanitize and export
  const handleSave = () => {
    const ta = textareaRef.current;
    const current = ta ? ta.value : markdownContent;
    const sanitized = sanitizeMarkdown(current);
    drawExcalidrawElements("markdown", sanitized, BOARD_DATA_KEY);
    onSave?.(sanitized);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-black/50 backdrop-blur-sm flex justify-center items-center z-1000">
      <div
        ref={containerRef}
        // 3. APPLY DYNAMIC WIDTH: Use containerWidth state here
        className={`${containerWidth} h-[90%] bg-[#101010] shadow-2xl p-8 overflow-y-auto flex flex-col scrollbar-none rounded-xl transition-all duration-300 ease-in-out`}>
        {/* Header: Allowed blocks + help */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-[#e0e0e0]">
              Allowed Markdown Blocks
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              {ALLOWED_BLOCKS.map((b) => (
                <div
                  key={b.symbol}
                  className="px-3 py-1 bg-[#2f2f2f] rounded-md border border-[#3a3a3a]"
                  title={`${b.label} — ${b.shortcut ?? ""}`}>
                  <span className="font-medium font-outfit text-white">
                    {b.symbol}
                  </span>
                  <span className="ml-2 font-outfit text-[#bdbdbd]">
                    {b.label}
                  </span>
                </div>
              ))}
              <div className="px-3 py-1 bg-[#2f2f2f] text-[#bdbdbd] rounded-md border border-[#3a3a3a]">
                (no prefix) → Paragraph
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Preview Toggle Button */}
            <button
              onClick={handleTogglePreview}
              className="px-3 py-1 rounded-md cursor-pointer bg-[#2e2e2e] text-[#cccccc] hover:bg-[#3a3a3a] text-sm flex  items-center gap-2 transition-colors"
              aria-pressed={showPreview}
              // The title (tooltip) clearly explains the action
              title={showPreview ? "Hide Live Preview" : "Show Live Preview"}>
              {/* Use the Eye icon when preview is OFF, and EyeOff when preview is ON */}
              {showPreview ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}

              {/* Optional: Use minimal text only on larger screens, but keep the core action clear */}
              <span className="hidden sm:inline">
                {showPreview ? "Hide" : "Preview"}
              </span>
            </button>
          </div>
        </div>

        {/* Block Buttons */}
        <div className="flex gap-3 mb-4">
          {ALLOWED_BLOCKS.map((b) => (
            <button
              key={b.symbol}
              onClick={() => applyBlock(b.symbol)}
              className="px-3 py-2 rounded-md cursor-pointer font-outfit bg-[#2e2e2e] text-[#cccccc] hover:bg-[#3a3a3a] text-sm"
              aria-label={`Insert ${b.label}`}>
              {b.label}
            </button>
          ))}

          <button
            onClick={() => applyBlock("para")}
            className="px-3 py-2 rounded-md cursor-pointer font-outfit bg-[#2e2e2e] text-[#cccccc] hover:bg-[#3a3a3a] text-sm"
            aria-label="Make paragraph">
            Paragraph
          </button>
        </div>

        {/* Editor + optional preview */}
        <div className="flex gap-4 grow min-h-0">
          <textarea
            ref={textareaRef}
            onInput={handleInput} // keep state in sync
            spellCheck="false"
            placeholder="Start writing your Markdown here..."
            className="grow p-4 rounded-sm bg-[#1e1e1e] text-[#cccccc]  text-sm leading-relaxed font-mono resize-none outline-none scrollbar-none"
          />

          {showPreview && (
            // 1. Added 'min-h-0' to allow 'h-full' to work inside 'grow' flex container
            // 2. Added 'h-full' to enforce height and 'overflow-y-auto' for scrollbar
            <div
              style={{ fontFamily: "excali" }}
              className="w-1/2 border-2 border-[#bdbdbd] p-4  text-sm scrollbar-none bg-[#0f0f0f] text-[#eaeaea] overflow-y-auto h-full min-h-0">
              <MarkdownPreview text={markdownContent} />
            </div>
          )}
        </div>

        {/* Bottom Cancel/Save Buttons */}
        <div className="flex justify-between gap-3 mt-5 w-full">
          {/* 1. Cancel Button (Moved to the far left) */}
          <div className="flex flex-col items-start">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md cursor-pointer bg-[#2e2e2e] text-[#cccccc] hover:bg-[#3a3a3a] text-base font-outfit flex items-center gap-2 transition-colors">
              <X className="w-4 h-4" />
              Cancel
            </button>
            {/* Shortcut Hint for Cancel */}
            <div className="text-xs text-[#888888] mt-1 font-mono">"Esc"</div>
          </div>

          {/* 2. Add Markdown Button (Stays on the far right) */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-md cursor-pointer bg-[#007acc] text-white hover:bg-[#0090ff] text-base font-outfit flex items-center gap-2 transition-colors">
              <Save className="w-4 h-4" />
              Add Markdown
            </button>
            {/* Shortcut Hint for Save */}
            <div className="text-xs text-[#888888] mt-1 font-mono">
              "Cmd/Ctrl + Enter"
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Simple safe previewer for supported blocks */
function MarkdownPreview({ text }) {
  // Use a regex to split by newline, while *keeping* the newline characters in the array.
  const lines = text.split(/(\r?\n)/);

  const elements = lines.map((ln, i) => {
    // If it's a newline character, return a minimal break
    if (ln === "\n" || ln === "\r\n") {
      return <br key={i} className="h-0.5" />;
    }

    const t = ln.trim();

    // If the line is entirely empty after stripping \n, it's just content
    if (ln === "") {
      return null;
    }

    if (/^---$/.test(t))
      // Completely strip vertical margin, use only mb-1 for separation from text
      return <hr key={i} className="my-0 border-t border-white mb-1" />;
    if (/^>>\s?/.test(t))
      return (
        // Completely strip vertical margin
        <div key={i} className="pl-1 text-red-400  my-0">
          {t.replace(/^>>\s?/, "")}
        </div>
      );
    if (/^>\s?/.test(t))
      return (
        // Completely strip vertical margin
        <blockquote key={i} className="pl-1 text-[#bfbfbf] my-0">
          {t.replace(/^>\s?/, "")}
        </blockquote>
      );
    if (/^#\s?/.test(t))
      return (
        // Strip bottom margin completely
        <h3 key={i} className="text-xl mt-4 mb-0">
          {t.replace(/^#\s?/, "")}
        </h3>
      );

    // Paragraph or empty line content:
    // FINAL FIX: my-0 and NO mb-px to completely remove the gap between consecutive text lines.
    return (
      <div key={i} className="leading-relaxed my-[-10]">
        {ln}
      </div>
    );
  });

  // Added !m-0 !p-0 to the parent container to aggressively strip any residual margin/padding
  return <div className="prose max-w-none m-0 p-0">{elements}</div>;
}

/** sanitize: keep only allowed blocks and paragraphs, normalize spacing */
function sanitizeMarkdown(text) {
  const lines = text.split(/\r?\n/);
  const out = lines.map((ln) => {
    const t = ln.trimEnd();
    if (t.match(/^---$/)) return "---";
    if (t.match(/^>>\s?.+/)) return t.replace(/^>>\s*/, ">> ");
    if (t.match(/^>\s?.+/)) return t.replace(/^>\s*/, "> ");
    if (t.match(/^#+\s?.+/)) return t.replace(/^#+\s*/, "# ");
    return t;
  });
  return out.join("\n");
}

/** initial placeholder text */
function placeholderSafe() {
  return `# API Overview

This API allows users to authenticate, fetch resources, and update dat authenticate, fetch resources, and update dat

> Hello this is a quote

>> ok this is a memo and you can use this and see this.

After a successful authentication, you’ll receive a JSON response that includes your session details, permissions, and expiration time. If authentication fails, the response will include an appropriate error message.

---

# Sample Request
`;
}
