---
layout: post
title: Template Engine
description: >
  본 글은 기존 Notion에서 이전된 글입니다.
sitemap: false
hide_last_modified: true
---

---

## 템플릿 엔진이란

- 웹 템플릿 엔진은 웹 템플릿들과 웹 컨텐츠 정보를 처리하기 위해 설계된 소프트웨어
- 웹 템플릿 엔진은 view code(html)와 data logic code(db connection)을 분리해주는 기능을 함

![image](https://user-images.githubusercontent.com/68031450/233296551-02725a0a-db04-46e4-a9e1-ee4932319a18.png)

## 템플릿 엔진의 필요성

- 대부분의 템플릿 엔진은 HTML에 비해 간단한 문법을 사용함으로써 코드량을 줄일 수 있음
- 데이터만 바뀌는 경우가 굉장히 많으므로 재사용성을 높일 수 있음
- 유지 보수가 용이해짐
- 자바스크립트를 사용하여 HTML을 렌더링 할 수 있게 해줌 ⇒ 반복문 등을 이용하여 간단하게 처리할 수 있음
  - HTML과 문법이 살짝 다를 수 있고, 자바스크립트 문법이 들어갈 수 있음

## 템플릿 엔진별 비교

### 1. Pug

- 장점
  - EJS에 비해 깔끔한 구문 ⇒ 직관적인 느낌을 줄 수 있음
  - 컴파일 후 html 문서를 렌더링하는 형식이기 때문에 생산성 향상
- 단점
  - 문법이 생소하여 익히는데 시간이 조금 걸릴 수 있음

### 2. Nunjucks

- HTML 문법을 사용하되, 추가로 자바스크립트 문법을 사용
- 특징
  - 확장자를 html 그대로 사용할 수도 있고 njk로 사용할 수도 있음

### 3. ejs

- ejs는 embedded javascript template의 약자
- node.js에서 사용하는 템플릿 뷰 엔진 중 하나
- 쉬운 문법으로 html내에서 인자로 넘겨받은 변수를 사용할 수 있다
- 장점
  - 기존의 HTML 문법에 <% %>를 사용하여 기존 문법에 크게 벗어나지 않음 ⇒ 러닝 커브가 낮음
  - Jade(pug) 보다 빠르다고 함
- 단점
  - block을 사용하기 위해서는 별도의 *third-party-library* 를 추가하여 사용해야 함
  - <% %> <%= %> 와 같은 문법이 HTML에 들어가 있어 코드를 읽기가 쉽지 않음

## 템플릿 엔진의 활용

[템플릿 엔진 모듈 - ejs, pug 모듈](https://namunotebook.tistory.com/12)

---

### Reference

[PUG vs EJS](https://velog.io/@ddaynew365/PUG-vs-EJS)

[Express - 템플릿 엔진 (Template Engine)](https://lgphone.tistory.com/78)

[Node.js - ejs에 대하여](https://recordofwonseok.tistory.com/m/46)

[실무에서 Handlebars 사용하기 (feat, express)](https://velog.io/@parkoon/%EC%8B%A4%EB%AC%B4%EC%97%90%EC%84%9C-Handlebars-%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0-feat-express)
