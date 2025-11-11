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
  Search,
  FolderPlus,
  PackagePlus,
  LayoutDashboard,
  Notebook,
  Brush,
  PenTool,
  Rocket,
  Lightbulb,
  Flame,
  Target,
  Star,
  Palette,
  Folder,
  Bolt,
  PaintBucket,
} from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [boards, setBoards] = useState({});
  const [editingBoardId, setEditingBoardId] = useState(null);
  const [newBoardName, setNewBoardName] = useState("");
  const [editingIconId, setEditingIconId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [menuState, setMenuState] = useState({
    open: false,
    x: 0,
    y: 0,
    boardId: null,
  });
  const router = useRouter();

  // ✅ Only import and map icons you actually use
  const ICONS = {
    Brush,
    PenTool,
    Rocket,
    Lightbulb,
    Flame,
    Target,
    Star,
    Palette,
    Folder,
    Bolt,
    Bucket: PaintBucket,
  };

  const availableIcons = Object.keys(ICONS);

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
    const id = crypto.randomUUID();
    const savedBoards = JSON.parse(localStorage.getItem("boards") || "{}");

    savedBoards[id] = {
      id,
      name: "Untitled Board",
      icon: "Brush", // ✅ default Lucide icon
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

  const saveBoardName = (id) => {
    const trimmed = newBoardName.trim();
    if (!trimmed) return setErrorMessage("Board name cannot be empty.");

    const savedBoards = JSON.parse(localStorage.getItem("boards") || "{}");
    if (!savedBoards[id]) return;

    savedBoards[id].name = trimmed;
    savedBoards[id].updatedAt = new Date().toISOString();

    localStorage.setItem("boards", JSON.stringify(savedBoards));
    setBoards(savedBoards);
    setEditingBoardId(null);
    setErrorMessage("");
  };

  const startEditingIcon = (id) => {
    setEditingIconId(id);
    setMenuState({ open: false, x: 0, y: 0, boardId: null });
  };

  const saveIcon = (id, iconName) => {
    const savedBoards = JSON.parse(localStorage.getItem("boards") || "{}");
    savedBoards[id].icon = iconName;
    savedBoards[id].updatedAt = new Date().toISOString();
    localStorage.setItem("boards", JSON.stringify(savedBoards));
    setBoards(savedBoards);
    setEditingIconId(null);
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
      if (count >= 1)
        return `${count} ${interval.label}${count !== 1 ? "s" : ""} ago`;
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

  // --- Board Menu ---
  const BoardMenu = ({ board }) => {
    if (!menuState.open) return null;
    const menuWidth = 144;
    const menuHeight = 160;
    const padding = 8;
    let left = menuState.x + padding;
    if (left + menuWidth > window.innerWidth)
      left = menuState.x - menuWidth - padding;
    let top = menuState.y + padding;
    if (top + menuHeight > window.innerHeight)
      top = window.innerHeight - menuHeight - padding;

    return (
      <div
        className="board-menu absolute z-50 w-36 bg-[#2a2a2a] rounded-md shadow-xl p-1"
        style={{ left, top }}
        onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => openBoard(menuState.boardId)}
          className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-[#3b3b3b] rounded-md">
          <ExternalLink className="w-4 h-4 mr-2" /> Open
        </button>
        <button
          onClick={() => startRenaming(menuState.boardId, board.name)}
          className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-[#3b3b3b] rounded-md">
          <Edit className="w-4 h-4 mr-2" /> Rename
        </button>
        <button
          onClick={() => startEditingIcon(menuState.boardId)}
          className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-[#3b3b3b] rounded-md">
          <Edit className="w-4 h-4 mr-2" /> Change Icon
        </button>
        <div className="border-t border-gray-700 my-1"></div>
        <button
          onClick={() => {
            if (window.confirm(`Delete board: ${board.name}?`)) {
              deleteBoard(menuState.boardId);
            }
          }}
          className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-red-900/40 rounded-md">
          <Trash2 className="w-4 h-4 mr-2" /> Delete
        </button>
      </div>
    );
  };

  const allBoardsArray = Object.keys(boards).map((id) => ({
    id,
    ...boards[id],
  }));
  const sortedBoards = allBoardsArray.sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );
  const recentBoards = sortedBoards.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#191919] text-gray-100 flex flex-col">
      <main className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-60 bg-[#202020] border-r border-[#2a2a2a] px-2 py-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md">
                <img className="rounded-sm" src="/logo_sm.svg" alt="logo" />
              </div>
              <h2 className="text-white text-lg font-mono">Tenshin</h2>
            </div>
            <button
              onClick={createNewBoard}
              className="text-white hover:text-gray-300 transition-colors"
              title="Board">
              <Notebook className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex flex-col text-sm mb-4">
            <button className="flex items-center gap-3 text-gray-300 hover:bg-[#2a2a2a] rounded-sm p-1">
              <Search className="w-4 h-4" />
              Search
            </button>
            <button className="flex items-center gap-3 text-gray-300 hover:bg-[#2a2a2a] rounded-sm p-1">
              <PackagePlus className="w-4 h-4" />
              New Folder
            </button>
          </nav>

          <div className="flex-1 overflow-y-auto">
            <h3 className="text-xs text-[#a3a3a3] font-semibold mb-2 mx-1">
              Favourites
            </h3>

            <div className="flex flex-col">
              {recentBoards.length > 0 ? (
                recentBoards.map((board) => {
                  const Icon = ICONS[board.icon] || Brush;
                  return (
                    <button
                      key={board.id}
                      onClick={() => openBoard(board.id)}
                      className="flex items-center gap-2 cursor-pointer text-gray-300 hover:bg-[#2a2a2a] rounded-sm p-1 w-full text-left">
                      <Icon className="w-4 h-4" />
                      <span className="truncate text-sm">{board.name}</span>
                    </button>
                  );
                })
              ) : (
                <p className="text-gray-600 text-sm px-2">No recent boards</p>
              )}
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 p-6 flex justify-center">
          <div className="w-full max-w-5xl">
            {/* Recent Boards */}
            <section className="mb-10">
              <h3 className="text-md mb-4">Recent Boards</h3>
              <div className="flex gap-4 overflow-x-auto pb-15 relative px-2 -mx-2">
                {recentBoards.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-gray-400 h-40 rounded-xl w-full">
                    <p className="text-sm">
                      No boards yet. Create your first one!
                    </p>
                  </div>
                ) : (
                  recentBoards.map((board) => {
                    const Icon = ICONS[board.icon] || Brush;
                    return (
                      <div
                        key={board.id}
                        className="board-card-container relative font-sans shrink-0 w-40 h-40 bg-[#1a1a1a] rounded-xl flex flex-col shadow-lg shadow-[black] justify-end hover:shadow-2xl transition-shadow">
                        <div className="grow bg-[#ff8383] rounded-t-xl"></div>
                        <div
                          className="p-4 cursor-pointer"
                          onClick={() => openBoard(board.id)}>
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between relative">
                              <div
                                className="cursor-pointer p-1 hover:bg-[#2a2a2a] rounded-md transition-transform hover:scale-110"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditingIcon(board.id);
                                }}>
                                <Icon className="w-6 h-6 text-gray-300" />
                              </div>
                              <span
                                className="text-white text-lg cursor-pointer p-1 hover:bg-[#2a2a2a] rounded-md"
                                onClick={(e) => handleMenuClick(e, board.id)}>
                                <Ellipsis />
                              </span>
                            </div>
                            <h3
                              className="text-md truncate text-white"
                              onDoubleClick={() =>
                                startRenaming(board.id, board.name)
                              }>
                              {board.name}
                            </h3>
                            <p className="text-xs text-gray-400">
                              {timeAgo(board.updatedAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            {menuState.open && menuState.boardId && (
              <BoardMenu board={boards[menuState.boardId]} />
            )}

            {/* Rename Modal */}
            {editingBoardId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-[#1a1a1a] p-6 rounded-xl w-80 shadow-xl">
                  <h2 className="text-lg text-white mb-4">Rename Board</h2>
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
                      }}>
                      Cancel
                    </Button>
                    <Button onClick={() => saveBoardName(editingBoardId)}>
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Icon Picker Modal */}
            {editingIconId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-[#1a1a1a] p-6 rounded-xl w-80 shadow-xl">
                  <h2 className="text-lg text-white mb-4">Choose an Icon</h2>
                  <div className="grid grid-cols-6 gap-3 mb-4">
                    {availableIcons.map((iconName) => {
                      const Icon = ICONS[iconName];
                      return (
                        <div
                          key={iconName}
                          className="cursor-pointer p-2 hover:bg-gray-700 rounded-md flex items-center justify-center transition-transform hover:scale-110"
                          onClick={() => saveIcon(editingIconId, iconName)}>
                          <Icon className="w-6 h-6 text-gray-300" />
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setEditingIconId(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
