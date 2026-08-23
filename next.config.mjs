/** @type {import('next').NextConfig} */
const nextConfig = {
  // GitHub Pages는 정적 호스팅이므로 정적 export로 빌드한다.
  output: "export",
  // 정적 export에서는 next/image 최적화가 동작하지 않는다.
  images: { unoptimized: true },
  // 정적 호스팅에서 /posts/foo/ → /posts/foo/index.html 로 매핑되도록.
  trailingSlash: true,
};

export default nextConfig;
