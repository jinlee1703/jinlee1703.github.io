/**
 * Next static export는 opengraph-image를 확장자 없는 파일(`opengraph-image`)로 내보내고
 * og:image URL도 `/opengraph-image?<hash>` 형태로 쓴다. GitHub Pages는 확장자로 MIME을
 * 판단하므로 확장자가 없으면 Content-Type이 비어 SNS 크롤러가 이미지를 인식하지 못한다.
 *
 * 이 스크립트는 빌드 후(out/) opengraph-image 파일에 `.png`를 붙이고,
 * HTML의 og:image / twitter:image URL을 `opengraph-image.png`로 교정한다.
 * (package.json의 postbuild로 자동 실행)
 */
import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "out");

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, files);
    else files.push(p);
  }
  return files;
}

function main(): void {
  if (!fs.existsSync(OUT)) return;

  const files = walk(OUT);

  let renamed = 0;
  for (const f of files) {
    if (path.basename(f) === "opengraph-image") {
      fs.renameSync(f, `${f}.png`);
      renamed++;
    }
  }

  let patched = 0;
  for (const f of walk(OUT)) {
    if (!f.endsWith(".html")) continue;
    const content = fs.readFileSync(f, "utf-8");
    const next = content.replace(
      /opengraph-image\?[^"'\s)]+/g,
      "opengraph-image.png",
    );
    if (next !== content) {
      fs.writeFileSync(f, next);
      patched++;
    }
  }

  console.log(
    `✅ OG 이미지 확장자 교정: ${renamed}개 리네임, HTML ${patched}개 패치`,
  );
}

main();
