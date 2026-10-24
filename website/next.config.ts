import type { NextConfig } from "next";

// The site is fully static: every page renders at build time and `next build` writes plain files to out/.
// It's deployed on Vercel, but out/ can be served from any static host (ADR 0002).
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
