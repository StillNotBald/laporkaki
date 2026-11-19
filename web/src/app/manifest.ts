import type { MetadataRoute } from "next";
import { submission } from "@/content/submission";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: submission.project.name,
    short_name: submission.project.name,
    description: "Report a public problem. We find who fixes it.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}