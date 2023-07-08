---
layout: post
title: Spring Request-Response Cycle
description: >
  소프트웨어 마에스트로 14기 팀 프로젝트에서 나는 백엔드 파트를 담당하여 Spring Boot를 통한 WAS 서버 개발을 하게 되었다. WAS 서버를 개발하던 도중 Spring의 구조에 대해 궁금증이 생겼고 게시글을 작성하게 되었다.
sitemap: false
hide_last_modified: true
---

---

##  스프링 요청-응답 사이클

![image](https://user-images.githubusercontent.com/68031450/251967735-8037498e-7554-4897-a9ad-dcf2e502a237.png)


&nbsp; 웹 애플리케이션에서 클라이언트의 HTTP 요청이 발생하면 이러한 요소들은 각각의 역할을 수행하며 요청을 처리하고 최종적으로 클라이언트에게 응답을 반환하는데, 이러한 과정을 통틀어 "웹 요청 처리 파이프라인"이라고 부른다.
&nbsp; 스프링 프레임워크에서는 위의 그림에 있는 요소들이 중요한 역할을 하며, 이들의 구성과 연동을 통해 복잡한 웹 애플리케이션의 요청-응답 처리를 구현하고 관리한다. 이러한 컴포넌트와 메커니즘들을 결합하여 사용함으로써 개발자는 효과적이고 유지보수가 가능한 웹 애플리케이션을 개발할 수 있다.
&nbsp; 그럼 이제 각 요소들에 대해서 상세하게 알아보자.

### 1. Filter

&nbsp; **웹 애플리케이션이 요청을 처리하기 전이나 후에 특정 작업을 수행하기 위해 사용되는 메커니즘**이다. 보통 Spring의 Dispatcher Servlet 이전에 위치합니다. 요청이 들어올 때마다 Filter는 요청을 검사하고, 필요한 처리를 한 뒤에 요청을 다음 Filter 혹은 Dispatcher Servlet에게 전달한다. 또한, 응답을 클라이언트에게 전송하기 전에 마지막으로 검사하거나 처리를 수행할 수도 있다.
&nbsp; 보통 로깅, 인증, 인코딩, XSS 공격 방지 등의 목적으로 사용된다.
&nbsp; Spring에서는 Spring Security에서 Filter를 기반으로 많은 기능을 구현하고 있다. 또한, Filter는 여러 개를 체인 형태로 연결하여 사용할 수 있어, 각각의 Filter가 특정 작업을 담당하게 할 수 있다.

### 2. Dispatcher Servlet

&nbsp; 스프링 MVC의 핵심 컴포넌트로, 프론트 컨트롤러 패턴(Front Controller Pattern)의 일종이다. **웹 애플리케이션에서 들어오는 모든 요청을 가장 먼저 처리하고 적절한 컨트롤러에게 요청을 위임하는 역할**을 수행한다. &nbsp; 주요 기능은 다음과 같다.

1. **요청을 적절한 핸들러에게 전달**: 들어오는 HTTP 요청을 분석하고, 이를 처리하기 위한 적절한 핸들러(Controller 또는 HandlerMapping을 통해 결정됨)를 찾아줌
2. **핸들러의 실행과 예외 처리**: 선택된 핸들러의 메서드를 호출하고, 메서드 실행 중 발생하는 예외를 처리
3. **응답 렌더링**: 핸들러가 작업을 마치면 그 결과를 클라이언트에게 반환, 이 과정에서 ViewResolver를 사용해 적절한 뷰를 찾아 데이터를 렌더링함
4. **Locale, Theme 해석**: 각 요청에 대한 Locale과 Theme를 해석하여 이를 처리하는 데 사용할 수 있게 함

### 3. Interceptor

&nbsp; 요청 처리 과정에서 특정 시점에 추가적인 작업을 수행하기 위한 메커니즘이며, AOP(Aspect Oriented Programming)의 일종으로 볼 수 있다. **DispatcherServlet이 컨트롤러를 호출하기 전과 후, 그리고 뷰를 렌더링한 후에 특정 로직을 수행할 수 있도록** 합니다. 이는 `HandlerInterceptor 인터페이스`를 구현하여 수행된다.
&nbsp; 인터셉터를 특정 URL 패턴에 대해 적용되도록 설정할 수 있으며, 여러 개의 인터셉터를 정의하여 체인처럼 구성할 수도 있다. 이를 통해 공통적으로 적용해야 하는 로직(로그인 체크, 로깅, 인코딩 등)을 재사용 가능하며, 코드의 중복을 줄일 수 있다.

### 4. AOP (Aspect-Oriented Programming)

&nbsp; **횡단 관심사(cross-cutting concerns)를 모듈화하는 프로그래밍 패러다임**이다. 횡단 관심사는 여러 클래스나 메소드에 걸쳐 반복적으로 등장하는 공통적인 관심사를 의미한다. 예를 들어, 로깅(logging), 트랜잭션 관리(transaction management), 보안(security) 등은 여러 객체와 메소드에서 공통으로 처리해야하는 횡단 관심사에 해당하는데, 이러한 횡단 관심사를 모듈화하면 코드의 중복을 줄일 수 있고, 응집도를 높이며, 유지 보수성을 향상시킬 수 있다.
&nbsp; Spring AOP는 이러한 횡단 관심사를 별도의 `Aspect`라는 모듈로 분리하고, 이를 프로그램의 필요한 지점에 `조인포인트'(Join Points)`라는 곳에 `어드바이스(Advice)`라고 부르는 방식으로 적용한다. 조인포인트는 메소드 호출, 필드 값 변경 등 프로그램 실행 중에 특정 연산이 발생하는 지점을 의미하며, 어드바이스는 조인포인트에서 실행할 수 있는 행동을 의미한다.
&nbsp; 이러한 방식을 통해 AOP는 횡단 관심사를 핵심 비즈니스 로직으로부터 분리하여 프로그램의 모듈성을 향상시키는 데 도움을 준다.

### 5. Controller

&nbsp; 주로 웹 요청을 처리하는 클래스를 지칭한다. Spring MVC에서 Controller는 **클라이언트로부터 들어오는 HTTP 요청을 받아들이고, 그에 대한 적절한 응답을 반환하는 역할**을 한다.
&nbsp; Controller 클래스에는 보통 @Controller나 @RestController 등의 어노테이션이 붙는데, @Controller 어노테이션은 보통 뷰를 반환하는 경우에 사용하며 @RestController 어노테이션은 주로 API 개발에서 사용되며, HTTP Response Body에 직접 결과를 작성하도록 설정된 @Controller의 특별한 형태라고 할 수 있다.

### 6. Spring Context

&nbsp; Spring Framework의 중요한 핵심 개념 중 하나이다. Spring Context, Application Context 등으로 불리며 스프링 컨테이너의 역할을 한다.
&nbsp; 스프링 컨테이너는 애플리케이션의 라이프사이클을 관리하고, `빈(Bean)`이라 불리는 객체들의 생성, 구성 및 조립을 담당한다. 이 빈들은 애플리케이션의 핵심적인 비즈니스 로직을 담당하는 객체들로, 서로 간의 의존성이나 연결성을 스프링 컨테이너가 관리한다.
&nbsp; 스프링 컨테이너는 보안, 트랜잭션 관리, 메시징 등의 다양한 엔터프라이즈 서비스를 제공하기도 한다.
&nbsp; 스프링 컨텍스트는 이러한 빈들의 저장소나 레지스트리 역할을 하며, 애플리케이션 구동 시 필요한 빈들을 생성하고, 빈들 사이의 의존성을 처리하고, 빈들이 필요할 때 해당 빈을 애플리케이션에 제공한다. 이런 방식으로, 스프링 컨텍스트는 **애플리케이션의 설정 및 라이프사이클을 관리하며, 애플리케이션의 코드에서 직접적인 관리를 분리하여 의존성 주입(Dependency Injection) 및 관리를 수행**하게 된다. 이는 코드의 재사용성을 높이고, 테스트를 용이하게 하며, 개발 생산성을 향상시키는 중요한 역할을 하게 된다.

## Reference

- [https://veneas.tistory.com/entry/Spring-Boot-%EC%8A%A4%ED%94%84%EB%A7%81-%EB%B6%80%ED%8A%B8-%ED%95%84%ED%84%B0-%EC%A0%81%EC%9A%A9-Filter#1._%EC%9D%B8%ED%84%B0%EC%85%89%ED%84%B0%EB%A5%BC_%EC%99%9C_%EC%93%B0%EB%82%98%EC%9A%94?](https://veneas.tistory.com/entry/Spring-Boot-%EC%8A%A4%ED%94%84%EB%A7%81-%EB%B6%80%ED%8A%B8-%ED%95%84%ED%84%B0-%EC%A0%81%EC%9A%A9-Filter#1._%EC%9D%B8%ED%84%B0%EC%85%89%ED%84%B0%EB%A5%BC_%EC%99%9C_%EC%93%B0%EB%82%98%EC%9A%94?)
- [https://devscb.tistory.com/119](https://devscb.tistory.com/119)
- [https://goodteacher.tistory.com/240?category=824125](https://goodteacher.tistory.com/240?category=824125)