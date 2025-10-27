"use client";

import dynamic from "next/dynamic";
import React, { useState, useCallback } from "react";
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
        Loading Sketchpad...
      </div>
    ),
  }
);

export default function FixedRectBoard() {
  // 1. State to hold the Excalidraw API instance
  const [api, setApi] = useState(null);

  // 🟦 Draw a rectangle using the correct API method
  const handleAddRectangle = useCallback(async () => {
    if (!api) return;

    const { convertToExcalidrawElements } = await import(
      "@excalidraw/excalidraw"
    );

    // Use the simplified element structure (ExcalidrawElementSkeleton)
    const newElementsSkeleton = [
      {
        type: "rectangle",
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * 200,
        width: 200,
        height: 100,
        strokeColor: "#1e1e1e",
        backgroundColor: "#d3e3fd",
        fillStyle: "solid",
        strokeWidth: 2,
        roughness: 1,
        opacity: 100,
        // No need to manually provide 'id', 'version', 'versionNonce', etc.
      },
    ];

    // Convert the simplified structure into full Excalidraw elements
    const newElements = convertToExcalidrawElements(newElementsSkeleton);

    // ✅ Key fix: Use updateScene to add elements to the existing set
    // This is the most reliable way to dynamically draw.
    api.updateScene({
      elements: [...api.getSceneElements(), ...newElements],
    });

    // OR, if you use a full Excalidraw element object (like your original `rect`),
    // the simpler api.addElements() call should technically work for single additions:
    // api.addElements(newElements);

    // However, for maximum compatibility and when working with other state data,
    // using updateScene is generally preferred.
  }, [api]); // Recreate callback when 'api' changes

  return (
    <div style={{ position: "relative", height: "100vh" }}>
      {/* Floating button */}
      <button
        onClick={handleAddRectangle}
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          zIndex: 10,
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "8px",
          padding: "8px 12px",
          cursor: "pointer",
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
        }}
      >
        ➕ Add Rectangle
      </button>

      {/* Excalidraw canvas */}
      {/* ✅ Key fix: Pass the setApi function to the excalidrawAPI prop */}
      <Excalidraw excalidrawAPI={(excalidrawApi) => setApi(excalidrawApi)} />
    </div>
  );
}
