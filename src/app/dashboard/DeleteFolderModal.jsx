import React, { useEffect } from "react";
import { Button } from "@/components/ui/button"; // adjust path

const DeleteFolderModal = ({ deleteFolderConfirm, onClose, deleteFolder }) => {
  if (!deleteFolderConfirm.open) return null;

  // Close modal on ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Prevent clicks inside modal from closing
  const handleModalClick = (e) => e.stopPropagation();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose} // clicking outside closes modal
    >
      <div
        className="bg-[#1a1a1a] p-6 rounded-xl w-96 shadow-xl"
        onClick={handleModalClick}
      >
        <h2 className="text-lg text-white mb-4">Delete folder</h2>
        <p className="text-sm text-gray-300 mb-4">
          Are you sure you want to delete this folder? Boards inside will move
          to "No Folder".
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={deleteFolder}>Delete Folder</Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteFolderModal;
