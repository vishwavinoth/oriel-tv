import { ImageResponse } from "next/og";
import { site } from "@/config/site";

export const dynamic = "force-static";
export const alt = `${site.name}: ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          color: "#F4F6FB",
          backgroundColor: "#07090F",
          backgroundImage:
            "radial-gradient(circle at 82% 92%, rgba(255, 138, 92, 0.55), rgba(255, 138, 92, 0) 55%), radial-gradient(circle at 15% 15%, rgba(170, 92, 255, 0.45), rgba(170, 92, 255, 0) 55%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 40, fontWeight: 700 }}>
          <svg width="72" height="72" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="15" fill="#141A33" />
            <path d="M17 49V29.5a15 15 0 0 1 30 0V49Z" fill="#9DB2FF" />
            <path d="M27 49V16M37 49V16M17 37.5h30" stroke="#141A33" strokeWidth="2.2" />
          </svg>
          Oriel TV
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 84, fontWeight: 700, letterSpacing: -3, lineHeight: 1.02 }}>Your TV deserves a better home.</div>
          <div style={{ fontSize: 34, color: "#B7BFCE" }}>{site.description}</div>
        </div>
      </div>
    ),
    size,
  );
}
