import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION } from "@/components/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sunrise: Minecraft Java Edition rewritten in Rust",
    short_name: "Sunrise",
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "browser",
    background_color: "#170c19",
    theme_color: "#170c19",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { src: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
  };
}
