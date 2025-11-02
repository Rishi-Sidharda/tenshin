"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // ✅ Import router
import { Menu, X } from "lucide-react";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter(); // ✅ Initialize router

  return (
    <div className="bg-[#121212] min-h-screen text-white flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center font-mono justify-between px-8 py-4 border-b border-gray-800">
        <h1
          className="text-2xl font-bold tracking-wide cursor-pointer"
          onClick={() => router.push("/")}
        >
          FusionBoard
        </h1>

        <ul className="hidden md:flex space-x-8 text-gray-300">
          <li
            className="hover:text-white transition-colors cursor-pointer"
            onClick={() => router.push("/")}
          >
            Home
          </li>
          <li
            className="hover:text-white transition-colors cursor-pointer"
            onClick={() => router.push("/features")}
          >
            Features
          </li>
          <li
            className="hover:text-white transition-colors cursor-pointer"
            onClick={() => router.push("/pricing")}
          >
            Pricing
          </li>
          <li
            className="hover:text-white transition-colors cursor-pointer"
            onClick={() => router.push("/contact")}
          >
            Contact
          </li>
        </ul>

        <button
          className="md:hidden text-gray-300 hover:text-white transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-[#1a1a1a] border-b border-gray-800">
          <ul className="flex flex-col space-y-4 px-8 py-4 text-gray-300">
            <li
              className="hover:text-white transition-colors cursor-pointer"
              onClick={() => router.push("/")}
            >
              Home
            </li>
            <li
              className="hover:text-white transition-colors cursor-pointer"
              onClick={() => router.push("/")}
            >
              Features
            </li>
            <li
              className="hover:text-white transition-colors cursor-pointer"
              onClick={() => router.push("/pricing")}
            >
              Pricing
            </li>
            <li
              className="hover:text-white transition-colors cursor-pointer"
              onClick={() => router.push("/")}
            >
              Contact
            </li>
          </ul>
        </div>
      )}

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center   grow text-center px-6">
        <h2 className="text-4xl md:text-6xl font-bold font-mono mb-4">
          Where sketches meet structure.
        </h2>
        <p className="text-gray-400 text-lg font-mono md:text-xl max-w-xl mb-8">
          A collaborative canvas that fuses the freedom of Excalidraw with the
          organization of Notion.
        </p>

        <div className="flex space-x-4">
          <button
            onClick={() => router.push("/board")}
            className="px-6 py-3 bg-white text-black font-semibold font-mono cursor-pointer hover:opacity-90 transition"
          >
            Try Now
          </button>
          <button
            onClick={() => router.push("/pricing")}
            className="px-6 py-3 border border-white text-white font-semibold font-mono cursor-pointer hover:bg-white hover:text-black transition"
          >
            Lock In
          </button>
        </div>
      </div>
    </div>
  );
}
