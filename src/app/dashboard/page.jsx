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
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
      setLoading(false);
    };

    getUser();

    // listen for auth changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading dashboard...</p>
      </div>
    );
  }

  if (!user) {
    // Logged out state
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <Card className="max-w-md w-full shadow-md p-8">
          <h1 className="text-2xl font-bold mb-4">Welcome to Drowtion 👋</h1>
          <p className="text-muted-foreground mb-6">
            You need to be signed in to access your dashboard.
          </p>
          <Separator className="my-4" />
          <Button onClick={() => router.push("/signin")}>Sign In</Button>
        </Card>
      </div>
    );
  }

  // Logged in state
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10">
      <Card className="max-w-xl w-full shadow-lg p-10">
        <CardContent>
          <h1 className="text-3xl font-bold mb-2">Hello, {user.email} 👋</h1>
          <p className="text-muted-foreground mb-6">
            Welcome back! Here’s your personalized dashboard.
          </p>

          <Separator className="my-6" />

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-xl">
              <p className="font-medium text-foreground">Recent Activity</p>
              <p className="text-sm text-muted-foreground">
                (This is where you could show recent user data or updates.)
              </p>
            </div>

            <div className="p-4 bg-muted rounded-xl">
              <p className="font-medium text-foreground">Account Info</p>
              <p className="text-sm text-muted-foreground">
                User ID: {user.id}
              </p>
            </div>
          </div>

          <Separator className="my-6" />

          <Button variant="destructive" onClick={handleLogout}>
            Log out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
