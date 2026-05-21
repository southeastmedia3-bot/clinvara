import type { MetadataRoute } from "next";
import { allProducts } from "@/lib/data/products";
import { blogs } from "@/lib/data/blogs";

const base = "https://clinvara.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/shop",
    "/routines",
    "/blog",
    "/track-order",
    "/cart",
    "/account",
    "/contact",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const products = allProducts.map((p) => ({
    url: `${base}/shop/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const posts = blogs.map((b) => ({
    url: `${base}/blog/${b.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...products, ...posts];
}
