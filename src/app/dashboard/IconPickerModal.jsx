import React, { useEffect } from "react";
import { Button } from "@/components/ui/button"; // adjust path

const IconPickerModal = ({
  availableIcons,
  ICONS,
  editingIconId,
  saveIcon,
  setEditingIconId,
}) => {
  if (!editingIconId) return null; // hide modal if no icon is being edited

  // Close modal on ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setEditingIconId(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [setEditingIconId]);

  // Stop propagation so clicks inside modal don't close it
  const handleModalClick = (e) => e.stopPropagation();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={() => setEditingIconId(null)} // clicking backdrop closes modal
    >
      <div
        className="bg-[#1a1a1a] p-6 rounded-xl w-80 shadow-xl"
        onClick={handleModalClick} // clicking modal itself does NOT close it
      >
        <h2 className="text-lg text-white mb-4">Choose an Icon</h2>
        <div className="grid grid-cols-6 gap-3 mb-4">
          {availableIcons.map((iconName) => {
            const Icon = ICONS[iconName];
            return (
              <div
                key={iconName}
                className="cursor-pointer p-2 hover:bg-gray-700 rounded-md flex items-center justify-center transition-transform hover:scale-110"
                onClick={() => saveIcon(editingIconId, iconName)}
              >
                <Icon className="w-6 h-6 text-gray-300" />
              </div>
            );
          })}
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setEditingIconId(null)}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IconPickerModal;
