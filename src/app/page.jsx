"use client";
import { useState, useEffect } from "react";
import FloatingImage from "./floatingImage";
import Pricing from "./pricingPage";
import { FaArrowUp, FaBars, FaTimes } from "react-icons/fa";

export default function Home() {
  const [showScroll, setShowScroll] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScroll(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleLinkClick = (selector) => {
    setMenuOpen(false);
    document.querySelector(selector)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen w-full bg-[#121212] text-white font-sans relative">
      {/* Floating Images */}
      <FloatingImage src="file.svg" size={120} speed={0.7} />
      <FloatingImage src="next.svg" size={120} speed={0.7} />
      <FloatingImage src="vercel.svg" size={120} speed={0.7} />
      <FloatingImage src="globe.svg" size={120} speed={0.7} />
      <FloatingImage src="window.svg" size={120} speed={0.7} />

      {/* Navbar */}
      <nav className="flex items-center justify-between px-4 md:px-8 py-6 relative">
        {/* Logo */}
        <div className="flex  items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <img src="/logo_sm.svg" className="rounded-md" alt="" />
          </div>
          <span className="font-semibold font-mono text-lg">Tenshin</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 space-x-6 items-center">
          <a
            href="#features"
            className="text-gray-400 hover:text-[#ff8383] transition-colors"
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick("#features");
            }}
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-gray-400 hover:text-[#ff8383] transition-colors"
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick("#pricing");
            }}
          >
            Pricing
          </a>
          <a
            href="/dashboard"
            className="text-gray-400 hover:text-[#ff8383] transition-colors"
          >
            Dashboard
          </a>
        </div>

        {/* Desktop Login */}
        <div className="hidden md:block">
          <a
            href="/signin"
            className="text-white font-semibold hover:underline transition-all"
          >
            Sign in
          </a>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-white text-2xl">
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="absolute top-full right-4 mt-2 w-48 bg-[#1A1A1A] rounded-lg shadow-lg flex flex-col py-4 z-50">
            <a
              href="#features"
              className="px-6 py-2 text-gray-400 hover:text-[#ff8383] transition-colors"
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick("#features");
              }}
            >
              Features
            </a>
            <a
              href="#pricing"
              className="px-6 py-2 text-gray-400 hover:text-[#ff8383] transition-colors"
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick("#pricing");
              }}
            >
              Pricing
            </a>
            <a
              href="/dashboard"
              className="px-6 py-2 text-gray-400 hover:text-[#ff8383] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Dashboard
            </a>
            <a
              href="/login"
              className="px-6 py-2 text-white font-semibold hover:underline transition-all"
              onClick={() => setMenuOpen(false)}
            >
              Log In
            </a>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center mt-[5vh] px-4 md:px-8">
        <h1 className="text-4xl sm:text-5xl md:text-8xl font-mono font-extrabold mb-6 leading-tight tracking-tighter bg-clip-text text-transparent animate-breathe">
          Draw Your Thoughts <br /> Write Your Mind_
        </h1>

        <style jsx>{`
          @keyframes breathe {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }

          .animate-breathe {
            background-image: linear-gradient(90deg, white, #ff8383, white);
            background-size: 200% 200%;
            animation: breathe 11s ease-in-out infinite;
          }
        `}</style>

        <p className="text-gray-400 text-base sm:text-lg md:text-xl max-w-xs sm:max-w-xl md:max-w-2xl">
          "From doodles to documentation, your ideas live here."
        </p>
        <p className="text-gray-400 text-base sm:text-lg md:text-xl mb-8 max-w-xs sm:max-w-xl md:max-w-2xl">
          "Excalidraw + Markdown = Tenshin [Second brain]"
        </p>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-6 sm:mt-10 font-mono">
          <a
            href="#get-started"
            className="bg-white text-black rounded-full px-6 sm:px-8 py-3 sm:py-4 font-semibold text-lg hover:bg-[#ff8383] transition-colors"
          >
            Get Started
          </a>
          <a
            href="/board"
            className="bg-gray-800 text-white rounded-full px-6 sm:px-8 py-3 sm:py-4 font-semibold text-lg hover:bg-gray-700 transition-colors"
          >
            Try now
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="font-mono opacity-100 mt-[5vh] py-20 px-4 sm:px-8 max-w-6xl mx-auto"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-12">
          Exclusive Features
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-[#1A1A1A] p-4 sm:p-6 rounded-xl shadow-lg text-center">
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">
              Markdown Integration
            </h3>
            <p className="text-gray-400 text-sm sm:text-base">
              Seamlessly combine diagrams with Markdown notes. Add context, code
              snippets, tasks, and rich formatting directly into your visual
              workspace, keeping all your ideas connected in one place.
            </p>
          </div>
          <div className="bg-[#1A1A1A] p-4 sm:p-6 rounded-xl shadow-lg text-center">
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">
              Visual Second Brain
            </h3>
            <p className="text-gray-400 text-sm sm:text-base">
              Your dashboard transforms into a personal knowledge hub. Organize
              notes, diagrams, and projects visually, link ideas, and navigate
              effortlessly — making it easy to think, plan, and recall
              information.
            </p>
          </div>
          <div className="bg-[#1A1A1A] p-4 sm:p-6 rounded-xl shadow-lg text-center">
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">
              Instant Context
            </h3>
            <p className="text-gray-400 text-sm sm:text-base">
              Keep all your ideas connected. Hover or click on any diagram
              element to see linked notes, references, and related content
              instantly — so you always have the full picture at your
              fingertips.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="h-auto sm:h-screen px-4 sm:px-8">
        <Pricing />
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 text-sm px-4 sm:px-8">
        © {new Date().getFullYear()} Tenshin. All rights reserved.
      </footer>

      {/* Scroll to Top Button */}
      {showScroll && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 cursor-pointer right-4 sm:right-8 p-4 rounded-full bg-[#ff8383] text-white shadow-lg hover:bg-[#ff4c4c] transition-colors z-50"
        >
          <FaArrowUp />
        </button>
      )}
    </div>
  );
}
