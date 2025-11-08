"use client";

import React, { useState } from "react";
import { Geist_Mono } from "next/font/google";

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
    className={`w-5 h-5 ${className}`}
  >
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
  },
  {
    name: "Pro",
    priceMonthly: "$4.99",
    priceYearly: "$49",
    description: "Access your boards from anywhere with real-time cloud sync.",
    features: [
      "Everything in Free",
      "Real-time cloud sync",
      "Access from any device/browser",
      "Share boards via link",
      "Priority email support",
      "Fully Ad Free",
    ],
    isHighlighted: true,
    buttonText: "Get Started",
    buttonVariant: "primary",
  },
];

const BillingToggle = ({ billingCycle, setBillingCycle }) => {
  const isMonthly = billingCycle === "monthly";

  const activeColor = "#ff8383";
  const inactiveColor = "#121212";

  return (
    <div className="flex justify-center mt-8">
      <div className="relative inline-flex p-1 bg-[#121212] rounded-md w-[200px]">
        {/* Sliding background */}
        <div
          className="absolute top-0 left-0 h-full w-1/2 rounded-md transition-all duration-500 ease-in-out"
          style={{
            backgroundColor: activeColor,
            transform: isMonthly ? "translateX(0%)" : "translateX(100%)",
          }}
        ></div>

        {/* Buttons */}
        <button
          onClick={() => setBillingCycle("monthly")}
          className={`cursor-pointer relative w-1/2 font-mono px-4 py-2 text-sm font-medium rounded-lg transition-transform duration-100 ${
            isMonthly ? "text-white scale-105 shadow-md" : "text-white"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingCycle("yearly")}
          className={` cursor-pointer font-mono relative w-1/2 px-4 py-2 text-sm font-medium rounded-lg transition-transform duration-100 ${
            !isMonthly ? "text-white scale-105 shadow-md" : "text-white"
          }`}
        >
          Yearly
          <span className="absolute -top-2 right-0 -mr-2 bg-[#ff8383] text-white text-xs font-bold px-2 py-0.5 rounded-full">
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
      className={`rounded-2xl p-6 flex flex-col h-full relative ${cardClasses} ${geistMono.variable} font-mono`}
    >
      {isHighlighted && (
        <div className="absolute top-0 right-0 -mt-3 -mr-3 px-3 py-1 bg-[#ff8383] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
          Most Popular
        </div>
      )}

      <h3 className="text-2xl font-bold text-white mb-2">{name}</h3>
      <p className="text-white mb-6">{description}</p>

      <div className="flex items-baseline mb-8">
        <span className="text-5xl font-extrabold text-white">{price}</span>
        <span className="text-xl font-medium text-white ml-2">{interval}</span>
      </div>

      <ul className="space-y-2 grow mb-8">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start">
            <CheckIcon className="text-[#ff8383] mr-3 mt-1 shrink-0" />
            <span className="text-white">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        className={`w-full py-3 rounded-xl cursor-pointer font-semibold transition-colors duration-200 ${buttonClasses[buttonVariant]}`}
      >
        {buttonText}
      </button>
    </div>
  );
};

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState("monthly");

  return (
    <div className="min-h-screen w-full bg-[#121212] relative">
      <div
        className={`${geistMono.variable} font-sans min-h-screen p-4 sm:p-8`}
      >
        <div className="max-w-4xl mx-auto text-center">
          <header className="mb-10 pt-6">
            <h1 className="text-9xl font-mono sm:text-5xl font-extrabold text-white mb-4">
              Simple, and Transparent Pricing
            </h1>
            <p className="text-xl font-mono text-white max-w-2xl mx-auto">
              Choose the plan that fits your needs.
            </p>
          </header>

          <BillingToggle
            billingCycle={billingCycle}
            setBillingCycle={setBillingCycle}
          />

          <div className="grid lg:grid-cols-2 items-center mt-10">
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
