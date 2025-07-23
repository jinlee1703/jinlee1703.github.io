---
layout: post
title: Spring Boot 멀티모듈 아키텍처 전환기
description: >
  📉 빌드 34 → 6 초, 테스트 33 → 1.4 초. 5단계 분리, 148개의 PR, 두 번의 되돌리기를 거쳐서 모노리스를 "모듈화된 모노리스"로 탈바꿈했다. 이 글은 MSA를 향한 징검다리로서의 멀티모듈 전환기를 기록한 회고록이다.
sitemap: false
hide_last_modified: false
published: true
---

---

* this unordered seed list will be replaced by the toc
{:toc}

## 1. 배경: 왜 모놀리스 아키텍처를 벗어났는가?

“서비스가 커지면 어떻게 해야할까?”라는 질문은 프로젝트를 시작할 때부터 하게 된 고민이었다. 현재 ‘CS-ALGO’라는 사이드 프로젝트를 진행하면서, 지금은 이메일 한 통을 보내고, 문제 풀이 결과를 제공해주는 단순한 시스템이지만, 필자는 서비스에 있어 두 가지 변수를 주시하고 있었다.

1. 도메인 확장
    - 지금은 “문제 발송” 하나뿐이지만, 간단한 “백오피스”부터, “구독 결제”, “실시간 피드백”, “문제 추천” 등의 다양한 주변 기능을 기획하고 있기에 확장에 열려있어야 한다.
2. 트래픽 급등
    - 아직은 본격적으로 사용자를 유치하지 않았으나, 사용자의 유입이 들어온다면 이를 고려하지 않는다면 서비스는 정상적으로 동작을 하지 않을 수 있다.
    - (가정) 3/9월과 같은 대규모 공채 시즌에 트래픽이 스파이크 형태로 몰릴 수 있을 것이다.

초기에 MSA를 바로 도입할 수도 있었다. 하지만 “서비스와 팀이 동시에 미성숙한 상태”에서 배포 복잡도/관측성 비용/계측 지연 등을 감당하기에는 리스크가 너무 크다고 판단하였다.

여기에 더해 우리는 “LEAN 개발 - 최소 기능(MVP), 최소 비용, 최단 사이클”에 집중하는 방식을 지향했다. Big-Up-Front Design 대신 Build-Measure-Lean 루프를 빠르게 돌리며 “필요할 때 필요한 만큼만 만든다”는 원칙을 세웠다. 이 철학은 ‘지금 당장 복잡한 MSA로 진입하기’보다는, 추후 탄력적으로 전환할 수 있는 발판을 우선 마련하는 방향으로 우리의 선택을 이끌었다.

### 1.1. 패키지 우선 분리

처음 시도는 **Gradle 모듈을 건드리지 않고**, 단일 프로젝트 안에서 **패키지** 레벨로만 `Web` / `presentation` / `Application` / `Domain` / `Infrastructure` / `Common` 계층을 나누는 것이었다.

```bash
com.csalgo
├── web           // thymeleaf controller, view-model
├── presentation  // controller, dto
├── application   // service, use‑case
├── domain        // entity, domain‑service
└── infrastructure // jpa, redis, mail adapter
```

이를 통해 ‘디렉터리만 분리하므로 바로 적용 가능하고, 패키지 간 의존 관계를 시각적으로 파악하기 쉽다’라는 장점을 얻고자 하였다. 다만 일반적인 모놀리식 아키텍처와 같이 Gradle 컴파일 클래스패스는 여전히 ‘한 바구니’라 순환 의존이 숨어 있었고, 모듈별 캐시가 없으니 빌드 시간·테스트 시간이 체감될 정도로 줄지 않는다는 문제를 가지고 있는 상태였다.

### 1.2 도메인 모듈 분리

우리는 “논리적으로는 쪼개고, 물리적으로는 하나” 라는 멀티모듈 구조를 1차 스탠스(Standing Architecture) 로 삼았다. 즉, 

- 모듈 = 미래에 서비스로 독립할 후보
- 모놀리스 프로세스 = 데이터 일관성과 배포 단순화를 보장하는 안전지대

이렇게 출발선을 그어 두면, 모듈 → 마이크로서비스 전이는 “리포지터리 분할 + 네트워크 경계 삽입”만 추가하면 되는 `N+1` 단계 작업으로 수렴한다.

> 💡 결국 멀티모듈 도입은 ‘아키텍처 결정을 미루는’ 게 아니라, ‘전환 가능성을 도입하는’ 방법이라고 판단하였다.
> 

## 2. **목표 설정: 무엇을 얻고 싶었나?**

먼저 ‘속도’와 ‘경계’를 가장 중요한 성공 지표로 삼기로 하였다.

1. 증분 빌드/테스트 시간 단축
2. 계층·도메인·기술 코드 분리: Presentation ↔ Application ↔ Domain ↔ Infrastructure 계층을 모듈로 명확히 구획
3. CI/CD 변동 최소화: 기존 GitHub Actions 워크플로를 *한 파일* 이상 수정하지 않는다
4. Gradle `api` vs `implementation` 스코프 준수로 모듈 간 의존성을 투명하게 관리

## 3. 계획 및 단계 설정

단계를 나누지 않고 모든 코드를 한꺼번에 분리하려고 했다가는 코드 리뷰와 CI 파이프라인이 동시에 불안정해질 위험이 크다고 판단하였다. 그래서 PR 한 개당 모듈 하나씩 분리하는 Step-by-Step 전략을 채택했다.

