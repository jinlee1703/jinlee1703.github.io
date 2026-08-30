import type { MetadataRoute } from "next";
import { getAllPosts, getAllCategories } from "@/lib/posts";
import { getAllBooks } from "@/lib/books";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts().map((p) => ({
    url: `${SITE.url}/${p.category}/${p.slug}/`,
    lastModified: p.date,
    changeFrequency: "yearly" as const,
    priority: 0.8,
  }));

  const categories = getAllCategories().map((c) => ({
    url: `${SITE.url}/${c.name}/`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const books = getAllBooks().map((b) => ({
    url: `${SITE.url}/bookshelf/${b.slug}/`,
    lastModified: b.date,
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  return [
    {
      url: `${SITE.url}/`,
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${SITE.url}/posts/`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    {
      url: `${SITE.url}/about/`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${SITE.url}/bookshelf/`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    },
    ...categories,
    ...posts,
    ...books,
  ];
}
