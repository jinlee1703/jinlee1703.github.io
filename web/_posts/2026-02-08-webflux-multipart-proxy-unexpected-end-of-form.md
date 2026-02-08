---
layout: post
title: "WebFlux Multipart 프록시에서 'Unexpected end of form'이 터지는 이유"
description: >
  WebFlux 기반 BFF에서 multipart/form-data를 내부 서비스로 프록시할 때,
  multipart를 파싱한 뒤 재조립하면서도 원본 헤더(Content-Type/Content-Length)를 그대로 복사하면
  boundary·길이가 body와 불일치해 "Unexpected end of form"이 발생한다.
  BodyInserters가 메시지를 재작성(write)한다는 관점과, 프록시를 “재작성(rebuild)”/“바이트 스트리밍(pass-through)” 모드로 구분하는 기준을 정리한다.
sitemap: false
hide_last_modified: false
published: true
---

---

* this unordered seed list will be replaced by the toc
{:toc}

---

## 1. 서론

지난 글(2026-01-25, "Spring Boot 버전 업데이트 이후, WebFlux 필터 헤더 전파가 깨진 이유와 해결기")에서 WebFlux의 헤더 전파 규칙을 정리했다. 이번 글은 그 연장선에서, **multipart/form-data를 프록시할 때 헤더-바디 결합이 어떻게 깨지는지**를 다룬다.

BFF(API Gateway)가 파일 업로드 요청을 내부 서비스로 프록시하는 구조는 흔하다. 다만 multipart/form-data는 “바디만 전달하면 끝”이 아니다. **헤더(Content-Type의 boundary, Content-Length)와 바디 구조가 강하게 결합된 프로토콜**이다.

필자는 WebFlux에서 multipart 요청을 파싱한 뒤 다시 조립해 전송하는 과정에서, 원본 헤더를 그대로 복사하는 코드 한 줄 때문에 내부 서비스가 multipart 파싱에 실패하고 `Unexpected end of form`을 뱉는 장애를 겪었다. 이 글은 그 장애가 왜 발생했는지, 그리고 실무에서 어떤 설계가 안전한지 정리한다.

---

## 2. 문제 상황

Internal Service(`common-user-api`)에서 파일 업로드 프록시 요청 처리 중 다음 오류가 발생했다.

```json
{
  "level": "error",
  "message": "[POST] /common/v1/file/commands/file-upload >> StatusCode:: 500, Message:: Unexpected end of form"
}
```

이 에러는 보통 다음 중 하나를 의미한다.

- 서버가 multipart 바디를 끝까지 읽지 못했다(Content-Length 불일치/스트림 종료)
- 헤더에 명시된 boundary로 바디를 파싱할 수 없다(boundary 불일치)
- 종료 boundary(`--boundary--`)를 찾지 못한다(바디 절단/구조 손상)

즉, “서버가 multipart를 끝냈다고 판단할 수 없는 상태”가 핵심이다.

---

## 3. 문제 코드

문제 지점은 아래 한 줄이다.

```kotlin
fun proxyPostMultipartData(
    request: ServerRequest,
    namespace: String? = null,
): Mono<Any> =
    request
        .multipartData()
        .flatMap { multipart ->
            client
                .post()
                .uri(/* ... */)
                .headers(request.headersConsumer()) // ❌ 문제 지점
                .body(BodyInserters.fromMultipartData(multipart))
                .accept(MediaType.ALL)
                .retrieve()
                /* ... */
        }
```

`headersConsumer()`는 원본 요청 헤더를 전부 복사하고, `exchange.attributes`에 저장한 값들도 헤더로 변환해 추가한다.

```kotlin
fun ServerRequest.headersConsumer(): Consumer<HttpHeaders> = Consumer { headers ->
    headers.addAll(this.headers().asHttpHeaders())       // 원본 헤더 전부 복사
    exchange().attributes.forEach { (key, value) ->      // attributes → 헤더 변환
        if (key is String) {
            headers.add(key, value.toString())
        }
    }
}
```

JSON 프록시에서는 큰 문제가 없었지만, multipart 프록시에서는 이 전략이 치명적이었다.

---

## 4. 원인: “multipart를 파싱한 뒤 재조립”하면 원본 헤더가 더 이상 정답이 아니다