| 단계 | 브랜치 | 주요 작업 | 대표 PR |
| --- | --- | --- | --- |
| 1 | `chore#148/split‑common‑module` | 공통 유틸 (`:csalgo-common`) 분리 | [#150](https://github.com/TEAM-JJINS/cs-algo/pull/150) |
| 2 | `chore#148/split‑domain‑module` | **도메인 모델** (`:csalgo-domain`) 추출 | [#151](https://github.com/TEAM-JJINS/cs-algo/pull/151) |
| 3 | `chore#148/split‑infrastructure‑module` | **Redis‧JPA‧Email** 컴포넌트를 `:csalgo-infrastructure` 로 이동 | [#153](https://github.com/TEAM-JJINS/cs-algo/pull/153) |
| 4 | `chore#148/split‑application‑module` | **Use Case 계층** 분리 + `:common` 모듈 도입 | [#152](https://github.com/TEAM-JJINS/cs-algo/pull/152) |
| 5 | `chore#148/split‑presentation‑module` | **RestController** 코드를 `:server` 모듈로 격리 | [#154](https://github.com/TEAM-JJINS/cs-algo/pull/154) |
| 6 | `chore#148/split-web‑module` | thymeleaf 등 프론트엔드 관련 코드를 `:web` 모듈로 격리 | [#157](https://github.com/TEAM-JJINS/cs-algo/pull/157) |
| 7 | `refactor#148/etc` | `api`/`implementation` 정비, 성능 벤치마킹 결과 정리 | [#159](https://github.com/TEAM-JJINS/cs-algo/pull/159) |

## 4. 측정 환경

- **머신**: Apple M2 Pro (12‑core) / 32 GB RAM
- **OS & 툴체인**: macOS 13.6, Gradle 8.7 (Kotlin DSL), Temurin JDK 21.0.2
- **옵션**: `-parallel`, `-build-cache`

모든 수치는 **로컬 캐시를 비운 뒤 같은 작업 두 번 실행**해 두 번째 결과를 취했다. 캐시 웜업 비용을 제외하기 위해서다.

## 5. 성능 변화 (**Before & After)**

| 작업 | 기존(ms) | 전환 후(ms) | 절감율 |
| --- | --- | --- | --- |
| Full Build | 34 129 | 6 243 | **‑81.7 %** |
| Full Test | 33 785 | 1 494 | **‑95.6 %** |
| Incremental Build¹ | n/a | 1 820 | — |
| Incremental Test² | n/a | 322 | — |

¹ 소스 한 파일 수정 후 `build`
² 테스트 클래스 하나 수정 후 `test`

빌드는 단순히 작업 수를 나눈 것이 아니라 빌드 캐시 히트율 이 비약적으로 상승하면서 빨라졌다. 테스트는 모듈이 분리되자 JUnit 스캐너가 전보다 8 분의 1만 검색하게 됐다. 특히 `:csalgo-server` 모듈의 MockMvc 통합 테스트가 다른 모듈 실행을 막지 않게 된 효과가 컸다.

## 6. 다음 계획 - MSA로의 점진적 이행

멀티모듈 구조는 “논리적으로는 쪼개고, 물리적으로는 하나”라는 Standing Architecture이다. 모듈을 독립 서비스로 승격하려면 레포지토리 분할 + 네트워크 경계 삽입 두 가지만 더하면 된다. 필자가 최근에 읽고 있는 『가상 면접 사례로 배우는 대규모 시스템 설계 기초』의 저자에 따르면, 시스템을 모듈에서 마이크로서비스로 분리해야 하는 가장 명확한 신호는 ‘팀 경계와 코드 경계가 어긋나는 순간’이라고 한다.

### 6.1 전환 시그널

- 모듈 간 호출량이 QPS(Query Per Second) 100 이상으로 증가
- 특정 도메인만 독립적으로 스케일 아웃해야 할 필요가 생김
- CI 빌드 파이프라인에서 특정 모듈이 전체 시간을 30 % 이상 차지

### 6.2 전환 체크리스트

1. **Persistency 분리**: DB–Schema 혹은 RDS 인스턴스 수준 분리
2. **인터페이스 고정**: 모듈 간 통신을 Event or REST Contract 로 표준화
3. **관측성 확보**: 로그, 메트릭, 트레이스를 중앙화
4. **릴리즈 정책 정의**: Semantic Versioning & Deprecation Policy

## 7. 마무리

멀티모듈은 ‘아키텍처 결정을 뒤로 미루기 위한 임시 방편’이 아니라, “전환 가능성을 담보하는 디자인”이라고 생각한다. 우리는 적은 비용으로 빌드·테스트 속도를 획기적으로 개선했고, 도메인별 경계를 코드 레벨에서 먼저 확정함으로써 MSA 전환 준비까지 끝냈다. 다음 단계는 실제 트래픽 증가나 도메인 확장 시 하나씩 서비스를 떼어내는 것 뿐이다.

## 8. References

- [Spring 공식 멀티모듈 가이드](https://docs.spring.io/spring-boot/docs/current/gradle-plugin/reference/htmlsingle/#getting-started-multi-module)
- [MSA Best Practices - Netflix OSS](https://netflix.github.io/)
- [Kubernetes 공식 문서](https://kubernetes.io/)
- [12-Factors App 원칙](https://medium.com/dtevangelist/12-factors-%EB%9E%80-b39c7ef1ed30)
- 『가상 면접 사례로 배우는 대규모 시스템 설계 기초』