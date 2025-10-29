"use client";

import React from "react";

export default function FloatingCard({ title, children, onClose }) {
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
        animation: "fadeIn 0.25s ease-in-out",
      }}
    >
      <div
        style={{
          width: "70%",
          height: "90%",
          backgroundColor: "#1e1e1e",
          borderRadius: "12px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          color: "white",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        <div style={{ flex: 1, overflowY: "auto" }}>
          {title && (
            <h2 style={{ fontSize: "1.5rem", marginBottom: "16px" }}>
              {title}
            </h2>
          )}
          {children}
        </div>

        <div style={{ textAlign: "right", marginTop: "16px" }}>
          <button
            onClick={onClose}
            style={{
              background: "#ff4757",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "10px 16px",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
