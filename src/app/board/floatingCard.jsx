"use client";
import React, { useRef, useEffect } from "react";

export default function FloatingCard({ onClose }) {
  const containerRef = useRef(null);

  // Optional: close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        onClose?.();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        ref={containerRef}
        style={{
          width: "50%",
          height: "90%",
          backgroundColor: "#101010",
          borderRadius: "12px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
          padding: "40px",
          overflowY: "auto",
          fontFamily: "Inter, sans-serif",
        }}
      ></div>
    </div>
  );
}
