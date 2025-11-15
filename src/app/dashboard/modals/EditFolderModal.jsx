import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EditFolderModal = ({
  folderForm,
  setFolderForm,
  availableIcons,
  ICONS,
  FOLDER_COLORS,
  saveEditFolder,
  onClose,
}) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const modalRef = useRef();
  const colorRef = useRef();
  const iconRef = useRef();

  // Close modal on ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleModalClick = (e) => e.stopPropagation();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-[#1a1a1a] p-6 rounded-sm w-96 shadow-xl"
        onClick={handleModalClick}
      >
        <h2 className="text-lg font-jetbrains-mono text-white font-medium mb-4">
          Edit Folder
        </h2>

        {/* Horizontal row: Color, Icon, Name */}
        <div className="flex items-center gap-2 mb-6">
          {/* Color selector */}
          <div className="relative" ref={colorRef}>
            <button
              onClick={() =>
                setOpenDropdown((prev) => (prev === "color" ? null : "color"))
              }
              className="w-8 h-8 cursor-pointer rounded-md flex items-center justify-center hover:border-2 hover:border-white"
              style={{ background: folderForm.color || "#2a2a2a" }}
            />
            {openDropdown === "color" && (
              <div
                className="absolute top-full mt-2 w-60 bg-[#1a1a1a] rounded-sm border border-[#2a2a2a] shadow-lg p-2 flex flex-wrap gap-2 z-50 max-h-[50vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()} // prevent closing modal
              >
                {FOLDER_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setFolderForm((s) => ({ ...s, color: c }));
                      setOpenDropdown(null);
                    }}
                    className={`w-6 h-6 cursor-pointer rounded-md ${
                      folderForm.color === c ? "ring-1 ring-offset-1" : ""
                    }`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Icon selector */}
          <div className="relative" ref={iconRef}>
            <button
              onClick={() =>
                setOpenDropdown((prev) => (prev === "icon" ? null : "icon"))
              }
              className="w-8.5 h-8.5 cursor-pointer rounded-md bg-[#2a2a2a] hover:bg-[#3a3a3a] flex items-center justify-center"
            >
              {folderForm.icon ? (
                React.createElement(ICONS[folderForm.icon], {
                  className: "w-5 h-5 text-gray-200",
                })
              ) : (
                <span className="text-gray-500 text-sm">?</span>
              )}
            </button>
            {openDropdown === "icon" && (
              <div
                className="absolute top-full mt-2 w-60 bg-[#1a1a1a] border border-[#2a2a2a] rounded-sm shadow-lg p-2 flex flex-wrap gap-2 z-50 max-h-[50vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {availableIcons.map((iconName) => {
                  const Icon = ICONS[iconName];
                  return (
                    <button
                      key={iconName}
                      onClick={() => {
                        setFolderForm((s) => ({ ...s, icon: iconName }));
                        setOpenDropdown(null);
                      }}
                      className="w-7 h-7 cursor-pointer rounded-md flex items-center justify-center hover:bg-[#333]"
                    >
                      <Icon className="w-5 h-5 text-gray-200" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Name input */}
          <Input
            value={folderForm.name}
            onChange={(e) =>
              setFolderForm((s) => ({ ...s, name: e.target.value }))
            }
            placeholder="Folder name"
            className="flex-1 bg-[#2a2a2a] text-gray-200 placeholder-gray-400 rounded-md border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 px-2 text-sm"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button
            className="cursor-pointer hover:bg-[#3a3a3a] bg-[#2a2a2a]"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="cursor-pointer hover:bg-[#3a3a3a] bg-[#2a2a2a]"
            onClick={() => saveEditFolder(folderForm)}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditFolderModal;
