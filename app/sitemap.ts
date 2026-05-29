import type { MetadataRoute } from "next";
import { blogs } from "@/lib/data/blogs";
import { getStorefrontProducts } from "@/lib/firebase/products";

const baseUrl = "https://clinvara.global";

const staticRoutes = [
  { route: "", priority: 1, changeFrequency: "weekly" as const },
  { route: "/shop", priority: 0.9, changeFrequency: "weekly" as const },
  { route: "/routines", priority: 0.75, changeFrequency: "monthly" as const },
  { route: "/contact", priority: 0.7, changeFrequency: "monthly" as const },
  { route: "/about-us", priority: 0.7, changeFrequency: "monthly" as const },
  { route: "/our-values", priority: 0.65, changeFrequency: "monthly" as const },
  { route: "/faqs", priority: 0.65, changeFrequency: "monthly" as const },
  { route: "/sustainability", priority: 0.6, changeFrequency: "monthly" as const },
  { route: "/shipping-policy", priority: 0.45, changeFrequency: "yearly" as const },
  { route: "/return-refund-policy", priority: 0.45, changeFrequency: "yearly" as const },
  { route: "/privacy-policy", priority: 0.35, changeFrequency: "yearly" as const },
  { route: "/terms-and-conditions", priority: 0.35, changeFrequency: "yearly" as const },
  { route: "/careers", priority: 0.4, changeFrequency: "monthly" as const },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const products = await getStorefrontProducts();

  return [
    ...staticRoutes.map(({ route, priority, changeFrequency }) => ({
      url: `${baseUrl}${route}`,
      lastModified: now,
      changeFrequency,
      priority,
    })),

    ...products.map((product) => ({
      url: `${baseUrl}/shop/${product.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: product.badge ? 0.85 : 0.8,
    })),

    ...blogs.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
