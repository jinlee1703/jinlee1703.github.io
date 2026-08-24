/**
 * 각 글의 OG 이미지(1200x630 PNG)를 빌드 전에 생성해 public/og/{category}/{slug}.png 로 저장한다.
 *
 * opengraph-image 특수파일을 dynamic route에 두면 static export에서 metadata RSC 직렬화가
 * 깨져 글 상세가 크래시하므로(Next.js #51147, #50698), 대신 이 스크립트로 PNG만 만들고
 * og:image는 generateMetadata에서 수동으로 지정한다.
 *
 * 실행: npm run og  (prebuild로 자동 실행)
 */
import React from "react";
import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";
import { getAllPosts } from "../lib/posts";

const fontData = fs.readFileSync(
  path.join(process.cwd(), "fonts/Pretendard-Bold.otf"),
);
const OUT = path.join(process.cwd(), "public/og");

async function render(title: string, category: string): Promise<Buffer> {
  const image = new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "#0f0f0f",
          padding: "80px",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, color: "#60a5fa" }}>
          {category}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 64,
            color: "#ededed",
            lineHeight: 1.3,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#9ca3af" }}>
          개발자 이진우 · jinlee.kr
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Pretendard", data: fontData, weight: 700, style: "normal" },
      ],
    },
  );
  return Buffer.from(await image.arrayBuffer());
}

async function main(): Promise<void> {
  const posts = getAllPosts();
  const limit = process.argv.includes("--sample") ? 1 : posts.length;
  let count = 0;
  for (const post of posts.slice(0, limit)) {
    const dir = path.join(OUT, post.category);
    fs.mkdirSync(dir, { recursive: true });
    const buf = await render(post.title, post.category);
    fs.writeFileSync(path.join(dir, `${post.slug}.png`), buf);
    count++;
  }
  console.log(`✅ OG 이미지 ${count}개 생성 → public/og/`);
}

main();
