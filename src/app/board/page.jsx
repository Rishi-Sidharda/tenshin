"use client";

import { Suspense } from "react";
import Board from "./board";

export default function BoardPage() {
  return (
    <Suspense fallback={<div>Loading board…</div>}>
      <Board />
    </Suspense>
  );
}
