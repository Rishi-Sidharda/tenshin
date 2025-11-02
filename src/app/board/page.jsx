"use client";

import dynamic from "next/dynamic";
import React, { useState, useEffect } from "react";
import "@excalidraw/excalidraw/index.css";
import { setExcalidrawApi, drawExcalidrawElements } from "./boardApi";
import FloatingNotion from "./floatingNotion";
import CommandPallet from "./commandPallet";

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

export default function Board() {
  const [api, setApi] = useState(null);
  const [showFloatingNotion, setShowFloatingNotion] = useState(false);
  const [showCommandPallet, setShowCommandPallet] = useState(false);

  useEffect(() => {
    if (api) setExcalidrawApi(api);
  }, [api]);

  useEffect(() => {
    if (!api) return;

    const handleKeyDown = (event) => {
      const isControlKey = event.ctrlKey || event.metaKey;
      const isForwardSlash = event.key === "/";

      if (isControlKey && isForwardSlash) {
        event.preventDefault();
        setShowCommandPallet(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [api]);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div
        style={{
          width: "2%",
          backgroundColor: "#1e1e1e",
          height: "100%",
        }}
      ></div>

      <div style={{ position: "relative", width: "98%", height: "100vh" }}>
        <Excalidraw
          theme="dark"
          renderTopRightUI={() => (
            <button
              onClick={() => {
                setShowCommandPallet(true);
              }}
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
          )}
          excalidrawAPI={(excalidrawApi) => setApi(excalidrawApi)}
        />
        {/* Floating Card */}
        {showCommandPallet && (
          <CommandPallet
            onClose={() => {
              setShowCommandPallet(false);
            }}
            floatingNotionAction={() => setShowFloatingNotion(true)}
          />
        )}
        {showFloatingNotion && (
          <FloatingNotion
            onClose={() => setShowFloatingNotion(false)}
          ></FloatingNotion>
        )}
      </div>
    </div>
  );
}
