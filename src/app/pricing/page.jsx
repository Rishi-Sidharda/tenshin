"use client";

import React, { useState } from "react";

import { Geist_Mono } from "next/font/google";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Custom Check Icon for features (simulating lucide-react Check)
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

// --- Pricing Data with Monthly and Yearly Tiers ---
const plans = [
  {
    name: "Free",
    priceMonthly: "$0",
    priceYearly: "$0",
    description: "Perfect for getting started and trying out our features.",
    features: [
      "Up to 5 Projects",
      "Basic Analytics",
      "Community Support",
      "500MB Storage",
    ],
    isHighlighted: false,
    buttonText: "Sign up for free",
    buttonVariant: "secondary",
  },
  {
    name: "Pro",
    priceMonthly: "$29",
    priceYearly: "$279", // $29 * 12 * 0.8 ≈ $279 (20% discount)
    description: "Everything you need to grow your business effectively.",
    features: [
      "All Free features",
      "Unlimited Projects",
      "Advanced Real-time Analytics",
      "Priority Email Support",
      "100GB Storage",
      "Custom Domains",
    ],
    isHighlighted: true,
    buttonText: "Get Started",
    buttonVariant: "primary",
  },
  {
    name: "Enterprise",
    priceMonthly: "$99",
    priceYearly: "$950", // $99 * 12 * 0.8 ≈ $950 (20% discount)
    description: "Scale your organization with dedicated support and features.",
    features: [
      "All Pro features",
      "Dedicated Infrastructure",
      "SLA Guarantee (99.9%)",
      "24/7 Phone Support",
      "Unlimited Storage",
      "Single Sign-On (SSO)",
    ],
    isHighlighted: false,
    buttonText: "Contact Us",
    buttonVariant: "ghost",
  },
];

// --- Toggle Component ---
const BillingToggle = ({ billingCycle, setBillingCycle }) => {
  const isMonthly = billingCycle === "monthly";
  const isYearly = billingCycle === "yearly";

  const activeClasses =
    "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 shadow-md";
  const inactiveClasses =
    "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700";

  return (
    <div className="flex justify-center mt-8">
      <div className="inline-flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl transition-all duration-300">
        <button
          onClick={() => setBillingCycle("monthly")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
            isMonthly ? activeClasses : inactiveClasses
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingCycle("yearly")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 relative ${
            isYearly ? activeClasses : inactiveClasses
          }`}
        >
          Yearly
          <span className="absolute -top-2 right-0 -mr-2 bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full">
            -20%
          </span>
        </button>
      </div>
    </div>
  );
};

// Reusable Card component (simulating shadcn Card)
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

  // Dynamic styling based on the highlighted status
  const cardClasses = isHighlighted
    ? "bg-white dark:bg-gray-900 shadow-2xl ring-4 ring-gray-900/50 dark:ring-gray-100/50 scale-[1.02] transform"
    : "bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all duration-300";

  // Updated button variants for a neutral palette
  const buttonClasses = {
    // Primary button is now dark gray/black
    primary:
      "bg-gray-900 text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300",
    secondary:
      "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600",
    ghost:
      "border border-gray-300 text-gray-900 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700",
  };

  return (
    <div
      className={`rounded-2xl p-8 flex flex-col h-full ${cardClasses} ${geistMono.variable} font-mono`}
    >
      {isHighlighted && (
        // Changed blue badge to dark gray/light gray badge
        <div className="absolute top-0 right-0 -mt-3 -mr-3 px-3 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
          Most Popular
        </div>
      )}

      {/* Header */}
      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        {name}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        {description}
      </p>

      {/* Price */}
      <div className="flex items-baseline mb-8">
        <span className="text-5xl font-extrabold text-gray-900 dark:text-gray-100">
          {price}
        </span>
        <span className="text-xl font-medium text-gray-600 dark:text-gray-300">
          {interval}
        </span>
      </div>

      {/* Features List */}
      <ul className="space-y-4 grow mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <CheckIcon className="text-gray-900 dark:text-gray-100 mr-3 mt-1 shrink-0" />
            <span className="text-gray-700 dark:text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>

      {/* Action Button */}
      <button 
        className={`w-full py-3 rounded-xl cursor-pointer font-semibold transition-colors duration-200 ${buttonClasses[buttonVariant]}`}
        onClick={() => {}}
      >
        {buttonText}
      </button>
    </div>
  );
};

// Main App Component
const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState("monthly");

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] relative">
      <div
        className={`${geistMono.variable} font-sans min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-8`}
      >
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <header className="text-center mb-10 pt-6">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-black dark:text-white mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Choose the plan that fits your needs and start building today.
            </p>
          </header>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6 items-center">
            {plans.map((plan) => (
              <div key={plan.name} className="h-full relative">
                <PricingCard plan={plan} billingCycle={billingCycle} />
              </div>
            ))}
          </div>

          {/* Footer/FAQ space */}
          <footer className="mt-20 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Need a custom plan?{" "}
              <a
                href="#"
                className="text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
              >
                Contact our sales team.
              </a>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
