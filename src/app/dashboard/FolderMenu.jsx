// src/components/FolderMenu.jsx
"use client";
import { Edit, Palette, Trash2 } from "lucide-react";

export default function FolderMenu({
  folder,
  folderMenuState,
  openEditFolderModal,
  setFolderForm,
  setEditFolderModalOpen,
  setSelectedFolderId,
  setFolderMenuState,
  FOLDER_COLORS,
  confirmDeleteFolder,
}) {
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
      onClick={(e) => e.stopPropagation()}
    >
      {/* Rename */}
      <button
        onClick={() => openEditFolderModal(folder.id)}
        className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-[#3b3b3b] rounded-md"
      >
        <Edit className="w-4 h-4 mr-2" /> Rename
      </button>

      {/* Change icon/color */}
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
        className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-[#3b3b3b] rounded-md"
      >
        <Palette className="w-4 h-4 mr-2" /> Change Color / Icon
      </button>

      <div className="border-t border-gray-700 my-1" />

      {/* Delete */}
      <button
        onClick={() => confirmDeleteFolder(folder.id)}
        className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-red-900/40 rounded-md"
      >
        <Trash2 className="w-4 h-4 mr-2" /> Delete Folder
      </button>
    </div>
  );
}
