"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Ban,
  Ellipsis,
  Search,
  PackagePlus,
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
  ChevronRight,
  ChevronDown,
  BookOpenText,
  MoreHorizontal,
  UserRoundCog,
  ScrollText,
  Settings,
  LucideLogOut,
} from "lucide-react";
import BoardMenu from "./BoardMenu";
import FolderMenu from "./FolderMenu";
import Sidebar from "./Sidebar";

export default function DashboardPage() {
  const router = useRouter();

  // Storage key
  const STORAGE_KEY = "tenshin";
  const BOARD_DATA_KEY = "boardData";

  // app state
  const [user, setUser] = useState(null);
  const [data, setData] = useState({
    folders: {},
    boards: {},
    ui: { collapsedFolders: {} },
  });

  // UI state
  const [boardMenuState, setBoardMenuState] = useState({
    open: false,
    x: 0,
    y: 0,
    boardId: null,
  });
  const [folderMenuState, setFolderMenuState] = useState({
    open: false,
    x: 0,
    y: 0,
    folderId: null,
  });

  const [editingBoardId, setEditingBoardId] = useState(null);
  const [newBoardName, setNewBoardName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingIconId, setEditingIconId] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);
  const [editFolderModalOpen, setEditFolderModalOpen] = useState(false);
  const [deleteFolderConfirm, setDeleteFolderConfirm] = useState({
    open: false,
    folderId: null,
  });
  const [folderForm, setFolderForm] = useState({
    name: "",
    icon: "Folder",
    color: "#8B5CF6",
  });

  // context: when user clicks a folder in sidebar, this becomes selected; new boards created while selected go into that folder
  const [selectedFolderId, setSelectedFolderId] = useState(null);

  // icons and colors
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
    PaintBucket,
  };
  const availableIcons = Object.keys(ICONS);

  const FOLDER_COLORS = [
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#10b981",
    "#06b6d4",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#6366f1",
    "#a3a3a3",
  ];

  // load and migrate storage
  function loadFromStorage() {
    try {
      const tenshinRaw = localStorage.getItem(STORAGE_KEY);
      const boardsDataRaw = localStorage.getItem(BOARD_DATA_KEY);
      const boardsData = boardsDataRaw ? JSON.parse(boardsDataRaw) : {};

      if (tenshinRaw) {
        const parsed = JSON.parse(tenshinRaw);
        const folders = parsed.folders || {};
        const boards = parsed.boards || {};
        const ui = parsed.ui || { collapsedFolders: {} };

        // ensure folders have arrays + expanded default
        Object.keys(folders).forEach((fid) => {
          if (!Array.isArray(folders[fid].boards)) folders[fid].boards = [];
          if (folders[fid].expanded === undefined) folders[fid].expanded = true;
        });

        return { folders, boards, ui, boardsData };
      }

      // migrate from old "boards" key if present
      const oldRaw = localStorage.getItem("boards");
      if (oldRaw) {
        const oldParsed = JSON.parse(oldRaw);
        const boards = {};
        const newBoardsData = {};

        Object.keys(oldParsed).forEach((id) => {
          const board = oldParsed[id];
          boards[id] = {
            id,
            name: board.name || "Untitled Board",
            icon: board.icon || "Brush",
            folderId: board.folderId || null,
            isFavorite: board.isFavorite || false,
            updatedAt: board.updatedAt || new Date().toISOString(),
          };
          newBoardsData[id] = {
            elements: board.elements || [],
            appState: board.appState || {},
            files: board.files || {},
          };
        });

        const newTop = { folders: {}, boards, ui: { collapsedFolders: {} } };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newTop));
        localStorage.setItem(BOARD_DATA_KEY, JSON.stringify(newBoardsData));

        try {
          localStorage.removeItem("boards");
        } catch (e) {}

        return {
          folders: {},
          boards,
          ui: { collapsedFolders: {} },
          boardsData: newBoardsData,
        };
      }

      // nothing found
      return {
        folders: {},
        boards: {},
        ui: { collapsedFolders: {} },
        boardsData: {},
      };
    } catch (e) {
      console.error("loadFromStorage error", e);
      return {
        folders: {},
        boards: {},
        ui: { collapsedFolders: {} },
        boardsData: {},
      };
    }
  }

  function saveToStorage({ folders, boards, ui, boardsData }) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ folders, boards, ui })
      );
      localStorage.setItem(BOARD_DATA_KEY, JSON.stringify(boardsData));
      setData({ folders, boards, ui, boardsData });
    } catch (e) {
      console.error("saveToStorage error", e);
    }
  }

  // ----------------------- INITIAL LOAD & AUTH -----------------------
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const currentUser = data?.user || null;
        setUser(currentUser);
        if (!currentUser) window.location.href = "/signin";
      } catch (e) {
        console.error("supabase getUser failed", e);
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    const loaded = loadFromStorage();
    setData(loaded);
    if (!loaded.ui) {
      const newData = { ...loaded, ui: { collapsedFolders: {} } };
      saveToStorage(newData);
    }
  }, []);

  // ----------------------- DERIVED LISTS -----------------------
  const allBoardsArray = Object.keys(data.boards || {}).map((id) => ({
    id,
    ...data.boards[id],
  }));
  const sortedBoards = allBoardsArray.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  const recentBoards = sortedBoards.slice(0, 12);
  const favorites = sortedBoards.filter((b) => b.isFavorite);
  const folderList = Object.values(data.folders || {}).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const noFolderBoards = sortedBoards.filter((b) => !b.folderId);

  // ----------------------- HELPERS -----------------------
  function timeAgo(dateString) {
    if (!dateString) return "just now";
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

  // ----------------------- BOARD CRUD -----------------------
  const createNewBoard = () => {
    const id = crypto.randomUUID();
    const assignedFolderId = selectedFolderId || null;

    const newMeta = {
      id,
      name: "Untitled Board",
      icon: "Brush",
      folderId: assignedFolderId,
      isFavorite: false,
      updatedAt: new Date().toISOString(),
    };

    const newBoardData = {
      elements: [],
      appState: {},
      files: {},
    };

    const newData = {
      folders: { ...(data.folders || {}) },
      boards: { ...(data.boards || {}), [id]: newMeta },
      boardsData: { ...(data.boardsData || {}), [id]: newBoardData },
      ui: { ...(data.ui || { collapsedFolders: {} }) },
    };

    if (assignedFolderId && newData.folders[assignedFolderId]) {
      const f = { ...newData.folders[assignedFolderId] };
      f.boards = Array.from(new Set([...(f.boards || []), id]));
      newData.folders[assignedFolderId] = f;
    }

    saveToStorage(newData);
    router.push(`/board?id=${encodeURIComponent(id)}`);
  };

  const openBoard = (id) => router.push(`/board?id=${encodeURIComponent(id)}`);

  const deleteBoard = (id) => {
    const newData = {
      folders: { ...(data.folders || {}) },
      boards: { ...(data.boards || {}) },
      boardsData: { ...(data.boardsData || {}) },
      ui: { ...(data.ui || { collapsedFolders: {} }) },
    };
    const board = newData.boards[id];
    if (!board) return;

    Object.keys(newData.folders).forEach((fid) => {
      const f = { ...newData.folders[fid] };
      if (Array.isArray(f.boards) && f.boards.includes(id)) {
        f.boards = f.boards.filter((b) => b !== id);
        newData.folders[fid] = f;
      }
    });

    delete newData.boards[id];
    delete newData.boardsData[id];

    saveToStorage(newData);
    setBoardMenuState({ open: false, x: 0, y: 0, boardId: null });
  };

  const startRenaming = (id, currentName) => {
    setEditingBoardId(id);
    setNewBoardName(currentName || "");
    setErrorMessage("");
    setBoardMenuState({ open: false, x: 0, y: 0, boardId: null });
  };

  const saveBoardName = (id) => {
    const trimmed = (newBoardName || "").trim();
    if (!trimmed) {
      setErrorMessage("Board name cannot be empty.");
      return;
    }
    const newData = { ...data, boards: { ...(data.boards || {}) } };
    if (!newData.boards[id]) return;
    newData.boards[id].name = trimmed;
    saveToStorage({ ...newData, boardsData: data.boardsData });
    setEditingBoardId(null);
    setErrorMessage("");
  };

  const startEditingIcon = (id) => {
    setEditingIconId(id);
    setBoardMenuState({ open: false, x: 0, y: 0, boardId: null });
  };

  const saveIcon = (id, iconName) => {
    const newData = { ...data, boards: { ...(data.boards || {}) } };
    if (!newData.boards[id]) return;
    newData.boards[id].icon = iconName;
    saveToStorage({ ...newData, boardsData: data.boardsData });
    setEditingIconId(null);
  };

  const toggleFavorite = (id) => {
    const newData = { ...data, boards: { ...(data.boards || {}) } };
    if (!newData.boards[id]) return;
    newData.boards[id].isFavorite = !newData.boards[id].isFavorite;
    saveToStorage({ ...newData, boardsData: data.boardsData });
    setBoardMenuState({ open: false, x: 0, y: 0, boardId: null });
  };

  const moveBoardToFolder = (boardId, folderId) => {
    const newData = {
      boards: { ...(data.boards || {}) },
      folders: { ...(data.folders || {}) },
      boardsData: { ...(data.boardsData || {}) },
      ui: { ...(data.ui || { collapsedFolders: {} }) },
    };
    const board = newData.boards[boardId];
    if (!board) return;

    const prevFolderId = board.folderId || null;
    if ((prevFolderId || null) === (folderId || null)) {
      setBoardMenuState({ open: false, x: 0, y: 0, boardId: null });
      return;
    }

    Object.keys(newData.folders).forEach((fid) => {
      const f = { ...newData.folders[fid] };
      if (Array.isArray(f.boards) && f.boards.includes(boardId)) {
        f.boards = f.boards.filter((b) => b !== boardId);
        newData.folders[fid] = f;
      }
    });

    newData.boards[boardId] = {
      ...board,
      folderId: folderId || null,
    };

    if (folderId && newData.folders[folderId]) {
      const dest = { ...newData.folders[folderId] };
      dest.boards = Array.from(new Set([...(dest.boards || []), boardId]));
      newData.folders[folderId] = dest;
    }

    saveToStorage(newData);
    setBoardMenuState({ open: false, x: 0, y: 0, boardId: null });
  };

  // ----------------------- FOLDER CRUD -----------------------
  const openCreateFolderModal = () => {
    setFolderForm({
      name: "New Folder",
      icon: "Folder",
      color: FOLDER_COLORS[0],
    });
    setCreateFolderModalOpen(true);
  };

  const createFolder = () => {
    const name = (folderForm.name || "").trim() || "New Folder";
    const id = crypto.randomUUID();
    const newFolder = {
      id,
      name,
      icon: folderForm.icon || "Folder",
      color: folderForm.color || FOLDER_COLORS[0],
      boards: [],
      expanded: true,
    };
    const newData = {
      folders: { ...(data.folders || {}), [id]: newFolder },
      boards: { ...(data.boards || {}) },
      boardsData: { ...(data.boardsData || {}) },
      ui: { ...(data.ui || { collapsedFolders: {} }) },
    };
    if (!newData.ui.collapsedFolders) newData.ui.collapsedFolders = {};
    newData.ui.collapsedFolders[id] = false; // false -> expanded
    saveToStorage(newData);
    setCreateFolderModalOpen(false);
    setSelectedFolderId(id);
  };

  const openEditFolderModal = (folderId) => {
    const f = data.folders[folderId];
    if (!f) return;
    setFolderForm({
      name: f.name,
      icon: f.icon || "Folder",
      color: f.color || FOLDER_COLORS[0],
    });
    setEditFolderModalOpen(true);
    setFolderMenuState({ open: false, x: 0, y: 0, folderId: null });
    setSelectedFolderId(folderId);
  };

  const saveEditFolder = () => {
    const id = selectedFolderId;
    if (!id) return;
    const name = (folderForm.name || "").trim();
    if (!name) return;
    const newData = { ...data, folders: { ...(data.folders || {}) } };
    newData.folders[id] = {
      ...newData.folders[id],
      name,
      icon: folderForm.icon,
      color: folderForm.color,
    };
    saveToStorage(newData);
    setEditFolderModalOpen(false);
    setSelectedFolderId(null);
  };

  const confirmDeleteFolder = (folderId) => {
    setDeleteFolderConfirm({ open: true, folderId });
    setFolderMenuState({ open: false, x: 0, y: 0, folderId: null });
  };

  const deleteFolder = () => {
    const id = deleteFolderConfirm.folderId;
    if (!id) return;
    const newData = {
      folders: { ...(data.folders || {}) },
      boards: { ...(data.boards || {}) },
      boardsData: { ...(data.boardsData || {}) },
      ui: { ...(data.ui || { collapsedFolders: {} }) },
    };

    const folder = newData.folders[id];
    (folder.boards || []).forEach((bId) => {
      if (newData.boards[bId]) newData.boards[bId].folderId = null;
    });

    delete newData.folders[id];
    if (
      newData.ui.collapsedFolders &&
      newData.ui.collapsedFolders[id] !== undefined
    ) {
      const cf = { ...newData.ui.collapsedFolders };
      delete cf[id];
      newData.ui.collapsedFolders = cf;
    }

    saveToStorage(newData);
    setDeleteFolderConfirm({ open: false, folderId: null });
    if (selectedFolderId === id) setSelectedFolderId(null);
  };

  const toggleFolderCollapse = (folderId) => {
    const newUi = {
      ...(data.ui || { collapsedFolders: {} }),
      collapsedFolders: { ...(data.ui?.collapsedFolders || {}) },
    };
    const current = newUi.collapsedFolders[folderId];
    newUi.collapsedFolders[folderId] = !current;
    const newData = { ...data, ui: newUi };
    saveToStorage(newData);
  };

  // Menus
  const handleBoardMenuClick = (e, boardId) => {
    e.stopPropagation();
    const clickX = e.clientX;
    const clickY = e.clientY;
    setBoardMenuState((prev) => ({
      open: prev.boardId === boardId && prev.open ? false : true,
      x: clickX,
      y: clickY,
      boardId,
    }));
  };

  const handleFolderMenuClick = (e, folderId) => {
    e.stopPropagation();
    const clickX = e.clientX;
    const clickY = e.clientY;
    setFolderMenuState((prev) => ({
      open: prev.folderId === folderId && prev.open ? false : true,
      x: clickX,
      y: clickY,
      folderId,
    }));
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        (boardMenuState.open &&
          !event.target.closest(".board-menu") &&
          !event.target.closest(".board-card-container")) ||
        (folderMenuState.open &&
          !event.target.closest(".folder-menu") &&
          !event.target.closest(".folder-item"))
      ) {
        setBoardMenuState({ open: false, x: 0, y: 0, boardId: null });
        setFolderMenuState({ open: false, x: 0, y: 0, folderId: null });
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [boardMenuState.open, folderMenuState.open]);

  // Render
  return (
    <div className="min-h-screen bg-[#191919] text-gray-100 flex flex-col">
      <main className="flex-1 flex">
        {/* Sidebar */}
        <Sidebar
          ICONS={ICONS}
          createNewBoard={createNewBoard}
          openCreateFolderModal={openCreateFolderModal}
          favorites={favorites}
          data={data}
          folderList={folderList}
          noFolderBoards={noFolderBoards}
          openBoard={openBoard}
          handleBoardMenuClick={handleBoardMenuClick}
          handleFolderMenuClick={handleFolderMenuClick}
          toggleFolderCollapse={toggleFolderCollapse}
          selectedFolderId={selectedFolderId}
          setSelectedFolderId={setSelectedFolderId}
        />

        {/* Main */}
        <div className="flex-1 p-6 flex justify-center">
          <div className="w-full max-w-5xl">
            <section className="mb-10">
              <h3 className="text-lg mt-20 mb-4">Recent Boards</h3>
              <div className="flex flex-wrap gap-4 py-4 justify-start">
                {recentBoards.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-gray-500 h-36 rounded-lg w-full bg-gray-900">
                    <p className="text-sm">
                      No boards yet. Create your first one!
                    </p>
                  </div>
                ) : (
                  recentBoards.slice(0, 6).map((board) => {
                    const Icon = ICONS[board.icon] || Brush;
                    const folder = board.folderId
                      ? data.folders[board.folderId]
                      : null;

                    return (
                      <div
                        key={board.id}
                        className="board-card-container w-36 h-36 bg-[#202020] hover:bg-[#2a2a2a] rounded-md flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow transform hover:-translate-y-0.5 hover:scale-105 cursor-pointer"
                        onClick={() => openBoard(board.id)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          handleBoardMenuClick(e, board.id);
                        }}
                      >
                        {/* Small Top Color Bar */}
                        <div
                          className="h-3 w-full rounded-t-lg"
                          style={{
                            backgroundColor: folder ? folder.color : "#6b7280",
                          }}
                        ></div>

                        {/* Content */}
                        <div className="p-3 flex flex-col gap-5 h-full">
                          <div className="flex items-center justify-between">
                            <div
                              className="p-1 rounded hover:bg-[#3a3a3a] transition-transform hover:scale-110"
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditingIcon(board.id);
                              }}
                            >
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <span
                              className="text-white p-1 rounded hover:bg-[#3a3a3a]"
                              onClick={(e) => handleBoardMenuClick(e, board.id)}
                            >
                              <Ellipsis />
                            </span>
                          </div>

                          <div>
                            <h3
                              className="text-white text-md truncate"
                              onDoubleClick={() =>
                                startRenaming(board.id, board.name)
                              }
                            >
                              {board.name}
                            </h3>
                            <p className="text-xs text-gray-400 mt-1">
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

            <section className="mt-10">
              <h3 className="text-lg mb-4">Browse by Folder</h3>

              {/* Custom Folder Dropdown */}
              <div className="relative inline-block w-56">
                {/* Trigger */}
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full bg-[#202020] hover:bg[#2a2a2a] text-white cursor-pointer py-2 px-3 rounded-md flex justify-between items-center"
                >
                  <span className="truncate flex items-center gap-2">
                    {/* Built-in options */}
                    {selectedFolderId === "all" && (
                      <>
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-600 rounded-sm">
                          <Folder className="w-3 h-3 text-white" />
                        </span>
                        All Boards
                      </>
                    )}

                    {selectedFolderId === "favourites" && (
                      <>
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-yellow-600 rounded-sm">
                          <Star className="w-3 h-3 text-white" />
                        </span>
                        Favourites
                      </>
                    )}

                    {selectedFolderId === "none" && (
                      <>
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-700 rounded-sm">
                          <Ban className="w-3 h-3 text-white" />
                        </span>
                        No Folder
                      </>
                    )}

                    {/* Actual folder */}
                    {data.folders[selectedFolderId] &&
                      (() => {
                        const folder = data.folders[selectedFolderId];
                        const Icon = ICONS[folder.icon] || Folder;
                        return (
                          <>
                            <span
                              className="inline-flex items-center justify-center w-5 h-5 rounded-sm"
                              style={{ background: folder.color }}
                            >
                              <Icon className="w-3 h-3 text-white" />
                            </span>
                            {folder.name}
                          </>
                        );
                      })()}
                  </span>
                  <span>▾</span>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute z-50 mt-2 w-full bg-[#2a2a2a] rounded-md shadow-lg py-1">
                    {/* All Boards */}
                    <div
                      className="px-3 py-2 hover:bg-[#2a2a2a] cursor-pointer flex items-center gap-2"
                      onClick={() => {
                        setSelectedFolderId("all");
                        setDropdownOpen(false);
                      }}
                    >
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-600 rounded-sm">
                        <Folder className="w-3 h-3 text-white" />
                      </span>
                      All Boards
                    </div>

                    {/* favourites */}
                    <div
                      className="px-3 py-2 hover:bg-[#2a2a2a] cursor-pointer flex items-center gap-2"
                      onClick={() => {
                        setSelectedFolderId("favourites");
                        setDropdownOpen(false);
                      }}
                    >
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-yellow-600 rounded-sm">
                        <Star className="w-3 h-3 text-white" />
                      </span>
                      Favourites
                    </div>

                    {/* no folder */}
                    <div
                      className="px-3 py-2 hover:bg-[#2a2a2a] cursor-pointer flex items-center gap-2"
                      onClick={() => {
                        setSelectedFolderId("none");
                        setDropdownOpen(false);
                      }}
                    >
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-700 rounded-sm">
                        <Ban className="w-3 h-3 text-white" />
                      </span>
                      No Folder
                    </div>

                    {/* User Folders */}
                    {Object.values(data.folders || {}).map((folder) => {
                      const Icon = ICONS[folder.icon] || Folder;
                      return (
                        <div
                          key={folder.id}
                          className="px-3 py-2 hover:bg-[#2a2a2a] cursor-pointer flex items-center gap-2"
                          onClick={() => {
                            setSelectedFolderId(folder.id);
                            setDropdownOpen(false);
                          }}
                        >
                          <span
                            className="inline-flex items-center justify-center w-5 h-5 rounded-sm"
                            style={{ background: folder.color }}
                          >
                            <Icon className="w-3 h-3 text-white" />
                          </span>
                          {folder.name}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4 py-4 justify-start">
                {/* ---------- ALL BOARDS ---------- */}
                {selectedFolderId === "all" &&
                  Object.values(data.boards || {}).map((board) => {
                    const Icon = ICONS[board.icon] || Brush;
                    const folder = board.folderId
                      ? data.folders[board.folderId]
                      : null;

                    return (
                      <div
                        key={board.id}
                        className="board-card-container w-36 h-36 bg-[#202020] hover:bg-[#2a2a2a] rounded-md flex flex-col justify-between shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5 hover:scale-105 cursor-pointer"
                        onClick={() => openBoard(board.id)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          handleBoardMenuClick(e, board.id);
                        }}
                      >
                        <div
                          className="h-3 w-full rounded-t-lg"
                          style={{
                            backgroundColor: folder?.color || "#6b7280",
                          }}
                        ></div>

                        <div className="p-3 flex flex-col gap-5 h-full">
                          <div className="flex items-center justify-between">
                            <div
                              className="p-1 rounded hover:bg-[#3a3a3a] transition hover:scale-110"
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditingIcon(board.id);
                              }}
                            >
                              <Icon className="w-6 h-6 text-white" />
                            </div>

                            <span
                              className="text-white p-1 rounded hover:bg-[#3a3a3a]"
                              onClick={(e) => handleBoardMenuClick(e, board.id)}
                            >
                              <Ellipsis />
                            </span>
                          </div>

                          <div>
                            <h3
                              className="text-white text-md truncate"
                              onDoubleClick={() =>
                                startRenaming(board.id, board.name)
                              }
                            >
                              {board.name}
                            </h3>
                            <p className="text-xs text-gray-400 mt-1">
                              {timeAgo(board.updatedAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {/* ---------- FAVOURITES ---------- */}
                {selectedFolderId === "favourites" &&
                  Object.values(data.boards || {})
                    .filter((board) => board.isFavourite)
                    .sort(
                      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
                    )
                    .map((board) => {
                      const Icon = ICONS[board.icon] || Brush;
                      const folder = board.folderId
                        ? data.folders[board.folderId]
                        : null;

                      return (
                        <div
                          key={board.id}
                          className="board-card-container w-36 h-36 bg-[#202020] hover:bg-[#2a2a2a] rounded-md flex flex-col justify-between shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5 hover:scale-105 cursor-pointer"
                          onClick={() => openBoard(board.id)}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            handleBoardMenuClick(e, board.id);
                          }}
                        >
                          <div
                            className="h-3 w-full rounded-t-lg"
                            style={{
                              backgroundColor: folder?.color || "#6b7280",
                            }}
                          ></div>

                          <div className="p-3 flex flex-col gap-5 h-full">
                            <div className="flex items-center justify-between">
                              <div
                                className="p-1 rounded hover:bg-[#3a3a3a] transition hover:scale-110"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditingIcon(board.id);
                                }}
                              >
                                <Icon className="w-6 h-6 text-white" />
                              </div>

                              <span
                                className="text-white p-1 rounded hover:bg-[#3a3a3a]"
                                onClick={(e) =>
                                  handleBoardMenuClick(e, board.id)
                                }
                              >
                                <Ellipsis />
                              </span>
                            </div>

                            <div>
                              <h3
                                className="text-white text-md truncate"
                                onDoubleClick={() =>
                                  startRenaming(board.id, board.name)
                                }
                              >
                                {board.name}
                              </h3>
                              <p className="text-xs text-gray-400 mt-1">
                                {timeAgo(board.updatedAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                {/* ---------- NO FOLDER ---------- */}
                {selectedFolderId === "none" &&
                  Object.values(data.boards || {})
                    .filter((board) => !board.folderId)
                    .sort(
                      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
                    )
                    .map((board) => {
                      const Icon = ICONS[board.icon] || Brush;

                      return (
                        <div
                          key={board.id}
                          className="board-card-container w-36 h-36 bg-[#202020] hover:bg-[#2a2a2a] rounded-md flex flex-col justify-between shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5 hover:scale-105 cursor-pointer"
                          onClick={() => openBoard(board.id)}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            handleBoardMenuClick(e, board.id);
                          }}
                        >
                          <div
                            className="h-3 w-full rounded-t-lg"
                            style={{ backgroundColor: "#6b7280" }}
                          ></div>

                          <div className="p-3 flex flex-col gap-5 h-full">
                            <div className="flex items-center justify-between">
                              <div
                                className="p-1 rounded hover:bg-[#3a3a3a] transition hover:scale-110"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditingIcon(board.id);
                                }}
                              >
                                <Icon className="w-6 h-6 text-white" />
                              </div>

                              <span
                                className="text-white p-1 rounded hover:bg-[#3a3a3a]"
                                onClick={(e) =>
                                  handleBoardMenuClick(e, board.id)
                                }
                              >
                                <Ellipsis />
                              </span>
                            </div>

                            <div>
                              <h3
                                className="text-white text-md truncate"
                                onDoubleClick={() =>
                                  startRenaming(board.id, board.name)
                                }
                              >
                                {board.name}
                              </h3>
                              <p className="text-xs text-gray-400 mt-1">
                                {timeAgo(board.updatedAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                {/* ---------- SPECIFIC FOLDER ---------- */}
                {selectedFolderId !== "all" &&
                  selectedFolderId !== "favourites" &&
                  selectedFolderId !== "none" &&
                  (data.folders[selectedFolderId]?.boards || [])
                    .map((id) => data.boards[id])
                    .filter(Boolean)
                    .map((board) => {
                      const Icon = ICONS[board.icon] || Brush;
                      const folder = data.folders[selectedFolderId];

                      return (
                        <div
                          key={board.id}
                          className="board-card-container w-36 h-36 bg-[#202020] hover:bg-[#2a2a2a] rounded-md flex flex-col justify-between shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5 hover:scale-105 cursor-pointer"
                          onClick={() => openBoard(board.id)}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            handleBoardMenuClick(e, board.id);
                          }}
                        >
                          <div
                            className="h-3 w-full rounded-t-lg"
                            style={{
                              backgroundColor: folder?.color || "#6b7280",
                            }}
                          ></div>

                          <div className="p-3 flex flex-col gap-5 h-full">
                            <div className="flex items-center justify-between">
                              <div
                                className="p-1 rounded hover:bg-[#3a3a3a] transition hover:scale-110"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditingIcon(board.id);
                                }}
                              >
                                <Icon className="w-6 h-6 text-white" />
                              </div>

                              <span
                                className="text-white p-1 rounded hover:bg-[#3a3a3a]"
                                onClick={(e) =>
                                  handleBoardMenuClick(e, board.id)
                                }
                              >
                                <Ellipsis />
                              </span>
                            </div>

                            <div>
                              <h3
                                className="text-white text-md truncate"
                                onDoubleClick={() =>
                                  startRenaming(board.id, board.name)
                                }
                              >
                                {board.name}
                              </h3>
                              <p className="text-xs text-gray-400 mt-1">
                                {timeAgo(board.updatedAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
              </div>
            </section>

            {boardMenuState.open && boardMenuState.boardId && (
              <BoardMenu
                board={data.boards[boardMenuState.boardId]}
                boardMenuState={boardMenuState}
                folderList={folderList}
                data={data}
                openBoard={openBoard}
                startRenaming={startRenaming}
                startEditingIcon={startEditingIcon}
                moveBoardToFolder={moveBoardToFolder}
                toggleFavorite={toggleFavorite}
                deleteBoard={deleteBoard}
              />
            )}
            {folderMenuState.open && folderMenuState.folderId && (
              <FolderMenu
                folder={data.folders[folderMenuState.folderId]}
                folderMenuState={folderMenuState}
                openEditFolderModal={openEditFolderModal}
                setFolderForm={setFolderForm}
                setEditFolderModalOpen={setEditFolderModalOpen}
                setSelectedFolderId={setSelectedFolderId}
                setFolderMenuState={setFolderMenuState}
                FOLDER_COLORS={FOLDER_COLORS}
                confirmDeleteFolder={confirmDeleteFolder}
              />
            )}

            {/* Rename Board Modal */}
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
                      variant=""
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
                          onClick={() => saveIcon(editingIconId, iconName)}
                        >
                          <Icon className="w-6 h-6 text-gray-300" />
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setEditingIconId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Create Folder Modal */}
            {createFolderModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-[#1a1a1a] p-6 rounded-xl w-96 shadow-xl">
                  <h2 className="text-lg text-white mb-4">Create Folder</h2>
                  <Input
                    value={folderForm.name}
                    onChange={(e) =>
                      setFolderForm((s) => ({ ...s, name: e.target.value }))
                    }
                    placeholder="Folder name"
                    className="mb-4"
                    autoFocus
                  />
                  <div className="mb-3">
                    <div className="text-sm text-gray-300 mb-2">
                      Pick an icon
                    </div>
                    <div className="flex gap-2 overflow-x-auto mb-2">
                      {availableIcons.map((iconName) => {
                        const Icon = ICONS[iconName];
                        return (
                          <button
                            key={iconName}
                            onClick={() =>
                              setFolderForm((s) => ({ ...s, icon: iconName }))
                            }
                            className={`p-2 rounded ${
                              folderForm.icon === iconName
                                ? "bg-[#333]"
                                : "hover:bg-[#2a2a2a]"
                            }`}
                          >
                            <Icon className="w-5 h-5 text-gray-200" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="text-sm text-gray-300 mb-2">
                      Pick a color
                    </div>
                    <div className="flex gap-2">
                      {FOLDER_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() =>
                            setFolderForm((s) => ({ ...s, color: c }))
                          }
                          className={`w-8 h-8 rounded ${
                            folderForm.color === c ? "ring-2 ring-offset-1" : ""
                          }`}
                          style={{ background: c }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCreateFolderModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={createFolder}>Create</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Folder Modal */}
            {editFolderModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-[#1a1a1a] p-6 rounded-xl w-96 shadow-xl">
                  <h2 className="text-lg text-white mb-4">Edit Folder</h2>
                  <Input
                    value={folderForm.name}
                    onChange={(e) =>
                      setFolderForm((s) => ({ ...s, name: e.target.value }))
                    }
                    placeholder="Folder name"
                    className="mb-4"
                    autoFocus
                  />
                  <div className="mb-3">
                    <div className="text-sm text-gray-300 mb-2">
                      Pick an icon
                    </div>
                    <div className="flex gap-2 overflow-x-auto mb-2">
                      {availableIcons.map((iconName) => {
                        const Icon = ICONS[iconName];
                        return (
                          <button
                            key={iconName}
                            onClick={() =>
                              setFolderForm((s) => ({ ...s, icon: iconName }))
                            }
                            className={`p-2 rounded ${
                              folderForm.icon === iconName
                                ? "bg-[#333]"
                                : "hover:bg-[#2a2a2a]"
                            }`}
                          >
                            <Icon className="w-5 h-5 text-gray-200" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="text-sm text-gray-300 mb-2">
                      Pick a color
                    </div>
                    <div className="flex gap-2">
                      {FOLDER_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() =>
                            setFolderForm((s) => ({ ...s, color: c }))
                          }
                          className={`w-8 h-8 rounded ${
                            folderForm.color === c ? "ring-2 ring-offset-1" : ""
                          }`}
                          style={{ background: c }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditFolderModalOpen(false);
                        setSelectedFolderId(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={saveEditFolder}>Save</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Delete Folder Confirmation */}
            {deleteFolderConfirm.open && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-[#1a1a1a] p-6 rounded-xl w-96 shadow-xl">
                  <h2 className="text-lg text-white mb-4">Delete folder</h2>
                  <p className="text-sm text-gray-300 mb-4">
                    Are you sure you want to delete this folder? Boards inside
                    will move to "No Folder".
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setDeleteFolderConfirm({ open: false, folderId: null })
                      }
                    >
                      Cancel
                    </Button>
                    <Button onClick={deleteFolder}>Delete Folder</Button>
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
