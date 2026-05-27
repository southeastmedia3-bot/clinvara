import type { MetadataRoute } from "next";
import { allProducts } from "@/lib/data/products";
import { blogs } from "@/lib/data/blogs";

const baseUrl = "https://clinvara.global";

const staticRoutes = [
  "",
  "/shop",
  "/routines",
  "/blog",
  "/track-order",
  "/contact",
  "/about-us",
  "/our-values",
  "/privacy-policy",
  "/terms-and-conditions",
  "/sustainability",
  "/faqs",
  "/shipping-policy",
  "/return-refund-policy",
  "/careers",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    ...staticRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: now,
      changeFrequency:
        route === "" || route === "/shop"
          ? ("weekly" as const)
          : ("monthly" as const),
      priority: route === "" ? 1 : route === "/shop" ? 0.9 : 0.7,
    })),
    ...allProducts.map((product) => ({
      url: `${baseUrl}/shop/${product.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...blogs.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
