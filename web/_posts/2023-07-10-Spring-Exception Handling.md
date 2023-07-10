---
layout: post
title: Spring - Exception Handling
description: >
  소프트웨어 마에스트로 14기 팀 프로젝트에서 나는 백엔드 파트를 담당하여 Spring Boot를 통한 WAS 개발을 하게 되었다. WAS 서버를 개발하던 도중 API에 대한 예외를 처리하기 위해 학습 차 게시글을 작성하게 되었다.
sitemap: false
hide_last_modified: true
---

---


# Theory

## Exception(예외)

&nbsp; 누구나 프로그램 개발을 하다보면 `예외`나 `Exception`라는 단어를 어렵지 않게 접해보았을 것이다. 하지만 이에 대한 정의는 잘 알지 못하고 넘어가는 경우가 있는데 나 또한 그랬다. 그래서 이에 대해 깊이 있게 정리하고자 한다.<br>
&nbsp; <span style="color: red; font-weight: bold;">Exception(예외)</span>란 **프로그램이 정상적으로 실행되는 도중에 발생할 수 있는 예상치 못한 이벤트나 문제**를 읨한다. 대개 오류나 문제의 원인이 되는 상황을 나타내며, 이는 사용자의 잘못된 입력, 파일이나 데이터베이스의 누락, 네트워크 연결 문제, 메모리 부족 등 다양한 원인에 의해 발생할 수 있다.

### Exception Handling(예외 처리)

&nbsp; Java 같은 프로그래밍 언어에서는 별도의 클래스를 사용하여 예외를 표현하기도 하는데, 이를 <span style="color: red; font-weight: bold;">Exception Handling(예외 처리)</span>라고 한다. 프로그램에서 예외가 발생했을 때, 예외 처리 코드를 통해 그 예외를 적절히 처리하도록 설계하는 것이 일반적이다. 이는 **프로그램의 안정성과 신뢰성을 향상**시키는데 중요한 역할을 한다.<br>
&nbsp; Java에서 예외를 처리하는 가장 쉬운 방법으로는 `try-catch-finally` 블록을 사용하여 예외를 처리한다. `try`  블록 내에서 예외가 발생할 수 있는 코드를 작성하고, `catch` 블록에서 해당 예외를 처리한다. 마지막으로 `finally` 블록에서는 예외 발생 여부와 관계없이 항상 실행되어야 하는 코드를 작성한다.<br>
&nbsp; 예외 처리는 **시스템의 안정성을 유지하고, 예상치 못한 오류로부터 시스템을 보호**하는 중요한 개념이다. 따라서 각각의 예외 상황에 대해 적절하게 대응하는 예외 처리 코드를 작성하는 것이 좋은 소프트웨어 개발의 핵심적인 요소 중 하나라고 볼 수 있다.

# Spring - Exception Handling

&nbsp; Spring Boot를 통한 WAS 개발을 담당하게 되면서 자연스럽게 서버의 예외 처리에 대해 고민을 하게 되었다. 위에서도 서술한 가장 간단한 방법으로 `try-catch`를 이용하여 예외처리를 할 수도 있지만, 이렇게 구현할 경우 자연스럽게 코드 라인이 증가하고, 가독성이 떨어지게 된다. 또한 다른 파일에서 발생하는 같은 에외에 대해 중복되는 코드가 많아 이를 보다 효율적으로 처리하고자 이에 대한 내용을 정리하게 되었다.

## @ControllerAdvice

&nbsp; `Spring 3.2`부터 지원하는 어노테이션이다. 모든 `@Controller`에 걸쳐 공통적으로 적용할 코드를 중앙화하는 방법을 제공한다. `@ContollreAdvice` 어노테이션은 `@ExceptionHandler`, `@InitBinder`, `@ModelAttribute` 등과 같이 사용되어, 모든 컨트롤러에 대해 예외 처리, 바인딩 설정, 모델 객체를 추가하는 등의 공통 작업을 정의하는 데 유용하게 사용할 수 있다.

```java
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(value = Exception.class)
    public ResponseEntity<String> handleException(Exception e) {
        return new ResponseEntity<>("An error occurred: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
```

&nbsp; 위의 예제 코드에서는 `GlobalExceptionHandler`라는 이름으로 클래스르르 만들어 모든 컨트롤러에서 발생하는 `Exception` 타입의 예외를 처리하는 클래스이다. 이 클래스에서는 어떤 컨트롤러에서든 `Exception` 타입의 예외가 발생하면 "An error occurred: " + 에러 메시지를 내용으로 가지는 응답을 반환하도록 한다. 이처럼 `@ControllerAdvice` 어노테이션을 통해 공통적인 로직을 한 곳에서 관리하여 중복 코드를 줄일 수 있다.

## @RestControllerAdvice

&nbsp; `@ControllerAdvice`와 `@ResponseBody`를 합쳐놓은 어노테이션이다. `@ControllerAdvice`와 도일한 역할을 수행하고, 추가적으로 `@responseBody`를 통해 객체를 리턴할 수 있다. 고로 단순히 예외만 처리하고 싶다면 `@ControllerAdvice`를 적용하면 되고, 응답으로 객체를 리턴해야 한다면 `@RestControllerAdvice`를 사용할 수 있을 것이다.

## @ExceptionHandler

&nbsp; `@ExceptionHandler`를 메서드에 선언하고 특정 예외 클래스를 지정해주면 해당 예외가 발생했을 때 메서드에 정의한 로직으로 처리할 수 있다. `@ControllerAdvice` 또는 `@RestControllerAdvice`에 정의된 메서드가 아닌 일반 컨트롤러 단에 존재하는 메서드에 선언할 경우, 해당 Controller에만 적용된다.<br>
&nbsp; <span style="color: red; font-weight: bold;">단, Controller, RestController에만 적용이 가능하며, Service에는 적용할 수 없다.</span>

---

## Reference

- [https://velog.io/@banjjoknim/RestControllerAdvice](https://velog.io/@banjjoknim/RestControllerAdvice)