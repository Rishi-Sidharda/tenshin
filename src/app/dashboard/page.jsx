"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [boards, setBoards] = useState({});
  const [editingBoardId, setEditingBoardId] = useState(null);
  const [newBoardName, setNewBoardName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  // Fetch current user
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      const currentUser = data?.user || null;
      setUser(currentUser);
      setLoading(false);

      if (!currentUser) window.location.href = "/signin";
    };

    getUser();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
          window.location.href = "/signin";
        }
      }
    );

    return () => subscription?.subscription?.unsubscribe();
  }, []);

  // Load boards
  useEffect(() => {
    const savedBoards = JSON.parse(localStorage.getItem("boards") || "{}");
    setBoards(savedBoards);
  }, []);

  const createNewBoard = () => {
    const defaultName = `Untitled-${Date.now()}`;
    const savedBoards = JSON.parse(localStorage.getItem("boards") || "{}");
    savedBoards[defaultName] = {
      name: defaultName,
      elements: [],
      appState: {},
      files: {},
    };
    localStorage.setItem("boards", JSON.stringify(savedBoards));
    setBoards(savedBoards);
    router.push(`/board?id=${encodeURIComponent(defaultName)}`);
  };

  const openBoard = (id) => {
    router.push(`/board?id=${encodeURIComponent(id)}`);
  };

  const deleteBoard = (id) => {
    const savedBoards = JSON.parse(localStorage.getItem("boards") || "{}");
    delete savedBoards[id];
    localStorage.setItem("boards", JSON.stringify(savedBoards));
    setBoards(savedBoards);
  };

  // ✅ Start renaming
  const startRenaming = (id, currentName) => {
    setEditingBoardId(id);
    setNewBoardName(currentName);
    setErrorMessage("");
  };

  // ✅ Save renamed board (persistent + unique)
  const saveBoardName = (oldId) => {
    const trimmed = newBoardName.trim();
    if (!trimmed) return setErrorMessage("Board name cannot be empty.");

    const savedBoards = JSON.parse(localStorage.getItem("boards") || "{}");

    // Check for duplicate name
    if (savedBoards[trimmed] && trimmed !== oldId) {
      setErrorMessage(
        "A board with that name already exists. Try another name."
      );
      return;
    }

    // Copy existing data and rename the key
    const boardData = savedBoards[oldId];
    delete savedBoards[oldId];
    savedBoards[trimmed] = {
      ...boardData,
      name: trimmed,
      updatedAt: new Date().toISOString(),
    };

    // Save changes
    localStorage.setItem("boards", JSON.stringify(savedBoards));
    setBoards(savedBoards);
    setEditingBoardId(null);
    setErrorMessage("");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/signin";
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading dashboard...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-10">
      <Card className="max-w-2xl w-full shadow-lg p-8">
        <CardContent>
          <h1 className="text-2xl font-bold mb-2">Hello, {user.email} 👋</h1>
          <Button className="mt-2 cursor-pointer" onClick={handleLogout}>
            Log out
          </Button>

          <Separator className="my-6" />

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Boards</h2>
            <Button onClick={createNewBoard}>+ New Board</Button>
          </div>

          {Object.keys(boards).length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No boards yet. Create one above!
            </p>
          ) : (
            <div className="space-y-3">
              {Object.keys(boards).map((id) => {
                const board = boards[id];
                const isEditing = editingBoardId === id;

                return (
                  <div
                    key={id}
                    className="flex justify-between items-center bg-muted p-3 rounded-lg"
                  >
                    {isEditing ? (
                      <div className="flex items-center space-x-2 w-full">
                        <Input
                          value={newBoardName}
                          onChange={(e) => setNewBoardName(e.target.value)}
                          className="flex-1"
                          autoFocus
                        />
                        <Button size="sm" onClick={() => saveBoardName(id)}>
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setEditingBoardId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className="truncate">{board.name}</span>
                        <div className="space-x-2">
                          <Button size="sm" onClick={() => openBoard(id)}>
                            Open
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => startRenaming(id, board.name)}
                          >
                            Rename
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteBoard(id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              {errorMessage && (
                <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
