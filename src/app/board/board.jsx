"use client";

import dynamic from "next/dynamic";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import "@excalidraw/excalidraw/index.css";
import { setExcalidrawApi } from "./boardApi";
import FloatingCard from "./floatingCard";
import CommandPallet from "./commandPallet";
import FloatingEditMarkdownCard from "./floatingEditMarkdownCard";

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
  const [showFloatingCard, setShowFloatingCard] = useState(false);
  const [showCommandPallet, setShowCommandPallet] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showMarkdownButton, setShowMarkdownButton] = useState(false);
  const [isEditingMarkdown, setIsEditingMarkdown] = useState(false);

  const [selectedMarkdownText, setSelectedMarkdownText] = useState(null);
  const [selectedMarkdownGroupId, setSelectedMarkdownGroupId] = useState(null);
  const [markdownPosition, setMarkdownPosition] = useState({ x: 0, y: 0 });

  const BOARD_DATA_KEY = "boardData";

  const handleChange = (elements, state) => {
    const { selectedElementIds } = state;

    // No selection, hide button and clear text
    if (!selectedElementIds || Object.keys(selectedElementIds).length === 0) {
      setShowMarkdownButton(false);
      setSelectedMarkdownText(null);
      return;
    }

    // Get selected elements
    const selectedElements = elements.filter((el) => selectedElementIds[el.id]);

    // Load board data from localStorage
    const boardDataRaw = localStorage.getItem(BOARD_DATA_KEY);
    const boardsData = boardDataRaw ? JSON.parse(boardDataRaw) : {};
    const markdownRegistry = boardsData[boardId]?.markdown_registry || {};

    // Find first markdown element among selection
    const markdownElement = selectedElements.find((el) =>
      el.groupIds?.some(
        (id) => id.startsWith("markdown-") && markdownRegistry[id]
      )
    );

    if (markdownElement) {
      // Show the markdown button
      setShowMarkdownButton(true);

      // Get the first markdown groupId
      const markdownGroupId = markdownElement.groupIds.find((id) =>
        id.startsWith("markdown-")
      );

      // Load board data from localStorage
      const boardDataRaw = localStorage.getItem(BOARD_DATA_KEY);
      const boardsData = boardDataRaw ? JSON.parse(boardDataRaw) : {};

      // Get the markdown text from registry
      const markdownTextRaw =
        boardsData[boardId]?.markdown_registry?.[markdownGroupId]?.text || "";
      const markdownGroupIdRaw =
        boardsData[boardId]?.markdown_registry?.[markdownGroupId]?.id || "";

      // Set state
      setSelectedMarkdownText(markdownTextRaw);
      setSelectedMarkdownGroupId(markdownGroupIdRaw);
    } else {
      // No markdown element selected
      setShowMarkdownButton(false);
      setSelectedMarkdownText(null);
    }
  };

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

  const deleteMarkdown = () => {
    if (!selectedMarkdownGroupId) return;

    // 1️⃣ Remove matching elements from the canvas
    const currentElements = api.getSceneElements();
    const updatedElements = currentElements.filter(
      (el) => !el.groupIds?.includes(selectedMarkdownGroupId)
    );

    api.updateScene({ elements: updatedElements });

    const boardDataRaw = localStorage.getItem(BOARD_DATA_KEY);
    const boardsData = boardDataRaw ? JSON.parse(boardDataRaw) : {};

    if (boardsData[boardId]?.markdown_registry) {
      delete boardsData[boardId].markdown_registry[selectedMarkdownGroupId];
    }

    localStorage.setItem(BOARD_DATA_KEY, JSON.stringify(boardsData));

    // 3️⃣ Reset UI state
    setSelectedMarkdownText(null);
    setShowMarkdownButton(false);
  };

  const handleEditMarkdown = () => {
    setIsEditingMarkdown(true);
  };

  function hashValue(value) {
    let str = "";
    try {
      str = JSON.stringify(value);
    } catch {
      return Math.random().toString(); // fallback
    }

    let hash = BigInt("0xcbf29ce484222325");
    const prime = BigInt("0x100000001b3");

    for (let i = 0; i < str.length; i++) {
      hash ^= BigInt(str.charCodeAt(i));
      hash *= prime;
    }

    return hash.toString(16); // return hex string
  }

  // -------------------------------------------
  // MAIN SAVE HANDLER (OPTIMIZED)
  // -------------------------------------------
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

    const markdownRegistryState = oldContent.markdown_registry || {};

    // -------------------------------------------
    // Calculate hashes
    // -------------------------------------------
    const oldHashes = {
      elements: oldContent.elements_hash,
      files: oldContent.files_hash,
      appState: oldContent.appState_hash,
      markdown: oldContent.markdown_hash,
    };

    const newHashes = {
      elements: hashValue(elements),
      files: hashValue(files),
      appState: hashValue(safeAppState),
      markdown: hashValue(markdownRegistryState),
    };

    // -------------------------------------------
    // Incrementally update ONLY changed fields
    // -------------------------------------------
    const updatedBoard = { ...oldContent };

    if (oldHashes.elements !== newHashes.elements) {
      updatedBoard.elements = elements;
      updatedBoard.elements_hash = newHashes.elements;
    }

    if (oldHashes.files !== newHashes.files) {
      updatedBoard.files = files;
      updatedBoard.files_hash = newHashes.files;
    }

    if (oldHashes.appState !== newHashes.appState) {
      updatedBoard.appState = safeAppState;
      updatedBoard.appState_hash = newHashes.appState;
    }

    if (oldHashes.markdown !== newHashes.markdown) {
      updatedBoard.markdown_registry = { ...markdownRegistryState };
      updatedBoard.markdown_hash = newHashes.markdown;
    }

    // Save back the changed board
    boardsData[boardId] = updatedBoard;

    // -------------------------------------------
    // Update metadata IF something changed
    // -------------------------------------------
    const somethingChanged =
      oldHashes.elements !== newHashes.elements ||
      oldHashes.files !== newHashes.files ||
      oldHashes.markdown !== newHashes.markdown ||
      oldHashes.appState !== newHashes.appState;

    if (somethingChanged) {
      if (!tenshin.boards[boardId]) {
        tenshin.boards[boardId] = {
          id: boardId,
          name: "Untitled Board",
          icon: "Brush",
        };
      }
      tenshin.boards[boardId].updatedAt = new Date().toISOString();
    }

    // Save to storage
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
        }}
      >
        <Excalidraw
          theme="dark"
          excalidrawAPI={(excalidrawApi) => setApi(excalidrawApi)}
          onChange={(elements, state) => {
            handleChange(elements, state);
          }}
          renderTopRightUI={() => {
            if (showMarkdownButton) {
              return (
                <button
                  className="text-xs font-outfit"
                  style={{
                    top: "16px",
                    left: "16px",
                    zIndex: 10,
                    background: "#232329",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 10px",
                    cursor: "pointer",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                  }}
                  onClick={() => {
                    handleEditMarkdown();
                  }}
                >
                  Markdown Options
                </button>
              );
            }

            // Default: show Add Component button
            return (
              <div
                style={{
                  top: "17px",
                  right: "16px",
                  zIndex: 10,
                  display: "flex", // not inline-flex
                  flexDirection: "column",
                  alignItems: "center", // centers hint under the button
                  pointerEvents: "none", // container doesn't block clicks
                }}
              >
                <button
                  onClick={() => setShowCommandPallet(true)}
                  className="text-xs font-outfit hover:bg-[#2a2a2a]"
                  style={{
                    background: "#232329",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 10px",
                    cursor: "pointer",
                    pointerEvents: "auto", // button remains clickable
                  }}
                >
                  Command Palette
                </button>

                <span
                  className="font-outfit"
                  style={{
                    fontSize: "10px",
                    opacity: 0.6,
                    color: "white",
                    marginTop: "2px",
                  }}
                >
                  " Ctrl + / "
                </span>
              </div>
            );
          }}
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
            floatingCardAction={() => setShowFloatingCard(true)}
          />
        )}

        {showFloatingCard && (
          <FloatingCard
            title="Custom Floating Card"
            onClose={() => setShowFloatingCard(false)}
          />
        )}
        {isEditingMarkdown && (
          <FloatingEditMarkdownCard
            title="Custom Floating Card"
            onClose={() => setIsEditingMarkdown(false)}
            markdownText={selectedMarkdownText}
            deleteMarkdown={() => {
              deleteMarkdown();
            }}
            markdownPosition={markdownPosition}
          />
        )}
      </div>
    </div>
  );
}
