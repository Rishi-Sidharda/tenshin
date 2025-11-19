"use client";

import { updateUserPlan } from "@/lib/dbActions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CheckIcon } from "lucide-react";

/* -----------------------------------------
   PRO FEATURES COMPONENT (embedded inline)
------------------------------------------ */

function ProFeatures() {
  // Check Icon component (unchanged)
  const CheckIcon = ({ className = "" }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`w-5 h-5 ${className}`}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );

  const [billing, setBilling] = useState("monthly");

  const prices = {
    monthly: {
      price: "$5",
      period: "/ month",
      discount: null,
    },
    yearly: {
      price: "$49",
      period: "/ year",
      discount: "(20% off)",
    },
  };

  const proFeatures = [
    "Everything in Free",
    "Real-time cloud sync",
    "Access from any device",
    "Share boards via link",
    "Priority email support",
    "Fully Ad Free",
  ];

  const currentPrice = prices[billing];

  return (
    <div className="mt-8 p-6 bg-[#1a1a1a] border rounded-2xl border-[#2a2a2a] shadow-2xl max-w-lg">
      {/* --- Pricing and Toggle Section --- */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 space-y-4 sm:space-y-0">
        {/* Price Display: More prominent and professional */}
        <div className="flex flex-col items-center sm:items-start">
          <div className="flex items-baseline text-white font-mono">
            <span className="text-6xl font-extrabold text-[#ff8383]">
              {currentPrice.price}
            </span>
            <span className="text-xl opacity-80 ml-1">
              {currentPrice.period}
            </span>
          </div>
        </div>

        {/* Toggle: Styled as a cleaner switch/pill-box */}
        <div className="flex bg-[#2a2a2a] rounded-full p-1 shadow-inner">
          <button
            onClick={() => setBilling("monthly")}
            className={`
              px-4 py-2 rounded-full cursor-pointer font-mono text-sm transition-all duration-300 ease-in-out
              ${
                billing === "monthly"
                  ? "bg-[#ff8383] text-black font-semibold shadow-md"
                  : "text-white opacity-80 hover:bg-[#3a3a3a] hover:opacity-100"
              }
            `}>
            Monthly
          </button>

          <button
            onClick={() => setBilling("yearly")}
            className={`
              px-4 py-2 rounded-full cursor-pointer font-mono text-sm transition-all duration-300 ease-in-out
              ${
                billing === "yearly"
                  ? "bg-[#ff8383] text-black font-semibold shadow-md"
                  : "text-white opacity-80 hover:bg-[#3a3a3a] hover:opacity-100"
              }
            `}>
            Yearly
          </button>
        </div>
      </div>
      {/* --- End Pricing and Toggle Section --- */}
      <hr className="border-t border-[#2a2a2a] mb-6" />

      <ul className="space-y-4">
        {proFeatures.map((feature, idx) => (
          <li key={idx} className="flex items-start">
            <CheckIcon className="text-[#ff8383] mr-3 mt-1 shrink-0" />
            <span className="text-white text-sm sm:text-base font-mono">
              {feature}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-8 max-w-xl">
        {/* Assuming Button is a component passed or defined elsewhere */}
        <Button
          onClick={() => handlePlanChange("pro")}
          className="w-full bg-[#ff8383] hover:bg-[#c96a6a] text-black font-bold rounded-lg shadow-md px-4 py-3 cursor-pointer">
          Upgrade to Pro
        </Button>
      </div>
    </div>
  );
}

/* -----------------------------------------
   MAIN PROFILE PAGE
------------------------------------------ */

export default function ProfilePage({
  hideProfilePage,
  authUser,
  initialProfile,
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
    profile.plan === "free" ? "Upgrade Plan" : "Manage Billing & Subscription";

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
              onClick={() =>
                handlePlanChange(profile.plan === "free" ? "pro" : "free")
              }
              disabled={updating}
              className="w-full bg-[#ff8383] cursor-pointer hover:bg-[#c96a6a] text-black font-bold rounded-xl shadow-md px-4 py-2 transition duration-200">
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
          </div>
        </div>
      </div>

      {/* UPGRADE SECTION FOR FREE USERS */}
      {profile.plan === "free" && (
        <div className="pt-10 border-t border-[#2a2a2a] mt-10">
          <h2 className="text-2xl font-bold mb-4">Unlock These Pro Features</h2>

          <ProFeatures />
        </div>
      )}
    </div>
  );
}
