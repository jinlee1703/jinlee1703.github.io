import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkGithubAlerts from "remark-github-alerts";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import { rehypeMermaid, rehypeImageAttrs } from "./rehype-mermaid";

/**
 * 마크다운 본문을 HTML 문자열로 렌더한다. (빌드 타임)
 * - GFM(표/취소선/체크박스), GitHub Alert(콜아웃)
 * - 헤딩 id(rehype-slug) + 앵커 링크
 * - 코드 하이라이트(Shiki, github-dark)
 * - 원본에 섞인 raw HTML(&nbsp;, <img>, <br> 등)도 처리(rehype-raw)
 */
export async function renderMarkdown(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkGithubAlerts)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeImageAttrs)
    // mermaid 코드블록은 Shiki 하이라이트 전에 div.mermaid로 분리한다.
    .use(rehypeMermaid)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: "wrap" })
    .use(rehypePrettyCode, { theme: "github-dark", keepBackground: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);
  return String(file);
}
