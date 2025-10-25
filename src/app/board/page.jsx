"use client";

import dynamic from "next/dynamic";
import React, { useRef, useEffect, useState } from "react";
import "@excalidraw/excalidraw/index.css";

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  { ssr: false }
);

export default function FixedRectBoard() {
  const excalidrawRef = useRef(null);
  const [api, setApi] = useState(null);

  // ✅ Wait for the Excalidraw API to be ready
  useEffect(() => {
    if (!excalidrawRef.current) return;
    excalidrawRef.current.readyPromise.then((api) => {
      setApi(api);
    });
  }, []);

  return (
    <div style={{ height: "100vh" }}>
      <Excalidraw ref={excalidrawRef} />
    </div>
  );
}
