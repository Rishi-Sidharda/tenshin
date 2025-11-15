import React, { useEffect } from "react";
import { Button } from "@/components/ui/button"; // adjust path
import { Input } from "@/components/ui/input"; // adjust path

const EditFolderModal = ({
  folderForm,
  setFolderForm,
  availableIcons,
  ICONS,
  FOLDER_COLORS,
  saveEditFolder,
  onClose, // callback to close modal
}) => {
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
        <h2 className="text-lg text-white mb-4">Edit Folder</h2>

        {/* Folder name */}
        <Input
          value={folderForm.name}
          onChange={(e) =>
            setFolderForm((s) => ({ ...s, name: e.target.value }))
          }
          placeholder="Folder name"
          className="mb-4"
          autoFocus
        />

        {/* Pick an icon */}
        <div className="mb-3">
          <div className="text-sm text-gray-300 mb-2">Pick an icon</div>
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

        {/* Pick a color */}
        <div className="mb-4">
          <div className="text-sm text-gray-300 mb-2">Pick a color</div>
          <div className="flex gap-2">
            {FOLDER_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setFolderForm((s) => ({ ...s, color: c }))}
                className={`w-8 h-8 rounded ${
                  folderForm.color === c ? "ring-2 ring-offset-1" : ""
                }`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={saveEditFolder}>Save</Button>
        </div>
      </div>
    </div>
  );
};

export default EditFolderModal;
