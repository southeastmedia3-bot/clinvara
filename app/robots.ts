import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/account",
          "/cart",
          "/checkout",
          "/api",
          "/admin",
          "/login",
          "/signup",
        ],
      },
    ],
    sitemap: "https://clinvara.global/sitemap.xml",
    host: "https://clinvara.global",
  };
}