"use client";

import dynamic from "next/dynamic";
import React, { useState, useCallback, useEffect } from "react";
import "@excalidraw/excalidraw/index.css";
// ✅ Import the utility function for element creation

// Dynamically import Excalidraw (no SSR)
const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        Loading board...
      </div>
    ),
  }
);

export default function FixedRectBoard() {
  // 1. State to hold the Excalidraw API instance
  const [api, setApi] = useState(null);

  // 🟦 Draw a rectangle using the correct API method
  const handleCommandPallet = useCallback(async () => {
    if (!api) return;

    const { convertToExcalidrawElements } = await import(
      "@excalidraw/excalidraw"
    );

    // Use the simplified element structure (ExcalidrawElementSkeleton)
    const newElementsSkeleton = [
      {
        // Key Change: Set type to "text"
        type: "text",
        // Key Change: Add the content for the text element
        text: `Hello Gemini! (${new Date().toLocaleTimeString()})`,
        // Position the text randomly
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * 200,
        // Text specific properties
        fontSize: 28,
        fontFamily: 1, // 1: Kiro (default), 2: Virgil, 3: Cascadia (Monospace)
        textAlign: "left",
        verticalAlign: "top",
        strokeColor: "#FFFFFFF", // A nice forest green color
        backgroundColor: "transparent",
        strokeWidth: 2,
        roughness: 1,
        opacity: 100,
      },
      {
        // Key Change: Set type to "text"
        type: "text",
        // Key Change: Add the content for the text element
        text: `Hello`,
        // Position the text randomly
        x: 200 + Math.random() * 200,
        y: 200 + Math.random() * 200,
        // Text specific properties
        fontSize: 28,
        fontFamily: 1, // 1: Kiro (default), 2: Virgil, 3: Cascadia (Monospace)
        textAlign: "left",
        verticalAlign: "top",
        strokeColor: "#FFFFFFF", // A nice forest green color
        backgroundColor: "transparent",
        strokeWidth: 2,
        roughness: 1,
        opacity: 100,
      },
    ];

    // Convert the simplified structure into full Excalidraw elements
    const newElements = convertToExcalidrawElements(newElementsSkeleton);

    // ✅ Key fix: Use updateScene to add elements to the existing set
    // This is the most reliable way to dynamically draw.
    api.updateScene({
      elements: [...api.getSceneElements(), ...newElements],
    });
  }, [api]); // Recreate callback when 'api' changes

  useEffect(() => {
    // Only attach listener once Excalidraw API is available
    if (!api) return;

    const handleKeyDown = (event) => {
      // Check for Ctrl (Windows/Linux) or Meta (Cmd on Mac) + /
      const isControlKey = event.ctrlKey || event.metaKey;
      const isForwardSlash = event.key === "/";

      if (isControlKey && isForwardSlash) {
        event.preventDefault(); // Stop default browser behavior (e.g., search)

        // ✅ Call your central action function
        handleCommandPallet();
      }
    };

    // Attach the global event listener
    document.addEventListener("keydown", handleKeyDown);

    // Clean up the event listener when the component unmounts or dependencies change
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [api, handleCommandPallet]);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Left Sidebar (3% width) */}
      <div
        style={{
          width: "2%",
          backgroundColor: "#1e1e1e", // optional, just to visualize
          height: "100%",
        }}
      ></div>

      {/* Right Side - Excalidraw Canvas (97% width) */}
      <div style={{ position: "relative", width: "98%", height: "100vh" }}>
        {/* Excalidraw canvas */}
        <Excalidraw
          theme="dark"
          renderTopRightUI={() => {
            return (
              <button
                onClick={handleCommandPallet}
                className="text-xs"
                style={{
                  top: "16px",
                  right: "16px",
                  zIndex: 10,
                  background: "#232329",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 10px",
                  cursor: "pointer",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                }}
              >
                Add Component
              </button>
            );
          }}
          excalidrawAPI={(excalidrawApi) => setApi(excalidrawApi)}
        />
      </div>
    </div>
  );
}
