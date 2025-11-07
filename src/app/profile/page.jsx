"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/dbActions";
import { updateUserPlan } from "@/lib/dbActions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      setAuthUser(userData?.user || null);

      if (!userId) {
        setLoading(false);
        setProfile(null);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("email, plan")
        .eq("id", userId)
        .single();

      setProfile(data);
      setLoading(false);
    }

    loadProfile();
  }, []);

  async function handlePlanChange(newPlan) {
    setUpdating(true);
    const { data, error } = await updateUserPlan(newPlan);
    if (!error) setProfile((prev) => ({ ...prev, plan: data.plan }));
    setUpdating(false);
  }

  if (loading) return <p className="p-4">Loading profile...</p>;

  if (!authUser)
    return (
      <div className="p-8 max-w-xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-2">You are not logged in</h1>
        <p className="text-lg">Please log in to view your profile.</p>
      </div>
    );

  return (
    <div className="p-8 max-w-xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Your Profile</h1>

      <Card className="rounded-2xl shadow p-4">
        <CardContent className="space-y-2">
          <p className="text-lg">
            <span className="font-bold">Email:</span> {profile.email}
          </p>
          <p className="text-lg">
            <span className="font-bold">Current Plan:</span> {profile.plan}
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Change Plan</h2>
        <div className="grid grid-cols-3 gap-4">
          <Button disabled={updating} onClick={() => handlePlanChange("free")}>
            Free
          </Button>
          <Button disabled={updating} onClick={() => handlePlanChange("pro")}>
            Pro
          </Button>
          <Button disabled={updating} onClick={() => handlePlanChange("ultra")}>
            Ultra
          </Button>
        </div>
      </div>
    </div>
  );
}
