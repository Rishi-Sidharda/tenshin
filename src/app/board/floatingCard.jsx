"use client";
import React, { useRef, useEffect, useState } from "react";
import { drawExcalidrawElements } from "./boardApi";

// The example content provided by the user.
const placeholderMarkdown = `
# API Overview

This API allows users to authenticate, fetch resources, and update dat authenticate, fetch resources, and update dat

a. Below is a detailed description of the endpoints and how they intera

ct. The text is long enough to wrap naturally within the available width.

> Remember: Always use HTTPS and include an authorization token in the headers.

>> ok this is a memo and you can use this and see this.

After a successful authentication, you’ll receive a JSON response that incl\\nudes your session details, permissions, and expiration time. If authentication fails, the response will include an appropriate error message.

--- --- --- --- ---
---

# Sample Request
`;

export default function FloatingCard({ onClose, onSave }) {
  const containerRef = useRef(null);
  const [markdownContent, setMarkdownContent] = useState(placeholderMarkdown);

  // Optional: close when clicking outside
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

  // Handler for textarea changes
  const handleEditorChange = (event) => {
    setMarkdownContent(event.target.value);
  };

  const handleSave = () => {
    // 1. Run the save function
    drawExcalidrawElements("markdown", markdownContent);
    onClose?.();
  };

  return (
    <div
      className="
      fixed inset-0 w-full h-full 
      bg-black/50 backdrop-blur-sm 
      flex justify-center items-center 
      z-1000
    "
    >
      <div
        ref={containerRef}
        className="
          w-1/2 h-[90%] bg-[#101010] 
          rounded-xl shadow-2xl 
          p-10 overflow-y-auto 
          font-inter flex flex-col
        "
      >
        {/* Markdown Editor */}
        <textarea
          value={markdownContent}
          onChange={handleEditorChange}
          spellCheck="false"
          placeholder="Start writing your Markdown here..."
          className="
            flex-grow w-full min-h-[100px]
            p-4 border border-[#333333]
            rounded-lg bg-[#1e1e1e] text-[#cccccc]
            text-base leading-relaxed font-mono
            resize-none box-border outline-none
            mb-5
          "
        />

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          {/* Cancel Button */}
          <button
            onClick={onClose}
            className="
              px-5 py-2 rounded-md 
              bg-[#2e2e2e] text-[#cccccc] 
              text-base cursor-pointer
            "
          >
            Cancel
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="
              px-5 py-2 rounded-md 
              bg-[#007acc] text-white 
              text-base font-bold cursor-pointer 
              transition-colors duration-200
              hover:bg-[#0090ff]
            "
          >
            Save Markdown
          </button>
        </div>
      </div>
    </div>
  );
}
