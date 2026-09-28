// GA의 Blog 속성(https://jinlee.kr/ 웹 스트림) 측정 ID
export const GA_IDS = ["G-GVW5DRM3KG"];

// 로컬 dev 서버(localhost) 방문이 GA에 섞이지 않도록 프로덕션 빌드에서만 수집한다.
export function isAnalyticsEnabled(env: string | undefined): boolean {
  return env === "production";
}

export function gtagSrc(ids: string[]): string {
  return `https://www.googletagmanager.com/gtag/js?id=${ids[0]}`;
}

export function gtagInitScript(ids: string[]): string {
  const configs = ids.map((id) => `gtag('config', '${id}');`).join("\n");
  return `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
${configs}
`;
}
