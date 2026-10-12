---
title: Spring Boot 3.5에서 4.1로 올리며 만난 것들
date: '2026-10-10'
category: web
published: true
description: Spring Boot 3.5의 OSS 지원이 끝나 20여 개 백엔드 서비스를 4.1로 올렸다. 컴파일 오류는 금방 고쳐졌지만, 컴파일과 테스트를 모두 통과하고도 런타임에 깨지는 변화가 더 많았다. Jackson 3 기본값, 경고 없이 무시되는 설정 키, protobuf 직렬화 라이브러리 버전, Kinesis 클라이언트(KCL) 2→3 전환과 롤백 문제를 어떻게 찾고 검증했는지 정리했다.
---

---


## 0. 왜 올렸나

&nbsp; Spring Boot는 마이너 버전마다 OSS(무료 공개) 지원 기간이 정해져 있다. 2026년 6월에 나온 3.5.16이 3.5.x의 마지막 OSS 릴리스였다([Spring 공식 블로그](https://spring.io/blog/2026/06/25/spring-boot-3-5-16-available-now)). 이후 3.5에서 보안 취약점이 나와도 무료 패치는 나오지 않는다. 우리 백엔드 JVM 서비스는 20개가 넘었고, 대부분 3.5.7에 머물러 있었다.

![Spring Boot 3.5.16 릴리스 공지의 End of OSS Support 단락](/assets/img/docs/spring-boot-4-migration/spring-boot-3-5-16-end-of-oss.png)

*Spring Boot 3.5.16 릴리스 공지. "last OSS release of the 3.5.x generation"이라며 4.0.x나 4.1.x로 올리라고 권한다.*

&nbsp; 목표 버전으로는 4.0.x와 4.1.x를 비교했다.

| | 4.0.x | 4.1.x |
|---|---|---|
| OSS 지원 종료 | 2026-12-31 | 2027-07-31 |
| Spring Cloud | 2025.1.x가 공식 짝 | 공식 짝인 GA 버전 없음 |

&nbsp; 4.0으로 가면 롤아웃이 끝나기도 전에 지원이 끝난다. 반면 Spring Cloud와 spring-cloud-aws는 공식적으로 Boot 4.0 기준으로 빌드돼 있었다. 다음 Spring Cloud 트레인(2026.0)은 아직 마일스톤이었고, 그것도 4.1이 아니라 4.2를 바라보고 있었다. 결국 공식 조합이 아니라는 점을 감수하고 4.1.1을 골랐다. 대신 빌드, 테스트, 기동, 실제 메시지 소비까지 서비스마다 직접 확인하기로 했다.


## 1. 진행 방식

&nbsp; 한 번에 다 올리지 않고 위험이 낮은 순서로 나눴다.

1. **PoC**: 가장 작은 서비스 하나(Web MVC + Mongo)를 먼저 올리고 걸린 것을 체크리스트로 남긴다.
2. **1차**: 메시징(Kinesis, SQS)을 쓰지 않는 서비스와 BFF(Backend For Frontend, 프론트 전용 API 서버)들.
3. **2차**: Kinesis나 SQS를 쓰는 서비스들.

&nbsp; 서비스마다 검증 방법은 같았다.

- **베이스라인부터 잰다.** 바꾸기 전 상태에서 빌드와 테스트를 먼저 돌려, 원래 깨져 있던 것과 이번 변경으로 깨진 것을 구분한다. 실제로 main에서부터 실패하던 검사가 두 서비스에서 나왔다.
- **두 jar를 나란히 띄운다.** 3.5.7로 빌드한 jar와 4.1.1로 빌드한 jar를 같은 DB, 같은 로컬 AWS 에뮬레이터에 붙여 같은 요청을 보낸다. 상태 코드, 헤더, 본문을 diff해서 바뀐 것만 본다. 정상 요청뿐 아니라 잘못된 입력, 깨진 JSON, 404, 405 같은 에러 응답도 넣는다.
- **기동 스모크를 빼먹지 않는다.** bootJar를 실제로 띄워서 `APPLICATION FAILED TO START`나 빈 누락이 없는지 본다. 뒤에서 보겠지만 컴파일은 되는데 기동에서만 터지는 경우가 있었다.
- **메시지는 실제로 흘려 본다.** SQS 큐에 메시지를 넣고 Kinesis 스트림에 레코드를 넣어서, 두 버전이 같은 결과를 DB에 남기는지 본다.

&nbsp; 이렇게 걸린 항목을 체크리스트에 계속 쌓았더니 마지막에는 30개가 넘었다. 아래에서는 그중 성격이 비슷한 것끼리 묶어 정리한다.

<svg class="sb4f1" viewBox="0 0 700 378" role="img" aria-labelledby="sb4f1-t sb4f1-d" style="max-width:100%;height:auto;font-family:inherit;display:block;margin:1.5rem auto">
<title id="sb4f1-t">검증 단계별로 드러난 문제</title>
<desc id="sb4f1-d">컴파일, 테스트, 기동, 응답 비교, 메시지 흘리기, 롤백의 여섯 단계가 위에서부터 차례로 나타난다. 각 단계 오른쪽에 그 단계에서 처음 드러난 문제가 적혀 있고, 기동 단계부터 아래 네 단계는 컴파일과 테스트를 통과한 문제라는 표시가 붙어 있다.</desc>
<style>.sb4f1{--ok:#188038;--bad:#c5221f;--warn:#a35200;--warnf:#f9ab00;--cur:#1967d2}.dark .sb4f1{--ok:#81c995;--bad:#f28b82;--warn:#fdd663;--warnf:#fdd663;--cur:#8ab4f8}.sb4f1:hover *{animation-play-state:paused}.sb4f1-r{animation:sb4f1-in 10s ease-out infinite both}@keyframes sb4f1-in{0%{opacity:0;transform:translateX(-12px)}5%{opacity:1;transform:translateX(0)}100%{opacity:1;transform:translateX(0)}}@media (prefers-reduced-motion: reduce){.sb4f1-r{animation:none}}</style>
<text x="350" y="22" text-anchor="middle" fill="currentColor" font-size="13" font-weight="600">검증 단계마다 처음 드러난 문제</text>
<g class="sb4f1-r" style="animation-delay:0.0s">
<rect x="12" y="36" width="676" height="48" rx="8" fill="currentColor" fill-opacity="0.03" stroke="currentColor" stroke-opacity="0.3"/>
<rect x="24" y="46" width="122" height="28" rx="14" fill="none" stroke="currentColor" stroke-width="1.3"/>
<text x="85" y="65" text-anchor="middle" fill="currentColor" font-size="13" font-weight="600">① 컴파일</text>
<text x="162" y="57" fill="currentColor" font-size="13">패키지 이동, 삭제된 API, null 표시</text>
<text x="162" y="75" fill="currentColor" font-size="11" opacity="0.7">@EntityScan 이동, fromHttpUrl 삭제, typeMapper setter</text>
</g>
<g class="sb4f1-r" style="animation-delay:0.6s">
<rect x="12" y="92" width="676" height="48" rx="8" fill="currentColor" fill-opacity="0.03" stroke="currentColor" stroke-opacity="0.3"/>
<rect x="24" y="102" width="122" height="28" rx="14" fill="none" stroke="currentColor" stroke-width="1.3"/>
<text x="85" y="121" text-anchor="middle" fill="currentColor" font-size="13" font-weight="600">② 테스트</text>
<text x="162" y="113" fill="currentColor" font-size="13">JUnit 6에서 autoparams 일부가 동작 안 함</text>
<text x="162" y="131" fill="currentColor" font-size="11" opacity="0.7">@CsvAutoSource → @CsvSource, 테스트 스타터 빈 충돌</text>
</g>
<g class="sb4f1-r" style="animation-delay:1.2s">
<rect x="12" y="148" width="676" height="48" rx="8" fill="currentColor" fill-opacity="0.03" stroke="currentColor" stroke-opacity="0.3"/>
<rect x="24" y="158" width="122" height="28" rx="14" fill="none" stroke="currentColor" stroke-width="1.3"/>
<text x="85" y="177" text-anchor="middle" fill="currentColor" font-size="13" font-weight="600">③ 기동</text>
<text x="162" y="169" fill="currentColor" font-size="13">Jackson 2 ObjectMapper 빈이 사라짐</text>
<text x="162" y="187" fill="currentColor" font-size="11" opacity="0.7">컴파일은 되지만 기동할 때 빈이 없어 실패</text>
<rect x="548" y="161" width="130" height="22" rx="11" fill-opacity="0.16" stroke-width="1" style="fill:var(--warnf);stroke:var(--warn)"/>
<text x="613" y="176" text-anchor="middle" font-size="11" font-weight="600" style="fill:var(--warn)">컴파일과 테스트 통과</text>
</g>
<g class="sb4f1-r" style="animation-delay:1.8s">
<rect x="12" y="204" width="676" height="48" rx="8" fill="currentColor" fill-opacity="0.03" stroke="currentColor" stroke-opacity="0.3"/>
<rect x="24" y="214" width="122" height="28" rx="14" fill="none" stroke="currentColor" stroke-width="1.3"/>
<text x="85" y="233" text-anchor="middle" fill="currentColor" font-size="13" font-weight="600">④ 응답 비교</text>
<text x="162" y="225" fill="currentColor" font-size="13">응답 형식과 설정이 모르게 바뀜</text>
<text x="162" y="243" fill="currentColor" font-size="11" opacity="0.7">에러 응답 timestamp(Jackson 3), 무시되는 옛 설정 키</text>
<rect x="548" y="217" width="130" height="22" rx="11" fill-opacity="0.16" stroke-width="1" style="fill:var(--warnf);stroke:var(--warn)"/>
<text x="613" y="232" text-anchor="middle" font-size="11" font-weight="600" style="fill:var(--warn)">컴파일과 테스트 통과</text>
</g>
<g class="sb4f1-r" style="animation-delay:2.4s">
<rect x="12" y="260" width="676" height="48" rx="8" fill="currentColor" fill-opacity="0.03" stroke="currentColor" stroke-opacity="0.3"/>
<rect x="24" y="270" width="122" height="28" rx="14" fill="none" stroke="currentColor" stroke-width="1.3"/>
<text x="85" y="289" text-anchor="middle" fill="currentColor" font-size="13" font-weight="600">⑤ 메시지 흘리기</text>
<text x="162" y="281" fill="currentColor" font-size="13">변환, 직렬화, 전송이 런타임에 깨짐</text>
<text x="162" y="299" fill="currentColor" font-size="11" opacity="0.7">SQS 변환기, hubspot 버전, KPL 전송 누락</text>
<rect x="548" y="273" width="130" height="22" rx="11" fill-opacity="0.16" stroke-width="1" style="fill:var(--warnf);stroke:var(--warn)"/>
<text x="613" y="288" text-anchor="middle" font-size="11" font-weight="600" style="fill:var(--warn)">컴파일과 테스트 통과</text>
</g>
<g class="sb4f1-r" style="animation-delay:3.0s">
<rect x="12" y="316" width="676" height="48" rx="8" fill="currentColor" fill-opacity="0.03" stroke="currentColor" stroke-opacity="0.3"/>
<rect x="24" y="326" width="122" height="28" rx="14" fill="none" stroke="currentColor" stroke-width="1.3"/>
<text x="85" y="345" text-anchor="middle" fill="currentColor" font-size="13" font-weight="600">⑥ 롤백</text>
<text x="162" y="337" fill="currentColor" font-size="13">되돌리면 Kinesis 소비가 멈춤</text>
<text x="162" y="355" fill="currentColor" font-size="11" opacity="0.7">KCL 3가 lease 테이블에 남긴 행</text>
<rect x="548" y="329" width="130" height="22" rx="11" fill-opacity="0.16" stroke-width="1" style="fill:var(--warnf);stroke:var(--warn)"/>
<text x="613" y="344" text-anchor="middle" font-size="11" font-weight="600" style="fill:var(--warn)">컴파일과 테스트 통과</text>
</g>
</svg>


## 2. 컴파일에서 드러나는 변화

&nbsp; 이쪽은 빌드가 바로 알려 주기 때문에 고치기 쉬웠다.

### 모듈 분리와 패키지 이동

&nbsp; Boot 4는 하나로 묶여 있던 자동 구성을 기능별 모듈로 쪼갰다. 그래서 스타터 이름과 import 경로가 많이 바뀌었다.

- `spring-boot-starter-web` → `spring-boot-starter-webmvc`
- 테스트 자동 구성도 모듈별로 나뉘었다. `@WebMvcTest`는 `spring-boot-starter-webmvc-test`, `@AutoConfigureWebTestClient`는 `spring-boot-starter-webflux-test`, `@DataMongoTest`는 `spring-boot-starter-data-mongodb-test`가 필요하다.
- 리액티브 Mongo만 쓰는 서비스는 `spring-boot-starter-data-mongodb-reactive-test`를 써야 한다. 동기용 스타터를 넣었더니 동기 드라이버가 같이 들어와서, Boot가 만든 `mongoDatabaseFactory` 빈이 직접 정의한 리액티브 빈과 이름이 겹쳐 테스트 컨텍스트가 뜨지 않았다.
- `@EntityScan`, `@MockBean`(→ `@MockitoBean`), Tomcat 커스터마이저 같은 클래스도 패키지가 바뀌거나 사라졌다.

### Spring Framework 7에서 삭제된 API

- `UriComponentsBuilder.fromHttpUrl` → `fromUriString`
- `HttpHeaders.containsKey` → `containsHeader` (`HttpHeaders`가 더 이상 `MultiValueMap`이 아니다)
- `HttpComponentsClientHttpRequestFactory.setConnectTimeout` → 커넥션 풀의 `ConnectionConfig`로 옮긴다

### null 표시가 엄격해졌다

&nbsp; Spring 7, Spring Data 2026, Reactor 3.8은 JSpecify(자바 코드에 null 가능 여부를 표시하는 표준 어노테이션)를 본격적으로 붙였다. Kotlin은 이 표시를 타입으로 읽기 때문에 컴파일 오류가 꽤 나왔다.

- `converter.typeMapper = X`가 `'val' cannot be reassigned`로 깨졌다. getter는 null을 반환하지 않는다고 표시돼 있고 setter 파라미터는 null을 허용한다고 표시돼 있어서, Kotlin이 둘을 하나의 프로퍼티로 묶지 못한다. `converter.setTypeMapper(X)`로 setter를 직접 호출하면 된다.
- 제네릭 확장 함수의 `Mono<T>`는 `T : Any` 상한이 필요해졌고, `Mono<X?>` 같은 반환 타입은 컴파일 오류가 됐다.

### 그 밖에

- protobuf Gradle 플러그인 0.9.2는 Boot 4 플러그인과 함께 쓰면 Gradle 9에서 삭제된 API(`forUseAtConfigurationTime`)를 호출해 설정 단계에서 실패한다. 0.9.6으로 올리면 된다.
- Boot 4.1은 JUnit 6을 관리한다. 테스트 데이터 생성 라이브러리인 autoparams의 `@CsvAutoSource`, `@MethodAutoSource`, `@ValueAutoSource`가 JUnit 6에서 동작하지 않아(`initializationError`) JUnit 표준 `@CsvSource` 등으로 바꿔야 했다. `@AutoSource`는 그대로 동작했다.
- 재미있는 점은 3.5에서 `junit-bom:6.0.0`을 선언해 둔 서비스도 실제로는 JUnit 5.12로 돌고 있었다는 것이다. Boot 3.5의 BOM(의존성 버전 목록)이 선언을 덮어쓰고 있었다. Boot 4.1로 올리면서 처음으로 진짜 JUnit 6이 됐고, 그제서야 autoparams 문제가 드러났다.


## 3. 컴파일도 테스트도 통과하는데 깨지는 것들

&nbsp; 이번 작업에서 시간을 가장 많이 쓴 건 이쪽이다. 아래 항목은 모두 컴파일이 되고, 서비스에 따라서는 CI 테스트까지 통과했다.

### Jackson 3가 기본값이 됐다

&nbsp; Boot 4는 JSON 라이브러리 기본값을 Jackson 2(`com.fasterxml.jackson`)에서 Jackson 3(`tools.jackson`)으로 바꿨다. 코드를 Jackson 3로 옮기지 않고 Jackson 2를 계속 쓰기로 했는데도 세 가지 문제가 생겼다.

1. **기동 실패.** Boot 3는 Jackson 2 `ObjectMapper` 빈을 자동으로 만들어 줬다. Boot 4는 Jackson 3 `JsonMapper`만 만든다. 그래서 `ObjectMapper`를 주입받는 코드는 컴파일은 되지만 기동할 때 빈이 없어 실패한다. 주입이 실제로 필요하면 `spring-boot-jackson2` 모듈을 추가하고, 쓰지 않는 주입이면 지운다.
2. **응답 형식이 모르는 사이에 바뀐다.** `ObjectMapper` 빈을 직접 정의해 둔 서비스도 MVC 컨트롤러의 JSON 변환은 Jackson 3로 넘어갔다. 기동은 정상인데 에러 응답의 `timestamp`가 숫자에서 ISO 문자열로 바뀌는 식이다. `spring.http.converters.preferred-json-mapper: jackson2`로 기존 동작을 유지할 수 있다. 응답을 protobuf 컨버터로 내보내거나 WebFlux 코덱에 Jackson 2 인코더를 명시한 서비스는 해당하지 않았다.
3. **전이 의존성이 빠진다.** 웹 스타터가 더 이상 Jackson 2 `jackson-databind`나 `jackson-datatype-jsr310`을 끌어오지 않는다. 직접 쓰는 모듈에 버전 없이 명시해야 한다.

<svg class="sb4f2" viewBox="0 0 700 262" role="img" aria-labelledby="sb4f2-t sb4f2-d" style="max-width:100%;height:auto;font-family:inherit;display:block;margin:1.5rem auto">
<title id="sb4f2-t">Boot 3.5와 4.1에서 응답 JSON을 만드는 주체</title>
<desc id="sb4f2-d">왼쪽 Boot 3.5에서는 컨트롤러가 HTTP 컨버터에 JSON을 만들어 달라고 하면 컨버터가 직접 등록한 Jackson 2 ObjectMapper를 쓴다. 오른쪽 Boot 4.1에서는 같은 요청에 Boot 기본값인 Jackson 3 JsonMapper를 쓰고, 직접 등록한 ObjectMapper는 쓰이지 않는다. 그 결과 에러 응답의 timestamp가 숫자에서 ISO 문자열로 바뀐다.</desc>
<style>.sb4f2{--ok:#188038;--bad:#c5221f;--warn:#a35200;--warnf:#f9ab00;--cur:#1967d2}.dark .sb4f2{--ok:#81c995;--bad:#f28b82;--warn:#fdd663;--warnf:#fdd663;--cur:#8ab4f8}</style>
<defs><marker id="sb4f2-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="12" y="12" width="332" height="238" rx="10" fill="none" stroke="currentColor" stroke-opacity="0.3"/>
<text x="28" y="36" fill="currentColor" font-size="13" font-weight="600">Spring Boot 3.5</text>
<rect x="28" y="58" width="104" height="40" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
<text x="80" y="83" text-anchor="middle" fill="currentColor" font-size="13">컨트롤러</text>
<rect x="216" y="58" width="112" height="40" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
<text x="272" y="83" text-anchor="middle" fill="currentColor" font-size="13">HTTP 컨버터</text>
<line x1="132" y1="78" x2="214" y2="78" stroke="currentColor" stroke-width="1.4" marker-end="url(#sb4f2-a)"/>
<text x="173" y="116" text-anchor="middle" fill="currentColor" font-size="11" opacity="0.8">"JSON으로 만들어 줘"</text>
<line x1="272" y1="98" x2="272" y2="146" stroke="currentColor" stroke-width="1.4" marker-end="url(#sb4f2-a)"/>
<text x="280" y="128" font-size="11" style="fill:var(--ok)">"등록된 빈 쓸게"</text>
<rect x="202" y="148" width="140" height="48" rx="6" fill-opacity="0.1" stroke-width="1.5" style="fill:var(--ok);stroke:var(--ok)"/>
<text x="272" y="168" text-anchor="middle" fill="currentColor" font-size="12">내 ObjectMapper 빈</text>
<text x="272" y="186" text-anchor="middle" fill="currentColor" font-size="11" opacity="0.75">(Jackson 2)</text>
<text x="28" y="232" font-size="12" font-weight="600" style="fill:var(--ok)">→ 응답 형식 유지</text>
<rect x="356" y="12" width="332" height="238" rx="10" fill="none" stroke="currentColor" stroke-opacity="0.3"/>
<text x="372" y="36" fill="currentColor" font-size="13" font-weight="600">Spring Boot 4.1</text>
<rect x="372" y="58" width="104" height="40" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
<text x="424" y="83" text-anchor="middle" fill="currentColor" font-size="13">컨트롤러</text>
<rect x="560" y="58" width="112" height="40" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
<text x="616" y="83" text-anchor="middle" fill="currentColor" font-size="13">HTTP 컨버터</text>
<line x1="476" y1="78" x2="558" y2="78" stroke="currentColor" stroke-width="1.4" marker-end="url(#sb4f2-a)"/>
<text x="517" y="116" text-anchor="middle" fill="currentColor" font-size="11" opacity="0.8">"JSON으로 만들어 줘"</text>
<line x1="616" y1="98" x2="616" y2="146" stroke="currentColor" stroke-width="1.4" marker-end="url(#sb4f2-a)"/>
<text x="624" y="128" font-size="11" style="fill:var(--warn)">"기본값 쓸게"</text>
<rect x="546" y="148" width="140" height="48" rx="6" fill-opacity="0.12" stroke-width="1.5" style="fill:var(--warnf);stroke:var(--warn)"/>
<text x="616" y="168" text-anchor="middle" fill="currentColor" font-size="12">JsonMapper</text>
<text x="616" y="186" text-anchor="middle" fill="currentColor" font-size="11" opacity="0.75">(Jackson 3, 기본값)</text>
<rect x="372" y="148" width="150" height="48" rx="6" fill="none" stroke="currentColor" stroke-opacity="0.45" stroke-dasharray="5 4"/>
<text x="447" y="168" text-anchor="middle" fill="currentColor" font-size="12" opacity="0.6">내 ObjectMapper 빈</text>
<text x="447" y="186" text-anchor="middle" fill="currentColor" font-size="11" opacity="0.6">(있지만 안 쓰임)</text>
<text x="372" y="232" font-size="12" font-weight="600" style="fill:var(--warn)">→ timestamp가 숫자에서 ISO 문자열로 바뀜</text>
</svg>

&nbsp; 1번은 기동 스모크로, 2번은 두 jar의 에러 응답 diff로 잡았다. 테스트만 봤다면 둘 다 놓쳤을 것이다.

### 이름이 바뀐 설정 키는 경고 없이 무시된다

&nbsp; 설정 키 이름이 바뀌면 옛 키는 오류도 경고도 없이 무시되고 기본값이 쓰인다.

- `spring.codec.max-in-memory-size` → `spring.http.codecs.max-in-memory-size`. 옛 키를 두면 요청 바디 한도가 기본값 256KB로 떨어진다. 10~20MB로 설정해 둔 서비스에서 대용량 요청이 413으로 실패할 뻔했다. 새 키로 256KB를 줘서 413이 나는 것까지 확인해, 새 키가 실제로 적용된다는 것도 검증했다.
- `spring.data.mongodb.*` → `spring.mongodb.*`
- 테스트 설정에서 자동 구성을 끄는 `autoconfigure.exclude`에 클래스 이름을 적어 둔 경우, 그 클래스의 패키지가 바뀌면 exclude가 오류 없이 무효가 된다.

&nbsp; 의심스러우면 `spring-boot-properties-migrator`를 잠깐 런타임 의존성으로 넣고 띄워 보면 바뀐 키를 경고로 알려 준다.

### protobuf 직렬화 라이브러리의 버전 함정

&nbsp; protobuf 메시지를 Jackson으로 JSON 변환하는 데 hubspot의 `jackson-datatype-protobuf`를 쓰고 있었다. Jackson 버전 고정을 빼서 Boot BOM이 정한 2.21로 맞췄더니, 이 라이브러리가 버전에 따라 런타임에 깨졌다. 버전마다 jar를 열어 어떤 메서드를 호출하는지 확인하고 표로 정리했다.

| 버전 | Jackson 2.21에서 | protobuf-java 4.x에서 |
|---|---|---|
| 0.9.14 이하 | 깨짐 (Jackson 2.20에서 삭제된 `PropertyNamingStrategyBase` 참조) | 깨짐 |
| 0.9.15 ~ 0.9.16 | 정상 | 깨짐 (`Descriptors.FileDescriptor.getSyntax()`가 4.x에 없음) |
| 0.9.17 이상 | 정상 | 정상 (`FileDescriptorProto.getSyntax()`를 호출) |

&nbsp; 증상은 `NoClassDefFoundError`나 `NoSuchMethodError`인데, 이 예외가 다른 예외에 감싸여 나와서 원인을 찾기 어렵다. Mongo 저장 경로에서는 `ConversionFailedException: <proto 타입> → org.bson.Document`로 나왔고, WebClient로 요청 바디를 직렬화하는 경로에서는 요청이 응답 없이 멈췄다. 한 서비스는 Mongo 연동 테스트가 CI에서 돌아서 잡혔지만, 다른 서비스는 테스트가 그 경로를 타지 않아 CI까지 통과했다. 그래서 의심되는 서비스마다 bootJar의 런타임 클래스패스로 작은 자바 파일을 직접 실행해서 proto 직렬화를 확인했다.

&nbsp; 이 과정에서 3.5에서부터 이미 깨져 있던 서비스도 하나 찾았다. 0.9.15와 protobuf-java 4.29.2를 함께 쓰고 있었는데, 테스트가 그 직렬화 경로를 타지 않아서 지금까지 드러나지 않았던 것이다.

### SQS 리스너 변환기가 기본값으로 바뀐다

&nbsp; spring-cloud-aws가 3.4에서 4.2로 바뀌면서 `@SqsListener`의 메시지 변환기에 커스텀 `ObjectMapper`를 넣던 `setObjectMapper`가 사라졌다. 이 설정을 빼 버리면 4.x 기본값인 Jackson 3 변환기가 쓰여서 protobuf 메시지 역직렬화가 깨진다. 이것도 컴파일은 통과한다. `LegacyJackson2MessageConverterMigration`으로 기존 Jackson 2 `ObjectMapper`를 계속 쓰게 했고, 로컬 에뮬레이터에 메시지를 넣어 두 버전이 같은 결과를 남기는 것을 확인했다.

### Kinesis 로그가 흔적 없이 빠진다

&nbsp; 기존 Kinesis 바인더(`spring-cloud-stream-binder-kinesis`)는 Boot 3 전용이라 Boot 4판이 나오지 않는다. Boot 4용은 spring-cloud-aws 쪽(`io.awspring.cloud:spring-cloud-aws-kinesis-stream-binder`)으로 옮겨 갔다. 설정 키(`spring.cloud.stream.kinesis.*`)는 그대로 쓸 수 있었다.

&nbsp; 문제는 새 바인더에 들어 있는 KPL(Kinesis Producer Library, 스트림에 레코드를 보내는 라이브러리) 1.0.7이 protobuf 4.x용으로 생성된 코드라는 점이었다. protobuf-java를 3.x로 고정해 둔 서비스에서는 전송이 `NoClassDefFoundError: com/google/protobuf/RuntimeVersion`으로 실패했다. 그런데 레코드를 보내는 코드가 예외를 삼키고 있어서 API 응답은 정상이었다. 에러 응답 없이 로그만 사라지는 셈이다. protobuf를 4.29.2로 올리고, 위 표에 따라 hubspot 라이브러리도 함께 올려서 해결했다.

<svg class="sb4f3" viewBox="0 58 700 192" role="img" aria-labelledby="sb4f3-t sb4f3-d" style="max-width:100%;height:auto;font-family:inherit;display:block;margin:1.5rem auto">
<title id="sb4f3-t">KPL 전송이 실패해도 API는 200을 응답하는 흐름</title>
<desc id="sb4f3-d">클라이언트가 API 서버에 요청을 보내면, 서버는 로그를 KPL로 보낸다. KPL은 protobuf 버전이 맞지 않아 NoClassDefFoundError로 Kinesis에 전송하지 못하지만, 서버가 그 예외를 catch에서 삼키기 때문에 클라이언트는 200 OK를 받는다. Kinesis 스트림에는 아무것도 도착하지 않는다.</desc>
<defs><marker id="sb4f3-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<style>.sb4f3{--ok:#188038;--bad:#c5221f;--warn:#a35200;--warnf:#f9ab00;--cur:#1967d2}.dark .sb4f3{--ok:#81c995;--bad:#f28b82;--warn:#fdd663;--warnf:#fdd663;--cur:#8ab4f8}.sb4f3:hover *{animation-play-state:paused}.sb4f3-dot{opacity:0;animation:8s linear infinite both}.sb4f3-req{animation-name:sb4f3-req}.sb4f3-log{animation-name:sb4f3-log}.sb4f3-tail{animation-name:sb4f3-tail}.sb4f3-res{animation-name:sb4f3-res}.sb4f3-x{transform-box:fill-box;transform-origin:center;animation:sb4f3-x 8s ease-out infinite both}@keyframes sb4f3-req{0%{opacity:0;transform:translate(0,0)}2%{opacity:1}16%{opacity:1;transform:translate(116px,0)}18%,100%{opacity:0;transform:translate(116px,0)}}@keyframes sb4f3-log{0%,19%{opacity:0;transform:translate(0,0)}21%{opacity:1}35%{opacity:1;transform:translate(98px,46px)}37%,100%{opacity:0;transform:translate(98px,46px)}}@keyframes sb4f3-tail{0%,37%{opacity:0;transform:translate(0,0)}38%{opacity:1}44%{opacity:1;transform:translate(18px,0)}46%,100%{opacity:0;transform:translate(18px,0)}}@keyframes sb4f3-res{0%,48%{opacity:0;transform:translate(0,0)}50%{opacity:1}64%{opacity:1;transform:translate(-116px,0)}66%,100%{opacity:0;transform:translate(-116px,0)}}@keyframes sb4f3-x{0%,44%{transform:scale(1)}48%{transform:scale(1.3)}54%,100%{transform:scale(1)}}@media (prefers-reduced-motion: reduce){.sb4f3-dot,.sb4f3-x{animation:none}}</style>
<circle cx="74" cy="104" r="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
<text x="74" y="109" text-anchor="middle" fill="currentColor" font-size="13">클라이언트</text>
<rect x="234" y="72" width="150" height="64" rx="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
<text x="309" y="99" text-anchor="middle" fill="currentColor" font-size="13" font-weight="600">API 서버</text>
<text x="309" y="119" text-anchor="middle" fill="currentColor" font-size="11" opacity="0.7">요청마다 로그를 KPL로 전송</text>
<line x1="116" y1="94" x2="232" y2="94" stroke="currentColor" stroke-width="1.4" marker-end="url(#sb4f3-a)"/>
<text x="174" y="84" text-anchor="middle" fill="currentColor" font-size="11" opacity="0.8">"주문 처리해 줘"</text>
<line x1="232" y1="116" x2="116" y2="116" stroke-width="1.6" marker-end="url(#sb4f3-a)" style="stroke:var(--ok)"/>
<text x="174" y="134" text-anchor="middle" font-size="12" font-weight="600" style="fill:var(--ok)">200 OK</text>
<line x1="340" y1="136" x2="438" y2="182" stroke="currentColor" stroke-width="1.4" marker-end="url(#sb4f3-a)"/>
<text x="402" y="146" fill="currentColor" font-size="11" opacity="0.8">"로그 보내 줘"</text>
<text x="309" y="162" text-anchor="middle" font-size="11" font-weight="600" style="fill:var(--warn)">↳ 예외는 catch에서 삼킴</text>
<rect x="440" y="170" width="110" height="40" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
<text x="495" y="195" text-anchor="middle" fill="currentColor" font-size="13">KPL 1.0.7</text>
<line x1="550" y1="190" x2="602" y2="190" stroke-width="1.4" stroke-dasharray="4 3" style="stroke:var(--bad)"/>
<g class="sb4f3-x"><line x1="570" y1="182" x2="584" y2="198" stroke-width="2.6" style="stroke:var(--bad)"/><line x1="584" y1="182" x2="570" y2="198" stroke-width="2.6" style="stroke:var(--bad)"/></g>
<text x="577" y="160" text-anchor="middle" font-size="11" font-weight="600" style="fill:var(--bad)">NoClassDefFoundError</text>
<rect x="604" y="170" width="84" height="40" rx="6" fill="none" stroke="currentColor" stroke-opacity="0.6" stroke-dasharray="5 4"/>
<text x="646" y="195" text-anchor="middle" fill="currentColor" font-size="12" opacity="0.8">Kinesis</text>
<text x="646" y="228" text-anchor="middle" fill="currentColor" font-size="11" opacity="0.65">도착한 레코드 없음</text>
<text x="495" y="228" text-anchor="middle" fill="currentColor" font-size="11" opacity="0.65">protobuf 4.x 필요</text>
<circle class="sb4f3-dot sb4f3-req" cx="116" cy="94" r="4.5" style="stroke:var(--background);stroke-width:2" fill="currentColor"/>
<circle class="sb4f3-dot sb4f3-log" cx="340" cy="136" r="4.5" style="stroke:var(--background);stroke-width:2" fill="currentColor"/>
<circle class="sb4f3-dot sb4f3-tail" cx="552" cy="190" r="4.5" style="fill:var(--bad);stroke:var(--background);stroke-width:2"/>
<circle class="sb4f3-dot sb4f3-res" cx="232" cy="116" r="4.5" style="fill:var(--ok);stroke:var(--background);stroke-width:2"/>
</svg>


## 4. KCL 2 → 3 전환과 롤백

### 왜 KCL이 바뀌나

&nbsp; Kinesis라는 AWS 서비스 자체는 그대로다. 바뀌는 건 우리 앱이 스트림을 읽을 때 쓰는 라이브러리다.

<svg class="sb4f4" viewBox="0 0 700 210" role="img" aria-labelledby="sb4f4-t sb4f4-d" style="max-width:100%;height:auto;font-family:inherit;display:block;margin:1.5rem auto">
<title id="sb4f4-t">Boot 업그레이드가 KCL 교체로 이어지는 연쇄</title>
<desc id="sb4f4-d">Spring Boot를 3.5에서 4.1로 올리면, 기존 Kinesis 바인더가 Boot 3 전용이라 spring-cloud-aws의 새 바인더로 바꿔야 한다. 새 바인더에 KCL 3.5.0이 들어 있어 KCL이 2.5.8에서 딸려 올라가고, KCL이 읽은 위치를 기록하는 DynamoDB lease 테이블의 기록 방식이 바뀐다. Kinesis 스트림 자체는 그대로다.</desc>
<style>.sb4f4{--ok:#188038;--bad:#c5221f;--warn:#a35200;--warnf:#f9ab00;--cur:#1967d2}.dark .sb4f4{--ok:#81c995;--bad:#f28b82;--warn:#fdd663;--warnf:#fdd663;--cur:#8ab4f8}</style>
<defs><marker id="sb4f4-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="12" y="48" width="148" height="78" rx="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
<text x="86" y="80" text-anchor="middle" fill="currentColor" font-size="13" font-weight="600">Spring Boot</text>
<text x="86" y="102" text-anchor="middle" fill="currentColor" font-size="12">3.5 → 4.1</text>
<rect x="186" y="48" width="148" height="78" rx="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
<text x="260" y="74" text-anchor="middle" fill="currentColor" font-size="13" font-weight="600">Kinesis 바인더</text>
<text x="260" y="95" text-anchor="middle" fill="currentColor" font-size="11" opacity="0.55" text-decoration="line-through">spring-cloud-stream</text>
<text x="260" y="113" text-anchor="middle" fill="currentColor" font-size="11">→ spring-cloud-aws</text>
<rect x="360" y="48" width="148" height="78" rx="8" fill-opacity="0.1" stroke-width="1.5" style="fill:var(--warnf);stroke:var(--warn)"/>
<text x="434" y="80" text-anchor="middle" fill="currentColor" font-size="13" font-weight="600">KCL</text>
<text x="434" y="102" text-anchor="middle" fill="currentColor" font-size="12">2.5.8 → 3.5.0</text>
<rect x="534" y="48" width="148" height="78" rx="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
<text x="608" y="74" text-anchor="middle" fill="currentColor" font-size="13" font-weight="600">DynamoDB</text>
<text x="608" y="94" text-anchor="middle" fill="currentColor" font-size="12">lease 테이블</text>
<text x="608" y="112" text-anchor="middle" fill="currentColor" font-size="11" opacity="0.7">샤드 담당, 읽은 위치</text>
<line x1="160" y1="87" x2="184" y2="87" stroke="currentColor" stroke-width="1.4" marker-end="url(#sb4f4-a)"/>
<line x1="334" y1="87" x2="358" y2="87" stroke="currentColor" stroke-width="1.4" marker-end="url(#sb4f4-a)"/>
<line x1="508" y1="87" x2="532" y2="87" stroke="currentColor" stroke-width="1.4" marker-end="url(#sb4f4-a)"/>
<text x="173" y="36" text-anchor="middle" fill="currentColor" font-size="11" opacity="0.8">"Boot 3 전용이라 교체"</text>
<text x="347" y="36" text-anchor="middle" fill="currentColor" font-size="11" opacity="0.8">"KCL이 딸려 올라감"</text>
<text x="521" y="36" text-anchor="middle" fill="currentColor" font-size="11" opacity="0.8">"기록 방식이 바뀜"</text>
<rect x="12" y="152" width="670" height="40" rx="8" fill="none" stroke="currentColor" stroke-opacity="0.45" stroke-dasharray="5 4"/>
<text x="347" y="177" text-anchor="middle" fill="currentColor" font-size="12" opacity="0.8">Kinesis 스트림(AWS 서비스)은 변경 없음</text>
</svg>

&nbsp; KCL(Kinesis Client Library)은 스트림을 읽는 일을 대신 해 주는 라이브러리다. 여러 파드가 어느 샤드(스트림을 나눈 단위)를 맡을지 나누고, 어디까지 읽었는지(체크포인트)를 기록한다. 이 정보는 DynamoDB 테이블(lease 테이블)에 저장된다. KCL을 직접 고른 게 아니라 새 바인더가 KCL 3를 쓰도록 만들어져 있어서 딸려 올라간 것이다.

### lease 테이블

&nbsp; lease는 "임대"라는 뜻으로, 여기서는 "이 샤드는 지금 이 워커가 맡고 있다"는 점유권을 말한다. 워커는 샤드를 실제로 읽는 KCL 인스턴스로, 보통 파드 하나가 워커 하나다. KCL은 소비자 그룹마다 DynamoDB 테이블을 하나 만들고(이름은 보통 소비자 그룹 이름), 샤드마다 행을 하나씩 둔다. 샤드가 하나인 스트림이라면 행도 하나다.

| leaseKey | leaseOwner | leaseCounter | checkpoint |
|---|---|---|---|
| `shardId-000000000000` | `3a497da6-…` (워커 ID) | `4` | `1791567138704` |

- **leaseKey**: 어느 샤드의 행인지. 샤드 ID가 그대로 들어간다.
- **leaseOwner**: 지금 이 샤드를 맡은 워커의 ID.
- **leaseCounter**: 담당 워커가 몇 초마다 1씩 올리는 숫자다. 일종의 하트비트(살아 있다는 신호)라서, 이 숫자가 한동안 멈추면 다른 워커가 담당 워커가 죽었다고 보고 샤드를 가져간다. 롤링 배포로 구 파드가 내려가면 counter가 멈추고, 잠시 뒤 새 파드가 그 샤드를 가져간다.
- **checkpoint**: 이 샤드를 어디까지 처리했는지를 나타내는 레코드 시퀀스 번호다. 처음에는 `TRIM_HORIZON`(남아 있는 가장 오래된 레코드부터)이고, 처리할 때마다 앞으로 간다. 파드가 바뀌어도 이 값부터 이어서 읽기 때문에 같은 레코드를 다시 처리하지 않는다.

&nbsp; 샤드가 하나인 스트림에서 롤링 배포를 하면 아래 순서로 넘어간다. 새 파드가 먼저 떠도, 구 파드가 counter를 올리는 동안에는 가져갈 샤드가 없어서 기다린다. 샤드가 여러 개라면 새 파드가 뜨자마자 KCL이 워커끼리 개수를 맞추려고 일부를 미리 넘기기도 한다.

<svg class="sb4f7" viewBox="0 0 712 268" role="img" aria-labelledby="sb4f7-t sb4f7-d" style="max-width:100%;height:auto;font-family:inherit;display:block;margin:1.5rem auto">
<title id="sb4f7-t">롤링 배포 중 샤드 이어받기</title>
<desc id="sb4f7-d">샤드가 하나인 스트림에서 롤링 배포를 하면, 새 파드가 떠도 구 파드가 lease를 계속 갱신하는 동안에는 새 파드가 대기한다. 구 파드가 종료되어 leaseCounter가 멈추고 약 10초가 지나면 새 파드가 lease를 가져가 checkpoint부터 이어 읽는다.</desc>
<style>.sb4f7{--ok:#188038;--bad:#c5221f;--warn:#a35200;--warnf:#f9ab00;--cur:#1967d2}.dark .sb4f7{--ok:#81c995;--bad:#f28b82;--warn:#fdd663;--warnf:#fdd663;--cur:#8ab4f8}.sb4f7:hover *{animation-play-state:paused}.sb4f7-h{opacity:0;animation:sb4f7-hl 10s infinite both}.sb4f7-h2{animation-delay:2.5s}.sb4f7-h3{animation-delay:5s}.sb4f7-h4{animation-delay:7.5s}@keyframes sb4f7-hl{0%{opacity:0}2%,23%{opacity:1}25%,100%{opacity:0}}@media (prefers-reduced-motion: reduce){.sb4f7-h{animation:none}}</style>
<rect class="sb4f7-h sb4f7-h1" x="10" y="8" width="164" height="222" rx="10" fill-opacity="0.08" stroke-width="1.5" style="fill:var(--cur);stroke:var(--cur)"/>
<rect x="10" y="8" width="164" height="222" rx="10" fill="none" stroke="currentColor" stroke-opacity="0.25" stroke-width="1.2"/>
<text x="92.0" y="32" text-anchor="middle" fill="currentColor" font-size="13" font-weight="600">① 새 파드 기동</text>
<rect x="24" y="46" width="136" height="46" rx="8" stroke-width="1.4" fill-opacity="0.1" style="stroke:var(--ok);fill:var(--ok)"/><text x="92.0" y="66.0" text-anchor="middle" fill="currentColor" font-size="12.5" font-weight="600">구 파드</text><text x="92.0" y="83.0" text-anchor="middle" font-size="11.5" style="fill:var(--ok)">읽는 중</text>
<rect x="24" y="102" width="136" height="46" rx="8" stroke-width="1.4" stroke="currentColor" fill="currentColor" fill-opacity="0.04"/><text x="92.0" y="122.0" text-anchor="middle" fill="currentColor" font-size="12.5" font-weight="600" opacity="0.75">새 파드</text><text x="92.0" y="139.0" text-anchor="middle" fill="currentColor" font-size="11.5" opacity="0.75">대기</text>
<text x="92.0" y="168" text-anchor="middle" fill="currentColor" font-size="11" opacity="0.65">lease 테이블 행</text>
<rect x="24" y="174" width="136" height="46" rx="8" stroke-width="1.4" fill-opacity="0.1" style="stroke:var(--ok);fill:var(--ok)"/><text x="92.0" y="194.0" text-anchor="middle" fill="currentColor" font-size="12.5" font-weight="600">owner: 구 파드</text><text x="92.0" y="211.0" text-anchor="middle" font-size="11.5" style="fill:var(--ok)">counter 계속 오름</text>
<rect class="sb4f7-h sb4f7-h2" x="186" y="8" width="164" height="222" rx="10" fill-opacity="0.08" stroke-width="1.5" style="fill:var(--cur);stroke:var(--cur)"/>
<rect x="186" y="8" width="164" height="222" rx="10" fill="none" stroke="currentColor" stroke-opacity="0.25" stroke-width="1.2"/>
<text x="268.0" y="32" text-anchor="middle" fill="currentColor" font-size="13" font-weight="600">② 구 파드 종료</text>
<rect x="200" y="46" width="136" height="46" rx="8" stroke-width="1.4" fill="none" stroke-dasharray="5 4" style="stroke:var(--bad)"/><text x="268.0" y="66.0" text-anchor="middle" fill="currentColor" font-size="12.5" font-weight="600">구 파드</text><text x="268.0" y="83.0" text-anchor="middle" font-size="11.5" style="fill:var(--bad)">종료</text>
<rect x="200" y="102" width="136" height="46" rx="8" stroke-width="1.4" stroke="currentColor" fill="currentColor" fill-opacity="0.04"/><text x="268.0" y="122.0" text-anchor="middle" fill="currentColor" font-size="12.5" font-weight="600" opacity="0.75">새 파드</text><text x="268.0" y="139.0" text-anchor="middle" fill="currentColor" font-size="11.5" opacity="0.75">대기</text>
<text x="268.0" y="168" text-anchor="middle" fill="currentColor" font-size="11" opacity="0.65">lease 테이블 행</text>
<rect x="200" y="174" width="136" height="46" rx="8" stroke-width="1.4" fill-opacity="0.15" style="stroke:var(--warn);fill:var(--warnf)"/><text x="268.0" y="194.0" text-anchor="middle" fill="currentColor" font-size="12.5" font-weight="600">owner: 구 파드</text><text x="268.0" y="211.0" text-anchor="middle" font-size="11.5" style="fill:var(--warn)">counter 멈춤</text>
<rect class="sb4f7-h sb4f7-h3" x="362" y="8" width="164" height="222" rx="10" fill-opacity="0.08" stroke-width="1.5" style="fill:var(--cur);stroke:var(--cur)"/>
<rect x="362" y="8" width="164" height="222" rx="10" fill="none" stroke="currentColor" stroke-opacity="0.25" stroke-width="1.2"/>
<text x="444.0" y="32" text-anchor="middle" fill="currentColor" font-size="13" font-weight="600">③ 공백 (약 10초)</text>
<rect x="376" y="46" width="136" height="46" rx="8" stroke-width="1.4" stroke="currentColor" fill="none" stroke-dasharray="5 4" opacity="0.35"/><text x="444.0" y="66.0" text-anchor="middle" fill="currentColor" font-size="12.5" font-weight="600" opacity="0.4">구 파드</text><text x="444.0" y="83.0" text-anchor="middle" fill="currentColor" font-size="11.5" opacity="0.4">없음</text>
<rect x="376" y="102" width="136" height="46" rx="8" stroke-width="1.4" stroke="currentColor" fill="currentColor" fill-opacity="0.04"/><text x="444.0" y="122.0" text-anchor="middle" fill="currentColor" font-size="12.5" font-weight="600" opacity="0.75">새 파드</text><text x="444.0" y="139.0" text-anchor="middle" fill="currentColor" font-size="11.5" opacity="0.75">만료 기다림</text>
<text x="444.0" y="168" text-anchor="middle" fill="currentColor" font-size="11" opacity="0.65">lease 테이블 행</text>
<rect x="376" y="174" width="136" height="46" rx="8" stroke-width="1.4" fill-opacity="0.15" style="stroke:var(--warn);fill:var(--warnf)"/><text x="444.0" y="194.0" text-anchor="middle" fill="currentColor" font-size="12.5" font-weight="600">owner: 구 파드</text><text x="444.0" y="211.0" text-anchor="middle" font-size="11.5" style="fill:var(--warn)">counter 멈춤</text>
<rect class="sb4f7-h sb4f7-h4" x="538" y="8" width="164" height="222" rx="10" fill-opacity="0.08" stroke-width="1.5" style="fill:var(--cur);stroke:var(--cur)"/>
<rect x="538" y="8" width="164" height="222" rx="10" fill="none" stroke="currentColor" stroke-opacity="0.25" stroke-width="1.2"/>
<text x="620.0" y="32" text-anchor="middle" fill="currentColor" font-size="13" font-weight="600">④ 새 파드가 이어받음</text>
<rect x="552" y="46" width="136" height="46" rx="8" stroke-width="1.4" stroke="currentColor" fill="none" stroke-dasharray="5 4" opacity="0.35"/><text x="620.0" y="66.0" text-anchor="middle" fill="currentColor" font-size="12.5" font-weight="600" opacity="0.4">구 파드</text><text x="620.0" y="83.0" text-anchor="middle" fill="currentColor" font-size="11.5" opacity="0.4">없음</text>
<rect x="552" y="102" width="136" height="46" rx="8" stroke-width="1.4" fill-opacity="0.1" style="stroke:var(--ok);fill:var(--ok)"/><text x="620.0" y="122.0" text-anchor="middle" fill="currentColor" font-size="12.5" font-weight="600">새 파드</text><text x="620.0" y="139.0" text-anchor="middle" font-size="11.5" style="fill:var(--ok)">읽는 중</text>
<text x="620.0" y="168" text-anchor="middle" fill="currentColor" font-size="11" opacity="0.65">lease 테이블 행</text>
<rect x="552" y="174" width="136" height="46" rx="8" stroke-width="1.4" fill-opacity="0.1" style="stroke:var(--ok);fill:var(--ok)"/><text x="620.0" y="194.0" text-anchor="middle" fill="currentColor" font-size="12.5" font-weight="600">owner: 새 파드</text><text x="620.0" y="211.0" text-anchor="middle" font-size="11.5" style="fill:var(--ok)">checkpoint부터 읽음</text>
<text x="356" y="256" text-anchor="middle" fill="currentColor" font-size="11.5" opacity="0.75">③ 동안 들어온 레코드는 스트림에 남아 ④에서 처리됨, 유실 없음</text>
</svg>

&nbsp; 그래서 KCL을 바꿀 때 가장 중요한 건 새 버전이 이 테이블을 그대로 이어받는지다. 테이블 이름이 달라지거나 체크포인트를 못 읽으면 처음부터 다시 읽게 되고, 이미 처리한 이벤트를 또 처리한다.

&nbsp; KCL 3는 이 테이블을 더 많이 쓴다. 샤드 행 외에 마이그레이션 상태 행(`Migration3.0`), 워커별 CPU 지표 행(워커 메트릭), 리더 선출 행(`Leader`)을 같은 테이블에 추가하고, 샤드 행에도 필드(`entityType`, `throughputKBps`)를 덧붙인다. "이 워커가 맡은 샤드"를 빨리 찾으려고 `leaseOwner` 기준 인덱스(`LeaseOwnerToLeaseKeyIndex`)도 만든다. 아래 롤백 문제는 바로 이 추가 행 때문에 생긴다.

### 로컬에서 lease 이어받기 검증

&nbsp; 가장 먼저 걱정한 건 KCL 3가 KCL 2가 쓰던 lease 테이블을 이어받는지였다. 이어받지 못하면 처음부터 다시 읽어서 같은 이벤트를 중복 처리하게 된다. 로컬 AWS 에뮬레이터(floci)에 스트림을 만들고 다음 순서로 확인했다.

1. 3.5.7(KCL 2)로 레코드 20건을 소비한다.
2. 같은 상태에서 4.1.1(KCL 3)로 바꿔 새 레코드 20건을 넣는다.
3. DB에 저장된 건수를 단계별로 센다.

&nbsp; 결과는 새 레코드 20건만 처리됐고, 이전 레코드는 다시 처리되지 않았다(재처리됐다면 1단계 건수가 40건이 된다). 같은 lease 테이블을 이어받았고, KCL 3용 인덱스가 자동으로 추가됐다.

&nbsp; 에뮬레이터에도 함정이 있었다. 샤드를 4개로 만들면 4개 모두 같은 해시 범위를 돌려줘서 KCL이 시작을 거부했다. enhanced fan-out(샤드마다 전용 처리량을 받는 구독 방식)은 KCL 2에서도 레코드를 한 건도 받지 못했다. 그래서 로컬 검증은 샤드 1개, polling 방식으로만 했고, 나머지는 dev 환경에서 확인했다.

### 롤백하면 소비가 멈춘다

&nbsp; 그런데 다른 서비스를 올리던 중에 문제가 하나 나왔다. KCL 3로 배포한 뒤 3.5.7(KCL 2)로 롤백하면 소비가 멈춘다. KCL 3는 lease 테이블에 마이그레이션 상태 행(`Migration3.0`)과 워커 메트릭 행을 추가로 쓰는데, KCL 2는 이 행을 lease로 읽으려다 `leaseCounter is marked non-null but is null`로 초기화에 실패한다. 20번 실패하면 스케줄러가 종료된다. 앱 프로세스는 떠 있어서 겉으로는 정상처럼 보인다는 점이 더 위험하다.

&nbsp; KCL 3에는 이 전환을 위한 호환 모드(`clientVersionConfig`)가 있다. 모드마다 롤백이 되는지 같은 방식으로 검증했다.

<svg class="sb4f5" viewBox="0 0 700 410" role="img" aria-labelledby="sb4f5-t sb4f5-d" style="max-width:100%;height:auto;font-family:inherit;display:block;margin:1.5rem auto">
<title id="sb4f5-t">KCL 3 모드별 lease 테이블 변화와 롤백 결과</title>
<desc id="sb4f5-d">위쪽 기본값 3X 모드에서는 KCL 2로 소비하던 lease 테이블에 KCL 3를 배포하면 Migration3.0과 워커 메트릭 행이 추가되고, 다시 KCL 2로 롤백하면 KCL 2가 이 행을 읽지 못해 소비가 멈춘다. 아래쪽 PHASE1 모드에서는 KCL 3를 배포해도 행이 추가되지 않아, KCL 2로 롤백해도 중복 없이 정상 소비한다. 세 단계가 왼쪽부터 차례로 강조된다.</desc>
<style>.sb4f5{--ok:#188038;--bad:#c5221f;--warn:#a35200;--warnf:#f9ab00;--cur:#1967d2}.dark .sb4f5{--ok:#81c995;--bad:#f28b82;--warn:#fdd663;--warnf:#fdd663;--cur:#8ab4f8}.sb4f5:hover *{animation-play-state:paused}.sb4f5-h{opacity:0;animation:9s ease-in-out infinite both}.sb4f5-h1{animation-name:sb4f5-h1}.sb4f5-h2{animation-name:sb4f5-h2}.sb4f5-h3{animation-name:sb4f5-h3}.sb4f5-c2{animation:sb4f5-c2 9s ease-out infinite both}.sb4f5-c3{animation:sb4f5-c3 9s ease-out infinite both}@keyframes sb4f5-h1{0%{opacity:0}3%,30%{opacity:1}33%,100%{opacity:0}}@keyframes sb4f5-h2{0%,33%{opacity:0}36%,63%{opacity:1}66%,100%{opacity:0}}@keyframes sb4f5-h3{0%,66%{opacity:0}69%,96%{opacity:1}100%{opacity:0}}@keyframes sb4f5-c2{0%,33%{opacity:0}38%,100%{opacity:1}}@keyframes sb4f5-c3{0%,66%{opacity:0}71%,100%{opacity:1}}@media (prefers-reduced-motion: reduce){.sb4f5-h,.sb4f5-c2,.sb4f5-c3{animation:none}}</style>
<rect class="sb4f5-h sb4f5-h1" x="172" y="34" width="156" height="370" rx="10" fill-opacity="0.08" stroke-opacity="0.45" style="fill:var(--cur);stroke:var(--cur)"/>
<rect class="sb4f5-h sb4f5-h2" x="342" y="34" width="156" height="370" rx="10" fill-opacity="0.08" stroke-opacity="0.45" style="fill:var(--cur);stroke:var(--cur)"/>
<rect class="sb4f5-h sb4f5-h3" x="512" y="34" width="156" height="370" rx="10" fill-opacity="0.08" stroke-opacity="0.45" style="fill:var(--cur);stroke:var(--cur)"/>
<text x="250" y="24" text-anchor="middle" fill="currentColor" font-size="12.5" font-weight="600">① KCL 2로 소비</text>
<text x="420" y="24" text-anchor="middle" fill="currentColor" font-size="12.5" font-weight="600">② KCL 3로 배포</text>
<text x="590" y="24" text-anchor="middle" fill="currentColor" font-size="12.5" font-weight="600">③ KCL 2로 롤백</text>
<rect x="12" y="40" width="676" height="168" rx="10" fill="none" stroke="currentColor" stroke-opacity="0.25"/>
<text x="24" y="68" fill="currentColor" font-size="13" font-weight="600">기본값 (3X)</text>
<text x="24" y="88" fill="currentColor" font-size="11" opacity="0.7">KCL 3 기능을 모두 켬</text>
<g>
<text x="250" y="66" text-anchor="middle" fill="currentColor" font-size="11" opacity="0.65">lease 테이블</text>
<rect x="180" y="74" width="140" height="22" rx="4" fill="currentColor" fill-opacity="0.06" stroke="currentColor" stroke-opacity="0.35"/>
<text x="250" y="89" text-anchor="middle" fill="currentColor" font-size="11">shardId-000</text>
<text x="250" y="176" text-anchor="middle" font-size="12.5" font-weight="700" style="fill:var(--ok)">✓ 소비</text>
</g>
<g class="sb4f5-c2">
<text x="420" y="66" text-anchor="middle" fill="currentColor" font-size="11" opacity="0.65">lease 테이블</text>
<rect x="350" y="74" width="140" height="22" rx="4" fill="currentColor" fill-opacity="0.06" stroke="currentColor" stroke-opacity="0.35"/>
<text x="420" y="89" text-anchor="middle" fill="currentColor" font-size="11">shardId-000</text>
<rect x="350" y="100" width="140" height="22" rx="4" fill-opacity="0.18" style="fill:var(--warnf);stroke:var(--warn)"/>
<text x="420" y="115" text-anchor="middle" fill="currentColor" font-size="11">Migration3.0</text>
<rect x="350" y="126" width="140" height="22" rx="4" fill-opacity="0.18" style="fill:var(--warnf);stroke:var(--warn)"/>
<text x="420" y="141" text-anchor="middle" fill="currentColor" font-size="11">워커 메트릭</text>
<text x="420" y="176" text-anchor="middle" font-size="12.5" font-weight="700" style="fill:var(--ok)">✓ 소비</text>
<text x="420" y="194" text-anchor="middle" fill="currentColor" font-size="11" opacity="0.7">행 2개 추가</text>
</g>
<g class="sb4f5-c3">
<text x="590" y="66" text-anchor="middle" fill="currentColor" font-size="11" opacity="0.65">lease 테이블</text>
<rect x="520" y="74" width="140" height="22" rx="4" fill="currentColor" fill-opacity="0.06" stroke="currentColor" stroke-opacity="0.35"/>
<text x="590" y="89" text-anchor="middle" fill="currentColor" font-size="11">shardId-000</text>
<rect x="520" y="100" width="140" height="22" rx="4" fill-opacity="0.18" style="fill:var(--warnf);stroke:var(--warn)"/>
<text x="590" y="115" text-anchor="middle" fill="currentColor" font-size="11">Migration3.0</text>
<rect x="520" y="126" width="140" height="22" rx="4" fill-opacity="0.18" style="fill:var(--warnf);stroke:var(--warn)"/>
<text x="590" y="141" text-anchor="middle" fill="currentColor" font-size="11">워커 메트릭</text>
<text x="590" y="176" text-anchor="middle" font-size="12.5" font-weight="700" style="fill:var(--bad)">✗ 소비 정지</text>
<text x="590" y="194" text-anchor="middle" font-size="11" style="fill:var(--bad)">KCL 2가 새 행을 못 읽음</text>
</g>
<rect x="12" y="224" width="676" height="168" rx="10" fill="none" stroke="currentColor" stroke-opacity="0.25"/>
<text x="24" y="252" fill="currentColor" font-size="13" font-weight="600">PHASE1</text>
<text x="24" y="272" fill="currentColor" font-size="11" opacity="0.7">동작은 KCL 2와 같음</text>
<g>
<text x="250" y="250" text-anchor="middle" fill="currentColor" font-size="11" opacity="0.65">lease 테이블</text>
<rect x="180" y="258" width="140" height="22" rx="4" fill="currentColor" fill-opacity="0.06" stroke="currentColor" stroke-opacity="0.35"/>
<text x="250" y="273" text-anchor="middle" fill="currentColor" font-size="11">shardId-000</text>
<text x="250" y="360" text-anchor="middle" font-size="12.5" font-weight="700" style="fill:var(--ok)">✓ 소비</text>
</g>
<g class="sb4f5-c2">
<text x="420" y="250" text-anchor="middle" fill="currentColor" font-size="11" opacity="0.65">lease 테이블</text>
<rect x="350" y="258" width="140" height="22" rx="4" fill="currentColor" fill-opacity="0.06" stroke="currentColor" stroke-opacity="0.35"/>
<text x="420" y="273" text-anchor="middle" fill="currentColor" font-size="11">shardId-000</text>
<text x="420" y="360" text-anchor="middle" font-size="12.5" font-weight="700" style="fill:var(--ok)">✓ 소비</text>
<text x="420" y="378" text-anchor="middle" fill="currentColor" font-size="11" opacity="0.7">행 추가 없음</text>
</g>
<g class="sb4f5-c3">
<text x="590" y="250" text-anchor="middle" fill="currentColor" font-size="11" opacity="0.65">lease 테이블</text>
<rect x="520" y="258" width="140" height="22" rx="4" fill="currentColor" fill-opacity="0.06" stroke="currentColor" stroke-opacity="0.35"/>
<text x="590" y="273" text-anchor="middle" fill="currentColor" font-size="11">shardId-000</text>
<text x="590" y="360" text-anchor="middle" font-size="12.5" font-weight="700" style="fill:var(--ok)">✓ 정상 소비</text>
<text x="590" y="378" text-anchor="middle" font-size="11" style="fill:var(--ok)">재처리, 중복 없음</text>
</g>
</svg>

| 시나리오 | KCL 3 모드 | lease 테이블에 추가되는 행 | KCL 2로 롤백 후 |
|---|---|---|---|
| 롤백 | `3X` (기본값) | `Migration3.0`, 워커 메트릭 | 소비 정지 |
| 롤백 | `COMPATIBLE_WITH_2X_PHASE1` | 없음 | 정상 소비, 중복 0 |
| 롤백 | `COMPATIBLE_WITH_2X` | `Migration3.0`, 워커 메트릭 | 소비 정지 |
| 공존 | `PHASE1` | 없음 | KCL 2와 3 동시 가동 중 오류 0, 중복 0 |
| 공존 | `3X` | `Migration3.0`, `Leader`, 워커 메트릭 | 소비와 중복은 정상, 구 KCL 2 파드에 오류 로그 |
| 복구 | `3X` 배포 후 | 비-`shardId-` 행 삭제 | KCL 2가 체크포인트부터 재처리 없이 소비 |

&nbsp; `PHASE1`은 라이브러리만 KCL 3이고 동작은 KCL 2와 같으며, 테이블에 아무것도 쓰지 않는다. 새 버전을 호환 모드로 먼저 깔아 두는 셈이다. 이미 `3X`로 마이그레이션된 테이블 위에 `PHASE1`로 다시 배포해도 KCL이 테이블에 기록된 상태를 따라가서 정상 소비했다.

&nbsp; 그래서 배포는 세 단계로 나누기로 했다.

1. `PHASE1`로 배포한다. 이 단계에서는 문제가 생기면 그냥 롤백하면 된다.
2. 안정화되면 `COMPATIBLE_WITH_2X`로 바꿔 배포한다. 마이그레이션이 시작되고, 이때부터는 롤백하려면 비-`shardId-` 행을 지워야 한다.
3. 설정을 지워 기본값(`3X`)으로 돌아간다.

&nbsp; 모드는 바인더의 `ConsumerEndpointCustomizer` 빈으로 넣었다. 바인더는 KCL을 쓰지 않는 모드(`kpl-kcl-enabled: false`, 테스트 설정 등)에서도 같은 customizer를 호출한다. 그래서 타입을 고정하지 않고 KCL 어댑터일 때만 적용하게 했다.

```kotlin
@Bean
open fun kclClientVersionCustomizer(
  @Value("\${kcl.client-version:CLIENT_VERSION_CONFIG_COMPATIBLE_WITH_2X_PHASE1}") clientVersion: String,
): ConsumerEndpointCustomizer<MessageProducerSupport> =
  ConsumerEndpointCustomizer { endpoint, _, _ ->
    if (endpoint is KclMessageDrivenChannelAdapter) {
      endpoint.setCoordinatorConfigCustomizer {
        it.clientVersionConfig(CoordinatorConfig.ClientVersionConfig.valueOf(clientVersion))
      }
    }
  }
```

&nbsp; 모드를 설정 값으로 받기 때문에, 다음 단계로 넘어갈 때는 코드가 아니라 설정만 바꾸면 된다.

&nbsp; KCL 3로 넘어가면 확인할 것이 두 가지 더 있다. KCL 3는 lease 테이블에 인덱스를 추가하므로 IAM 역할에 그 테이블에 대한 `dynamodb:UpdateTable` 권한과 인덱스(`.../index/*`)에 대한 `dynamodb:Query` 권한이 필요하다. 또 기동할 때 EC2 메타데이터(워커 CPU 지표용) 조회에 실패하면 ERROR 로그를 한 줄 남기는데, 소비에는 영향이 없다.


## 5. 기동 시간과 메모리

&nbsp; 가장 작은 서비스에서 3.5.7과 4.1.1을 각각 세 번씩 띄워 쟀다.

<svg class="sb4f6" viewBox="0 0 700 262" role="img" aria-labelledby="sb4f6-t sb4f6-d" style="max-width:100%;height:auto;font-family:inherit;display:block;margin:1.5rem auto">
<title id="sb4f6-t">구성별 기동 시간, 로드된 클래스, metaspace 비교</title>
<desc id="sb4f6-d">3.5.7, 3.5.7에서 쓰지 않던 Kinesis 의존성만 제거한 버전, 4.1.1 세 구성을 비교한다. 기동 시간은 2.05초, 1.39초, 1.20초, 로드된 클래스는 14,750개, 10,700개, 11,478개, metaspace는 69MB, 53MB, 61MB다. 개선의 대부분은 의존성 제거에서 나오고, 4.1.1은 의존성만 제거한 3.5.7보다 클래스와 metaspace가 조금 많다.</desc>
<style>.sb4f6{--ok:#188038;--bad:#c5221f;--warn:#a35200;--warnf:#f9ab00;--cur:#1967d2}.dark .sb4f6{--ok:#81c995;--bad:#f28b82;--warn:#fdd663;--warnf:#fdd663;--cur:#8ab4f8}</style>
<rect x="150" y="10" width="14" height="12" rx="2" fill="currentColor" fill-opacity="0.28"/>
<text x="170" y="21" fill="currentColor" font-size="11">3.5.7</text>
<rect x="260" y="10" width="14" height="12" rx="2" fill="currentColor" fill-opacity="0.55"/>
<text x="280" y="21" fill="currentColor" font-size="11">3.5.7 − 미사용 의존성</text>
<rect x="470" y="10" width="14" height="12" rx="2" style="fill:var(--cur)"/>
<text x="490" y="21" fill="currentColor" font-size="11">4.1.1 (의존성 제거 포함)</text>
<text x="12" y="74" fill="currentColor" font-size="12.5" font-weight="600">기동 시간</text>
<rect x="150" y="44" width="400.0" height="14" rx="3" fill="currentColor" fill-opacity="0.28"/>
<text x="558.0" y="55" fill="currentColor" font-size="11" opacity="0.85">2.05초</text>
<rect x="150" y="64" width="271.2" height="14" rx="3" fill="currentColor" fill-opacity="0.55"/>
<text x="429.2" y="75" fill="currentColor" font-size="11" opacity="0.85">1.39초</text>
<rect x="150" y="84" width="234.1" height="14" rx="3" style="fill:var(--cur)"/>
<text x="392.1" y="95" fill="currentColor" font-size="11" opacity="0.85">1.20초</text>
<text x="12" y="146" fill="currentColor" font-size="12.5" font-weight="600">로드된 클래스</text>
<rect x="150" y="116" width="400.0" height="14" rx="3" fill="currentColor" fill-opacity="0.28"/>
<text x="558.0" y="127" fill="currentColor" font-size="11" opacity="0.85">14,750개</text>
<rect x="150" y="136" width="290.2" height="14" rx="3" fill="currentColor" fill-opacity="0.55"/>
<text x="448.2" y="147" fill="currentColor" font-size="11" opacity="0.85">10,700개</text>
<rect x="150" y="156" width="311.3" height="14" rx="3" style="fill:var(--cur)"/>
<text x="469.3" y="167" fill="currentColor" font-size="11" opacity="0.85">11,478개</text>
<text x="12" y="218" fill="currentColor" font-size="12.5" font-weight="600">metaspace</text>
<rect x="150" y="188" width="400.0" height="14" rx="3" fill="currentColor" fill-opacity="0.28"/>
<text x="558.0" y="199" fill="currentColor" font-size="11" opacity="0.85">69MB</text>
<rect x="150" y="208" width="307.2" height="14" rx="3" fill="currentColor" fill-opacity="0.55"/>
<text x="465.2" y="219" fill="currentColor" font-size="11" opacity="0.85">53MB</text>
<rect x="150" y="228" width="353.6" height="14" rx="3" style="fill:var(--cur)"/>
<text x="511.6" y="239" fill="currentColor" font-size="11" opacity="0.85">61MB</text>
</svg>

&nbsp; 처음에는 Boot 4가 훨씬 가벼워진 줄 알았다. 그런데 3.5.7에서 의존성만 지운 버전을 따로 재 보니, 개선의 대부분은 쓰지 않던 의존성을 지운 효과였다. Boot 4 자체는 기동이 0.2초쯤 빨라지는 대신 클래스가 780개쯤, metaspace가 8MB쯤 늘었다. Jackson 3가 Jackson 2와 함께 올라오는 영향으로 보인다. 다른 서비스들도 metaspace가 10MB 안팎 늘었다. 효과를 섞어서 재지 않으려면 비교 대상을 하나 더 두는 게 중요하다는 걸 배웠다.


## 6. 마무리

&nbsp; 돌아보면 이번 작업의 교훈은 하나로 모인다. **컴파일과 테스트가 통과했다고 동작이 같은 건 아니다.**

- 기동해야만 드러나는 문제가 있다(빈 누락).
- 응답을 비교해야만 드러나는 문제가 있다(Jackson 3 전환, 404 메시지).
- 실제로 메시지를 흘려야만 드러나는 문제가 있다(SQS 변환기, KPL, hubspot).
- 되돌려 봐야만 드러나는 문제가 있다(KCL 롤백).

&nbsp; 그래서 바꾸기 전 jar와 바꾼 뒤 jar를 나란히 띄워 비교하는 방식이 가장 큰 도움이 됐다. 덤으로, 원래부터 깨져 있었는데 아무도 모르던 문제도 몇 개 찾았다. 테스트가 덮지 않던 직렬화 경로, 최신 IDL과 맞지 않던 설정 파일, 다섯 달 동안 잘못된 경로로 배포를 요청하고 있던 CI 설정 같은 것들이다.
