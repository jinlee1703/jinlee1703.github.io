---
layout: post
title: Spring - 정적 컨텐츠 & MVC & API
description: >
  영남대학교 멋쟁이사자처럼 대학 11기에서 BE 파트로 참여하면서, 멋쟁이사자처럼 대학 11기 해커톤에 참여하게 되었다. API를 설계하던 중 Controller의 동작 방식에 대해 궁금증이 생겼고, 이를 통해 팀원의 빠른 이해를 돕기 위해 게시글을 작성하게 되었다.
sitemap: false
hide_last_modified: true
---

---

## Spring 작동 순서

### 1. 정적 컨텐츠

&nbsp; `정적 컨텐츠`란 클라이언트의 요청을 받고 서버에 미리 저장된 HTML, CSS, JS 등의 파일을 그대로 응답해 보여주는 것을 말한다. **모든 클라이언트들의 요청에 대해 동일한 결과를 보여주는 것이 가장 큰 특징이다.** Spring Boot는 기본적으로 정적 컨텐츠 기능을 제공한다.

```html
<!-- resources/static/hello-static.html -->
<!DOCTYPE HTML>
<html>
<head>
 <title>static content</title>
 <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
</head>
<body>
정적 컨텐츠 입니다.
</body>
</html>
```

&nbsp; 위와 같은 html 파일을 해당 경로에 작성한 후 `http://localhost:8080/hello-static.html`에 접속을 하면 아래와 같은 정적 컨텐츠가 제공된다.

