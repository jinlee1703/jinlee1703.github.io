import type { Metadata } from "next";
import PostList, { type PostListItem } from "@/components/PostList";
import { getAllPosts, getAllCategories } from "@/lib/posts";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  const posts: PostListItem[] = getAllPosts().map(
    ({ slug, title, date, category, description }) => ({
      slug,
      title,
      date,
      category,
      description,
    }),
  );
  const categories = getAllCategories();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${SITE.url}/#blog`,
    name: SITE.title,
    description: SITE.description,
    url: `${SITE.url}/`,
    inLanguage: "ko-KR",
    publisher: { "@id": `${SITE.url}/#person` },
    blogPost: posts.slice(0, 10).map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${SITE.url}/${p.category}/${p.slug}/`,
      datePublished: p.date,
    })),
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PostList posts={posts} categories={categories} />
    </main>
  );
}
