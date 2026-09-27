import { GA_IDS, gtagSrc, gtagInitScript } from "./analytics";

describe("Google Analytics", () => {
  it("Blog 속성의 측정 ID 하나로만 수집한다", () => {
    expect(GA_IDS).toEqual(["G-GVW5DRM3KG"]);
  });

  it("gtag 로더 주소는 첫 번째 측정 ID로 만든다", () => {
    expect(gtagSrc(["G-AAA", "G-BBB"])).toBe(
      "https://www.googletagmanager.com/gtag/js?id=G-AAA",
    );
  });

  it("초기화 스크립트는 측정 ID마다 config를 호출한다", () => {
    const script = gtagInitScript(["G-AAA", "G-BBB"]);

    expect(script).toContain("gtag('js', new Date());");
    expect(script).toContain("gtag('config', 'G-AAA');");
    expect(script).toContain("gtag('config', 'G-BBB');");
  });
});
