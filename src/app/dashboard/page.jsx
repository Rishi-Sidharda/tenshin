"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [boards, setBoards] = useState({});
  const router = useRouter();

  // Fetch current user
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      const currentUser = data?.user || null;
      setUser(currentUser);
      setLoading(false);

      if (!currentUser) {
        // Redirect to signin if not logged in
        window.location.href = "/signin";
      }
    };

    getUser();

    // Listen for auth changes
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

    return () => {
      subscription?.subscription?.unsubscribe();
    };
  }, []); // ✅ empty dependency array – stable

  // Load boards from localStorage
  useEffect(() => {
    const savedBoards = JSON.parse(localStorage.getItem("boards") || "{}");
    setBoards(savedBoards);
  }, []);

  const createNewBoard = () => {
    const id = `board-${Date.now()}`;
    const savedBoards = JSON.parse(localStorage.getItem("boards") || "{}");
    savedBoards[id] = { name: id, elements: [], appState: {}, files: {} };
    localStorage.setItem("boards", JSON.stringify(savedBoards));
    setBoards(savedBoards);
    router.push(`/board?id=${id}`);
  };

  const openBoard = (id) => {
    router.push(`/board?id=${id}`);
  };

  const deleteBoard = (id) => {
    const savedBoards = JSON.parse(localStorage.getItem("boards") || "{}");
    delete savedBoards[id];
    localStorage.setItem("boards", JSON.stringify(savedBoards));
    setBoards(savedBoards);
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

  if (!user) return null; // Safety fallback

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
              {Object.keys(boards).map((id) => (
                <div
                  key={id}
                  className="flex justify-between items-center bg-muted p-3 rounded-lg"
                >
                  <span>{boards[id].name}</span>
                  <div className="space-x-2">
                    <Button size="sm" onClick={() => openBoard(id)}>
                      Open
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteBoard(id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
