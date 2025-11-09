"use client";

import dynamic from "next/dynamic";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import "@excalidraw/excalidraw/index.css";
import { setExcalidrawApi } from "./boardApi";
import FloatingNotion from "./floatingNotion";
import CommandPallet from "./commandPallet";
import { Menu, Settings, UserRoundCog } from "lucide-react";
import {
  SquareChevronRight,
  LayoutDashboard,
  SquareChevronLeft,
} from "lucide-react";

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
  const searchParams = useSearchParams();
  const boardId = searchParams.get("id");

  const [api, setApi] = useState(null);
  const [showFloatingNotion, setShowFloatingNotion] = useState(false);
  const [showCommandPallet, setShowCommandPallet] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // ✅ Register the Excalidraw API
  useEffect(() => {
    if (api) setExcalidrawApi(api);
  }, [api]);

  // ✅ Keyboard shortcut for Command Palette
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

  // ✅ Load board data from localStorage after API ready
  useEffect(() => {
    if (!api || !boardId || isLoaded) return;

    const savedBoards = JSON.parse(localStorage.getItem("boards") || "{}");
    const boardData = savedBoards[boardId];

    if (boardData) {
      const fixedAppState = {
        ...boardData.appState,
        collaborators: new Map(),
      };

      // Delay load slightly to ensure Excalidraw is fully initialized
      setTimeout(() => {
        api.updateScene({
          elements: boardData.elements || [],
          appState: fixedAppState,
          files: boardData.files || {},
        });
        api.scrollToContent(boardData.elements || []);
        setIsLoaded(true);
      }, 300);
    } else {
      setIsLoaded(true);
    }
  }, [api, boardId, isLoaded]);

  // ✅ Manual Save Button handler
  const handleSave = () => {
    if (!api || !boardId) return;
    setIsSaving(true);

    const elements = api.getSceneElements();
    const appState = api.getAppState();
    const files = api.getFiles();

    const safeAppState = { ...appState, collaborators: {} };

    const savedBoards = JSON.parse(localStorage.getItem("boards") || "{}");
    savedBoards[boardId] = {
      elements,
      appState: safeAppState,
      files,
      name: boardId,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem("boards", JSON.stringify(savedBoards));

    setTimeout(() => setIsSaving(false), 800);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: isOpen ? "17%" : "3.5%",
          backgroundColor: "#1e1e1e",
          transition: "width 0.3s ease",
          zIndex: 10,
          color: "white",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "1px",
        }}
      >
        {/* Sidebar Content */}
        {isOpen ? (
          <div></div>
        ) : (
          <div className="flex flex-col justify-between items-center h-screen bg-[#1e1e1e] text-white">
            {/* --- Top Section: Logo + 2 icons --- */}
            <div className="flex flex-col items-center">
              {/* Logo */}
              <img
                src="/logo_sm.svg"
                alt="Logo"
                className="rounded-md size-9 mt-4 cursor-pointer"
                onClick={() => {
                  window.location.href = "/";
                }}
              />

              {/* Placeholder Icons */}
              <div className="flex flex-col items-center gap-3 mt-4">
                <button
                  className="p-2 cursor-pointer rounded-md hover:bg-[#1a1a1a] transition-colors"
                  title=""
                  onClick={() => setIsOpen(true)}
                >
                  <SquareChevronRight size={24} className="text-gray-200" />
                </button>

                {/* New Note Icon */}
                <button
                  className="p-2 cursor-pointer rounded-md hover:bg-[#1a1a1a] transition-colors"
                  title="Dashboard"
                  onClick={() => {
                    window.location.href = "/dashboard";
                  }}
                >
                  <LayoutDashboard size={24} className="text-gray-200" />
                </button>
              </div>
            </div>

            {/* --- Bottom Section: 2 icons --- */}
            <div className="flex flex-col items-center gap-4 mb-3">
              <button
                className="p-3 cursor-pointer rounded-md hover:bg-[#1a1a1a] transition-colors"
                title="New Note"
                onClick={() => {
                  window.location.href = "/dashboard";
                }}
              >
                <UserRoundCog size={24} className="text-gray-200" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Excalidraw Area */}
      <div
        style={{
          position: "relative",
          width: "96.5%",
          height: "100vh",
          marginLeft: "3.5%", // visually align with sidebar's base width
          backgroundColor: "#f5f5f5",
        }}
      >
        <Excalidraw
          theme="dark"
          excalidrawAPI={(excalidrawApi) => setApi(excalidrawApi)}
          UIOptions={{
            canvasActions: {
              // keeps the other buttons
              changeColor: true,
            },
            renderCustomUI: true,
          }}
          defaultOptions={{
            elementBackgroundColor: "red", // sets default element color
            primaryColor: "red", // sets the primary theme color to red
          }}
          renderTopRightUI={() => (
            <button
              onClick={() => setShowCommandPallet(true)}
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
        />

        {/* Save Button */}
        <button
          onClick={handleSave}
          style={{
            position: "absolute",
            bottom: "20px",
            right: "20px",
            background: isSaving ? "#2e8b57" : "#232329",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "10px 14px",
            cursor: "pointer",
            fontSize: "14px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            transition: "all 0.2s ease-in-out",
            zIndex: 50,
          }}
        >
          {isSaving ? "✅ Saved!" : "💾 Save Board"}
        </button>

        {/* Floating Notion + Command Palette */}
        {showCommandPallet && (
          <CommandPallet
            onClose={() => setShowCommandPallet(false)}
            floatingNotionAction={() => setShowFloatingNotion(true)}
          />
        )}

        {showFloatingNotion && (
          <FloatingNotion
            title="Custom Floating Card"
            onClose={() => setShowFloatingNotion(false)}
          />
        )}
      </div>
    </div>
  );
}
