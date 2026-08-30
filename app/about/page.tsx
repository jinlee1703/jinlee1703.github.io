import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "소개",
  description: "무언가에 몰입할 때 가장 행복한 개발자 이진우입니다.",
  alternates: { canonical: "/about/" },
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <article className="prose prose-neutral max-w-none dark:prose-invert">
        <h1>소개</h1>
        <p>안녕하세요. 무언가에 몰입할 때 가장 행복한 개발자 이진우입니다.</p>
        <p>
          기술로 문제를 푸는 것만큼 &ldquo;왜 이 문제를 푸는가&rdquo;를 아는 게
          중요하다고 믿습니다. 요구사항을 받아 구현하는 데서 멈추지 않고, 제품과
          사용자 맥락까지 이해하는 엔지니어이고 싶습니다.
        </p>

        <h2>이 블로그는</h2>
        <p>
          개발하며 마주친 문제와, 그것을 어떻게 판단하고 풀어냈는지 기록합니다.
          잘 정리된 결론보다, 결론에 이르기까지의 과정을 남기려 합니다.
        </p>

        <h2>Career</h2>
        <ul>
          <li>강남언니 KOS팀 백엔드 엔지니어 (2025.10 ~ 현재)</li>
          <li>
            <a
              href="https://naver.worksmobile.com/cases/navercare/"
              target="_blank"
              rel="noopener noreferrer"
            >
              네이버 Healthcare DT 개발 인턴
            </a>{" "}
            (2024.06 ~ 2024.08)
          </li>
        </ul>

        <h2>Activity</h2>
        <ul>
          <li>청소년 SW동행 대구과학고등학교 멘토 (2024.09 ~ 2024.11)</li>
          <li>
            <a
              href="https://github.com/Likelion-YeungNam-Univ"
              target="_blank"
              rel="noopener noreferrer"
            >
              멋쟁이사자처럼 영남대학교
            </a>{" "}
            대표 (2024.01 ~ 2024.12)
          </li>
          <li>
            <a
              href="https://github.com/SWM-REPL"
              target="_blank"
              rel="noopener noreferrer"
            >
              소프트웨어 마에스트로 14기
            </a>{" "}
            (2023.04 ~ 2023.12)
          </li>
          <li>
            <a
              href="https://github.com/Likelion-YeungNam-Univ"
              target="_blank"
              rel="noopener noreferrer"
            >
              멋쟁이사자처럼 영남대학교
            </a>{" "}
            11기 (2023.03 ~ 2023.12)
          </li>
          <li>
            <a
              href="https://github.com/boostcampwm-2022"
              target="_blank"
              rel="noopener noreferrer"
            >
              네이버 부스트캠프 웹·모바일 7기
            </a>{" "}
            (2022.07 ~ 2022.12)
          </li>
          <li>오픈소스 컨트리뷰션 아카데미 (2022.07 ~ 2022.10)</li>
          <li>
            경북소프트웨어고등학교 기능경기대회 정보기술 직종 준비반 강사 (2021.11
            ~ 2022.08)
          </li>
          <li>
            Microsoft Office Excel · VBA 프리랜서 (2017.08 ~ 현재)
          </li>
          <li>경북기계공업고등학교 정보기술 기능영재반 (2014.03 ~ 2017.02)</li>
        </ul>

      </article>
    </main>
  );
}
