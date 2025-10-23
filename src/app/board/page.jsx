"use client"; // Important for Next.js App Router

import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import React from "react";

const ExcalidrawWrapper = () => {
  // Ensure the container has defined dimensions for Excalidraw to render correctly
  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <Excalidraw />
    </div>
  );
};

export default ExcalidrawWrapper;
