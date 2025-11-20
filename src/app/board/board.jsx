"use client";

import dynamic from "next/dynamic";
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import "@excalidraw/excalidraw/index.css";
import { setExcalidrawApi } from "./boardApi";
import FloatingCard from "./floatingCard";
import CommandPallet from "./commandPallet";
import FloatingEditMarkdownCard from "./floatingEditMarkdownCard";
// Import supabase to get the current user
import { supabase } from "@/lib/supabaseClient";

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
  const [user, setUser] = useState(null);
  const [STORAGE_KEY, setSTORAGE_KEY] = useState(null);
  const [BOARD_DATA_KEY, setBOARD_DATA_KEY] = useState(null);

  const [showFloatingCard, setShowFloatingCard] = useState(false);
  const [showCommandPallet, setShowCommandPallet] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showMarkdownButton, setShowMarkdownButton] = useState(false);
  const [isEditingMarkdown, setIsEditingMarkdown] = useState(false);

  const [selectedMarkdownText, setSelectedMarkdownText] = useState(null);
  const [selectedMarkdownGroupId, setSelectedMarkdownGroupId] = useState(null);

  // ----------------------------------------------------------------------
  // 1. AUTH & KEY SETUP
  // ----------------------------------------------------------------------

  // ✅ Get User and Set Dynamic Keys
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const currentUser = data?.user || null;
        setUser(currentUser);

        if (currentUser) {
          const userId = currentUser.id;
          // Set user-specific keys
          setSTORAGE_KEY(`tenshin-${userId}`);
          setBOARD_DATA_KEY(`boardData-${userId}`);
        } else {
          // Redirect if not authenticated (same as Dashboard)
          window.location.href = "/signin";
        }
      } catch (e) {
        console.error("supabase getUser failed", e);
      }
    };
    getUser();
  }, []);

  // ----------------------------------------------------------------------
  // 2. Data Handlers (Updated to use dynamic keys)
  // ----------------------------------------------------------------------

  const handleChange = (elements, state) => {
    // Return early if keys aren't ready
    if (!BOARD_DATA_KEY) return;

    const { selectedElementIds } = state;

    // No selection, hide button and clear text
    if (!selectedElementIds || Object.keys(selectedElementIds).length === 0) {
      setShowMarkdownButton(false);
      setSelectedMarkdownText(null);
      return;
    }

    // Get selected elements
    const selectedElements = elements.filter((el) => selectedElementIds[el.id]);

    // Load board data from localStorage using dynamic key
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

  const deleteMarkdown = () => {
    if (!selectedMarkdownGroupId || !BOARD_DATA_KEY) return; // Guard against missing key

    // 1️⃣ Remove matching elements from the canvas
    const currentElements = api.getSceneElements();
    const updatedElements = currentElements.filter(
      (el) => !el.groupIds?.includes(selectedMarkdownGroupId)
    );

    api.updateScene({ elements: updatedElements });

    // 2️⃣ Update markdown_registry in local storage
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

  // ✅ Wrapped handleSave in useCallback for use in useEffect and to prevent unnecessary re-creation
  const handleSave = useCallback(() => {
    // 1. EARLY EXIT & STATE SETUP
    // Check if the API is available before proceeding
    if (!api || !boardId || !STORAGE_KEY || !BOARD_DATA_KEY) {
      // console.log("Save skipped: API or Keys not ready.");
      return;
    }

    // Set saving state only if this is NOT an autosave, or if you want UI feedback for autosave.
    // For minimal interruption, we'll keep the existing button-click logic for isSaving state
    // and let the button handle the visual feedback.

    // Get live data
    const elements = api.getSceneElements();
    const files = api.getFiles();
    const rawAppState = api.getAppState();

    // 2. PREPARE SAFE APP STATE (Efficient filtering)
    // Use Math.round once for scroll coordinates
    const safeAppState = {
      theme: rawAppState.theme,
      gridSize: rawAppState.gridSize,
      zoom: rawAppState.zoom?.value,
      viewBackgroundColor: rawAppState.viewBackgroundColor,
      name: rawAppState.name,
      scrollX: Math.round(rawAppState.scrollX),
      scrollY: Math.round(rawAppState.scrollY),
      // Add other stable fields here
    };

    // 3. SYNCHRONOUS DATA LOAD (Unchanged Load Behavior)
    const tenshin = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
      boards: {},
      folders: {},
      ui: { collapsedFolders: {} },
      userId: user?.id,
    };
    const boardsData = JSON.parse(localStorage.getItem(BOARD_DATA_KEY)) || {};

    // Use local variables for faster property access
    const oldBoard = boardsData[boardId] || {};
    const oldRegistry = oldBoard.markdown_registry || {};

    // 4. CALCULATE NEW HASHES (Streamlined)
    const newHashes = {
      // Use shorter version for element hash access
      elements:
        elements.length + ":" + (elements[elements.length - 1]?.version ?? 0),
      files: Object.keys(files).length.toString(), // Ensure consistent string type
      // Use a concise pipe-separated string for AppState hash
      appState: [
        safeAppState.scrollX,
        safeAppState.scrollY,
        safeAppState.theme,
        safeAppState.viewBackgroundColor,
      ].join("|"),
      markdown: Object.keys(oldRegistry).length.toString(), // Consistent type
    };

    const oldHashes = {
      elements: oldBoard.elements_hash,
      files: oldBoard.files_hash,
      appState: oldBoard.appState_hash,
      markdown: oldBoard.markdown_hash,
    };

    // 5. CONDITIONAL UPDATE
    let somethingChanged = false;
    const updatedBoard = { ...oldBoard };

    if (oldHashes.elements !== newHashes.elements) {
      updatedBoard.elements = elements;
      updatedBoard.elements_hash = newHashes.elements;
      somethingChanged = true;
    }

    if (oldHashes.files !== newHashes.files) {
      updatedBoard.files = files;
      updatedBoard.files_hash = newHashes.files;
      somethingChanged = true;
    }

    if (oldHashes.appState !== newHashes.appState) {
      updatedBoard.appState = safeAppState;
      updatedBoard.appState_hash = newHashes.appState;
      somethingChanged = true;
    }

    // Markdown hash only updates if registry size changes
    if (oldHashes.markdown !== newHashes.markdown) {
      updatedBoard.markdown_registry = { ...oldRegistry };
      updatedBoard.markdown_hash = newHashes.markdown;
      somethingChanged = true;
    }

    boardsData[boardId] = updatedBoard;

    // 6. UPDATE METADATA & SYNCHRONOUS SAVE
    if (somethingChanged) {
      // Streamline board creation/update
      if (!tenshin.boards[boardId]) {
        tenshin.boards[boardId] = {
          id: boardId,
          name: updatedBoard.appState?.name || "Untitled Board",
          icon: "Brush",
        };
      }
      tenshin.boards[boardId].updatedAt = new Date().toISOString();
    }

    if (user) {
      tenshin.userId = user.id;
    }

    // Use dynamic keys to save data - This is the remaining synchronous I/O bottleneck
    if (somethingChanged) {
      // Only write to localStorage if something actually changed.
      localStorage.setItem(BOARD_DATA_KEY, JSON.stringify(boardsData));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tenshin));
      // console.log("Autosave: Data written to localStorage.");
    } else {
      // console.log("Autosave: No changes detected, write skipped.");
    }
  }, [api, boardId, STORAGE_KEY, BOARD_DATA_KEY, user]);
  // Note: user is included in the dependency array to ensure tenshin.userId is set correctly

  // Helper for the manual save button click
  const handleManualSave = () => {
    setIsSaving(true);
    handleSave();
    // Simulate a brief "Saved!" visual confirmation before reverting
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  // ----------------------------------------------------------------------
  // 3. Effects (Updated load logic + AUTOSAVE)
  // ----------------------------------------------------------------------

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

  // 🌟 NEW: Autosave functionality using setInterval
  useEffect(() => {
    // Only set up autosave if the API and keys are ready
    if (!api || !STORAGE_KEY || !BOARD_DATA_KEY) {
      return;
    }

    const intervalId = setInterval(() => {
      // The handleSave function is called every 5 seconds (5000 ms)
      handleSave();
    }, 5000); // 5 seconds

    // Clean up the interval when the component unmounts or dependencies change
    return () => {
      clearInterval(intervalId);
    };
    // handleSave is a dependency because it's wrapped in useCallback and needs
    // to pick up the latest dependencies (like api, keys, user) it closes over.
  }, [api, STORAGE_KEY, BOARD_DATA_KEY, handleSave]);

  // ✅ Load board data from localStorage after API and KEYS ready
  useEffect(() => {
    // Only proceed if API, boardId, and both keys are ready, and we haven't loaded yet
    if (!api || !boardId || isLoaded || !STORAGE_KEY || !BOARD_DATA_KEY) return;

    // Use dynamic keys
    const boardDataRaw = localStorage.getItem(BOARD_DATA_KEY);

    const boardsData = boardDataRaw ? JSON.parse(boardDataRaw) : {};

    const boardContent = boardsData[boardId];

    if (boardContent) {
      // Fix appState: collaborators must be a Map, not a plain object/array
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
        // Scroll to content or center view
        api.scrollToContent(boardContent.elements || []);
        setIsLoaded(true);
      }, 300);
    } else {
      setIsLoaded(true);
    }
  }, [api, boardId, isLoaded, STORAGE_KEY, BOARD_DATA_KEY]); // DEPENDS ON NEW KEYS

  const handleEditMarkdown = () => {
    setIsEditingMarkdown(true);
  };

  // ----------------------------------------------------------------------
  // 4. Render
  // ----------------------------------------------------------------------

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
            handleChange(elements, state);
          }}
          renderTopRightUI={() => {
            if (showMarkdownButton) {
              return (
                <button
                  className="text-xs font-outfit text-gray-400 border-2 border-[#ff8383] hover:bg-[#2d2d35]"
                  style={{
                    top: "16px",
                    left: "16px",
                    zIndex: 10,
                    background: "#232329",
                    color: "white",
                    borderRadius: "8px",
                    padding: "8px 10px",
                    cursor: "pointer",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                  }}
                  onClick={() => {
                    handleEditMarkdown();
                  }}>
                  Markdown Options
                </button>
              );
            }

            // Default: show Command Palette button
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
                }}>
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
                  }}>
                  Command Palette
                </button>

                <span
                  className="font-outfit"
                  style={{
                    fontSize: "10px",
                    opacity: 0.6,
                    color: "white",
                    marginTop: "2px",
                  }}>
                  " Ctrl + / "
                </span>
              </div>
            );
          }}
        />

        {/* Save Button - Now calls handleManualSave */}
        <button
          onClick={handleManualSave}
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
            BOARD_DATA_KEY={BOARD_DATA_KEY}
          />
        )}
        {isEditingMarkdown && (
          <FloatingEditMarkdownCard
            title="Custom Floating Card"
            onClose={() => setIsEditingMarkdown(false)}
            markdownText={selectedMarkdownText}
            BOARD_DATA_KEY={BOARD_DATA_KEY}
            deleteMarkdown={() => {
              deleteMarkdown();
            }}
          />
        )}
      </div>
    </div>
  );
}
