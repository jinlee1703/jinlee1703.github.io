/**
 * Jekyll 포스트(`{category}/_posts/*.md`)를 Next.js 콘텐츠(`content/posts/{category}/{slug}.md`)로 변환한다.
 * - front matter 재작성, {:toc}/상대경로 정리 (scripts/migrate-lib.ts)
 * - assets/img → public/assets/img 복사
 * - 로컬 이미지 깨진 링크 리포트 출력
 *
 * 실행: npm run migrate
 */
import fs from "node:fs";
import path from "node:path";
import { parseFilename, buildMarkdown } from "./migrate-lib";

const CATEGORIES = ["web", "database", "devops", "network", "essay", "trend", "etc"];
const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "content/posts");
const PUBLIC_ASSETS = path.join(ROOT, "public/assets");

function migratePosts(): { count: number; files: string[]; failures: string[] } {
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  const files: string[] = [];
  const failures: string[] = [];
  for (const category of CATEGORIES) {
    const srcDir = path.join(ROOT, category, "_posts");
    if (!fs.existsSync(srcDir)) continue;
    const outCat = path.join(OUT_DIR, category);
    fs.mkdirSync(outCat, { recursive: true });
    for (const file of fs.readdirSync(srcDir)) {
      if (!file.endsWith(".md")) continue;
      try {
        const { date, slug } = parseFilename(file);
        const original = fs.readFileSync(path.join(srcDir, file), "utf-8");
        const md = buildMarkdown({ original, category, date, slug });
        const outPath = path.join(outCat, `${slug}.md`);
        fs.writeFileSync(outPath, md);
        files.push(path.relative(ROOT, outPath));
      } catch (err) {
        failures.push(`${category}/_posts/${file} → ${(err as Error).message.split("\n")[0]}`);
      }
    }
  }
  return { count: files.length, files, failures };
}

function copyAssets(): void {
  // 실제 글이 참조하는 이미지(docs/)와 사이트 로고만 복사한다.
  // Hydejack 데모 이미지(blog/, sidebar-bg.jpg)는 제외.
  fs.rmSync(PUBLIC_ASSETS, { recursive: true, force: true });
  const items = ["img/docs", "img/logo.png"];
  for (const item of items) {
    const src = path.join(ROOT, "assets", item);
    if (!fs.existsSync(src)) continue;
    const dest = path.join(PUBLIC_ASSETS, item);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.cpSync(src, dest, { recursive: true });
  }
}

/** 변환된 글에서 로컬(/assets/...) 이미지 참조를 모아 실제 파일 존재를 검사한다. */
function reportBrokenImages(files: string[]): string[] {
  const broken: string[] = [];
  const imgRe = /!\[[^\]]*\]\((\/assets\/[^)\s]+)\)/g;
  for (const rel of files) {
    const content = fs.readFileSync(path.join(ROOT, rel), "utf-8");
    let m: RegExpExecArray | null;
    while ((m = imgRe.exec(content)) !== null) {
      const imgPath = path.join(ROOT, "public", decodeURIComponent(m[1]));
      if (!fs.existsSync(imgPath)) broken.push(`${rel} → ${m[1]}`);
    }
  }
  return broken;
}

function main(): void {
  const { count, files, failures } = migratePosts();
  copyAssets();
  const broken = reportBrokenImages(files);

  console.log(`\n✅ 변환 완료: ${count}개 글 → content/posts/`);
  if (failures.length > 0) {
    console.log(`\n❌ 변환 실패 ${failures.length}건:`);
    for (const f of failures) console.log("   -", f);
  }
  const byCat = files.reduce<Record<string, number>>((acc, f) => {
    const cat = f.split(path.sep)[2];
    acc[cat] = (acc[cat] ?? 0) + 1;
    return acc;
  }, {});
  console.log("   카테고리별:", JSON.stringify(byCat));

  if (broken.length > 0) {
    console.log(`\n⚠️  깨진 로컬 이미지 링크 ${broken.length}건:`);
    for (const b of broken) console.log("   -", b);
  } else {
    console.log("\n✅ 로컬 이미지 링크 깨짐 없음");
  }
}

main();
