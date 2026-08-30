import type { Metadata } from "next";
import PostList, { type PostListItem } from "@/components/PostList";
import { getAllPosts, getAllCategories } from "@/lib/posts";

export const metadata: Metadata = {
  title: "글",
  description: "개발하며 마주친 문제와 판단 과정을 기록합니다.",
  alternates: { canonical: "/posts/" },
};

export default function PostsPage() {
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
