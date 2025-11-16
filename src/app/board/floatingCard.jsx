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

/**
 * A floating modal card component containing a simple Markdown editor.
 * @param {object} props
 * @param {function} props.onClose - Function to call when the card should close.
 * @param {function} props.onSave - Function to call when the save button is clicked,
 * receiving the edited markdown content as an argument.
 * @returns {JSX.Element}
 */
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

  // Handler for the Save button click:
  // 1. Calls the onSave function (prop).
  // 2. Calls the onClose function (prop).
  const handleSave = () => {
    // 1. Run the save function
    drawExcalidrawElements("markdown", markdownContent);
    onClose?.();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        ref={containerRef}
        style={{
          width: "50%",
          height: "90%",
          backgroundColor: "#101010",
          borderRadius: "12px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
          padding: "40px",
          overflowY: "auto",
          fontFamily: "Inter, sans-serif",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Markdown Editor (Textarea) */}
        <textarea
          value={markdownContent}
          onChange={handleEditorChange}
          spellCheck="false"
          style={{
            flexGrow: 1,
            width: "100%",
            minHeight: "100px",
            padding: "15px",
            border: "1px solid #333333",
            borderRadius: "8px",
            backgroundColor: "#1e1e1e",
            color: "#cccccc",
            fontSize: "16px",
            lineHeight: "1.6",
            fontFamily: "monospace",
            resize: "none",
            boxSizing: "border-box",
            outline: "none",
            marginBottom: "20px",
          }}
          placeholder="Start writing your Markdown here..."
        />

        {/* Buttons Container */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
          }}
        >
          {/* Cancel Button (calls onClose) */}
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: "6px",
              backgroundColor: "#2e2e2e",
              color: "#cccccc",
              cursor: "pointer",
              fontSize: "16px",
              fontFamily: "inherit",
            }}
          >
            Cancel
          </button>

          {/* Save Button (calls handleSave -> onSave & onClose) */}
          <button
            onClick={handleSave}
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: "6px",
              backgroundColor: "#007acc",
              color: "white",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              fontFamily: "inherit",
              transition: "background-color 0.2s",
            }}
          >
            Save Markdown
          </button>
        </div>
      </div>
    </div>
  );
}
