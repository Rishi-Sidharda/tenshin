"use client";

import { Ellipsis, Brush } from "lucide-react";
// ICONS will now be passed as a prop instead of imported // adjust import depending on your project

export default function RecentBoards({
  recentBoards,
  data,
  openBoard,
  handleBoardMenuClick,
  startEditingIcon,
  startRenaming,
  timeAgo,
  ICONS,
  loadingUser,
}) {
  return (
    <section className="mb-5 font-outfit">
      <h3 className="text-lg font-medium mt-20 mb-4">Recent Boards</h3>
      <div className="flex flex-wrap gap-3 py-4 justify-start">
        {/* Check if loading is true */}
        {loadingUser ? (
          // Render 5 animated placeholder boards when loading
          Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index} // Added key for mapping
              className="w-32 h-32 bg-[#202020] rounded-lg flex flex-col justify-between">
              {/* Placeholder for the folder color bar (top strip) */}
              <div className="h-2.5 w-full rounded-t-lg bg-[#2a2a2a] animate-pulse"></div>

              <div className="p-2.5 flex flex-col gap-3 h-full animate-pulse">
                {/* Placeholder for the Icon and Ellipsis menu */}
                <div className="flex items-center justify-between">
                  {/* Placeholder Icon */}
                  <div className="p-1 rounded-lg bg-[#2a2a2a] w-6 h-6"></div>
                  {/* Placeholder Ellipsis */}
                  <div className="bg-[#2a2a2] rounded-lg w-5 h-5"></div>
                </div>

                {/* Placeholder for the Title and Date */}
                <div>
                  {/* Placeholder Title */}
                  <div className="h-4 bg-[#2a2a2a] rounded w-full"></div>
                  {/* Placeholder Updated Time */}
                  <div className="h-3 bg-[#2a2a2a] rounded w-3/4 mt-2"></div>
                </div>
              </div>
            </div>
          ))
        ) : recentBoards.length === 0 ? (
          // Existing: No boards message
          <div className="flex flex-col items-center justify-center text-gray-500 h-36 rounded-md w-full bg-[#1a1a1a]">
            <p className="text-sm font-light">
              No boards yet. Create your first one!
            </p>
          </div>
        ) : (
          // Existing: Map over actual boards
          recentBoards.slice(0, 6).map((board) => {
            const Icon = ICONS[board.icon] || Brush;
            const folder = board.folderId ? data.folders[board.folderId] : null;

            return (
              <div
                key={board.id}
                className="board-card-container w-32 h-30 bg-[#202020] hover:bg-[#2a2a2a] rounded-lg flex flex-col justify-between transition-transform transform hover:-translate-y-0.5 hover:scale-105 cursor-pointer"
                onClick={() => openBoard(board.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleBoardMenuClick(e, board.id);
                }}>
                <div
                  className="h-2.5 w-full rounded-t-lg"
                  style={{
                    backgroundColor: folder ? folder.color : "#6b7280",
                  }}></div>

                <div className="p-2.5 flex flex-col gap-3 h-full">
                  <div className="flex items-center justify-between">
                    <div
                      className="p-1 rounded-lg hover:bg-[#3a3a3a] transition-transform hover:scale-110"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditingIcon(board.id);
                      }}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span
                      className="text-white p-1 rounded-lg hover:bg-[#3a3a3a]"
                      onClick={(e) => handleBoardMenuClick(e, board.id)}>
                      <Ellipsis />
                    </span>
                  </div>

                  <div>
                    <h3
                      className="text-white text-md truncate"
                      onDoubleClick={() => startRenaming(board.id, board.name)}>
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
  );
}
