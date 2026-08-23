import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts().map((p) => ({
    url: `${SITE.url}/${p.category}/${p.slug}/`,
    lastModified: p.date,
    changeFrequency: "yearly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: `${SITE.url}/`,
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${SITE.url}/about/`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    ...posts,
  ];
}
