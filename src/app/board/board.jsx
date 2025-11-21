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

// 🌟 IMPORT NEW INDEXEDDB STORAGE FUNCTIONS
import {
  loadBoardData,
  handleSave as saveToDB, // Renamed to avoid collision with component's handleSave
  handleChange as checkMarkdownSelection, // Renamed for clarity
  deleteMarkdown as deleteMarkdownFromDB, // Renamed for clarity
} from "@/lib/storage";

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
  },
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
  // 2. STORAGE WRAPPERS (handleSave, handleChange, deleteMarkdown)
  // ----------------------------------------------------------------------

  // 🌟 NEW: handleSave implementation using the imported IndexedDB function
  const handleSave = useCallback(() => {
    saveToDB({
      api,
      boardId,
      STORAGE_KEY,
      user,
      BOARD_DATA_KEY,
    });
  }, [api, boardId, STORAGE_KEY, user]);

  // 🌟 NEW: handleChange implementation using the imported IndexedDB function
  const handleChange = useCallback(
    (elements, state) => {
      checkMarkdownSelection({
        elements,
        state,
        boardId,
        BOARD_DATA_KEY,
        setShowMarkdownButton,
        setSelectedMarkdownText,
        setSelectedMarkdownGroupId,
      });
    },
    [boardId, BOARD_DATA_KEY],
  );

  // 🌟 NEW: deleteMarkdown implementation using the imported IndexedDB function
  const deleteMarkdown = useCallback(() => {
    deleteMarkdownFromDB({
      api,
      boardId,
      selectedMarkdownGroupId,
      BOARD_DATA_KEY,
      setSelectedMarkdownText,
      setShowMarkdownButton,
    });
    // Note: Resetting selectedMarkdownGroupId happens inside the utility function
  }, [api, boardId, selectedMarkdownGroupId, BOARD_DATA_KEY]);

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
  // 3. Effects (Load + Autosave + Other Logic)
  // ----------------------------------------------------------------------

  // 🌟 NEW: Initial Board Loading (replaces your old useEffect block)
  useEffect(() => {
    loadBoardData({
      api,
      boardId,
      isLoaded,
      setIsLoaded,
      STORAGE_KEY,
      BOARD_DATA_KEY,
    });
  }, [api, boardId, isLoaded, STORAGE_KEY, BOARD_DATA_KEY]);

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
    // handleSave is a dependency because it's wrapped in useCallback
  }, [api, STORAGE_KEY, BOARD_DATA_KEY, handleSave]);

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
        }}
      >
        <Excalidraw
          theme="dark"
          excalidrawAPI={(excalidrawApi) => setApi(excalidrawApi)}
          onChange={(elements, state) => {
            // Using the new handleChange wrapper
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
                  }}
                >
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
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  pointerEvents: "none",
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
                    pointerEvents: "auto",
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
              // Calling the new deleteMarkdown wrapper
              deleteMarkdown();
            }}
          />
        )}
      </div>
    </div>
  );
}
