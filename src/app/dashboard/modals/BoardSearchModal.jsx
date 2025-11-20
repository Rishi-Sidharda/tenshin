import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, ChevronRight } from "lucide-react"; // Imported ChevronRight

export default function BoardSearch({ boards, openBoard, ICONS, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  // ESC key closes modal + disable scroll
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);

    // disable page scroll
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = original;
    };
  }, [onClose]);

  // live search filter
  useEffect(() => {
    const q = query.toLowerCase();
    const filtered = Object.values(boards || {})
      .filter((b) => b.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
    setResults(filtered);
  }, [query, boards]);

  return (
    <div
      className="fixed inset-0 z-50 font-outfit flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}>
      <div
        className="bg-[#1a1a1a] w-full max-w-xl rounded-lg shadow-black shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Search Boards</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-[#ff8383] cursor-pointer transition-colors p-1">
            <X className="h-6 w-6" />
          </button>
        </div>

        <Input
          type="text"
          placeholder="Search your boards..."
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full text-white border-[#2a2a2a] border-2 rounded-md"
        />

        <div className="mt-4 max-h-80 overflow-y-auto scrollbar-none space-y-2">
          {results.length === 0 ? (
            <p className="text-gray-400 text-center py-6">No boards found.</p>
          ) : (
            results.map((board) => {
              const Icon = ICONS[board.icon];

              return (
                <Button
                  key={board.id}
                  onClick={() => {
                    openBoard(board.id);

                    onClose();
                  }}
                  // Added relative positioning and group class for hover effect
                  className="group w-full h-auto cursor-pointer justify-start p-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] focus:bg-[#3a3a3a] transition rounded-md text-white relative">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl text-white">
                      <Icon />
                    </div>

                    <div className="text-left">
                      <p className="font-normal truncate text-white">
                        {board.name}
                      </p>
                    </div>
                  </div>

                  {/* --- Hover/Active Indicator --- */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">
                    <span className="text-sm font-semibold">Open</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                  {/* ------------------------------- */}
                </Button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