### 4.1 multipart 처리 흐름에서 boundary/길이는 바뀔 수 있다

아래 흐름이 발생하는 순간, “원본 요청”과 “내가 다시 만든 요청”은 바이트 레벨에서 같은 요청이 아니다.

```text
클라이언트 요청(원본)
  Content-Type: multipart/form-data; boundary=ABC123
  Content-Length: 5000
  Body: boundary=ABC123 기반

BFF에서 request.multipartData()
  → 원본 boundary(ABC123)로 파싱
  → MultiValueMap(Part들) 생성

BodyInserters.fromMultipartData()
  → MultiValueMap을 multipart body로 재작성
  → 새로운 boundary(XYZ789) 생성 가능
  → 바디 크기 변경 가능(예: 5023 bytes)
```

정리하면 다음 두 단계가 다르다.

- `multipartData()`는 원본 바디를 **구조로 읽는(read)** 단계
- `fromMultipartData()`는 그 구조를 **새 바디로 쓰는(write)** 단계

write 단계가 들어오는 순간부터 원본 `Content-Type(boundary)` / `Content-Length`는 “원본 바디”에 대한 값이며, “재작성된 바디”에 대해서는 틀릴 수 있다.

### 4.2 왜 Spring은 Content-*를 재산출하는가

Spring WebFlux는 `BodyInserters`와 `HttpMessageWriter`를 통해 요청 바디를 “직렬화하여 작성(write)”한다. multipart는 이 작성 과정에서 boundary가 필요하고, 바디 구성 결과에 따라 길이도 달라질 수 있다.

따라서 `Content-Type(boundary 포함)`과 `Content-Length` 같은 Content-* 헤더는 “원본을 복사”하는 값이 아니라 “최종 바이트 결과로부터 산출”되는 값으로 취급된다. 리액티브 환경에서는 길이를 사전에 확정하기 어려운 경우가 많고, 전송 프레이밍은 HTTP 규약/보안과도 직결된다. 그래서 Spring은 새 메시지를 만들 때 Content-*를 다시 계산해 일관성을 보장하도록 설계되어 있다.

---

## 5. 직접 원인: 헤더-바디 불일치

`headersConsumer()`는 원본의 `Content-Type`, `Content-Length`까지 그대로 복사한다. 그런데 바디는 이미 `fromMultipartData()`가 만든 “새 boundary 기반의 새 바디”다.

결과적으로 내부 서비스가 받는 요청이 아래처럼 된다.

- 헤더: `Content-Type: multipart/form-data; boundary=ABC123`
- 헤더: `Content-Length: 5000`
- 실제 Body: `boundary=XYZ789`, 실제 크기 `5023`

이 상태에서 서버는 두 갈래로 무너진다.

Case A: boundary 불일치
서버는 헤더의 boundary(ABC123)로 파트를 구분하려고 한다. 그런데 바디에는 ABC123이 없고 XYZ789만 있다. 시작 boundary를 못 찾거나, 파트 경계를 찾지 못한다.

Case B: Content-Length 불일치 → 바디 절단 → 종료 boundary 미검출
서버는 Content-Length(5000)만큼만 읽고 “요청 바디가 끝났다”고 판단한다. 실제는 5023 bytes인데 5000만 읽어서 마지막 23 bytes가 유실된다. 종료 boundary(`--XYZ789--`)가 잘리면 multipart는 끝나지 않는다. 이 케이스가 대표적으로 `Unexpected end of form`이다.

정리하면, 이 장애는 “Spring이 이상해서”가 아니라 **프록시가 프로토콜 결합(헤더-바디)을 깨뜨렸기 때문**이다.

---

## 6. 해결: multipart 프록시에서 원본 헤더 전체 복사를 제거한다

해결은 단순하다. multipart를 재조립해서 보낼 거면, WebClient/Spring이 새 바디에 맞는 헤더를 계산하도록 맡겨야 한다.

```kotlin
fun proxyPostMultipartData(
    request: ServerRequest,
    namespace: String? = null,
): Mono<Any> =
    request
        .multipartData()
        .flatMap { multipart ->
            client
                .post()
                .uri(/* ... */)
                // .headers(request.headersConsumer()) ✅ 제거
                .body(BodyInserters.fromMultipartData(multipart))
                .accept(MediaType.ALL)
                .retrieve()
                /* ... */
        }
```

