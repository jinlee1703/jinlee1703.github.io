/**
 * favicon 세트를 생성한다. 블로그명 이니셜 "JW"를 다크 배경에 흰 글자로 렌더한다.
 *
 * 마이그레이션(Jekyll→Next.js) 때 favicon 설정이 누락되어 검색결과에 옛 Hydejack "hy"
 * 파비콘이 캐시된 채 남아 있었음. 이 스크립트로 파비콘을 새로 만들고 metadata.icons에 연결한다.
 *
 * next/og로 각 크기 PNG를 렌더하고, favicon.ico는 PNG를 ICO 컨테이너로 래핑한다
 * (Vista 이후 ICO는 PNG 임베드를 허용하므로 별도 인코더 없이 정식 .ico 생성 가능).
 *
 * 실행: npm run favicon  (생성물은 리포에 커밋한다)
 */
import React from "react";
import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";

const fontData = fs.readFileSync(
  path.join(process.cwd(), "fonts/Pretendard-Bold.otf"),
);
const PUB = path.join(process.cwd(), "public");

async function renderPng(size: number): Promise<Buffer> {
  const image = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f0f0f",
          color: "#ffffff",
          fontSize: Math.round(size * 0.44),
          fontWeight: 700,
          letterSpacing: -Math.round(size * 0.03),
          fontFamily: "Pretendard",
        }}
      >
        JW
      </div>
    ),
    {
      width: size,
      height: size,
      fonts: [
        { name: "Pretendard", data: fontData, weight: 700, style: "normal" },
      ],
    },
  );
  return Buffer.from(await image.arrayBuffer());
}

/** 단일 PNG를 담은 ICO 컨테이너를 만든다. */
function pngToIco(png: Buffer, size: number): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // image count

  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 = 256)
  entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
  entry.writeUInt8(0, 2); // palette
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png.length, 8); // image size
  entry.writeUInt32LE(6 + 16, 12); // offset

  return Buffer.concat([header, entry, png]);
}

async function main() {
  const p32 = await renderPng(32);
  const p48 = await renderPng(48);
  const p180 = await renderPng(180);
  const p192 = await renderPng(192);
  const p512 = await renderPng(512);

  fs.writeFileSync(path.join(PUB, "favicon.ico"), pngToIco(p48, 48));
  fs.writeFileSync(path.join(PUB, "favicon-32x32.png"), p32);
  fs.writeFileSync(path.join(PUB, "apple-icon.png"), p180);
  fs.writeFileSync(path.join(PUB, "icon-192.png"), p192);
  fs.writeFileSync(path.join(PUB, "icon-512.png"), p512);

  console.log("favicon 생성 완료: favicon.ico(48), 32, apple(180), 192, 512");
}

main();
