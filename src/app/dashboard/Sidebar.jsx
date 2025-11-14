"use client";

// components/Sidebar.jsx

import {
  BookOpenText,
  PackagePlus,
  Search,
  Brush,
  Folder,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  UserRoundCog,
  ScrollText,
  Settings,
  LogOut as LucideLogOut,
} from "lucide-react";

export default function Sidebar({
  ICONS,
  createNewBoard,
  openCreateFolderModal,
  favorites,
  data,
  folderList,
  noFolderBoards,
  openBoard,
  handleBoardMenuClick,
  handleFolderMenuClick,
  toggleFolderCollapse,
  selectedFolderId,
  setSelectedFolderId,
}) {
  return (
    <aside className="w-64 h-screen bg-[#202020] border-r border-[#2a2a2a] flex flex-col">
      {/* Top section (fixed) */}
      <div className="flex items-center justify-between px-2 py-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md">
            <img className="rounded-sm" src="/logo_sm.svg" alt="logo" />
          </div>
          <h2 className="text-white text-lg font-mono">Tenshin</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            title="Create new Board"
            onClick={createNewBoard}
            className="text-gray-300 cursor-pointer hover:text-[#a3a3a3] px-2"
          >
            <BookOpenText className="w-5 h-5" />
          </button>
          <button
            title="Create New Folder"
            onClick={openCreateFolderModal}
            className="text-gray-300 cursor-pointer hover:text-[#a3a3a3] px-2"
          >
            <PackagePlus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <nav className="flex flex-col mx-1 text-sm mb-4">
        <button className="flex items-center gap-3 text-gray-300 hover:bg-[#2a2a2a] rounded-sm p-1">
          <Search className="w-4 h-4" />
          Search
        </button>
        <button
          onClick={openCreateFolderModal}
          className="flex items-center gap-3 text-gray-300 hover:bg-[#2a2a2a] rounded-sm p-1"
        >
          <PackagePlus className="w-4 h-4" />
          New Folder
        </button>
        <button
          onClick={createNewBoard}
          className="flex items-center gap-3 text-gray-300 hover:bg-[#2a2a2a] rounded-sm p-1"
        >
          <BookOpenText className="w-4 h-4" />
          Create Board
        </button>
      </nav>

      <div className="flex-1 mx-1 scrollbar-hidden overflow-y-auto">
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
                  className="group flex items-center gap-2 cursor-pointer text-gray-300 hover:bg-[#2a2a2a] rounded-sm p-1 w-full text-left"
                >
                  <span
                    className="ml-2 text-xs px-1 py-2 rounded-md shrink-0"
                    style={{
                      background: folder ? folder.color : "#d3d3d3",
                    }}
                  ></span>
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate text-sm flex-1">{board.name}</span>
                  <span
                    className="ml-2 text-gray-400 shrink-0 px-1 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation(); // prevent button click
                      handleBoardMenuClick(e, board.id);
                    }}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </span>
                </button>
              );
            })
          ) : (
            <p className="text-gray-500 text-sm italic px-2">no favourites</p>
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
              const collapsed = (data.ui?.collapsedFolders || {})[folder.id];
              const isCollapsed = collapsed === undefined ? false : collapsed; // undefined -> expanded by default
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
                    }`}
                  >
                    {/* Collapse/Expand Button */}
                    <button
                      aria-label={
                        isCollapsed ? "Expand folder" : "Collapse folder"
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFolderCollapse(folder.id);
                      }}
                      className="px-1 py-2 text-gray-400 hover:text-gray-200 transition-colors duration-150 rounded"
                    >
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
                      className="flex items-center gap-2 w-full text-left"
                    >
                      <span
                        className="inline-flex items-center justify-center w-5 h-5 rounded-sm"
                        style={{ background: folder.color }}
                      >
                        <Icon className="w-3 h-3 text-white" />
                      </span>
                      <span className="truncate text-sm">{folder.name}</span>
                    </button>

                    {/* Three-dot menu */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFolderMenuClick(e, folder.id);
                      }}
                      aria-label="Folder options"
                      className="p-1 text-gray-400 hover:text-gray-200 rounded"
                    >
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
                              className="group flex items-center gap-2 cursor-pointer text-gray-300 hover:bg-[#2a2a2a] rounded-md p-1 w-full text-left transition-colors"
                            >
                              {/* Board icon */}
                              <Icon className="w-4 h-4 shrink-0" />

                              {/* Board name */}
                              <span className="truncate text-sm flex-1">
                                {b.name}
                              </span>

                              {/* More dots icon, only visible on hover */}
                              <span
                                className="ml-2 mr-1 text-gray-400 shrink-0 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBoardMenuClick(e, b.id);
                                }}
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </span>
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
            <h3
              onClick={() => {
                setSelectedFolderId(null);
              }}
              className="text-xs pr-full text-[#a3a3a3] font-semibold mb-2 mx-1"
            >
              No Folder
            </h3>
            <div className="flex flex-col gap-1 px-1">
              {noFolderBoards.map((board) => {
                const Icon = ICONS[board.icon] || Brush;
                return (
                  <button
                    key={board.id ?? index}
                    onClick={() => openBoard(board.id)}
                    className="group flex items-center gap-2 cursor-pointer text-gray-300 hover:bg-[#2a2a2a] rounded-md p-1 w-full text-left transition-colors"
                  >
                    {/* Board icon */}
                    <Icon className="w-4 h-4 shrink-0" />

                    {/* Board name */}
                    <span className="truncate text-sm flex-1">
                      {board.name}
                    </span>

                    {/* More dots icon, only visible on hover */}
                    <span
                      className="ml-2 mr-1 text-gray-400 shrink-0 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBoardMenuClick(e, board.id);
                      }}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-6"></div>
      </div>

      <div className="shrink-0 mb-3 pt-3 border-t border-[#2a2a2a] px-2">
        <div className="flex items-center gap-2">
          {/* Profile */}
          <button
            title="Profile"
            onClick={() => {
              window.location.href = "/profile";
            }}
            className="text-gray-300 hover:text-[#a3a3a3] p-1 cursor-pointer rounded-md transition-colors"
          >
            <UserRoundCog className="w-5 h-5" />
          </button>

          {/* Docs */}
          <button
            title="Documentation"
            onClick={() => {
              // handle docs click
            }}
            className="text-gray-300 hover:text-[#a3a3a3] p-1 cursor-pointer rounded-md transition-colors"
          >
            <ScrollText className="w-5 h-5" />
          </button>

          {/* Settings */}
          <button
            title="Settings"
            onClick={() => {
              // handle settings click
            }}
            className="text-gray-300 hover:text-[#a3a3a3] p-1 cursor-pointer rounded-md transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Log Out */}
          <button
            title="Sign out"
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/signin";
            }}
            className="text-gray-300 hover:text-[#a3a3a3] p-1 cursor-pointer rounded-md transition-colors"
          >
            <LucideLogOut className="w-5 h-5" />
          </button>

          {/* User Plan Indicator */}
          <span
            onClick={() => {
              window.location.href = "/pricing";
            }}
            className="ml-auto cursor-pointer font-mono text-xs font-semibold text-gray-200 bg-gray-700 px-2 py-1 rounded-md"
          >
            Free Plan
          </span>
        </div>
      </div>
    </aside>
  );
}
