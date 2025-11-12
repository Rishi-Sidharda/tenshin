"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Edit,
  Trash2,
  ExternalLink,
  Ellipsis,
  Search,
  FolderPlus,
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
  FilePlus,
  LogOut,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  BookOpenText,
  MoreHorizontal,
} from "lucide-react";

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
  const [menuState, setMenuState] = useState({
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
    setMenuState({ open: false, x: 0, y: 0, boardId: null });
  };

  const startRenaming = (id, currentName) => {
    setEditingBoardId(id);
    setNewBoardName(currentName || "");
    setErrorMessage("");
    setMenuState({ open: false, x: 0, y: 0, boardId: null });
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
    setMenuState({ open: false, x: 0, y: 0, boardId: null });
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
    setMenuState({ open: false, x: 0, y: 0, boardId: null });
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
      setMenuState({ open: false, x: 0, y: 0, boardId: null });
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
      updatedAt: new Date().toISOString(),
    };

    if (folderId && newData.folders[folderId]) {
      const dest = { ...newData.folders[folderId] };
      dest.boards = Array.from(new Set([...(dest.boards || []), boardId]));
      newData.folders[folderId] = dest;
    }

    saveToStorage(newData);
    setMenuState({ open: false, x: 0, y: 0, boardId: null });
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
        (menuState.open &&
          !event.target.closest(".board-menu") &&
          !event.target.closest(".board-card-container")) ||
        (folderMenuState.open &&
          !event.target.closest(".folder-menu") &&
          !event.target.closest(".folder-item"))
      ) {
        setMenuState({ open: false, x: 0, y: 0, boardId: null });
        setFolderMenuState({ open: false, x: 0, y: 0, folderId: null });
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [menuState.open, folderMenuState.open]);

  // Board menu component
  function BoardMenu({ board }) {
    if (!menuState.open || !menuState.boardId) return null;
    if (!board) return null;
    const menuWidth = 240;
    const menuHeight = 320;
    const padding = 8;
    let left = menuState.x + padding;
    if (left + menuWidth > window.innerWidth)
      left = menuState.x - menuWidth - padding;
    let top = menuState.y + padding;
    if (top + menuHeight > window.innerHeight)
      top = window.innerHeight - menuHeight - padding;

    return (
      <div
        className="board-menu absolute z-50 w-56 bg-[#2a2a2a] rounded-md shadow-xl p-1"
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

        <div className="border-t border-gray-700 my-1" />

        <div className="px-2 py-1 text-sm text-gray-300">Move to folder</div>
        <div className="max-h-40 overflow-y-auto p-1">
          <button
            onClick={() => moveBoardToFolder(menuState.boardId, null)}
            className="w-full text-left px-3 py-1 text-sm hover:bg-[#3b3b3b] rounded-md">
            No Folder
          </button>
          {folderList.map((f) => (
            <button
              key={f.id}
              onClick={() => moveBoardToFolder(menuState.boardId, f.id)}
              className="w-full text-left px-3 py-1 text-sm hover:bg-[#3b3b3b] rounded-md">
              <span
                className="inline-block w-3 h-3 mr-2 rounded-sm"
                style={{ background: f.color }}></span>
              {f.name}
            </button>
          ))}
        </div>

        <div className="border-t border-gray-700 my-1" />

        <button
          onClick={() => toggleFavorite(menuState.boardId)}
          className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-[#3b3b3b] rounded-md">
          <Star className="w-4 h-4 mr-2" />{" "}
          {data.boards[menuState.boardId]?.isFavorite
            ? "Remove Favorite"
            : "Add to Favorites"}
        </button>

        <button
          onClick={() => {
            if (window.confirm(`Delete board: ${board.name}?`))
              deleteBoard(menuState.boardId);
          }}
          className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-red-900/40 rounded-md">
          <Trash2 className="w-4 h-4 mr-2" /> Delete
        </button>
      </div>
    );
  }

  // Folder menu component
  function FolderMenu({ folder }) {
    if (!folderMenuState.open || !folderMenuState.folderId) return null;
    if (!folder) return null;
    const menuWidth = 200;
    const menuHeight = 160;
    const padding = 8;
    let left = folderMenuState.x + padding;
    if (left + menuWidth > window.innerWidth)
      left = folderMenuState.x - menuWidth - padding;
    let top = folderMenuState.y + padding;
    if (top + menuHeight > window.innerHeight)
      top = window.innerHeight - menuHeight - padding;

    return (
      <div
        className="folder-menu absolute z-50 w-50 bg-[#2a2a2a] rounded-md shadow-xl p-1"
        style={{ left, top }}
        onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => openEditFolderModal(folder.id)}
          className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-[#3b3b3b] rounded-md">
          <Edit className="w-4 h-4 mr-2" /> Rename
        </button>

        <button
          onClick={() => {
            setFolderForm({
              name: folder.name,
              icon: folder.icon || "Folder",
              color: folder.color || FOLDER_COLORS[0],
            });
            setEditFolderModalOpen(true);
            setSelectedFolderId(folder.id);
            setFolderMenuState({ open: false, x: 0, y: 0, folderId: null });
          }}
          className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-[#3b3b3b] rounded-md">
          <Palette className="w-4 h-4 mr-2" /> Change Color / Icon
        </button>

        <div className="border-t border-gray-700 my-1"></div>

        <button
          onClick={() => confirmDeleteFolder(folder.id)}
          className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-red-900/40 rounded-md">
          <Trash2 className="w-4 h-4 mr-2" /> Delete Folder
        </button>
      </div>
    );
  }

  // Render
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

            <div className="flex items-center gap-2">
              <button
                onClick={createNewBoard}
                className="text-gray-300 hover:text-[#a3a3a3] cursor-pointer px-2 transition-colors"
                title="Board">
                <FilePlus className="w-5 h-5" />
              </button>
              <button
                onClick={openCreateFolderModal}
                className="text-gray-300 hover:text-[#a3a3a3] cursor-pointer px-2 transition-colors"
                title="Folder">
                <FolderPlus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <nav className="flex flex-col text-sm mb-4">
            <button className="flex items-center gap-3 text-gray-300 hover:bg-[#2a2a2a] rounded-sm p-1">
              <Search className="w-4 h-4" />
              Search
            </button>
            <button
              onClick={openCreateFolderModal}
              className="flex items-center gap-3 text-gray-300 hover:bg-[#2a2a2a] rounded-sm p-1">
              <PackagePlus className="w-4 h-4" />
              New Folder
            </button>
            <button
              onClick={createNewBoard}
              className="flex items-center gap-3 text-gray-300 hover:bg-[#2a2a2a] rounded-sm p-1">
              <BookOpenText className="w-4 h-4" />
              Create Board
            </button>
          </nav>

          <div className="flex-1 overflow-y-auto">
            {/* Favorites */}
            <h3 className="text-xs text-[#a3a3a3] font-semibold mb-2 mx-1">
              Favourites
            </h3>
            <div className="flex flex-col">
              {favorites.length > 0 ? (
                favorites.map((board) => {
                  const Icon = ICONS[board.icon] || Brush;
                  const folder = board.folderId
                    ? data.folders[board.folderId]
                    : null;
                  return (
                    <button
                      key={board.id}
                      onClick={() => openBoard(board.id)}
                      className="flex items-center gap-2 cursor-pointer text-gray-300 hover:bg-[#2a2a2a] rounded-sm p-1 w-full text-left">
                      <Icon className="w-4 h-4" />
                      <span className="truncate text-sm">{board.name}</span>
                      {folder && (
                        <span
                          className="ml-auto text-xs px-2 py-0.5 rounded"
                          style={{ background: folder.color }}>
                          {folder.name}
                        </span>
                      )}
                    </button>
                  );
                })
              ) : (
                <p className="text-gray-600 text-sm px-2">No favourites</p>
              )}
            </div>

            {/* Folders */}
            <h3 className="text-xs text-[#a3a3a3] font-semibold mt-4 mb-2 mx-1">
              Folders
            </h3>
            <div className="flex flex-col">
              {folderList.length === 0 ? (
                <p className="text-gray-600 text-sm px-2 mt-2">No folders</p>
              ) : (
                folderList.map((folder) => {
                  const Icon = ICONS[folder.icon] || Folder;
                  const collapsed = (data.ui?.collapsedFolders || {})[
                    folder.id
                  ];
                  const isCollapsed =
                    collapsed === undefined ? false : collapsed; // undefined -> expanded by default
                  const folderBoards = (folder.boards || [])
                    .map((id) => data.boards[id])
                    .filter(Boolean)
                    .sort(
                      (a, b) =>
                        new Date(b.updatedAt).getTime() -
                        new Date(a.updatedAt).getTime()
                    );

                  return (
                    <div key={folder.id} className="relative">
                      <div
                        className={`folder-item flex items-center mb-1 text-gray-300 hover:bg-[#2a2a2a] rounded-sm px-1 w-full text-left ${
                          selectedFolderId === folder.id ? "bg-[#2a2a2a]" : ""
                        }`}>
                        {/* Collapse/Expand Button */}
                        <button
                          aria-label={
                            isCollapsed ? "Expand folder" : "Collapse folder"
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFolderCollapse(folder.id);
                          }}
                          className="px-1 py-2 text-gray-400 hover:text-gray-200 transition-colors duration-150 rounded">
                          {isCollapsed ? (
                            <ChevronRight className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>

                        {/* Folder Info */}
                        <button
                          onClick={() => {
                            toggleFolderCollapse(folder.id);
                            setSelectedFolderId(folder.id);
                          }}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            handleFolderMenuClick(e, folder.id);
                          }}
                          className="flex items-center gap-2 w-full text-left">
                          <span
                            className="inline-flex items-center justify-center w-5 h-5 rounded-sm"
                            style={{ background: folder.color }}>
                            <Icon className="w-3 h-3 text-white" />
                          </span>
                          <span className="truncate text-sm">
                            {folder.name}
                          </span>
                        </button>

                        {/* Three-dot menu */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFolderMenuClick(e, folder.id);
                          }}
                          aria-label="Folder options"
                          className="p-1 text-gray-400 hover:text-gray-200 rounded">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>

                      {!isCollapsed && (
                        <div className="ml-6 mt-1 mb-2 flex flex-col gap-1">
                          {folderBoards.length ? (
                            folderBoards.map((b, index) => {
                              // Dynamically assign the icon for this board
                              const Icon = ICONS[b.icon] || Brush;

                              return (
                                <button
                                  key={b.id ?? index}
                                  onClick={() => openBoard(b.id)}
                                  className="flex items-center gap-2 cursor-pointer text-gray-300 hover:bg-[#2a2a2a] rounded-sm p-1 w-full text-left">
                                  {/* Board icon */}
                                  <Icon className="w-4 h-4" />

                                  {/* Board name */}
                                  <span className="truncate text-sm">
                                    {b.name}
                                  </span>

                                  {/* Optional folder badge */}
                                  {b.folder && (
                                    <span
                                      className="ml-auto text-xs px-2 py-0.5 rounded"
                                      style={{ background: b.folder.color }}>
                                      {b.folder.name}
                                    </span>
                                  )}
                                </button>
                              );
                            })
                          ) : (
                            <div className="text-xs text-gray-500 italic">
                              Empty
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Boards with no folder */}
            {noFolderBoards.length > 0 && (
              <div className="mt-2">
                <h3 className="text-xs text-[#a3a3a3] font-semibold mb-2 mx-1">
                  No Folder
                </h3>
                <div className="flex flex-col gap-1 px-1">
                  {noFolderBoards.map((board) => {
                    const Icon = ICONS[board.icon] || Brush;
                    return (
                      <button
                        key={board.id}
                        onClick={() => openBoard(board.id)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          handleMenuClick(e, board.id);
                        }}
                        className="flex items-center gap-2 text-gray-300 hover:bg-[#2a2a2a] rounded-sm p-1 w-full text-left">
                        <Icon className="w-4 h-4" />
                        <span className="truncate text-sm">{board.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-6"></div>
          </div>

          <div className="pt-4 border-t border-[#2a2a2a]">
            <div className="flex items-center justify-between px-1">
              <div className="text-xs text-gray-400">ok</div>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/signin";
                }}
                className="text-gray-300 hover:text-[#a3a3a3]">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 p-6 flex justify-center">
          <div className="w-full max-w-5xl">
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
                          onClick={() => openBoard(board.id)}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            handleMenuClick(e, board.id);
                          }}>
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
              <BoardMenu board={data.boards[menuState.boardId]} />
            )}
            {folderMenuState.open && folderMenuState.folderId && (
              <FolderMenu folder={data.folders[folderMenuState.folderId]} />
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
                            }`}>
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
                      onClick={() => setCreateFolderModalOpen(false)}>
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
                            }`}>
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
                      }}>
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
                      }>
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
