import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";
import { getAllPostParams, getPostBySlug } from "@/lib/posts";
import { SITE } from "@/lib/site";

export const dynamicParams = false;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllPostParams();
}

const fontData = fs.readFileSync(
  path.join(process.cwd(), "fonts/Pretendard-Bold.otf"),
);

type Params = { category: string; slug: string };

export default async function Image({ params }: { params: Promise<Params> }) {
  const { category, slug } = await params;
  const post = getPostBySlug(
    decodeURIComponent(category),
    decodeURIComponent(slug),
  );
  const title = post?.title ?? SITE.title;
  const cat = post?.category ?? "";

  return new ImageResponse(
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
          {cat}
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
      ...size,
      fonts: [
        { name: "Pretendard", data: fontData, weight: 700, style: "normal" },
      ],
    },
  );
}
