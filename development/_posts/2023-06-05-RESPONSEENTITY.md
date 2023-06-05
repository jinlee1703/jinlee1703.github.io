---
layout: post
title: ResponseEntity
description: >
  소프트웨어 마에스트로 14기 팀 프로젝트에서 나는 백엔드 파트를 담당하여 Spring Boot를 통한 API 서버 개발을 하게 되었다. 이를 위해 학습 차 게시글을 작성하게 되었다.
sitemap: false
hide_last_modified: true
---

---

### HTTP & RESTful API

&nbsp; 들어가기에 앞서 HTTP와 RESTful API가 무엇인지 모르는 사람들은 [이 문서](https://jinu0137.github.io/network/2023-05-01-http/)를 읽어보기를 권한다.

## Response Entity

### 정의

&nbsp; Spring Framework에서는 HttpEntity라는 클래스를 제공한다. **HTTP Request(요청)**과 **HTTP Response(응답)**에 해당하는 **HttpHeader**와 **HttpBody**를 포함하는 클래스이다.

```java
public class HttpEntity<T> {

	private final HttpHeaders headers;

	@Nullable
	private final T body;
}
```

```java
public class RequestEntity<T> extends HttpEntity<T>
public class ResponseEntity<T> extends HttpEntity<T>
```

&nbsp; HttpEntity 클래스를 상속받아 구현한 클래스가 RequestEntity, ResponseEntity 클래스이다. ResponseEntity는 사용자의 HttpRequest에 대한 응답 데이터를 포함하는 클래스이다. 따라서 **HttpStatus, HttpHeaders, HttpBody**를 포함한다.

## 생성자

&nbsp; ResponseEntity의 생성자를 보면 `this()`를 통해 매개변수가 3개인 생성자를 호출하여, 아래 보이는 매개변수가 3개인 생성자로 가게 된다.

```java
public ResponseEntity(HttpStatus status) {
	this(null, null, status);
}
```

```java
public ResponseEntity(@Nullable T body, HttpStatus status) {
	this(body, null, status);
}
```

&nbsp; 매개변수 3개인 생성자는 다음과 같다.

```java
new ResponseEntity<>(message, headers, HttpStatus.OK);
```

- message : 반환할 임의의 메시지 객체
- headers : 반환할 HTTP 헤더
- HttpStatus : 반환할 HTTP 응답코드

## Reference

- [https://devlog-wjdrbs96.tistory.com/182](https://devlog-wjdrbs96.tistory.com/182)
