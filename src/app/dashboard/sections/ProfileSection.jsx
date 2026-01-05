"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CheckIcon, LogOut } from "lucide-react";

export default function ProfilePage({
  hideProfilePage,
  authUser,
  initialProfile,
  handleLogout,
}) {
  const [profile, setProfile] = useState(initialProfile);
  const [updating, setUpdating] = useState(false);

  async function handlePlanChange(newPlan) {
    if (!authUser || !profile) return;

    setUpdating(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    const { data, error } = await updateUserPlan(newPlan);

    if (!error && data?.plan) {
      setProfile((prev) => ({ ...prev, plan: data.plan }));
    } else {
      console.error("Failed to update plan:", error);
    }

    setUpdating(false);
  }

  if (!authUser || !profile) {
    return (
      <div className="p-8 w-full text-center text-white min-h-screen font-mono">
        <h1 className="text-3xl font-bold mb-2">
          Access Denied or Profile Not Found
        </h1>
        <p className="text-lg opacity-80">
          Authentication required. Please ensure you are logged in or try
          refreshing.
        </p>
      </div>
    );
  }

  const planAccentClass =
    profile.plan === "free" ? "text-[#ff8383]" : "text-lime-400";

  const manageButtonText =
    profile.plan === "free"
      ? "Upgrade Yearly"
      : "Manage Billing & Subscription";

  return (
    <div className="w-full font-mono p-8 space-y-10 text-white min-h-screen">
      {/* BACK BUTTON */}
      <Button
        onClick={hideProfilePage}
        className="bg-[#2a2a2a] cursor-pointer hover:bg-[#3a3a3a] text-white rounded-xl shadow-md px-4 py-2">
        ← Return to Application
      </Button>

      {/* ACCOUNT OVERVIEW */}
      <div className="pb-10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-10">
          {/* LEFT SIDE */}
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl font-bold">Account Overview</h1>
            <p className="text-gray-400">
              Review and manage your account details and subscription status.
            </p>

            <Card className="rounded-2xl shadow-2xl bg-[#1a1a1a] w-full max-w-sm border border-[#2a2a2a]">
              <CardContent className="space-y-4 p-6">
                <p className="text-lg border-b border-[#2a2a2a] pb-3">
                  <span className="font-bold text-gray-300">
                    Registered Email:
                  </span>{" "}
                  <span className="text-gray-300 wrap-break-word">
                    {profile.email}
                  </span>
                </p>

                <p className="text-lg">
                  <span className="font-bold text-gray-300">Active Plan:</span>{" "}
                  <span className={`font-semibold ${planAccentClass}`}>
                    {profile.plan.toUpperCase()}
                  </span>
                </p>

                <p className="text-sm pt-2 text-gray-500">
                  {profile.plan === "free"
                    ? "Limited features. Upgrade for full access."
                    : "Full access enabled. Thank you for your subscription."}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SIDE */}
          <div className="md:w-70 space-y-8">
            <h2 className="text-xl font-semibold border-b border-[#2a2a2a] pb-2">
              Subscription Actions
            </h2>

            <Button
              onClick={() => {}}
              disabled={updating}
              className="w-full bg-[#ff8383] cursor-pointer hover:bg-[#c96a6a] text-black font-bold rounded-lg shadow-md px-4 py-2 transition duration-200">
              {updating ? "Processing..." : manageButtonText}
            </Button>

            <h2 className="text-xl font-semibold border-b border-[#2a2a2a] pb-2">
              Support
            </h2>

            <p className="text-gray-400 text-sm">
              For technical issues or billing inquiries, please contact our
              dedicated support team.
            </p>

            <a
              href="mailto:support@tenshin.app"
              className="text-lg underline text-gray-300 hover:text-[#ff8383] transition duration-200">
              support@tenshin.app
            </a>

            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              className="w-full  cursor-pointer border border-red-400 mt-5 text-red-500 hover:bg-[#1a1a1a] rounded-lg shadow-md px-4 py-2 flex items-center justify-center gap-2 transition duration-200">
              <LogOut className="w-5 font-bold mr-3 h-5" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* UPGRADE SECTION FOR FREE USERS */}
      {profile.plan === "free" && (
        <div className="pt-10 border-t border-[#2a2a2a] mt-10">
          <h2 className="text-2xl font-bold mb-4">Unlock These Pro Features</h2>
        </div>
      )}
    </div>
  );
}