이렇게 하면 전송되는 요청은 일관성을 회복한다.

- Content-Type: `multipart/form-data; boundary=XYZ789`
- Content-Length: 새 바디 기준으로 계산되거나(가능 시), 전송 방식에 맞게 처리됨
- Body: boundary=XYZ789 기반

---

## 7. headersConsumer()는 왜 필요했나: 인증/테넌트 헤더 전파

`headersConsumer()`의 본래 목적은 “인증/테넌트 식별 헤더 전파”였다.

- `x-user-id`, `x-account-id`, `x-tenant-id`
- 인증/인가, 로깅/감사, 멀티테넌시 격리에 필요

JSON 프록시에서는 Content-Type이 고정적이고(boundary 없음), 바디 재작성의 민감도가 낮아서 원본 헤더 복사가 문제로 드러나지 않았다. multipart는 Content-Type의 boundary가 곧 파서의 키이므로 “재작성 + 원본 Content-* 복사” 조합이 바로 장애로 이어진다.

결론은 다음이다.

- 헤더 전파는 필요하다.
- 하지만 방식이 “전체 복사”면 안 된다.
- 특히 `Content-Type`, `Content-Length`, `Transfer-Encoding`, `Host` 같은 전송 계층 헤더는 프레임워크에 맡기는 편이 안전하다.

---

## 8. 프록시는 2가지 모드로 나눠야 한다: rebuild vs pass-through

여기서부터가 실무 적용 기준이다. “프록시”라고 해서 모두 같은 동작을 하면 안 된다.

### 8.1 재작성(proxy rebuild)

의미: 요청을 파싱하고 구조를 다룬 뒤, 새 메시지로 재작성해서 전달한다.

예: `request.multipartData()` → 파트 검증/필터링/추가 → `fromMultipartData()`

이 모드에서는 Content-*는 “원본 복사”가 아니라 “재산출”되어야 한다. 따라서 원본 `Content-Type/Content-Length` 복사는 금지에 가깝다. 필요한 인증/도메인 헤더만 선별 전달해야 한다.

### 8.2 바이트 스트리밍(proxy pass-through)

의미: 바디를 해석하지 않고 “원본 바이트 스트림을 그대로” 전달한다.

예: `BodyInserters.fromDataBuffers(request.bodyToFlux(DataBuffer::class.java))`

이 모드에서는 바디가 원본 그대로이므로, 원본 Content-*를 그대로 전달해도 논리적으로 일치한다. 대용량 파일/고성능 프록시에는 이 모드가 기본값이 되는 편이 낫다.

---

## 9. 더 안전한 패턴: “선별 헤더 전달”로 유지 보수성 확보

rebuild 모드에서 권장하는 구현 방향은 allowlist다.

```kotlin
fun proxyPostMultipartDataSafe(request: ServerRequest): Mono<Any> =
    request.multipartData().flatMap { multipart ->
        client.post()
            .uri(/* ... */)
            .headers { headers ->
                // ✅ 인증/도메인 헤더만 전달
                request.exchange().attributes["x-user-id"]?.let { headers.add("x-user-id", it.toString()) }
                request.exchange().attributes["x-account-id"]?.let { headers.add("x-account-id", it.toString()) }
                request.exchange().attributes["x-tenant-id"]?.let { headers.add("x-tenant-id", it.toString()) }

                // ❌ Content-* 계열은 넣지 않는다 (rebuild 시 깨질 수 있음)
            }
            .body(BodyInserters.fromMultipartData(multipart))
            .retrieve()
            /* ... */
    }
```

“원본 헤더 전체 복사 + 일부 수정”은 시간이 지나면 다시 지뢰가 된다. allowlist는 길게 보면 사고 확률을 낮춘다.

---

## 10. 근본 개선: 스트리밍(pass-through) 프록시로 비용과 리스크를 동시에 줄이기

프록시 목적이 “검증/변형”이 아니라 “운반”이라면 pass-through가 더 적합하다.

