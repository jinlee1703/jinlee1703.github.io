import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllCategories, getPostsByCategory } from "@/lib/posts";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllCategories().map((c) => ({ category: c.name }));
}

type Params = { category: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { category } = await params;
  const cat = decodeURIComponent(category);
  return {
    title: `${cat} 글 목록`,
    description: `${cat} 카테고리의 글 목록입니다.`,
    alternates: { canonical: `/${cat}/` },
  };
}

function formatDate(iso: string): string {
  return iso.replace(/-/g, ".");
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { category } = await params;
  const cat = decodeURIComponent(category);
  const posts = getPostsByCategory(cat);
  if (posts.length === 0) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8">
        <div className="mb-1 text-sm text-[var(--muted)]">
          <Link
            href="/"
            className="transition-colors hover:text-[var(--foreground)]"
          >
            글
          </Link>
          <span> / {cat}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{cat}</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">{posts.length}개의 글</p>
      </header>

      <ul className="divide-y divide-[var(--border)]">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/${p.category}/${p.slug}/`}
              className="group flex items-baseline justify-between gap-4 py-3"
            >
              <span className="flex-1 transition-colors group-hover:text-[var(--accent)]">
                {p.title}
              </span>
              <time className="shrink-0 tabular-nums text-xs text-[var(--muted)]">
                {formatDate(p.date)}
              </time>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
