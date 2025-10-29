"use client";

export default function CommandPallet({ onClose }) {
  return (
    <div
      onClick={onClose}
      className="absolute top-1/2 left-1/2 z-50 size-9 bg-black transform -translate-x-1/2 -translate-y-1/2"
    ></div>
  );
}
