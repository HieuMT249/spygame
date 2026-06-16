"use client";

import { useEffect, useState } from "react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#ffffff"];

interface Piece {
  id: number;
  left: string;
  color: string;
  duration: string;
  swayDuration: string;
  delay: string;
  shape: "rect" | "circle";
}

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

export const Confetti = ({ active }: { active: boolean }) => {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (!active) { setPieces([]); return; }

    const generated: Piece[] = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      left: `${randomBetween(0, 100)}%`,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      duration: `${randomBetween(2.5, 5)}s`,
      swayDuration: `${randomBetween(1.5, 3)}s`,
      delay: `${randomBetween(0, 2)}s`,
      shape: Math.random() > 0.5 ? "rect" : "circle",
    }));

    setPieces(generated);

    // Cleanup after longest animation
    const t = setTimeout(() => setPieces([]), 7000);
    return () => clearTimeout(t);
  }, [active]);

  if (pieces.length === 0) return null;

  return (
    <>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            backgroundColor: p.color,
            animationDuration: `${p.duration}, ${p.swayDuration}`,
            animationDelay: `${p.delay}, ${p.delay}`,
            borderRadius: p.shape === "circle" ? "50%" : "2px",
          }}
        />
      ))}
    </>
  );
};