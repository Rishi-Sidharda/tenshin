"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ICONS, FOLDER_COLORS } from "@/lib/settings";
import BoardMenu from "./menus/BoardMenu";
import FolderMenu from "./menus/FolderMenu";
import Sidebar from "./sections/Sidebar";
import RecentBoards from "./sections/RecentBoardSection";
import SelectFolderViewSection from "./sections/SelectFolderViewSection";
import RenameBoardModal from "./modals/RenameBoardModal";
import IconPickerModal from "./modals/IconPickerModal";
import CreateFolderModal from "./modals/CreateFolderModal";
import EditFolderModal from "./modals/EditFolderModal";
import DeleteFolderModal from "./modals/DeleteFolderModal";
import ProfilePage from "./sections/ProfileSection";

export default function DashboardPage() {
  const router = useRouter();
  // app state
  const [user, setUser] = useState(null);

  // ADDED: State for the user's profile data from the 'profiles' table
  const [userProfile, setUserProfile] = useState(null);
  // ADDED: State to track if the initial user/profile data is loading
  const [loadingUser, setLoadingUser] = useState(true);
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
  const [dropDownSelectedId, setDropDownSelectedId] = useState("all");

  const [profilePageVisibility, setProfilePageVisibility] = useState(false);
  const [boardLoading, setBoardLoading] = useState(false);

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
  const [selectedFolderId, setSelectedFolderId] = useState("none");

  const availableIcons = Object.keys(ICONS);

  // --- MODIFIED: Initial state is null, will be set after auth ---
  const [STORAGE_KEY, SET_STORAGE_KEY] = useState(null);
  const [BOARD_DATA_KEY, SET_BOARD_DATA_KEY] = useState(null);
  // ----------------------------------------------------------------

  function loadFromStorage() {
    if (!STORAGE_KEY || !BOARD_DATA_KEY) {
      // Return default data if keys are not ready
      return {
        folders: {},
        boards: {},
        ui: { collapsedFolders: {} },
        boardsData: {},
        userId: null,
      };
    }

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

        // --- MODIFIED: Return userId from storage ---
        return { folders, boards, ui, boardsData, userId: parsed.userId };
        // --------------------------------------------
      }

      // --- Migration from old "boards" key (Only runs if new user-specific keys are empty) ---
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
        const currentUserId = user ? user.id : "unknown-migrated";
        // --- MODIFIED: Add userId to the migrated data before saving ---
        const newTopWithId = { ...newTop, userId: currentUserId };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(newTopWithId));
        localStorage.setItem(BOARD_DATA_KEY, JSON.stringify(newBoardsData));

        try {
          localStorage.removeItem("boards");
        } catch (e) {}

        // --- MODIFIED: Return userId for state ---
        return {
          folders: {},
          boards,
          ui: { collapsedFolders: {} },
          boardsData: newBoardsData,
          userId: currentUserId,
        };
        // -------------------------------------------
      }

      // nothing found
      // --- MODIFIED: Return current user ID if nothing found ---
      return {
        folders: {},
        boards: {},
        ui: { collapsedFolders: {} },
        boardsData: {},
        userId: user ? user.id : null,
      };
      // ---------------------------------------------------------
    } catch (e) {
      console.error("loadFromStorage error", e);
      // --- MODIFIED: Return current user ID on error ---
      return {
        folders: {},
        boards: {},
        ui: { collapsedFolders: {} },
        boardsData: {},
        userId: user ? user.id : null,
      };
      // -------------------------------------------------
    }
  }

  function saveToStorage({ folders, boards, ui }) {
    if (!STORAGE_KEY) return; // Guard clause: do nothing if keys aren't set

    try {
      // Load existing tenshin data to preserve anything not included in the update
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
        boards: {},
        folders: {},
        ui: { collapsedFolders: {} },
        // --- MODIFIED: Ensure existing structure has userId ---
        userId: user ? user.id : null,
      };

      const merged = {
        // --- ADDED: Ensure userId is always saved ---
        userId: existing.userId || (user ? user.id : null),
        // ---------------------------------------------
        folders: folders ?? existing.folders,
        boards: boards ?? existing.boards,
        ui: ui ?? existing.ui,
      };

      // Write only the tenshin metadata (NO boardData here)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));

      // Update app state
      setData((currentData) => ({
        ...currentData, // Keep boardsData intact
        folders: merged.folders,
        boards: merged.boards,
        ui: merged.ui,
        // userId doesn't need to be in the main data state, but is now in local storage
      }));
    } catch (e) {
      console.error("saveToStorage error", e);
    }
  }

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

  // -----------------------------------------------------------------------------
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

    // Note: boardData is implicitly handled by the dashboard logic but not saved via saveToStorage
    // We assume the board component will save the actual elements data under the BOARD_DATA_KEY
    // For the dashboard metadata save:
    const newData = {
      folders: { ...(data.folders || {}) },
      boards: { ...(data.boards || {}), [id]: newMeta },
      ui: { ...(data.ui || { collapsedFolders: {} }) },
      // boardsData is intentionally omitted here as saveToStorage doesn't handle it
    };

    if (assignedFolderId && newData.folders[assignedFolderId]) {
      const f = { ...newData.folders[assignedFolderId] };
      f.boards = Array.from(new Set([...(f.boards || []), id]));
      newData.folders[assignedFolderId] = f;
    }

    saveToStorage(newData);
  };

  const openBoard = (id) => {
    setBoardLoading(true);
    router.push(`/board?id=${encodeURIComponent(id)}`);
  };

  const deleteBoard = (id) => {
    const newData = {
      folders: { ...(data.folders || {}) },
      boards: { ...(data.boards || {}) },
      ui: { ...(data.ui || { collapsedFolders: {} }) },
    };
    const board = newData.boards[id];
    if (!board) return;

    // Remove board ID from any folder list
    Object.keys(newData.folders).forEach((fid) => {
      const f = { ...newData.folders[fid] };
      if (Array.isArray(f.boards) && f.boards.includes(id)) {
        f.boards = f.boards.filter((b) => b !== id);
        newData.folders[fid] = f;
      }
    });

    delete newData.boards[id];
    // We would need to delete the board content from localStorage as well
    if (BOARD_DATA_KEY) {
      try {
        const boardsDataRaw = localStorage.getItem(BOARD_DATA_KEY);
        const boardsData = boardsDataRaw ? JSON.parse(boardsDataRaw) : {};
        delete boardsData[id];
        localStorage.setItem(BOARD_DATA_KEY, JSON.stringify(boardsData));
      } catch (e) {
        console.error("Failed to delete board data from storage", e);
      }
    }

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
    // boardsData is now correctly left out of saveToStorage argument
    saveToStorage(newData);
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
    saveToStorage(newData);
    setEditingIconId(null);
  };

  const toggleFavorite = (id) => {
    const newData = { ...data, boards: { ...(data.boards || {}) } };
    if (!newData.boards[id]) return;
    newData.boards[id].isFavorite = !newData.boards[id].isFavorite;
    saveToStorage(newData);
    setBoardMenuState({ open: false, x: 0, y: 0, boardId: null });
  };

  const moveBoardToFolder = (boardId, folderId) => {
    const newData = {
      boards: { ...(data.boards || {}) },
      folders: { ...(data.folders || {}) },
      ui: { ...(data.ui || { collapsedFolders: {} }) },
    };
    const board = newData.boards[boardId];
    if (!board) return;

    const prevFolderId = board.folderId || null;
    if ((prevFolderId || null) === (folderId || null)) {
      setBoardMenuState({ open: false, x: 0, y: 0, boardId: null });
      return;
    }

    // Remove from previous folder
    Object.keys(newData.folders).forEach((fid) => {
      const f = { ...newData.folders[fid] };
      if (Array.isArray(f.boards) && f.boards.includes(boardId)) {
        f.boards = f.boards.filter((b) => b !== boardId);
        newData.folders[fid] = f;
      }
    });

    // Update board metadata
    newData.boards[boardId] = {
      ...board,
      folderId: folderId || null,
    };

    // Add to new folder
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
      ui: { ...(data.ui || { collapsedFolders: {} }) },
    };

    const folder = newData.folders[id];
    // Move boards inside the folder to 'no folder'
    (folder?.boards || []).forEach((bId) => {
      if (newData.boards[bId]) newData.boards[bId].folderId = null;
    });

    delete newData.folders[id];
    // Remove collapsed state
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

  // --------------------------------------------------------------------------------------------------

  // ----------------------- INITIAL LOAD & AUTH -----------------------
  // ----------------------- INITIAL LOAD & AUTH -----------------------
  useEffect(() => {
    const getUser = async () => {
      try {
        // 1. Get Auth User
        const { data } = await supabase.auth.getUser();
        const currentUser = data?.user || null;

        if (currentUser) {
          setUser(currentUser);

          // 2. Fetch User Profile (email and plan)
          const { data: profileData } = await supabase
            .from("profiles")
            .select("email, plan")
            .eq("id", currentUser.id)
            .single();

          setUserProfile(profileData);

          // 3. Set user-specific storage keys
          const userId = currentUser.id;
          SET_STORAGE_KEY(`tenshin-${userId}`);
          SET_BOARD_DATA_KEY(`boardData-${userId}`);
        } else {
          // Redirect if not logged in
          window.location.href = "/signin";
        }
      } catch (e) {
        console.error("supabase getUser failed", e);
      } finally {
        // Set loading to false once the process is complete (success or failure)
        setLoadingUser(false);
      }
    };
    getUser();
  }, []); // Empty dependency array means this runs once on mount

  // --- MODIFIED: Data loading now waits for user-specific keys ---
  useEffect(() => {
    if (STORAGE_KEY && BOARD_DATA_KEY) {
      const loaded = loadFromStorage();
      setData(loaded);

      // Ensure UI state is initialized if missing
      if (!loaded.ui || !loaded.ui.collapsedFolders) {
        const newData = { ...loaded, ui: { collapsedFolders: {} } };
        // Save immediately to fix the UI structure if it's broken/missing
        saveToStorage(newData);
      }
    }
  }, [STORAGE_KEY, BOARD_DATA_KEY]);
  // -------------------------------------------------------------

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

  const showProfilePage = () => {
    setProfilePageVisibility(true);
  };

  const hideProfilePage = () => {
    setProfilePageVisibility(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/signin";
  };

  // Render
  return (
    <div className="min-h-screen bg-[#191919] text-gray-100 flex flex-col">
      {boardLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="text-xl font-bold flex flex-col items-center">
            <svg
              className="animate-spin h-8 w-8 text-[#ff8383] mb-3"
              viewBox="0 0 24 24">
              {/* Standard SVG spinner path */}
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading Board...
          </div>
        </div>
      )}
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
          showProfilePage={showProfilePage}
          handleLogout={handleLogout}
        />
      </div>
      <main className="flex-1 flex">
        {/* Main Content Area */}
        <div className="flex-1 ml-64 p-6 flex justify-center">
          <div className="w-full max-w-5xl mx-auto">
            {/* Conditional Rendering Logic 👇 */}
            {profilePageVisibility ? (
              // 1. If profilePageVisibility is TRUE, show only the Profile Page
              <ProfilePage
                hideProfilePage={hideProfilePage}
                authUser={user}
                initialProfile={userProfile}
                handleLogout={handleLogout}
              />
            ) : (
              // 2. If profilePageVisibility is FALSE, show the main dashboard components
              <>
                <RecentBoards
                  recentBoards={recentBoards}
                  data={data}
                  openBoard={openBoard}
                  handleBoardMenuClick={handleBoardMenuClick}
                  startEditingIcon={startEditingIcon}
                  startRenaming={startRenaming}
                  timeAgo={timeAgo}
                  ICONS={ICONS}
                  loadingUser={loadingUser}
                />

                <SelectFolderViewSection
                  data={data}
                  selectedFolderId={dropDownSelectedId}
                  setSelectedFolderId={setDropDownSelectedId}
                  dropdownOpen={dropdownOpen}
                  setDropdownOpen={setDropdownOpen}
                  ICONS={ICONS}
                  timeAgo={timeAgo}
                  startEditingIcon={startEditingIcon}
                  startRenaming={startRenaming}
                  handleBoardMenuClick={handleBoardMenuClick}
                  openBoard={openBoard}
                  loadingUser={loadingUser}
                />
              </>
            )}
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
            {/* ... (Rest of your modals: RenameBoardModal, IconPickerModal, etc.) ... */}
            {/* For brevity, the rest of the modals are omitted here but should be kept in your file. */}

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
