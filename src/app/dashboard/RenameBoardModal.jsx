import { useEffect } from "react";
import { Button } from "@/components/ui/button"; // adjust import path
import { Input } from "@/components/ui/input"; // adjust import path

export default function RenameBoardModal({
  newBoardName,
  setNewBoardName,
  saveBoardName,
  setEditingBoardId,
  editingBoardId,
  errorMessage,
  setErrorMessage,
}) {
  // Close modal on Esc key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setEditingBoardId(null);
        setErrorMessage("");
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [setEditingBoardId, setErrorMessage]);

  // Close modal on click outside
  const handleClickOutside = (e) => {
    if (e.target.id === "modal-overlay") {
      setEditingBoardId(null);
      setErrorMessage("");
    }
  };

  return (
    <div
      id="modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleClickOutside}
    >
      <div className="bg-[#1a1a1a] p-6 rounded-xl w-80 shadow-xl">
        <h2 className="text-lg text-white mb-4">Rename Board</h2>
        <Input
          value={newBoardName}
          onChange={(e) => setNewBoardName(e.target.value)}
          placeholder="Enter new board name"
          className="mb-4"
          autoFocus
        />
        {errorMessage && (
          <p className="text-red-500 text-sm mb-2">{errorMessage}</p>
        )}
        <div className="flex justify-end gap-2">
          <Button
            variant=""
            onClick={() => {
              setEditingBoardId(null);
              setErrorMessage("");
            }}
          >
            Cancel
          </Button>
          <Button onClick={() => saveBoardName(editingBoardId)}>Save</Button>
        </div>
      </div>
    </div>
  );
}
