"use client";
import Pricing from "./pricing/page";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-[#121212] text-white font-sans">
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
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-gray-400 hover:text-[#ff8383] transition-colors"
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
      <section className="flex  flex-col items-center justify-center text-center mt-[15vh] px-4">
        <h1 className="text-5xl font-mono md:text-7xl font-bold mb-6 leading-normal">
          Draw Your Thoughts <br /> Write Your Mind_
        </h1>
        <p className="text-gray-400 text-lg font-mono md:text-xl mb-8 max-w-2xl">
          "From doodles to documentation, your ideas live here."
        </p>
        <div></div>
        <div className="flex space-x-4 font-mono">
          <a
            href="#get-started"
            className="bg-white text-black px-8 py-4 font-semibold text-lg hover:bg-gray-200 transition-colors"
          >
            Get Started
          </a>
          <a
            href="#features"
            className="bg-gray-800 text-white px-8 py-4 font-semibold text-lg hover:bg-gray-700 transition-colors"
          >
            Why Tenshin
          </a>
        </div>
      </section>

      {/* Optional Features Section */}
      <section
        id="features"
        className="font-mono h-screen mt-[10vh] py-20 px-8 max-w-6xl mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#1A1A1A] p-6 rounded-xl shadow-lg text-center">
            <h3 className="text-xl font-semibold mb-4">
              Realtime Collaboration
            </h3>
            <p className="text-gray-400">
              Work with your team in real-time, just like Google Docs.
            </p>
          </div>
          <div className="bg-[#1A1A1A] p-6 rounded-xl shadow-lg text-center">
            <h3 className="text-xl font-semibold mb-4">Easy Exports</h3>
            <p className="text-gray-400">
              Export diagrams as PNG, SVG, or shareable links.
            </p>
          </div>
          <div className="bg-[#1A1A1A] p-6 rounded-xl shadow-lg text-center">
            <h3 className="text-xl font-semibold mb-4">Custom Themes</h3>
            <p className="text-gray-400">
              Customize colors, fonts, and styles for your diagrams.
            </p>
          </div>
        </div>
      </section>
      <section id="pricing" className="h-screen">
        <Pricing />
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Tenshin. All rights reserved.
      </footer>
    </div>
  );
}
