"use client";
import { ExternalLink, Edit, Star, Trash2 } from "lucide-react";

export default function BoardMenu({
  board,
  boardMenuState,
  folderList,
  data,
  openBoard,
  startRenaming,
  startEditingIcon,
  moveBoardToFolder,
  toggleFavorite,
  deleteBoard,
}) {
  if (!boardMenuState.open || !boardMenuState.boardId) return null;
  if (!board) return null;

  const menuWidth = 240;
  const menuHeight = 320;
  const padding = 8;

  let left = boardMenuState.x + padding;
  if (left + menuWidth > window.innerWidth)
    left = boardMenuState.x - menuWidth - padding;

  let top = boardMenuState.y + padding;
  if (top + menuHeight > window.innerHeight)
    top = window.innerHeight - menuHeight - padding;

  const submenuWidth = 240;

  return (
    <div
      className="board-menu absolute z-50 w-56 bg-[#2a2a2a] rounded-md shadow-xl p-1"
      style={{ left, top }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Open */}
      <button
        onClick={() => openBoard(boardMenuState.boardId)}
        className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-[#3b3b3b] rounded-md"
      >
        <ExternalLink className="w-4 h-4 mr-2" /> Open
      </button>

      {/* Rename */}
      <button
        onClick={() => startRenaming(boardMenuState.boardId, board.name)}
        className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-[#3b3b3b] rounded-md"
      >
        <Edit className="w-4 h-4 mr-2" /> Rename
      </button>

      {/* Change Icon */}
      <button
        onClick={() => startEditingIcon(boardMenuState.boardId)}
        className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-[#3b3b3b] rounded-md"
      >
        <Edit className="w-4 h-4 mr-2" /> Change Icon
      </button>

      <div className="border-t border-gray-700 my-1" />

      {/* Move submenu */}
      <div className="relative group">
        <button className="flex items-center justify-between w-full px-3 py-2 text-sm text-gray-300 hover:bg-[#3b3b3b] rounded-md">
          Move to folder
          <span className="ml-2">&gt;</span>
        </button>

        <div
          className="absolute top-0 max-h-80 overflow-y-auto rounded-md bg-[#2a2a2a] scrollbar-hidden shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50"
          style={{
            minWidth: submenuWidth,
            left:
              left + menuWidth + submenuWidth > window.innerWidth
                ? `-${submenuWidth}px`
                : "100%",
          }}
        >
          <button
            onClick={() => moveBoardToFolder(boardMenuState.boardId, null)}
            className="w-full text-left px-3 py-2 text-sm hover:bg-[#3b3b3b] rounded-md"
          >
            No Folder
          </button>

          {folderList.map((f) => (
            <button
              key={f.id}
              onClick={() => moveBoardToFolder(boardMenuState.boardId, f.id)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-[#3b3b3b] rounded-md flex items-center"
            >
              <span
                className="inline-block w-3 h-3 mr-2 rounded-sm"
                style={{ background: f.color }}
              ></span>
              {f.name}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-700 my-1" />

      {/* Favorite */}
      <button
        onClick={() => toggleFavorite(boardMenuState.boardId)}
        className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-[#3b3b3b] rounded-md"
      >
        <Star className="w-4 h-4 mr-2" />
        {data.boards[boardMenuState.boardId]?.isFavorite
          ? "Remove Favorite"
          : "Add to Favorites"}
      </button>

      {/* Delete */}
      <button
        onClick={() => {
          if (window.confirm(`Delete board: ${board.name}?`))
            deleteBoard(boardMenuState.boardId);
        }}
        className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-red-900/40 rounded-md"
      >
        <Trash2 className="w-4 h-4 mr-2" /> Delete
      </button>
    </div>
  );
}
