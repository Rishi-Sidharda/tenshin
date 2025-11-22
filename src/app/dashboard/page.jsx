"use client";

import { useEffect, useState, useCallback } from "react";
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
import BoardSearch from "./modals/BoardSearchModal";

// --- IMPORT NEW ASYNCHRONOUS STORAGE FUNCTIONS ---
// Assuming these are in a separate file (e.g., /lib/dashboardStorage.js)
import {
  loadDashboardData,
  saveDashboardMetadata,
  deleteBoardFromDashboard,
} from "@/lib/dashboardStorage";

export default function DashboardPage() {
  const router = useRouter();

  // app state
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [data, setData] = useState({
    folders: {},
    boards: {},
    ui: { collapsedFolders: {} },
    boardsData: {}, // This will still be loaded but is now part of the data state
  });

  // UI state (rest of UI state remains the same)
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [deleteFolderConfirm, setDeleteFolderConfirm] = useState({
    open: false,
    folderId: null,
  });
  const [folderForm, setFolderForm] = useState({
    name: "",
    icon: "Folder",
    color: "#8B5CF6",
  });

  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const availableIcons = Object.keys(ICONS);

  // Keys for IndexedDB
  const [STORAGE_KEY, SET_STORAGE_KEY] = useState(null);
  const [BOARD_DATA_KEY, SET_BOARD_DATA_KEY] = useState(null);

  // ----------------------- ASYNCHRONOUS STORAGE HANDLERS -----------------------

  /**
   * Replaces saveToStorage. Uses useCallback to ensure function stability.
   * Only saves the metadata part to tenshinStore.
   */
  const saveMetadata = useCallback(
    async (newData) => {
      if (!STORAGE_KEY) return; // Guard clause

      // 1. Prepare metadata object
      const metadata = {
        folders: newData.folders,
        boards: newData.boards,
        ui: newData.ui,
      };

      try {
        // 2. Write to IndexedDB
        await saveDashboardMetadata({ metadata, STORAGE_KEY, user });

        // 3. Update local state
        setData((currentData) => ({
          ...currentData, // Keep boardsData intact
          ...metadata,
        }));
      } catch (e) {
        console.error("saveMetadata error", e);
      }
    },
    [STORAGE_KEY, user]
  );

  // ----------------------- BOARD CRUD -----------------------

  const createNewBoard = useCallback(() => {
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

    const newData = {
      folders: { ...(data.folders || {}) },
      boards: { ...(data.boards || {}), [id]: newMeta },
      ui: { ...(data.ui || { collapsedFolders: {} }) },
    };

    if (assignedFolderId && newData.folders[assignedFolderId]) {
      const f = { ...newData.folders[assignedFolderId] };
      f.boards = Array.from(new Set([...(f.boards || []), id]));
      newData.folders[assignedFolderId] = f;
    }

    // Use the new async save function
    saveMetadata(newData);
  }, [data.folders, data.boards, data.ui, selectedFolderId, saveMetadata]);

  const saveBoardName = useCallback(
    (id) => {
      const trimmed = (newBoardName || "").trim();
      if (!trimmed) {
        setErrorMessage("Board name cannot be empty.");
        return;
      }
      const newData = { ...data, boards: { ...(data.boards || {}) } };
      if (!newData.boards[id]) return;
      newData.boards[id].name = trimmed;

      // Use the new async save function
      saveMetadata(newData);
      setEditingBoardId(null);
      setErrorMessage("");
    },
    [data, newBoardName, saveMetadata]
  );

  const saveIcon = useCallback(
    (id, iconName) => {
      const newData = { ...data, boards: { ...(data.boards || {}) } };
      if (!newData.boards[id]) return;
      newData.boards[id].icon = iconName;
      saveMetadata(newData);
      setEditingIconId(null);
    },
    [data, saveMetadata]
  );

  const toggleFavorite = useCallback(
    (id) => {
      const newData = { ...data, boards: { ...(data.boards || {}) } };
      if (!newData.boards[id]) return;
      newData.boards[id].isFavorite = !newData.boards[id].isFavorite;
      saveMetadata(newData);
      setBoardMenuState({ open: false, x: 0, y: 0, boardId: null });
    },
    [data, saveMetadata]
  );

  const moveBoardToFolder = useCallback(
    (boardId, folderId) => {
      const newData = {
        boards: { ...(data.boards || {}) },
        folders: { ...(data.folders || {}) },
        ui: { ...(data.ui || { collapsedFolders: {} }) },
      };
      const board = newData.boards[boardId];
      if (!board) return;

      // ... (rest of moveBoardToFolder logic remains the same) ...
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

      saveMetadata(newData);
      setBoardMenuState({ open: false, x: 0, y: 0, boardId: null });
    },
    [data, saveMetadata]
  );

  /**
   * Replaces the synchronous deleteBoard function with an asynchronous one.
   */
  const deleteBoard = useCallback(
    async (id) => {
      if (!STORAGE_KEY || !BOARD_DATA_KEY) return;

      try {
        const updatedMetadata = await deleteBoardFromDashboard({
          boardId: id,
          data,
          STORAGE_KEY,
          BOARD_DATA_KEY,
        });

        // Update local state with the returned metadata (folders, boards, ui)
        setData((currentData) => ({
          ...currentData,
          ...updatedMetadata,
        }));
      } catch (e) {
        console.error("Async deleteBoard failed:", e);
      }

      setBoardMenuState({ open: false, x: 0, y: 0, boardId: null });
    },
    [data, STORAGE_KEY, BOARD_DATA_KEY]
  );

  // ----------------------- FOLDER CRUD -----------------------

  const createFolder = useCallback(() => {
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
    saveMetadata(newData);
    setCreateFolderModalOpen(false);
    setSelectedFolderId(id);
  }, [data, folderForm, saveMetadata]);

  const saveEditFolder = useCallback(() => {
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
    saveMetadata(newData);
    setEditFolderModalOpen(false);
    setSelectedFolderId(null);
  }, [data, selectedFolderId, folderForm, saveMetadata]);

  const deleteFolder = useCallback(() => {
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

    saveMetadata(newData);
    setDeleteFolderConfirm({ open: false, folderId: null });
    if (selectedFolderId === id) setSelectedFolderId("none");
  }, [data, deleteFolderConfirm.folderId, selectedFolderId, saveMetadata]);

  const toggleFolderCollapse = useCallback(
    (folderId) => {
      const newUi = {
        ...(data.ui || { collapsedFolders: {} }),
        collapsedFolders: { ...(data.ui?.collapsedFolders || {}) },
      };
      const current = newUi.collapsedFolders[folderId];
      newUi.collapsedFolders[folderId] = !current;
      const newData = { ...data, ui: newUi };
      saveMetadata(newData);
    },
    [data, saveMetadata]
  );

  // ----------------------- INITIAL LOAD & AUTH -----------------------

  // Authentication and Key Setting (Remains the same)
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
          window.location.href = "/signin";
        }
      } catch (e) {
        console.error("supabase getUser failed", e);
      } finally {
        setLoadingUser(false);
      }
    };
    getUser();
  }, []);

  // --- MODIFIED: ASYNCHRONOUS Data loading waits for user-specific keys ---
  useEffect(() => {
    // This runs only when the keys are available
    if (STORAGE_KEY && BOARD_DATA_KEY) {
      const loadData = async () => {
        const loaded = await loadDashboardData({
          STORAGE_KEY,
          BOARD_DATA_KEY,
          user,
        });

        setData(loaded);

        // Ensure UI state is initialized if missing
        if (!loaded.ui || !loaded.ui.collapsedFolders) {
          const newData = { ...loaded, ui: { collapsedFolders: {} } };
          // Save immediately to fix the UI structure if it's broken/missing
          await saveDashboardMetadata({
            metadata: newData,
            STORAGE_KEY,
            user,
          });
        }
      };
      loadData();
    }
  }, [STORAGE_KEY, BOARD_DATA_KEY, user]);
  // -------------------------------------------------------------

  // ----------------------- DERIVED LISTS -----------------------
  // ... (Derived lists remain the same) ...
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

  // ----------------------- OTHER HANDLERS -----------------------

  const openBoard = (id) => {
    setBoardLoading(true);
    router.push(`/board?id=${encodeURIComponent(id)}`);
  };

  const startRenaming = (id, currentName) => {
    setEditingBoardId(id);
    setNewBoardName(currentName || "");
    setErrorMessage("");
    setBoardMenuState({ open: false, x: 0, y: 0, boardId: null });
  };

  const startEditingIcon = (id) => {
    setEditingIconId(id);
    setBoardMenuState({ open: false, x: 0, y: 0, boardId: null });
  };

  const openCreateFolderModal = () => {
    setFolderForm({
      name: "New Folder",
      icon: "Folder",
      color: FOLDER_COLORS[0],
    });
    setCreateFolderModalOpen(true);
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

  const confirmDeleteFolder = (folderId) => {
    setDeleteFolderConfirm({ open: true, folderId });
    setFolderMenuState({ open: false, x: 0, y: 0, folderId: null });
  };

  const handleSearch = () => {
    setSearchOpen(true);
  };

  // ----------------------- HELPERS -----------------------
  function timeAgo(dateString) {
    if (!dateString) return "just now";
    // ... (timeAgo logic remains the same) ...
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
          handleSearch={handleSearch}
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
            {searchOpen && (
              <BoardSearch
                boards={data.boards}
                openBoard={openBoard}
                ICONS={ICONS}
                onClose={() => setSearchOpen(false)}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
