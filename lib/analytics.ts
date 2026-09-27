// Jekyll(Hydejack) 시절 두 곳에서 보내던 측정 ID를 그대로 유지한다.
// G-GVW5DRM3KG: base.html에 직접 넣은 gtag, G-D0EJL6FSZR: _config.yml의 google_analytics
export const GA_IDS = ["G-GVW5DRM3KG", "G-D0EJL6FSZR"];

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
