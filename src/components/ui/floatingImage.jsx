"use client";
import { useEffect, useRef } from "react";

export default function FloatingImage({ src, size = 100, speed = 0.5 }) {
  const imgRef = useRef(null);

  useEffect(() => {
    let posX = Math.random() * window.innerWidth;
    let posY = Math.random() * window.innerHeight;

    // Random movement direction
    let velX = (Math.random() * 2 - 1) * speed; // between -speed and +speed
    let velY = (Math.random() * 2 - 1) * speed;

    const move = () => {
      posX += velX;
      posY += velY;

      // Wrap-around edges
      if (posX > window.innerWidth) posX = -size;
      if (posX < -size) posX = window.innerWidth;
      if (posY > window.innerHeight) posY = -size;
      if (posY < -size) posY = window.innerHeight;

      if (imgRef.current) {
        imgRef.current.style.transform = `translate(${posX}px, ${posY}px)`;
      }

      requestAnimationFrame(move);
    };

    move();
  }, [size, speed]);

  return (
    <img
      ref={imgRef}
      src={src}
      alt="Floating"
      className="fixed pointer-events-none opacity-20 blur-sm"
      style={{
        width: size,
        height: size,
        zIndex: 0,
      }}
    />
  );
}
