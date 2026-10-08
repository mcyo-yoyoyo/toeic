import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TOEIC 300 OS",
    short_name: "TOEIC 300",
    description: "56 天托业阅读个人备考助理",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f1ea",
    theme_color: "#1c1915",
    lang: "zh-CN",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
