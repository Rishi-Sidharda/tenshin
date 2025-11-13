"use client";

import dynamic from "next/dynamic";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import "@excalidraw/excalidraw/index.css";
import { setExcalidrawApi } from "./boardApi";
import FloatingCard from "./floatingCard";
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
        }}>
        Loading board...
      </div>
    ),
  }
);

export default function Board() {
  const searchParams = useSearchParams();
  const boardId = searchParams.get("id");

  const [api, setApi] = useState(null);
  const [showFloatingCard, setShowFloatingCard] = useState(false);
  const [showCommandPallet, setShowCommandPallet] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showMarkdownButton, setShowMarkdownButton] = useState(false);

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

    const STORAGE_KEY = "tenshin";
    const BOARD_DATA_KEY = "boardData";

    const tenshinRaw = localStorage.getItem(STORAGE_KEY);
    const boardDataRaw = localStorage.getItem(BOARD_DATA_KEY);

    const tenshin = tenshinRaw
      ? JSON.parse(tenshinRaw)
      : { boards: {}, folders: {}, ui: { collapsedFolders: {} } };
    const boardsData = boardDataRaw ? JSON.parse(boardDataRaw) : {};

    const boardContent = boardsData[boardId];

    if (boardContent) {
      const fixedAppState = {
        ...boardContent.appState,
        collaborators: new Map(),
      };

      // Delay to ensure Excalidraw is initialized
      setTimeout(() => {
        api.updateScene({
          elements: boardContent.elements || [],
          appState: fixedAppState,
          files: boardContent.files || {},
        });
        api.scrollToContent(boardContent.elements || []);
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

    const STORAGE_KEY = "tenshin";
    const BOARD_DATA_KEY = "boardData";

    // Load existing data
    const tenshinRaw = localStorage.getItem(STORAGE_KEY);
    const boardDataRaw = localStorage.getItem(BOARD_DATA_KEY);

    const tenshin = tenshinRaw
      ? JSON.parse(tenshinRaw)
      : { boards: {}, folders: {}, ui: { collapsedFolders: {} } };
    const boardsData = boardDataRaw ? JSON.parse(boardDataRaw) : {};

    const oldContent = boardsData[boardId] || {};

    // Update content
    boardsData[boardId] = {
      elements,
      appState: safeAppState,
      files,
    };

    // Update metadata.updatedAt only if elements/files changed
    const hasChanged =
      JSON.stringify(oldContent.elements) !== JSON.stringify(elements) ||
      JSON.stringify(oldContent.files) !== JSON.stringify(files);

    if (hasChanged) {
      if (!tenshin.boards[boardId]) {
        tenshin.boards[boardId] = {
          id: boardId,
          name: "Untitled Board",
          icon: "Brush",
        };
      }
      tenshin.boards[boardId].updatedAt = new Date().toISOString();
    }

    // Save back
    localStorage.setItem(BOARD_DATA_KEY, JSON.stringify(boardsData));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tenshin));

    setTimeout(() => setIsSaving(false), 800);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Excalidraw Area */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100vh",
        }}>
        <Excalidraw
          theme="dark"
          excalidrawAPI={(excalidrawApi) => setApi(excalidrawApi)}
          onChange={(elements, state) => {
            const { selectedElementIds } = state;
            if (
              !selectedElementIds ||
              Object.keys(selectedElementIds).length === 0
            )
              return;

            const selectedElements = elements.filter(
              (el) => selectedElementIds[el.id]
            );
            const markdownSelected = selectedElements.some((el) =>
              el.groupIds?.some((id) => id.startsWith("markdown-"))
            );

            setShowMarkdownButton(markdownSelected);
          }}
          UIOptions={{
            canvasActions: {
              changeColor: true,
            },
            renderCustomUI: true,
          }}
          defaultOptions={{
            elementBackgroundColor: "red",
            primaryColor: "red",
          }}
          renderTopLeftUI={() => (
            <button
              onClick={() => setShowCommandPallet(true)}
              className="text-xs"
              style={{
                top: "16px",
                left: "16px",
                position: "absolute",
                zIndex: 10,
                background: "#232329",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "8px 10px",
                cursor: "pointer",
                boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
              }}>
              Add Component
            </button>
          )}
          renderTopRightUI={() => (
            <button
              onClick={() => setShowCommandPallet(true)}
              className="text-xs"
              style={{
                top: "16px",
                right: "16px",
                position: "absolute",
                zIndex: 10,
                background: "#232329",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "8px 10px",
                cursor: "pointer",
                boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
              }}>
              Add Component
            </button>
          )}
        />

{showMarkdownButton && (
        <button
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            padding: "10px 16px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
          onClick={() => alert("Markdown button clicked!")}
        >
          Markdown Options
        </button>
      )}

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
          }}>
          {isSaving ? "✅ Saved!" : "💾 Save Board"}
        </button>

        {/* Floating Notion + Command Palette */}
        {showCommandPallet && (
          <CommandPallet
            onClose={() => setShowCommandPallet(false)}
            floatingCardAction={() => setShowFloatingCard(true)}
          />
        )}

        {showFloatingCard && (
          <FloatingCard
            title="Custom Floating Card"
            onClose={() => setShowFloatingCard(false)}
          />
        )}
      </div>
    </div>
  );
}
