import type { Metadata } from "next";
import PostList, { type PostListItem } from "@/components/PostList";
import { getAllPosts, getAllCategories } from "@/lib/posts";

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

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <PostList posts={posts} categories={categories} />
    </main>
  );
}
