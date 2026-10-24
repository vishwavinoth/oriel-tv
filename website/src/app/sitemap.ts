import type { MetadataRoute } from "next";
import { site } from "@/config/site";

export const dynamic = "force-static";

export const ROUTES = [
  "/",
  "/features/",
  "/devices/",
  "/docs/",
  "/docs/getting-started/",
  "/docs/device-management/",
  "/docs/troubleshooting/",
  "/downloads/",
  "/changelog/",
  "/contributing/",
  "/security/",
  "/privacy/",
  "/license/",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map((route) => ({
    url: new URL(route, site.url).toString(),
    lastModified,
    changeFrequency: route === "/" || route === "/changelog/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.6,
  }));
}
