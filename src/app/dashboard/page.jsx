"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PlusCircle,
  LogOut,
  Edit,
  Trash2,
  ExternalLink,
  Ellipsis,
} from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [boards, setBoards] = useState({});
  const [editingBoardId, setEditingBoardId] = useState(null);
  const [newBoardName, setNewBoardName] = useState("");
  const [editingEmojiId, setEditingEmojiId] = useState(null);
  const [emojiValue, setEmojiValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [menuState, setMenuState] = useState({
    open: false,
    x: 0,
    y: 0,
    boardId: null,
  });
  const router = useRouter();

  // --- Fetch user ---
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      const currentUser = data?.user || null;
      setUser(currentUser);
      if (!currentUser) window.location.href = "/signin";
    };
    getUser();
  }, []);

  // --- Load boards ---
  useEffect(() => {
    const savedBoards = JSON.parse(localStorage.getItem("boards") || "{}");
    setBoards(savedBoards);
  }, []);

  const createNewBoard = () => {
    const id = `new-${Date.now()}`;
    const savedBoards = JSON.parse(localStorage.getItem("boards") || "{}");
    savedBoards[id] = {
      name: id,
      emoji: "🖌️",
      elements: [],
      appState: {},
      files: {},
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem("boards", JSON.stringify(savedBoards));
    setBoards(savedBoards);
    router.push(`/board?id=${encodeURIComponent(id)}`);
  };

  const openBoard = (id) => router.push(`/board?id=${encodeURIComponent(id)}`);

  const deleteBoard = (id) => {
    const savedBoards = JSON.parse(localStorage.getItem("boards") || "{}");
    delete savedBoards[id];
    localStorage.setItem("boards", JSON.stringify(savedBoards));
    setBoards(savedBoards);
    setMenuState({ open: false, x: 0, y: 0, boardId: null });
  };

  const startRenaming = (id, currentName) => {
    setEditingBoardId(id);
    setNewBoardName(currentName);
    setErrorMessage("");
    setMenuState({ open: false, x: 0, y: 0, boardId: null });
  };

  const saveBoardName = (oldId) => {
    const trimmed = newBoardName.trim();
    if (!trimmed) return setErrorMessage("Board name cannot be empty.");

    const savedBoards = JSON.parse(localStorage.getItem("boards") || "{}");
    if (savedBoards[trimmed] && trimmed !== oldId) {
      setErrorMessage("A board with that name already exists.");
      return;
    }

    const boardData = savedBoards[oldId];
    delete savedBoards[oldId];
    savedBoards[trimmed] = { ...boardData, name: trimmed };
    localStorage.setItem("boards", JSON.stringify(savedBoards));
    setBoards(savedBoards);
    setEditingBoardId(null);
    setErrorMessage("");
  };

  const startEditingEmoji = (id, currentEmoji) => {
    setEditingEmojiId(id);
    setEmojiValue(currentEmoji || "🖌️");
    setMenuState({ open: false, x: 0, y: 0, boardId: null });
  };

  const saveEmoji = (id, emoji) => {
    const savedBoards = JSON.parse(localStorage.getItem("boards") || "{}");
    savedBoards[id].emoji = emoji || "🖌️";
    localStorage.setItem("boards", JSON.stringify(savedBoards));
    setBoards(savedBoards);
    setEditingEmojiId(null);
  };

  function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    const intervals = [
      { label: "year", seconds: 31536000 },
      { label: "month", seconds: 2592000 },
      { label: "week", seconds: 604800 },
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "min", seconds: 60 },
      { label: "sec", seconds: 1 },
    ];

    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count >= 1) {
        return `${count} ${interval.label}${count !== 1 ? "s" : ""} ago`;
      }
    }
    return "just now";
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/signin";
  };

  // --- Menu handling ---
  const handleMenuClick = (e, boardId) => {
    e.stopPropagation();
    const clickX = e.clientX;
    const clickY = e.clientY;
    setMenuState((prev) => ({
      open: prev.boardId === boardId && prev.open ? false : true,
      x: clickX,
      y: clickY,
      boardId,
    }));
  };

  // Close menu on outside click
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        menuState.open &&
        !event.target.closest(".board-menu") &&
        !event.target.closest(".board-card-container")
      ) {
        setMenuState({ open: false, x: 0, y: 0, boardId: null });
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [menuState.open]);

  // --- Board Menu Component ---
  const BoardMenu = ({ board }) => {
    if (!menuState.open) return null;

    const menuWidth = 144; // width in px (w-36)
    const menuHeight = 160; // estimated height
    const padding = 8;

    let left = menuState.x + padding;
    if (left + menuWidth > window.innerWidth) {
      left = menuState.x - menuWidth - padding;
    }

    let top = menuState.y + padding;
    if (top + menuHeight > window.innerHeight) {
      top = window.innerHeight - menuHeight - padding;
    }

    return (
      <div
        className="board-menu absolute z-50 w-36 bg-[#2a2a2a] rounded-md shadow-xl p-1"
        style={{ left, top }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => openBoard(menuState.boardId)}
          className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-[#3b3b3b] rounded-md transition-colors"
        >
          <ExternalLink className="w-4 h-4 mr-2" /> Open
        </button>
        <button
          onClick={() => startRenaming(menuState.boardId, board.name)}
          className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-[#3b3b3b] rounded-md transition-colors"
        >
          <Edit className="w-4 h-4 mr-2" /> Rename
        </button>
        <button
          onClick={() => startEditingEmoji(menuState.boardId, board.emoji)}
          className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-[#3b3b3b] rounded-md transition-colors"
        >
          <Edit className="w-4 h-4 mr-2" /> Change Emoji
        </button>
        <div className="border-t border-gray-700 my-1"></div>
        <button
          onClick={() => {
            if (
              window.confirm(
                `Are you sure you want to delete board: ${board.name}?`
              )
            ) {
              deleteBoard(menuState.boardId);
            }
          }}
          className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-red-900/40 rounded-md transition-colors"
        >
          <Trash2 className="w-4 h-4 mr-2" /> Delete
        </button>
      </div>
    );
  };

  // --- Prepare boards ---
  const allBoardsArray = Object.keys(boards).map((id) => ({
    id,
    ...boards[id],
  }));
  const sortedBoards = allBoardsArray.sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );
  const recentBoards = sortedBoards.slice(0, 8);

  return (
    <div className="min-h-screen bg-[#121212] text-gray-100 flex flex-col">
      {/* Navbar */}
      <header className="flex items-center justify-between p-5 bg-[#101010]/90 backdrop-blur-md">
        <h1 className="text-xl tracking-tight">
          <span className="text-white font-sans">Tenshin Dashboard</span>
        </h1>
        <div className="flex items-center gap-3">
          {user && (
            <span className="text-sm text-gray-400 hidden sm:block">
              {user.email}
            </span>
          )}
          <Button
            onClick={handleLogout}
            variant="outline"
            className="bg-[#1e1e1e] border-gray-700 hover:bg-gray-800"
          >
            <LogOut className="w-4 h-4 mr-1" /> Logout
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg">Your Boards</h2>
          <Button
            onClick={createNewBoard}
            className="bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <PlusCircle className="w-4 h-4 mr-2" /> New Board
          </Button>
        </div>

        {/* Recent Boards */}
        <section className="mb-10">
          <h3 className="text-md  mb-4">Recent Boards</h3>
          <div className="flex gap-4 overflow-x-auto scrollbar-hidden">
            {recentBoards.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-gray-400 h-40 rounded-xl w-full">
                <p className="text-sm">No boards yet. Create your first one!</p>
              </div>
            ) : (
              recentBoards.map((board) => (
                <div
                  key={board.id}
                  className="board-card-container relative font-sans shrink-0 w-40 h-40 bg-[#1a1a1a] rounded-xl shadow-xl shadow-[#101010] flex flex-col justify-end hover:shadow-lg transition-shadow"
                >
                  <div className="grow bg-[#ff8383] rounded-t-xl"></div>
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => openBoard(board.id)}
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between relative">
                        <span
                          className="text-2xl"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditingEmoji(board.id, board.emoji);
                          }}
                          title="Click to edit emoji"
                        >
                          {board.emoji || "🖌️"}
                        </span>
                        <span
                          className="text-white text-lg cursor-pointer p-1 hover:bg-[#2a2a2a] rounded-md transition-colors"
                          onClick={(e) => handleMenuClick(e, board.id)}
                          title="More options"
                        >
                          <Ellipsis />
                        </span>
                      </div>
                      <h3
                        className="text-sm font-medium truncate text-white w-full"
                        onDoubleClick={() =>
                          startRenaming(board.id, board.name)
                        }
                      >
                        {board.name}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {timeAgo(board.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* All Boards */}
        <section>
          <h3 className="text-md mb-4">All Boards</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allBoardsArray.length === 0 ? (
              <p className="text-gray-400">No boards yet.</p>
            ) : (
              allBoardsArray.map((board) => (
                <div
                  key={board.id}
                  className="board-card-container relative font-sans w-full h-32 bg-[#1a1a1a] rounded-xl shadow-xl shadow-[#101010] flex flex-col justify-end hover:shadow-lg transition-shadow p-4 cursor-pointer"
                  onClick={() => openBoard(board.id)}
                >
                  <div className="flex items-center justify-between">
                    <span>{board.emoji || "🖌️"}</span>
                    <span
                      className="text-white cursor-pointer"
                      onClick={(e) => handleMenuClick(e, board.id)}
                    >
                      <Ellipsis />
                    </span>
                  </div>
                  <h3 className="text-white font-medium truncate">
                    {board.name}
                  </h3>
                  <p className="text-gray-400 text-xs">
                    {timeAgo(board.updatedAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        {menuState.open && menuState.boardId && (
          <BoardMenu board={boards[menuState.boardId]} />
        )}

        {/* --- Rename Modal --- */}
        {editingBoardId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-[#1a1a1a] p-6 rounded-xl w-80 shadow-xl">
              <h2 className="text-lg  text-white mb-4">Rename Board</h2>
              <Input
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="Enter new board name"
                className="mb-4"
                autoFocus
              />
              {errorMessage && (
                <p className="text-red-500 text-sm mb-2">{errorMessage}</p>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingBoardId(null);
                    setErrorMessage("");
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={() => saveBoardName(editingBoardId)}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* --- Emoji Modal --- */}
        {editingEmojiId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-[#1a1a1a] p-6 rounded-xl w-80 shadow-xl">
              <h2 className="text-lg text-white mb-4">Choose an Emoji</h2>
              <div className="grid grid-cols-6 gap-3 mb-4">
                {[
                  "🖌️",
                  "🎨",
                  "📝",
                  "📌",
                  "🔥",
                  "💡",
                  "⚡",
                  "🎯",
                  "🌟",
                  "🚀",
                ].map((emoji) => (
                  <span
                    key={emoji}
                    className="text-2xl cursor-pointer hover:bg-gray-700 rounded-md p-1"
                    onClick={() => saveEmoji(editingEmojiId, emoji)}
                  >
                    {emoji}
                  </span>
                ))}
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setEditingEmojiId(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
