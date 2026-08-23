import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts().map((p) => ({
    url: `${SITE.url}/${p.category}/${p.slug}/`,
    lastModified: p.date,
  }));

  return [
    { url: `${SITE.url}/` },
    { url: `${SITE.url}/about/` },
    ...posts,
  ];
}