![image](https://user-images.githubusercontent.com/68031450/260218588-b8f807d9-b245-47ef-b8b1-7b4ae379eafe.png)

&nbsp; 이제 Spring에서 정적 컨텐츠를 서비스하는 과정에 대해 살펴보자.

![image](https://user-images.githubusercontent.com/68031450/260226451-ae4cd42d-01a2-4af4-b895-f7849575eac7.png)

1. Client에서 URL로 `localhost:8080/hello-static.html`을 요청한다.
2. 내장 톰캣 서버에서 스프링 컨테이너를 통해 `hello-static` 관련 컨트롤러가 존재하는 지 확인한다. 이 경우에는 존재하지 않음(존재할 경우는 MVC에서 확인할 수 있음)으로 다음으로 넘어간다.
3. `resources`에 `static/hello-static.html` 파일의 존재 여부를 확인한다.
4. 해당 파일이 존재하므로 `hello-static.html` 파일을 응답한다.

### 2. MVC와 템플릿 엔진

&nbsp; `MVC(Model-View-Controller)`는 사용자 인터페이스, 데이터 및 논리 제어를 구현하는 데 널리 사용되는 소프트웨어 디자인 패턴이다. 소프트웨어의 비즈니스 로직과 화면을 구분하는데 중점을 두고 있으며, 웹에서 화면을 출력하기 위해 내용을 담고, 보여주고, 전달해주는 소프트웨어 구현 방식 중 하나이다.<br>
&nbsp; MVC 소프트웨어 디자인 패턴은 각각 `Model`, `View`, `Controller`로 구분이 되는데, Model은 데이터와 비즈니스 로직을 관리하고, View는 레이아웃과 화면을 처리한다. 그리고 Controller에서 클라이언트의 요청을 모델과 뷰 영역으로 라우팅하게 된다.

```java
// HelloController.java
@Controller
public class HelloController {
 @GetMapping("hello-mvc")
 public String helloMvc(@RequestParam("name") String name, Model model) {
 model.addAttribute("name", name);
 return "hello-template";
 }
}
```

&nbsp; `템플릿 엔진`은 템플릿 양식과 특정데이터 모델에 따른 입력 자료를 합성하여 결과 문서를 출력하는 소프트웨어이다. 정적 컨텐츠와 달리 html 파일을 브라우저로 그냥 보내주는 것이 아닌, 서버에서 프로그래밍을 통해 동적으로 바꾸어서 보내주는 역할을 한다. 스프링에서 사용하는 대표적인 템플릿 엔진으로는 `Thymeleaf`가 있다.

```html
<!-- resources/templates/hello-template.html -->
<html xmlns:th="http://www.thymeleaf.org">
<body>
<p th:text="'hello ' + ${name}">hello! empty</p>
</body>
```

&nbsp; 이제 Spring에서 MVC 패턴과 템플릿 엔진을 통해 동작하는 방식을 확인해보자.

![image](https://user-images.githubusercontent.com/68031450/260227699-40f498af-3cab-4b7e-b7c5-e87e0bef88fe.png)

1. Client에서 URL로 `localhost:8080/hello`를 요청한다.
2. `helloController`에 해당 url을 처리하는 API의 존재를 확인한다.
3. 해당 컨트롤러의 API에서 String인 `hello`를 반환한다.
4. **컨트롤러가 리턴 값으로 문자를 반환할 경우** ViewResolver가 화면을 찾아서 처리한다.
    - 스프링 부트 템플릿 엔진 기본 viewName 매핑
    - `resources:templates/` + {viewName} + `.html`
5. 템플릿 엔진을 통해 변환된 html 파일을 반환한다.

### 3. API

&nbsp; `API`는 정의 및 프로토콜 집합을 사용하여 두 소프트웨어 구성 요소가 서로 통신할 수 있게 하는 메커니즘이다. 그 중에서도 오늘날 웹에서 볼 수 있는 가장 많이 사용되는 것은 `REST API`이다. 클라이언트가 서버에 요청을 데이터로 전송하면, 서버가 이 클라이언트 입력을 사용하여 내부 함수를 시작하고 출력 데이터를 다시 클라이언트에 반환한다. 아래에서 스프링 코드를 살펴보자.

```java
@Controller
public class HelloController {
 @GetMapping("hello-string")
 @ResponseBody
 public String helloString(@RequestParam("name") String name) {
 return "hello " + name;
 }
}
```

&nbsp; `@ResponseBody`를 사용하면 viewResolver를 사용하지 않는 대신에 HTTP의 BODY에 문자 내용을 직접 반환할 수 있다. 또한 객체도 반환할 수 있다.<br>
&nbsp; 아래에서 `http://localhost:8080/hello-string?name=spring`를 요청했을 때에 대한 예시를 살펴보자.

```java
@Controller
public class HelloController {
 @GetMapping("hello-api")
 @ResponseBody
 public Hello helloApi(@RequestParam("name") String name) {
  Hello hello = new Hello();
  hello.setName(name);
  return hello;
 }
 
 static class Hello {
  private String name;
  public String getName() {
    return name;
  }
  public void setName(String name) {
    this.name = name;
  }
 }
}
```

&nbsp; @ResponseBody 를 사용하고, 객체를 반환하면 객체가 JSON으로 변환되어 반환이 된다.<br><br>
&nbsp; 이제 세부 동작을 살펴보자.

![image](https://user-images.githubusercontent.com/68031450/260228725-305e5cba-c884-4f1a-8d33-cf1a6e31166e.png)

1. Client에서 URL로 `localhost:8080/hello-api`를 요청한다.
2. `helloController`에 해당 url을 처리하는 API의 존재를 확인한다.
3. `@ResponseBody`를 사용하여 객체를 반환한다.
4. `@ResponseBody`로 인해 viewResolver가 아닌 `HttpMessageConverter`가 동작된다.
    - 기본 문자처리: StringHttpMessageConverter
    - 기본 객체처리: MappingJackson2HttpMessageConverter
5. `HttpMessageConver`에서 객체를 `json`으로 변환하여 응답한다.

---

## Reference

- [https://velog.io/@gerrymandering/Spring-정적-컨텐츠동적-컨텐츠](https://velog.io/@gerrymandering/Spring-정적-컨텐츠동적-컨텐츠)
- [https://docs.spring.io/spring-boot/docs/2.3.1.RELEASE/reference/html/spring-boot-features.html#boot-features-developing-web-applications](https://docs.spring.io/spring-boot/docs/2.3.1.RELEASE/reference/html/spring-boot-features.html#boot-features-developing-web-applications)
- [https://velog.io/@lim950808/06-MVC와-템플릿-엔진](https://velog.io/@lim950808/06-MVC와-템플릿-엔진)
- [https://developer.mozilla.org/ko/docs/Glossary/MVC](https://developer.mozilla.org/ko/docs/Glossary/MVC)
