---
layout: post
title: Headless Browser
description: >
  멘토링을 듣던 중, Headless Browser라는 키워드를 접하게 되었고, 이에 대한 내용을 정리하고자 한다.
sitemap: false
hide_last_modified: false
---

---

## Headless Browser?

&nbsp; 그래픽 사용자 인터페이스(GUI)가 없는 웹 브라우저를 의미한다. 일반적인 브라우저와 동일한 기능을 수행하지만, 화면에 표시되지 않고 백그라운드에서 실행된다.

## Point

- GUI 없음 : 시각적 출력이 필요 없어, 서버 환경에서 효율적으로 동작
- 리소스 효율성 : GUI 관련 리소스를 사용하지 않아 더 적은 메모리와 CPU 사용
- 자동화에 최적화 : 스크립트를 통한 제어가 용이함
- 빠른 실행 속도 : GUI 렌더링 과정이 없어 일반 브라우저보다 빠름

## Usage

- 웹 스크래핑 및 크롤링
- 자동화된 테스팅 (CI/CD 파이프라인)
- 서버 사이드 렌더링
- PDF 생성
- 성능 모니터링 및 분석
- 자동화된 스크린샷 생성

## Disadvantage

- 상대적으로 복잡한 디버깅
- 일부 복잡하 ㄴ웹 애플리케이션에서 정확한 렌더링이 어려울 수 있음
- 사용자 상호작용이 필요한 테스트에는 부적합

## Library

- Puppeteer (Node.js)
- Selenium WebDriver
- Playwright

## Caution

&nbsp; 헤드리스 브라우저는 악성 소프트웨어나 봇에 의해 악용될 수 있어, 웹사이트 운영자들은 이를 탐지하고 대응하는 방법을 고려해야 한다.
