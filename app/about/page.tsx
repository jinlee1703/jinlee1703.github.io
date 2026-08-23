import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "소개",
  description: "백엔드 개발자 이진우를 소개합니다.",
  alternates: { canonical: "/about/" },
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <article className="prose prose-neutral max-w-none dark:prose-invert">
        <h1>소개</h1>
        <p>
          사람들의 일상에서 불편함을 해소하고 삶의 질을 높이는 서비스를 구현하는
          백엔드 개발자를 지향합니다. 시간보다 중요한 건 밀도라고 믿습니다.
        </p>

        <h2>Career</h2>
        <ul>
          <li>
            경북소프트웨어고등학교 기능경기대회 정보기술 직종 준비반 강사
            (2021.11. ~ 2022.08.)
          </li>
          <li>엑셀 및 VBA 활용 프리랜서 (2017.08. ~ 현재)</li>
        </ul>

        <h2>Activity</h2>
        <ul>
          <li>경북기계공업고등학교 정보기술 기능영재반 (2014.03. ~ 2017.02.)</li>
          <li>2022 오픈소스 컨트리뷰션 아카데미 (2022.07. ~ 2022.10.)</li>
          <li>부스트캠프 웹·모바일 7기 (2022.07. ~ 2022.12.)</li>
        </ul>

        <h2>Award</h2>
        <ul>
          <li>
            2021 사회맞춤형 산학협력 선도전문대학(LINC+) 팀프로젝트 경진대회 —
            대상(교육부장관상)
          </li>
          <li>
            2017 Microsoft Office Specialist 세계경진대회 Excel 부문 한국대표
            선발전 — 1등(한국대표)
          </li>
          <li>2016 전국기능경기대회 정보기술 직종 — 우수상(4위)</li>
          <li>2016 대구지방기능경기대회 — 금(1위)</li>
        </ul>

        <h2>Contact</h2>
        <ul>
          <li>
            GitHub —{" "}
            <a
              href="https://github.com/jinlee1703"
              target="_blank"
              rel="noopener noreferrer"
            >
              @jinlee1703
            </a>
          </li>
        </ul>
      </article>
    </main>
  );
}
