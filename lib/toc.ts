import GithubSlugger from "github-slugger";

export interface TocItem {
  depth: number;
  text: string;
  id: string;
}

/**
 * 마크다운 본문에서 h2/h3 헤딩을 추출해 목차를 만든다.
 * id는 github-slugger로 생성하여 rehype-slug가 붙이는 id와 일치시킨다.
 */
export function extractToc(markdown: string): TocItem[] {
  const slugger = new GithubSlugger();
  const toc: TocItem[] = [];
  let inFence = false;

  for (const line of markdown.split("\n")) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = line.match(/^(#{2,3})\s+(.+?)\s*#*\s*$/);
    if (!match) continue;

    const depth = match[1].length;
    const text = match[2].replace(/[*`_~]/g, "").trim();
    toc.push({ depth, text, id: slugger.slug(text) });
  }

  return toc;
}
