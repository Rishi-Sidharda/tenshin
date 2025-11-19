"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { drawExcalidrawElements } from "./boardApi";

export default function CommandPallet({ onClose, floatingCardAction }) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const listRef = useRef(null);

  const commands = [
    { label: "Add Markdown", action: () => floatingCardAction?.() },
    { label: "Open Dashboard", action: () => router.push("/dashboard") },
    {
      label: "Add Rectangle",
      action: () => drawExcalidrawElements("rectangle"),
    },
    { label: "Add Line", action: () => drawExcalidrawElements("line") },
    { label: "Add Ellipse", action: () => drawExcalidrawElements("ellipse") },
    { label: "Add Text", action: () => drawExcalidrawElements("text") },
  ];

  const filtered = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) =>
          filtered.length ? (prev + 1) % filtered.length : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) =>
          filtered.length ? (prev - 1 + filtered.length) % filtered.length : 0
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selected = filtered[activeIndex];
        if (selected) {
          selected.action();
          onClose?.();
        }
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [filtered, activeIndex, onClose]);

  // scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.children[activeIndex];
    if (activeEl) activeEl.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  return (
    <div
      onClick={onClose}
      className="fixed font-outfit inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[10]">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-sm bg-[#1A1A1A] shadow-[0_0_30px_rgba(0,0,0,0.6)] border border-[#2A2A2A] overflow-hidden">
        {/* Search input */}
        <div className="border-b border-[#2A2A2A] px-4 py-3">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            className="w-full bg-transparent outline-none text-sm text-neutral-200 placeholder:text-neutral-500"
          />
        </div>

        {/* Command list */}
        <div
          ref={listRef}
          className="max-h-64 overflow-y-auto py-1 custom-scroll scrollbar-hidden">
          {filtered.length > 0 ? (
            filtered.map((cmd, i) => (
              <button
                key={i}
                onClick={() => {
                  cmd.action();
                  onClose?.();
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between rounded-sm ${
                  i === activeIndex
                    ? "bg-[#2F2B3A] text-[#E0E0E0]"
                    : "text-neutral-400 hover:bg-[#242424] hover:text-neutral-200"
                }`}>
                <span>{cmd.label}</span>
                {i === activeIndex && (
                  <span className="text-md text-[#9b87f5]">↵</span>
                )}
              </button>
            ))
          ) : (
            <div className="px-4 py-6 text-sm text-neutral-500 text-center">
              No commands found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