```kotlin
fun proxyPostMultipartDataStreaming(request: ServerRequest): Mono<Any> =
    client.post()
        .uri(/* ... */)
        .headers { headers ->
            // ✅ 원본 바디를 그대로 전달할 때만 Content-* 복사가 일관된다
            request.headers().contentType().ifPresent { headers.contentType = it }
            request.headers().contentLength().takeIf { it > 0 }?.let { headers.contentLength = it }

            // ✅ 필요한 인증 헤더 추가
            request.exchange().attributes["x-user-id"]?.let { headers.add("x-user-id", it.toString()) }
            request.exchange().attributes["x-account-id"]?.let { headers.add("x-account-id", it.toString()) }
            request.exchange().attributes["x-tenant-id"]?.let { headers.add("x-tenant-id", it.toString()) }
        }
        .body(BodyInserters.fromDataBuffers(request.bodyToFlux(org.springframework.core.io.buffer.DataBuffer::class.java)))
        .retrieve()
        /* ... */
```

장점은 명확하다.

- 대용량 파일에서 메모리 효율이 좋다(전체를 파싱/적재하지 않는다)
- 파싱/재조립 오버헤드가 없다
- boundary 불일치 같은 류의 문제를 구조적으로 제거한다

---

## 11. (프로젝트 맥락) “파일 업로드는 인증 헤더 없이도 동작”이 만든 착시

프로젝트 라우팅 구조상 파일 업로드 경로가 인증/테넌트 주입 필터를 타지 않는 케이스가 있었다.

- 해당 라우트는 필터를 거치지 않아 `exchange.attributes`에 인증 관련 값이 없다
- 따라서 `.headers(request.headersConsumer())`를 제거해도 인증 동작에는 영향이 없었다

다만 이 사실은 본질을 가린다.

- 인증이 필요하든 아니든,
- **multipart를 재작성하는 순간 Content-* 헤더 전체 복사는 언제든 폭발할 수 있다.**

즉, 이번 케이스는 “운 좋게 인증 영향이 없었던” 것일 뿐, 설계상 안전한 방향은 “선별 헤더/스트리밍”이다.

---

## 12. 결론

### 12.1 문제 요약

- `request.multipartData()`로 파싱 후 `BodyInserters.fromMultipartData()`로 재조립하면 boundary/길이가 바뀔 수 있다.
- 그런데 원본 `Content-Type(boundary 포함)`과 `Content-Length`를 복사하면, 헤더는 원본 기준이고 바디는 재작성 기준이라 내부 서비스에서 multipart 파싱이 실패한다.
- 그 결과가 `Unexpected end of form`이다.

### 12.2 해결책 요약

- **rebuild 모드**: 원본 Content-* 복사 금지, 인증/도메인 헤더만 선별 전달
- **pass-through 모드**: 원본 바디 그대로 전달, 원본 Content-* 유지 가능
- 프록시 코드는 “한 가지 방식”이 아니라, 두 모드 중 무엇인지 명시적으로 결정해야 한다

---

## 13. 필자의 해석

필자는 이 문제를 통해 “프록시는 헤더를 복사하는 코드가 아니라, 프로토콜 결합을 유지하는 코드”라는 결론을 얻었다.

multipart는 헤더의 boundary가 바디 파싱의 유일한 키다. 그런데 `BodyInserters.fromMultipartData()`는 메시지를 재작성한다. 재작성하면서도 원본 Content-*를 덮어쓰는 순간, 내부 서비스는 “틀린 boundary와 틀린 길이”를 진실로 받아들이고 파싱을 시도한다. `Unexpected end of form`은 그 파싱이 더 이상 진행될 수 없다는 신호다.

결국 핵심은 한 줄 삭제가 아니라, **프록시가 rebuild인지 pass-through인지 모드를 먼저 결정하고, 그 모드에 맞춰 헤더 정책을 분리하는 것**이다.

---

## 14. 참고 자료

아래 자료들은 “왜 boundary/Content-Length가 헤더-바디 결합의 핵심인지”, “왜 Spring이 Content-*를 재산출하는 쪽으로 설계되었는지”를 확인할 때 도움이 된다.

1. RFC 7578: multipart/form-data
2. RFC 7230: HTTP/1.1 Message Syntax and Routing (Content-Length / Transfer-Encoding 프레이밍 규칙)
3. Spring Framework Reference: WebClient – Body(특히 multipart 전송 파트)
4. Spring Framework Javadoc: `BodyInserters`
5. Spring Framework 코드/문서: `MultipartHttpMessageWriter`(multipart 직렬화/헤더 세팅 관점)
