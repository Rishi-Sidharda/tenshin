"use client";
import React, { useRef, useEffect } from "react";

export default function FloatingCard({ onClose }) {
  const containerRef = useRef(null);

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
          width: "70%",
          maxWidth: "900px",
          height: "90%",
          backgroundColor: "#191919",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "48px 96px", overflowY: "auto", flex: 1 }}>
          {/* Your content goes here */}
        </div>
      </div>
    </div>
  );
}
