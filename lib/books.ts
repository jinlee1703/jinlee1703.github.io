import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { sortByDateDesc } from "./posts";

export interface BookMeta {
  slug: string;
  title: string;
  author: string;
  date: string;
  cover?: string;
  link?: string;
}

export interface Book extends BookMeta {
  /** 리뷰 본문 (마크다운) */
  content: string;
}

const BOOKS_DIR = path.join(process.cwd(), "content/books");

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function normalizeDate(value: unknown): string {
  if (value instanceof Date) {
    return `${value.getUTCFullYear()}-${pad(value.getUTCMonth() + 1)}-${pad(value.getUTCDate())}`;
  }
  if (typeof value === "string") return value.slice(0, 10);
  return "";
}

/** 파일 내용과 slug로부터 Book을 파싱한다. (순수 함수) */
export function parseBook(fileContent: string, slug: string): Book {
  const { data, content } = matter(fileContent);
  return {
    slug,
    title: typeof data.title === "string" && data.title ? data.title : slug,
    author: typeof data.author === "string" ? data.author : "",
    date: normalizeDate(data.date),
    cover: typeof data.cover === "string" ? data.cover : undefined,
    link: typeof data.link === "string" ? data.link : undefined,
    content,
  };
}

/** content/books/*.md 를 모두 읽어 최신순으로 반환한다. */
export function getAllBooks(): Book[] {
  if (!fs.existsSync(BOOKS_DIR)) return [];
  const books = fs
    .readdirSync(BOOKS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const slug = f.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(BOOKS_DIR, f), "utf-8");
      return parseBook(raw, slug);
    });
  return sortByDateDesc(books);
}

export function getBookBySlug(slug: string): Book | null {
  const file = path.join(BOOKS_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  return parseBook(fs.readFileSync(file, "utf-8"), slug);
}

export function getAllBookSlugs(): string[] {
  return getAllBooks().map((b) => b.slug);
}
