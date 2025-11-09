import React from "react";
import Link from "next/link";
import { FaTwitter, FaGithub, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#121212] font-mono text-gray-300 border-t border-[#ff8383]/30">
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center md:text-left">
        {/* Logo + Name */}
        <Link
          href="/"
          className="flex items-center justify-center md:justify-start hover:opacity-90 transition-opacity"
        >
          <img
            src="/logo_sm.svg"
            alt="Tenshin Logo"
            className="w-10 h-10 rounded-md shadow-lg"
          />
          <span className="ml-3 text-2xl font-semibold text-white tracking-tight leading-none">
            Tenshin
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center justify-center space-x-8 text-sm font-medium">
          <Link
            href="/legal"
            className="hover:text-[#ff8383] transition-colors"
          >
            Legal
          </Link>
          <Link
            href="/legal"
            className="hover:text-[#ff8383] transition-colors"
          >
            Privacy
          </Link>
          <Link
            href="/legal"
            className="hover:text-[#ff8383] transition-colors"
          >
            Terms
          </Link>
        </div>

        {/* Social Links */}
        <div className="flex items-center justify-center md:justify-end space-x-6 text-xl">
          <a
            href="https://twitter.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#ff8383] transition-colors hover:drop-shadow-[0_0_5px_#ff8383]"
          >
            <FaTwitter className="w-5 h-5" />
          </a>
          <a
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#ff8383] transition-colors hover:drop-shadow-[0_0_5px_#ff8383]"
          >
            <FaGithub className="w-5 h-5" />
          </a>
          <a
            href="https://linkedin.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#ff8383] transition-colors hover:drop-shadow-[0_0_5px_#ff8383]"
          >
            <FaLinkedin className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="text-center text-sm text-gray-500 border-t border-[#ff8383]/10 py-4">
        © {new Date().getFullYear()} Tenshin by Rishi Sidharda · All rights
        reserved.
      </div>
    </footer>
  );
}
