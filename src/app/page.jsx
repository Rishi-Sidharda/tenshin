"use client";
import { useState, useEffect } from "react";
import FloatingImage from "./floatingImage";
import Pricing from "./pricingPage";
import { FaArrowUp } from "react-icons/fa"; // Using react-icons for the up arrow

export default function Home() {
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setShowScroll(scrollTop > 100); // Show button after scrolling 100px
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      <nav className="flex items-center font-mono justify-between px-8 py-6 relative">
        {/* Left: Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-black font-bold">T</span>
          </div>
          <span className="font-semibold font-mono text-lg">Tenshin</span>
        </div>

        {/* Center: Links */}
        <div className="absolute left-1/2 transform -translate-x-1/2 space-x-6 flex items-center">
          <a
            href="#features"
            className="text-gray-400 hover:text-[#ff8383] transition-colors"
            onClick={(e) => {
              e.preventDefault();
              document
                .querySelector("#features")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-gray-400 hover:text-[#ff8383] transition-colors"
            onClick={(e) => {
              e.preventDefault();
              document
                .querySelector("#pricing")
                ?.scrollIntoView({ behavior: "smooth" });
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

        {/* Right: Log In */}
        <div>
          <a
            href="/login"
            className="text-white font-semibold hover:underline transition-all"
          >
            Log In
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex  flex-col items-center justify-center text-center mt-[5vh] px-4">
        <h1 className="text-5xl md:text-8xl font-mono font-extrabold mb-6 leading-tight tracking-tighter bg-clip-text text-transparent animate-breathe">
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

        <p className="text-gray-400 text-lg font-mono md:text-xl max-w-2xl">
          "From doodles to documentation, your ideas live here."
        </p>
        <p className="text-gray-400 text-lg font-mono md:text-xl mb-8 max-w-2xl">
          "Excalidraw + Markdown = Tenshin [Second brain]"
        </p>
        <div className="flex space-x-4 mt-10 font-mono">
          <a
            href="#get-started"
            className="bg-white text-black rounded-full px-8 py-4 font-semibold text-lg hover:bg-[#ff8383] transition-colors"
          >
            Get Started
          </a>
          <a
            href="/board"
            className="bg-gray-800 text-white rounded-full px-8 py-4 font-semibold text-lg hover:bg-gray-700 transition-colors"
          >
            Try now
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="font-mono opacity-100  mt-[5vh] py-20 px-8 max-w-6xl mx-auto"
      >
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Exclusive Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#1A1A1A] p-6 rounded-xl shadow-lg text-center">
            <h3 className="text-xl font-semibold mb-4">Markdown Integration</h3>
            <p className="text-gray-400">
              Seamlessly combine diagrams with Markdown notes. Add context, code
              snippets, tasks, and rich formatting directly into your visual
              workspace, keeping all your ideas connected in one place.
            </p>
          </div>
          <div className="bg-[#1A1A1A] p-6 rounded-xl shadow-lg text-center">
            <h3 className="text-xl font-semibold mb-4">Visual Second Brain</h3>
            <p className="text-gray-400">
              Your dashboard transforms into a personal knowledge hub. Organize
              notes, diagrams, and projects visually, link ideas, and navigate
              effortlessly — making it easy to think, plan, and recall
              information.
            </p>
          </div>
          <div className="bg-[#1A1A1A] p-6 rounded-xl shadow-lg text-center">
            <h3 className="text-xl font-semibold mb-4">Instant Context</h3>
            <p className="text-gray-400">
              Keep all your ideas connected. Hover or click on any diagram
              element to see linked notes, references, and related content
              instantly — so you always have the full picture at your
              fingertips.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="h-screen">
        <Pricing />
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Tenshin. All rights reserved.
      </footer>

      {/* Scroll to Top Button */}
      {showScroll && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 cursor-pointer right-8 p-4 rounded-full bg-[#ff8383] text-white shadow-lg hover:bg-[#ff4c4c] transition-colors z-50"
        >
          <FaArrowUp />
        </button>
      )}
    </div>
  );
}
