---
layout: post
title: Webpack & Babel & Source-map & Boilerplate
description: >
  본 글은 기존 Notion에서 이전된 글입니다.
sitemap: false
hide_last_modified: true
---

## Webpack

### 웹팩의 정의

- 최신 프론트엔드 프레임워크에서 가장 많이 사용되는 모듈 번들러(Module Bundler)
  - 모듈 번들러 : 웹 애플리케이션을 구성하는 자원(HTML, CSS, JavaScript, Images 등)을 모두 각각의 모듈로 보고 이를 조합하여 병합된 하나의 결과물을 만드는 도구
- 여러개의 리소스 파일(JS, CSS, JPG 등)을 하나로 묶어주는 도구

### 웹팩의 장점

1. 여러개의 파일을 하나로 묶어주기 때문에 네트워크 접속의 부담이 줄어듦
   1. 더 빠른 서비스 제공
2. 여러개의 서로 다른 패키지들이 서로 같은 이름의 전역 변수를 사용하면 프로그램은 오동작하게 됨
   1. 이런 문제를 극복하기 위해 등장한 것이 모듈
   2. 웹팩은 아직 최신기술이라 적용하기가 애매한 기술인 모듈을 오래된 브라우저에서도 사용할 수 있게 도와줌
3. 웹팩에는 매우 많은 플러그인들이 존재
   1. 이러한 플러그인들을 이용하면 웹 개발시에 필요한 다양한 작업을 자동화 할 수 있음

### 모듈이란

- 프로그래밍 관점에서 특정 기능을 갖는 작은 코드 단위

  ```jsx
  // math.js
  function sum(a, b) {
    return a + b;
  }

  function substract(a, b) {
    return a - b;
  }

  const pi = 3.14;

  export { sum, substract, pi };
  ```

  - 이 math.js 파일은 3가지 기능을 갖고 있는 모듈
    - sum() 함수
    - substract() 함수
    - pi 상수

- 성격이 비슷한 기능들을 하나의 의미 있는 파일로 관리하면 모듈

### 웹팩에서의 모듈

- 웹 애플리케이션을 구성하는 모든 자원을 의미
  - 웹 애플리케이션을 제작하려면 HTML, CSS, Javascript, Images, Font 등 많은 파일들이 필요함 (이 파일 하나하나가 모두 모듈)

### 모듈 번들링

- 웹 애플리케이션을 구성하는 몇십, 몇백개의 자원들을 하나의 파일로 병합 및 압축해주는 동작
  ![image](https://user-images.githubusercontent.com/68031450/240645332-3febdbac-e57a-4eda-821a-ac18d6149fab.png)

> 빌드, 번들링, 변환 이 세 단어 모두 같은 의미

---

## Babel

### Babel이란

- **Babel is a JavaScript compiler.**
  - JavaScript로 결과물을 만들어주는 컴파일러
  - 소스 대 소스 컴파일러

### JavaScript로 변환하는 과정이 필요한 이유

- 새로운 ESNext 문법을 기존의 브라우저에 사용하기 위해 **(하위 호환성 고려)**
  - 모든 사람들이 새로운 브라우저를 사용하며 좋겠지만 아직도 많은 사람들이 예전 브라우져 예전 OS 를 사용하고 있음
- 새로운 언어 고려
  - typescript 든 coffeescript 든 javascript 로의 compile이 필수가 되어야 하며, 이를 담당하는게 babel
- polyfill
  - 개발자가 특정 기능이 지원되지 않는 브라우저를 위해 사용할 수 있는 코드 조각이나 플러그인
  - 브라우저에서 지원하지 않는 기능들에 대한 호환성 작업을 채워 넣는다고 해서 polyfill이라고 칭함
  - 이러한 polyfill 을 손쉽게 지원하기 위해 babel-polyfill 기능을 지원

---

## Source-map

### 소스 맵이란

- 배포용으로 빌드한 파일과 원본 파일을 서로 연결시켜주는 기능
- 만일 빌드 후 취합되거나 변환 된 CSS, JavaScript 파일들이 오류가 발생한다면, 개발자 도구에서는 빌드 된 파일에서 오류를 출력하고 있을 것
  - 우리가 원하는 것은 **빌드 전 오류난 파일 및 라인** 을 알고싶은 것

---

## Boilerplate

### 보일러플레이트란

- 컴퓨터 프로그래밍에서 보일러 플레이트 또는 보일러 플레이트 코드라고 부르는 것은 최소한의 변경으로 여러 곳에서 재사용되며, 반복적으로 비슷한 형태를 띄는 코드
- 웹 개발 쪽을 하다 보니 여기선 개발을 시작할 수 있는 기초가 되는 주춧돌, template

---

## Reference

[웹팩이란? | 웹팩 핸드북](https://joshua1988.github.io/webpack-guide/webpack/what-is-webpack.html#%EB%AA%A8%EB%93%88%EC%9D%B4%EB%9E%80)

[번역) 10분 만에 웹팩 배우기 (Learn webpack in under 10minutes)](https://serzhul.io/JavaScript/learn-webpack-in-under-10minutes/)

[babel 이란 무엇인가?](https://bravenamme.github.io/2020/02/12/what-is-babel/)

[Source Map | 웹팩 핸드북](https://joshua1988.github.io/webpack-guide/devtools/source-map.html)

[보일러플레이트 코드란?(Boilerplate code)](https://charlezz.medium.com/%EB%B3%B4%EC%9D%BC%EB%9F%AC%ED%94%8C%EB%A0%88%EC%9D%B4%ED%8A%B8-%EC%BD%94%EB%93%9C%EB%9E%80-boilerplate-code-83009a8d3297)

[Webpack으로 boilerplate 만들기 - 1 (webpack, babel 설정하기)](https://haerang94.tistory.com/5?category=791931)

[웹팩(Webpack) 밑바닥부터 설정하기](https://365kim.tistory.com/35)
