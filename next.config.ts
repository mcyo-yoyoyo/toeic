import type { NextConfig } from "next";

const pages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  ...(pages
    ? {
        output: "export" as const,
        basePath: "/toeic",
        assetPrefix: "/toeic",
        trailingSlash: true,
      }
    : {}),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
