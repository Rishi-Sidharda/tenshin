"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
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
import BoardMenu from "./BoardMenu";
import FolderMenu from "./FolderMenu";
import Sidebar from "./Sidebar";
import RecentBoards from "./RecentBoardSection";
import SelectFolderViewSection from "./SelectFolderViewSection";
import RenameBoardModal from "./RenameBoardModal";
import IconPickerModal from "./IconPickerModal";
import CreateFolderModal from "./CreateFolderModal";
import EditFolderModal from "./EditFolderModal";
import DeleteFolderModal from "./DeleteFolderModal";

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
  const [selectedFolderId, setSelectedFolderId] = useState("all");

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
      <div className="fixed top-0 left-0 h-full w-64">
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
      </div>
      <main className="flex-1 flex">
        {/* Main */}
        <div className="flex-1 ml-64 p-6 flex justify-center">
          <div className="w-full max-w-5xl mx-auto">
            <RecentBoards
              recentBoards={recentBoards}
              data={data}
              openBoard={openBoard}
              handleBoardMenuClick={handleBoardMenuClick}
              startEditingIcon={startEditingIcon}
              startRenaming={startRenaming}
              timeAgo={timeAgo}
              ICONS={ICONS} // <-- pass icons here
            />

            <SelectFolderViewSection
              data={data}
              selectedFolderId={selectedFolderId}
              setSelectedFolderId={setSelectedFolderId}
              dropdownOpen={dropdownOpen}
              setDropdownOpen={setDropdownOpen}
              ICONS={ICONS}
              timeAgo={timeAgo}
              startEditingIcon={startEditingIcon}
              startRenaming={startRenaming}
              handleBoardMenuClick={handleBoardMenuClick}
              openBoard={openBoard}
            />

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
              <RenameBoardModal
                newBoardName={newBoardName}
                setNewBoardName={setNewBoardName}
                saveBoardName={saveBoardName}
                setEditingBoardId={setEditingBoardId}
                editingBoardId={editingBoardId}
                errorMessage={errorMessage}
                setErrorMessage={setErrorMessage}
              />
            )}

            {/* Icon Picker Modal */}
            {editingIconId && (
              <IconPickerModal
                availableIcons={availableIcons}
                ICONS={ICONS}
                editingIconId={editingIconId}
                saveIcon={saveIcon}
                setEditingIconId={setEditingIconId}
              />
            )}

            {/* Create Folder Modal */}
            {createFolderModalOpen && (
              <CreateFolderModal
                folderForm={folderForm}
                setFolderForm={setFolderForm}
                availableIcons={availableIcons}
                ICONS={ICONS}
                FOLDER_COLORS={FOLDER_COLORS}
                createFolder={createFolder}
                onClose={() => setCreateFolderModalOpen(false)}
              />
            )}

            {/* Edit Folder Modal */}
            {editFolderModalOpen && (
              <EditFolderModal
                folderForm={folderForm}
                setFolderForm={setFolderForm}
                availableIcons={availableIcons}
                ICONS={ICONS}
                FOLDER_COLORS={FOLDER_COLORS}
                saveEditFolder={saveEditFolder}
                onClose={() => {
                  setEditFolderModalOpen(false);
                  setSelectedFolderId(null);
                }}
              />
            )}

            {/* Delete Folder Confirmation */}
            {deleteFolderConfirm.open && (
              <DeleteFolderModal
                deleteFolderConfirm={deleteFolderConfirm}
                onClose={() =>
                  setDeleteFolderConfirm({ open: false, folderId: null })
                }
                deleteFolder={deleteFolder}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
