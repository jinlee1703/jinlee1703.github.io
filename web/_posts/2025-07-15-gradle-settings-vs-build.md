---
layout: post
title: Gradle에서 settings.gradle과 build.gradle의 역할과 차이
description: >
  스프링 부트를 멀티모듈로 개발하다보면 `settings.gradle`과 `build.gradle`의 책임이 헷갈릴 때가 있다. 필자는 이 글에서 둘의 역할과 차이점을 명확히 정리해보고자 한다.
sitemap: false
hide_last_modified: false
published: true
---

---

* this unordered seed list will be replaced by the toc
{:toc}

## 📌 Settings.gradle의 역할

`settings.gralde`은 Gradle이 프로젝트 전체를 어떻게 구성할지를 정의하는 곳이다. 즉 루트 프로젝트와 서브 프로젝트(모듈)를 등록하고, 멀티모듈 빌드를 위한 스캐폴딩을 제공한다.

### 주요 기능

- 프로젝트 이름 정의
- 어떤 모듈(프로젝트)을 포함할지 결정

```gradle
rootProject.name = "my-app"
include("core", "service", "web")
```

### 빌드 실행 시

- `gradle build`를 하면 Gradle은 먼저 `settings.gradle`읅고,
- `core`, `service`, `web` 모듈을 찾아서 빌드 그래프를 생성한다.

## 📌 build.gradle의 역할

`build.gradle`은 각 모듈(또는 루트)에 대한 **빌드 스크립트**이다.

- 의존성, 플러그인, 빌드 태스크를 정의한다.

보통 멀티모듈에서는

- 루트 `build.gradle`에 공통 설정을,
- 각 모듈(`core/build.gradle` 등)에 모듈별 의존성을 작성한다.

```gradle
plugins {
    id 'java'
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
}
```

## 🔍 settings.gradle vs build.gradle 차이

| 항목 | settings.gradle | build.gradle |
|------|------------------|--------------|
| **책임** | 프로젝트 계층(루트 & 서브 프로젝트) 관리 | 빌드 로직, 의존성, 플러그인 설정 |
| **실행 시점** | Gradle이 빌드 DAG 구성할 때 최초 실행 | 각 프로젝트 빌드 시 실행 |
| **멀티모듈** | 어떤 모듈을 포함할지 `include` | 그 모듈을 어떻게 빌드할지 정의 |
| **DSL** | `rootProject`, `include` 등 | `plugins`, `dependencies`, `tasks` 등 |

## 🔍 멀티모듈 빌드 흐름

1. `gradle build` 실행
2. Gradle은 `settings.gradle`을 읽어 **빌드 그래프(DAG)** 를 만든다.
3. 각 모듈에 들어가 `build.gradle`을 읽어 빌드, 테스트, 패키징을 수행한다.

---

## 📝 마치며

정리하자면,

- `settings.gradle`은 **프로젝트 구조를 잡는 설계도**
- `build.gradle`은 **빌드 작업을 수행하는 시방서**

멀티모듈을 설계할 때 이 둘의 역할을 정확히 이해하면 코드 구조, 빌드 관리, CI/CD 설계까지 훨씬 깔끔해진다.

다음에는 `api` vs `implementation` 같은 의존성 스코프도 다뤄보고자 한다.