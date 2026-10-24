import type { SVGProps } from "react";

/** The Oriel mark: an arched bay window with six panes of light. Original artwork for this project. */
export function OrielMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false" {...props}>
      <defs>
        <linearGradient id="oriel-mark-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1C2344" />
          <stop offset="1" stopColor="#07090F" />
        </linearGradient>
        <linearGradient id="oriel-mark-glass" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#F4F6FF" />
          <stop offset="0.5" stopColor="#9DB2FF" />
          <stop offset="1" stopColor="#5B5FD6" />
        </linearGradient>
        <clipPath id="oriel-mark-arch">
          <path d="M17 49V29.5a15 15 0 0 1 30 0V49Z" />
        </clipPath>
      </defs>
      <rect width="64" height="64" rx="15" fill="url(#oriel-mark-bg)" />
      <path d="M17 49V29.5a15 15 0 0 1 30 0V49Z" fill="url(#oriel-mark-glass)" />
      <g clipPath="url(#oriel-mark-arch)" stroke="#11162C" strokeWidth="2.2">
        <path d="M27 50V12M37 50V12M16 37.5h32" />
      </g>
      <path d="M14 49.5h36" stroke="#9DB2FF" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
