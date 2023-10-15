---
layout: post
title: Spring 순환 참조 해결
description: >
  소프트웨어 마에스트로 14기 팀 프로젝트에서 나는 백엔드 파트를 담당하여 Spring Boot를 통한 WAS 개발을 하게 되었다. WAS 개발 도중 순환 참조가 발생하였고, 이를 해결한 과정을 작성하려고 한다.
sitemap: false
hide_last_modified: true
---

---

## 순환 참조란

&nbsp; 스프링에서 발생하는 순환 참조(`Circular Reference`)는 스프링 컨테이너 내에서 Bean 간의 의존성 주입 관계에서 발생하는 스프링 애플리케이션 개발 시 주의해야하는 중요한 이슈 중 하나이다.<br>
&nbsp; 예를 들면, 아래 그림과 같이 Bean A가 Bean B를 참조하고 다시 Bean B가 Bean A를 참조하는 상황을 의미한다.

![image](https://user-images.githubusercontent.com/68031450/275320378-92794b36-637d-4023-adb0-b4c7896f578e.png)

&nbsp; 이러한 순환 참조는 스프링 컨테이너가 빈을 생성하고 초기화하는 과정에서 문제를 일으킬 수 있다.

## 내가 겪은 상황

<img width="1486" alt="image" src="https://user-images.githubusercontent.com/68031450/275320524-fce9649c-b70d-4685-ad86-b3d6c3839b0e.png">

- `jwtAuthenticationFilter`: JWT가 유효한 지 검증하도록 하는 Filter
- `jwtProvider`: JWT를 생성 및 검증하는 Util
- `userService`: DB를 통해 회원 CRUD 로직을 구현한 서비스, password 암호화를 위해 securityConfig를 호출함
- `securityConfig`: Filter를 적용하고, password 암호화를 구현한 설정 파일

&nbsp; 내가 겪은 순환 참조의 경우는 `jwtAuthenticationFilter`가 jwt 검증을 위해 jwtProvider를 호출한다. 그러면 `jwtProvider`는 회원의 DB 존재 여부를 검증하기 위해 userService를 호출하고, `userService`는 password 암호화를 위해 securityConfig를 호출, `securityConfig`는 , filter를 적용하기 위해 다시 jwtAuthenticationFilter를 호출하여 순환 참조가 발생하는 것이였다.<br>

## 나의 해결 방법

![image](https://user-images.githubusercontent.com/68031450/275321113-b2d90017-4c3e-4590-ad5c-50ed18bbaeea.png)

&nbsp; 나의 경우에는 `AuthConfig`라는 제3의 `Configuration`에 password를 암호화하는 Bean을 옮겨서 순환 참조를 해결하였다.

### 기존 소스 코드

#### SecurityConfig

```java
@Configuration
@EnableWebSecurity(debug = true)
@RequiredArgsConstructor
public class SecurityConfig {
 private final JwtAuthenticationFilter jwtAuthenticationFilter;
 private final ObjectMapper objectMapper = new ObjectMapper();

 @Bean
 public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
  ...
 }

 @Bean
 public PasswordEncoder passwordEncoder() {
  return new BCryptPasswordEncoder();
 }
}

```

#### AuthConfig

```java
@Component
@ConfigurationProperties(prefix = "oauth2")
@Getter
@Setter
public class AuthConfig {
 private String defaultNickname;
}
```

### 수정 후 소스 코드

#### SecurityConfig

```java
@Configuration
@EnableWebSecurity(debug = true)
@RequiredArgsConstructor
public class SecurityConfig {
 private final JwtAuthenticationFilter jwtAuthenticationFilter;
 private final ObjectMapper objectMapper = new ObjectMapper();

 @Bean
 public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
  ...
 }

 // passwordEncoder 삭제
}

```

#### AuthConfig

```java
@Component
@ConfigurationProperties(prefix = "oauth2")
@Getter
@Setter
public class AuthConfig {
 private String defaultNickname;

 @Bean
 public PasswordEncoder passwordEncoder() {
  return new BCryptPasswordEncoder();
 }
}
```

## 또 다른 해결 방법

### @Lazy 어노테이션

&nbsp; `@Lazy` 어노테이션을 사용하여 빈을 지연 초기화할 수 있다. 이는 빈을 사용할 때까지 초기화를 지연시키는 방법으로, 순환 참조를 방지하는 데 도움이 된다.<br>
&nbsp; 하지만 스프링에서는 이 방식을 추천하지 않는다고 한다. [공식 문서](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.spring-application.lazy-initialization)를 보면 애플리케이션에서 문제를 발견하는 것이 늦어질 수 있다고 한다.<br>
&nbsp; 만약 Bean이 잘 못 구성되어 있는데 초기화가 지연되게 된다면, 애플리케이션은 해당 문제를 발견하지 못하고 있다가 나중에 빈이 초기화되는 시점에 발견하게 된다. 당연하게도 모든 문제는 최대한 빠른 시점에 알게 되는 것이 좋으므로 이 방식은 자중하도록 하자.

### 옵션 추가

&nbsp; `spring.main.allow-circular-references=true`라는 옵션을 통해 순환 참조 자체를 허용할 수 있다고 한다. 내 경우 서로 의존하고 있더라도 순환 참조가 발생하는 로직은 아니기 때문에 이 방식을 통해 해결할 수는 있었으나, 이 방식을 적용할 경우 다른 곳에서 순환 참조가 발생하였을 경우 이를 알아차리기 어렵기 때문에 적합한 방법은 아니라고 판단했다.

### 결론

&nbsp; 문제가 발생할 경우 이를 단순히 회피하려고 하지 말고 부딪혀가며 해결해보도록 하자. 가장 중요한 것은 순환 참조가 발생하지 않도록 설계하는 것이 중요하다!

---

## Reference

- [https://catsbi.oopy.io/4d728131-93cd-4814-994c-65e372f2aef5](https://catsbi.oopy.io/4d728131-93cd-4814-994c-65e372f2aef5)
- [https://dev-monkey-dugi.tistory.com/144](https://dev-monkey-dugi.tistory.com/144)
