import PostList, { type PostListItem } from "@/components/PostList";
import { getAllPosts, getAllCategories } from "@/lib/posts";

export default function Home() {
  const posts: PostListItem[] = getAllPosts().map(
    ({ slug, title, date, category }) => ({ slug, title, date, category }),
  );
  const categories = getAllCategories();

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <PostList posts={posts} categories={categories} />
    </main>
  );
}
