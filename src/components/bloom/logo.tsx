import * as React from "react";

/** Bloom's one logo: a white five-petal flower with a gold heart on pink. It
 *  stays pink under every palette, and matches src/app/icon.svg and the PNGs
 *  in public/icons, so the app reads the same in the tab, on the home screen
 *  and inside the app. */
export function BloomLogo({ size = 40, className }: { size?: number; className?: string }) {
  const id = React.useId();
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} role="img" aria-label="Bloom">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff6fb0" />
          <stop offset="1" stopColor="#ee2d85" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill={`url(#${id})`} />
      <g transform="translate(32 32)" fill="#ffffff">
        {[0, 72, 144, 216, 288].map((angle) => (
          <ellipse key={angle} cx="0" cy="-10.9" rx="6.7" ry="9" transform={`rotate(${angle})`} />
        ))}
      </g>
      <circle cx="32" cy="32" r="4.8" fill="#f6c453" />
    </svg>
  );
}
