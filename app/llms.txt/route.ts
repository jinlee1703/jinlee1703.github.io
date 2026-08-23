import { getAllPosts } from "@/lib/posts";
import { SITE } from "@/lib/site";

// GEO: 생성형 엔진이 사이트를 이해하도록 llms.txt 표준(https://llmstxt.org) 제공
export const dynamic = "force-static";

export function GET() {
  const posts = getAllPosts();
  const lines = posts.map((p) => {
    const desc = p.description.replace(/\s+/g, " ").trim();
    const link = `${SITE.url}/${p.category}/${p.slug}/`;
    return desc ? `- [${p.title}](${link}): ${desc}` : `- [${p.title}](${link})`;
  });

  const body = `# ${SITE.title}

> ${SITE.description}

${SITE.tagline}

## 글 목록

${lines.join("\n")}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
