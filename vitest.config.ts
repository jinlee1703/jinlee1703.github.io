import { defineConfig } from "vitest/config";

export default defineConfig({
  // tsconfig의 jsx: preserve 대신 React 17+ 자동 런타임으로 변환해 컴포넌트를 렌더 테스트한다.
  esbuild: { jsx: "automatic" },
  resolve: { alias: { "@": new URL("./", import.meta.url).pathname } },
  test: {
    globals: true,
    environment: "node",
    include: ["**/*.test.ts", "**/*.test.tsx"],
  },
});
