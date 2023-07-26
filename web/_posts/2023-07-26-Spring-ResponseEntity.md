---
layout: post
title: Spring - ResponseEntity
description: >
  소프트웨어 마에스트로 14기 팀 프로젝트에서 나는 백엔드 파트를 담당하여 Spring Boot를 통한 WAS 개발을 하게 되었다. WAS 서버를 개발하던 도중 여러 레퍼런스에서 API의 응답으로 ResponseEntity를 많이 사용하는 것을 보게 되었고, 이것이 무엇인가에 대해 궁금증이 생겨 게시글을 작성하게 되었다.
sitemap: false
hide_last_modified: true
---

---

## Spring Docs에서 설명하는 ResponseEntity

&nbsp; Spring Docs에서 `ResponseEntity`를 찾아보니 가장 상단에 이러한 문장이 있었다. <br>

`ResponseEntity는 @ResponseBody와 비슷하지만, status와 header가 있다.`

&nbsp; 이 문장의 의미를 이해하기 위해 아래의 예제 코드를 살펴보자.<br>

```java
@GetMapping("/something")
public ResponseEntity<String> handle() {
	String body = ... ;
	String etag = ... ;
	return ResponseEntity.ok().eTag(etag).body(body);
```

&nbsp; Spring MVC는 `single value Reactive Types`(단일 값 반응 유형)를 사용하여 ResponseEntity를 비동기적으로 생성하거나 body에 대한 single 혹은 multi-value 유형을 지원한다. 이것은 아래 유형의 비동기 응답을 허용한다.

- `ResponseEntity<Mono<T>>` or `ResponseEntity<Flux<T>>`
	- Response의 status와 header를 즉시 알리고, body는 나중에 비동기적으로 제공
	- body가 0, 1 값으로 구성된 경우 Mono를 사용하고 여러 값을 생성할 수 있는 경우 Flux를 사용
- `Mono<ResponseEntity<T>>`
	- Response의 status, header, body, 이 3가지 모두 나중에 비동기식으로 제공
	- 이를 통해, 비동기 요청 처리 결과에 따라 Response status 및 header가 달라질 수 있음

&nbsp; 위의 내용을 내 나름대로 해석해보자면, ResponseEntity 객체는 기본적으로 status, header는 동기 방식으로 응답하고, body는 비동기 방식으로 응답하지만, Mono 객체를 겉에 감싸줌으로써 status, header, body 모두 비동기 방식으로 응답할 수 있는 것으로 보인다.

## 좀 더 쉽게 설명해보기

&nbsp; `ResponseEntity`는 Spring Framework에서 HTTP 응답을 다룰 때 사용한다고 한다. 위에서 설명한 대로 ResponseEntity는 응답(Response)의 상태(status) 코드, 헤더(header), 본문(body) 등을 포함하고 있다.<br>
&nbsp; `ResponseEntity`는 제네릭 클래스로, HTTP 응답 본문의 타입을 제네릭 매개 변수로 지정할 수 있다. 예를 들어 `ResponseEntity<String>`은 본문이 `String`인 HTTP 응답을 의미한다.

## 왜 사용하는가?

&nbsp; Spring에서 RESTful 웹 서비스를 개발하면서 특히 HTTP 응답을 상세하게 제어하고자 `ResponseEntity`를 활용한다. ResponseEntity를 통해 서버에서 클라이언트로 리소스를 전송할 때 HTTP 상태 코드, HTTP 응답 헤더 등을 직접 제어하고 싶을 때 사용한다.<br>

&nbsp; 아래 예시를 살펴보자.

```java
@GetMapping("/users/{id}")
public ResponseEntity<User> getUser(@PathVariable Long id) {
    User user = userService.findUserById(id);
    if (user == null) {
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    } else {
        return new ResponseEntity<>(user, HttpStatus.OK);
    }
}
```

&nbsp; 위 코드에서 `ResponseEntity<User>`는 HTTP 응답 본문의 타입이 User인 응답을 의미한다. userService.findUserById(id)로 유저 정보를 조회한 후, 유저 정보가 없으면 HTTP 상태 코드를 404 (NOT FOUND)로 설정하고, 유저 정보가 존재하면 HTTP 상태 코드를 200 (OK)로 설정하고 응답 본문에 유저 정보를 넣어 응답을 보낸다.<br>

## 요약

&nbsp; ResponseEntity는 Spring Framework에서 HTTP 응답을 다룰 때 사용하는 제네릭 클래스이다. 단순히 객체만 반환하여 API를 구현할 수도 있지만, 객체만 반환하는 것에 비해 HTTP 응답의 상태 코드, 헤더, 본문 등을 보다 간편하고 세밀하게 제어할 수 있다는 이점이 있기 때문에 ResponseEntity를 사용하여 구현하면 보다 쉽게 API를 구현할 수 있다.

---

## Reference

- [Spring Docs - ResponseEntity](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/responseentity.html#page-title)