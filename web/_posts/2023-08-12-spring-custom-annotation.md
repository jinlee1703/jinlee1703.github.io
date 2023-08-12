---
layout: post
title: Spring - Custom Annotation
description: >
  소프트웨어 마에스트로 14기 팀 프로젝트에서 나는 백엔드 파트를 담당하여 Spring Boot를 통한 WAS 개발을 하게 되었다. Spring AOP 등을 적용하기 위해 커스텀 어노테이션에 대한 학습을 하기로 하였다.
sitemap: false
hide_last_modified: true
---

---

## 어노테이션?

&nbsp; `어노테이션(Annotation)`은 자바 프로그래밍 언어의 요소 중 하나로, 코드에 메타데이터(정보를 설명하는 데이터)를 제공하는 방법이다. 주로 `컴파일러`, `런타임`, `개발자 도구` 등에 추가적인 정보를 제공하여 코드의 동작 방식이나 처리 과정을 결정하거나 설정할 수 있다.<br>
&nbsp; 어노테이션은 `@` 기호를 사용하여 표시되며, 클래스, 메서드, 변수 등의 선언문 앞에 붙여 사용한다. 어노테이션을 사용함으로써 코드의 가독성을 높이거나, 문서화를 개선하거나, 더 나은 개발 환경을 제공할 수 있다.<br><br>
&nbsp; Spring 프레임워크의 대표적인 어노테이션으로는 `@Autowired`, `@Entity` 등이 있는데, 각각의 목적으로는 의존성 주입(Dependency Injection)을 편리하게 설정할 수 있게 하고, JPA를 통해 해당 클래스가 데이터베이스 테이블과 매핑된 엔티티임을 나타내며 데이터베이스와의 연동을 돕는다.

## 커스텀 어노테이션?

&nbsp; `커스텀 어노테이션(Custom Annotation)`은 자바 프로그래밍에서 사용자가 직접 정의한 어노테이션이다. 이러한 커스텀 어노테이션은 기존의 내장 어노테이션 외에도 프로젝트나 라이브러리에서 특정 기능을 활성화 혹은 설정하기 위해 사용한다.<br>
&nbsp; 커스텀 어노테이션을 적절한 요소에 적용하여 프로젝트 혹은 라이브러리의 기능을 확장하거나 유연하게 제어할 수 있다.

### 커스텀 어노테이션 정의

&nbsp; 커스텀 어노테이션을 정의할 때는 `@interface` 키워드를 사용하여 어노테이션의 이름과 속성을 정의할 수 있다. 속성은 해당 어노테이션을 사용할 때 값을 전달하는 데 사용된다. 커스텀 어노테이션은 클래스, 메서드, 변수 등 다양한 요소에 붙여서 사용할 수 있다.

```java
public @interface 커스텀어노테이션명 {

}
```

#### @Target

&nbsp; 커스텀 어노테이션이 생성될 수 있는 위치를 지정하는 어노테이션이다.

```java
@Target({ElementType.METHOD})
public @interface 커스텀어노테이션명 {

}
```

|name|description|
|---|---|
|PACKAGE|패키지 선언 시|
|TYPE|타입(class, interface, enum) 선언 시|
|CONSTRUCTOR|생성자 선언 시|
|FIELD|enum 상수를 포함한 멤버 변수 선언 시|
|METHOD|메소드 선언 시|
|ANNOTATION_TYPE|어노테이션 타입 선언 시|
|LOCAL_VARIABLE|지역변수 선언 시|
|PARAMETER|파라미터 선언 시|
|TYPE_PARAMETER|파라미터 타입 선언 시|

#### @Retention

&nbsp; 어노테이션이 언제까지 유효할 지 정하는 어노테이션이다.

```java
@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface LogExclusion {

}

```

|name|description|
|---|---|
|RUNTIME|컴파일 이후에도 참조 가능|
|CLASS|클래스를 참조할 때까지 유효|
|SOURCE|컴파일 이후 어노테이션 정보 소멸|

### 커스텀 어노테이션 사용 시 유의사항

&nbsp; 어노테이션을 사용하게 되면 코드가 간결해지게 된다. 그렇기 때문에 자칫하면 커스텀 어노테이션을 남발할 수 있게 된다. `Reference`에서 좋은 블로그 게시글이 있길래 참고할 수 있었다.<br><br>

<div style="background-color: #E6E6E6; color: black; font-style: italic;">
&nbsp; 어노테이션의 의도는 숨어있기 때문에 내부적으로 어떤 동작을 하게 되는지 명확하지 않다면 로직 플로우를 이해하기 어렵게 되고, 코드 정리가 덜 되어, 현재 사용되지 않고 있는 어노테이션들이 있더라도 쉽사리 누군가 손을 대기 부담스러워하는 경우를 많이 보았다.<br><br>
&nbsp; 하물며 '커스텀' 어노테이션은 그 부담을 가중시키고, 무분별한 어노테이션 추가가 당장의 작업 속도를 끌어올릴 수 있지만, 긴 관점에서 시의적절한 것인지를 공감할 수 있어야 한다.<br><br>
&nbsp; 그럼에도 어노테이션이 가진 가장 큰 장점은 '간결함'이다. 로직 흐름에 대한 컨텍스트가 응축되어 있어 적재적소에 사용된다면 불필요한 반복 코드가 줄고 개발자는 비즈니스 로직에 더 집중할 수 있도록 만들어 주기 때문이다.<br><br>
&nbsp; 이와 같이 양면성을 가진 도구가 시의적절한지는 구성원간의 이해와 공감대가 선행되어야 한다. 또한 커스텀 어노테이션은 플로우에 대한 컨텍스트를 담고 있기 때문에 용도와 목적에 맞게 작성하는 것이 중요하다. 다른 말로, 이것 저것 할 수 있는 다기능으로 만들게 되면 해석이 어려워진다는 뜻이다.
</div>

---

## Reference

- [https://shinsunyoung.tistory.com/83](https://shinsunyoung.tistory.com/83)
- [https://techblog.woowahan.com/2684/](https://techblog.woowahan.com/2684/)
