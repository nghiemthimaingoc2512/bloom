"use client";

import { motion } from "framer-motion";
import type { FlowerKind, FlowerStage } from "@/lib/types";

export function Flower({
  stage,
  kind,
  delay = 0,
  size = 40,
}: {
  stage: FlowerStage;
  kind: FlowerKind;
  delay?: number;
  size?: number;
}) {
  // Colours come from the palette tokens in globals.css, so the garden
  // follows whichever accent the person picked instead of staying pink.
  const petalColor =
    stage === "bloom" ? "var(--flower-bloom)" : stage === "wilt" ? "var(--flower-wilt)" : "var(--flower-fade)";
  const centerColor = stage === "bloom" ? "var(--flower-center)" : "var(--flower-fade)";
  const stemColor = stage === "fade" ? "var(--flower-fade)" : "var(--flower-stem)";
  const scale = stage === "fade" ? 0.7 : stage === "wilt" ? 0.85 : 1;
  const rotate = stage === "wilt" ? 8 : stage === "fade" ? 14 : 0;

  return (
    <motion.svg
      viewBox="0 0 40 60"
      width={size}
      height={size * 1.5}
      initial={{ opacity: 0, y: 8, scale: 0.6 }}
      animate={{ opacity: stage === "fade" ? 0.55 : 1, y: 0, scale, rotate }}
      transition={{ duration: 0.6, delay }}
    >
      <line x1="20" y1="60" x2="20" y2="26" stroke={stemColor} strokeWidth="2" strokeLinecap="round" />
      {kind === "sakura" ? (
        <g transform="translate(20,20)">
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse
              key={a}
              cx={Math.cos((a * Math.PI) / 180) * 7}
              cy={Math.sin((a * Math.PI) / 180) * 7}
              rx="7"
              ry="5"
              fill={petalColor}
              transform={`rotate(${a} ${Math.cos((a * Math.PI) / 180) * 7} ${Math.sin((a * Math.PI) / 180) * 7})`}
            />
          ))}
          <circle cx="0" cy="0" r="3.2" fill={centerColor} />
        </g>
      ) : (
        <g transform="translate(20,20)">
          <path d="M0,-14 C8,-10 8,4 0,10 C-8,4 -8,-10 0,-14 Z" fill={petalColor} />
          <path d="M0,-11 C5,-8 6,2 0,7 C-6,2 -5,-8 0,-11 Z" fill={centerColor} opacity="0.55" />
        </g>
      )}
    </motion.svg>
  );
}
