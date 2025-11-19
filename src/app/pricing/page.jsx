"use client";

import React, { useState } from "react";
import { Geist_Mono } from "next/font/google";
import { useRouter } from "next/navigation";
import { polarPay } from "@/lib/polar";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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

const plans = [
  {
    name: "Free (forever)",
    priceMonthly: "$0",
    priceYearly: "$0",
    description: "All your data stays on your machine, no account needed.",
    features: [
      "Unlimited boards",
      "Full Markdown support",
      "Export (PNG, SVG, JSON, MD)",
      "Local device storage only",
      "with Ads in dashboard",
    ],
    isHighlighted: false,
    buttonText: "Start for Free",
    buttonVariant: "secondary",
    planName: "free",
  },
  {
    name: "Pro",
    priceMonthly: "$4.99",
    priceYearly: "$49",
    description: "Access your boards from anywhere with real-time cloud sync.",
    features: [
      "Everything in Free",
      "Real-time cloud sync",
      "Access from any device",
      "Share boards via link",
      "Priority email support",
      "Fully Ad Free",
    ],
    isHighlighted: true,
    buttonText: "Get Started",
    buttonVariant: "primary",
    planName: "pro",
  },
];

const BillingToggle = ({ billingCycle, setBillingCycle }) => {
  const isMonthly = billingCycle === "monthly";
  const activeColor = "#ff8383";

  return (
    <div className="flex justify-center mt-6 sm:mt-8">
      <div className="relative inline-flex p-1 bg-[#121212] rounded-md w-[180px] sm:w-[220px]">
        {/* Sliding background */}
        <div
          className="absolute top-0 left-0 h-full w-1/2 rounded-md transition-all duration-500 ease-in-out"
          style={{
            backgroundColor: activeColor,
            transform: isMonthly ? "translateX(0%)" : "translateX(100%)",
          }}></div>

        {/* Buttons */}
        <button
          onClick={() => setBillingCycle("monthly")}
          className={`cursor-pointer relative w-1/2 font-mono px-3 sm:px-4 py-2 text-sm sm:text-base font-medium rounded-lg transition-transform duration-100 ${
            isMonthly ? "text-white scale-105 shadow-md" : "text-white"
          }`}>
          Monthly
        </button>
        <button
          onClick={() => setBillingCycle("yearly")}
          className={`cursor-pointer relative w-1/2 font-mono px-3 sm:px-4 py-2 text-sm sm:text-base font-medium rounded-lg transition-transform duration-100 ${
            !isMonthly ? "text-white scale-105 shadow-md" : "text-white"
          }`}>
          Yearly
          <span className="absolute -top-2 right-0 -mr-2 bg-[#ff8383] text-white text-xs sm:text-sm font-bold px-2 py-0.5 rounded-full">
            -20%
          </span>
        </button>
      </div>
    </div>
  );
};

const PricingCard = ({ plan, billingCycle }) => {
  const {
    name,
    priceMonthly,
    priceYearly,
    description,
    features,
    isHighlighted,
    buttonText,
    buttonVariant,
    planName,
  } = plan;

  const price = billingCycle === "monthly" ? priceMonthly : priceYearly;
  const interval = billingCycle === "monthly" ? "/month" : "/year";

  const cardClasses = isHighlighted
    ? "bg-[#1a1a1a] shadow-2xl ring-4 ring-[#ff8383]/50 scale-[1.02] transform max-w-sm mx-auto"
    : "bg-[#1a1a1a] shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 max-w-sm mx-auto";

  const buttonClasses = {
    primary: "bg-[#ff8383] text-white hover:bg-[#ff6666]",
    secondary: "bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]",
  };

  return (
    <div
      className={`rounded-2xl p-5 sm:p-6 flex flex-col h-full relative ${cardClasses} ${geistMono.variable} font-mono`}>
      {isHighlighted && (
        <div className="absolute top-0 right-0 -mt-3 -mr-3 px-3 py-1 bg-[#ff8383] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-full shadow-lg">
          Most Popular
        </div>
      )}

      <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">{name}</h3>
      <p className="text-white mb-6 text-sm sm:text-base">{description}</p>

      <div className="flex items-baseline mb-6 sm:mb-8">
        <span className="text-4xl sm:text-5xl font-extrabold text-white">
          {price}
        </span>
        <span className="text-lg sm:text-xl font-medium text-white ml-2">
          {interval}
        </span>
      </div>

      <ul className="space-y-2 grow mb-6 sm:mb-8">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start text-sm sm:text-base">
            <CheckIcon className="text-[#ff8383] mr-3 mt-1 shrink-0" />
            <span className="text-white">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => {
          if (planName === "pro") {
            polarPay(billingCycle, "ok", "ok@gmail.com");
          } else {
            window.location.href = "/signin";
          }
        }}
        className={`w-full py-3 sm:py-4 rounded-xl cursor-pointer font-semibold transition-colors duration-200 ${buttonClasses[buttonVariant]}`}>
        {buttonText}
      </button>
    </div>
  );
};

const Pricing = ({ noBg = false }) => {
  const [billingCycle, setBillingCycle] = useState("monthly");

  return (
    <div
      className={`min-h-screen w-full relative ${noBg ? "" : "bg-[#121212]"}`}>
      <div className={`${geistMono.variable} font-sans p-4 sm:p-8`}>
        <div className="max-w-4xl mx-auto text-center">
          <header className="mb-6 sm:mb-10 pt-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-mono font-extrabold text-white mb-4">
              Simple, and Transparent Pricing
            </h1>
            <p className="text-base sm:text-lg md:text-xl font-mono text-white max-w-2xl mx-auto">
              Choose the plan that fits your needs.
            </p>
          </header>

          <BillingToggle
            billingCycle={billingCycle}
            setBillingCycle={setBillingCycle}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 sm:mt-10">
            {plans.map((plan) => (
              <div key={plan.name} className="h-full relative">
                <PricingCard plan={plan} billingCycle={billingCycle} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
