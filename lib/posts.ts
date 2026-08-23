import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export interface PostMeta {
  slug: string;
  title: string;
  /** ISO 형식 날짜 "YYYY-MM-DD" */
  date: string;
  category: string;
  description: string;
  published: boolean;
}

export interface Post extends PostMeta {
  /** MDX 본문 (front matter 제외) */
  content: string;
}

export interface CategoryCount {
  name: string;
  count: number;
}

const POSTS_DIR = path.join(process.cwd(), "content/posts");

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** gray-matter가 YAML date를 Date로 파싱하는 경우까지 포함해 "YYYY-MM-DD"로 정규화한다. */
function normalizeDate(value: unknown): string {
  if (value instanceof Date) {
    return `${value.getUTCFullYear()}-${pad(value.getUTCMonth() + 1)}-${pad(value.getUTCDate())}`;
  }
  if (typeof value === "string") {
    return value.slice(0, 10);
  }
  return "";
}

/** 파일 내용과 slug로부터 Post를 파싱한다. (순수 함수) */
export function parsePost(fileContent: string, slug: string): Post {
  const { data, content } = matter(fileContent);
  return {
    slug,
    title: typeof data.title === "string" && data.title ? data.title : slug,
    date: normalizeDate(data.date),
    category:
      typeof data.category === "string" && data.category ? data.category : "etc",
    description: typeof data.description === "string" ? data.description : "",
    published: data.published !== false,
    content,
  };
}

/** 날짜 내림차순(최신순) 정렬. 원본 배열을 변형하지 않는다. */
export function sortByDateDesc<T extends { date: string }>(posts: T[]): T[] {
  return [...posts].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/** 카테고리별 글 개수를 세어 개수 내림차순으로 반환한다. */
export function groupByCategory(posts: { category: string }[]): CategoryCount[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    counts.set(post.category, (counts.get(post.category) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

// ── 파일시스템 기반 조회 (빌드 타임) ────────────────────────────────

/** content/posts/*.mdx 를 모두 읽어 published 글만 최신순으로 반환한다. */
export function getAllPosts(): Post[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const posts = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const slug = f.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(POSTS_DIR, f), "utf-8");
      return parsePost(raw, slug);
    })
    .filter((p) => p.published);
  return sortByDateDesc(posts);
}

export function getPostBySlug(slug: string): Post | null {
  const file = path.join(POSTS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  return parsePost(fs.readFileSync(file, "utf-8"), slug);
}

export function getAllCategories(): CategoryCount[] {
  return groupByCategory(getAllPosts());
}

export function getPostsByCategory(category: string): Post[] {
  return getAllPosts().filter((p) => p.category === category);
}
