import matter from "gray-matter";
import * as yaml from "js-yaml";

export interface BuildInput {
  /** 원본 Jekyll 마크다운 파일 전체 내용 */
  original: string;
  category: string;
  date: string;
  slug: string;
}

/** Jekyll 파일명 "YYYY-MM-DD-title.md" 에서 날짜와 slug(날짜 포함)를 추출한다. */
export function parseFilename(filename: string): { date: string; slug: string } {
  const base = filename.replace(/\.md$/, "");
  const match = base.match(/^(\d{4}-\d{2}-\d{2})-/);
  // URL/파일경로 안전을 위해 slug의 공백은 하이픈으로 정규화한다.
  const slug = base.replace(/\s+/g, "-");
  return { date: match ? match[1] : "", slug };
}

/**
 * Kramdown/Jekyll 전용 본문 문법을 정리한다.
 * - `{:toc}` seed 리스트 블록 제거 (TOC는 rehype로 생성)
 * - 상대경로 이미지(`../../assets/`, `../assets/`)를 사이트 절대경로(`/assets/`)로 변환
 */
export function transformBody(body: string): string {
  let out = body
    .split("\n")
    .filter((line) => {
      if (/^\s*\{:toc\}\s*$/.test(line)) return false;
      if (/this unordered seed list will be replaced by the toc/.test(line)) {
        return false;
      }
      return true;
    })
    .join("\n")
    .replace(/\.\.\/\.\.\/assets\//g, "/assets/")
    .replace(/\.\.\/assets\//g, "/assets/")
    .trimStart();

  // Hydejack이 본문 맨 앞에 넣던 장식용 수평선(---)을 제거한다. (본문 중간 hr은 보존)
  if (/^---\s*(\n|$)/.test(out)) {
    out = out.replace(/^---\s*(\n|$)/, "").trimStart();
  }
  return out;
}

/** 원본 Jekyll 글을 새 front matter + 정리된 본문의 마크다운으로 재작성한다. */
export function buildMarkdown({ original, category, date, slug }: BuildInput): string {
  const { data, content } = matter(original);

  const frontmatter: Record<string, unknown> = {
    title: typeof data.title === "string" && data.title ? data.title : slug,
    date,
    category,
    description: typeof data.description === "string" ? data.description.trim() : "",
  };
  // 기본값(true)은 생략하고, 명시적 false만 보존한다.
  if (data.published === false) {
    frontmatter.published = false;
  }

  // matter.stringify는 본문이 `---`로 시작하면 본문을 YAML로 오파싱하므로,
  // front matter를 직접 조립해 본문을 절대 파싱하지 않도록 한다.
  const yamlStr = yaml.dump(frontmatter, { lineWidth: -1, forceQuotes: false });
  return `---\n${yamlStr}---\n\n${transformBody(content)}\n`;
}
