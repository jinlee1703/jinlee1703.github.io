---
layout: post
title: jakarta.validation 패키지 - MySQL NotNull 설정
description: >
  소프트웨어 마에스트로 14기 팀 프로젝트에서 나는 백엔드 파트를 담당하여 Spring Boot를 통한 WAS 서버 개발을 하게 되었다. WAS 서버를 개발하던 @NotNull 어노테이션을 통해 DTO에 Null 값이 들어오지 않도록 개발하려다 이슈를 발견하고 트러블 슈팅을 작성하게 되었다.
sitemap: false
hide_last_modified: true
---

---

# JPA에서 NN(Not Null)을 설정하는 방법을 찾다가...

&nbsp; 이번 프로젝트에서 Spring Boot 프레임워크로 WAS 서버 개발을 하게 되었다. Database는 MySQL을 사용하기로 하였는데, 이를 위한 ORM으로 JPA를 채택하였다. MySQL의 테이블과 소스 코드의 Entity를 매핑하는 과정에서 MySQL 테이블의 Column에 NN(Not Null) 옵션을 주기 위해 방법을 검색해보았다.

## 1. @NotNull 어노테이션

&nbsp; 게시글 최하단의 Reference 블로그를 살펴보며 @NotNull 어노테이션을 통해 테이블의 Column에 NN 옵션을 주는 것을 시도해보았다. **하지만 내 바람과 달리 NN 옵션은 테이블에 적용되지 않았다.** 이에 대해 위의 블로그와 내 소스 코드가 어떤 차이가 있는 지 살펴보니 위 블로그의 `@NotNull`은 `javax.validation` 패키지에서 import되고 있었고 나의 소스 코드는 `jakarta.validation` 패키지에서 import하고 있었다.

### javax.validation과 jakarta.validation

&nbsp; 두 가지 모두 자바에서 사용되는 Bean Validation API의 패키지이다. 그러나 이 두 패키지명 사이에는 중요한 역사적인 차이점이 있다고 한다.
&nbsp; 기존에 Java EE는 Sun Microsystems가 개발하였으나, 이후 Oracle에 인수되어 Oracle이 이를 관리하였는데, Oracle은 2017년에 Java EE를 Eclipse Foundation에 기부하였고, 이에 따라 Java EE는 Jakarta EE로 브랜드명이 변경되었다고 한다.<br>
&nbsp; 기존의 javax.* 패키지는 Oracle의 소유였기 때문에, Eclipse Foundation은 새로운 기능을 추가하거나 변경할 때 javax.* 패키지를 사용할 수 없었고, javax.* 패키지 대신 jakarta.* 패키지를 사용하기로 결정하였다고 한다. 이로 인해 새롭게 개발되는 기능들은 jakarta.* 패키지로 이동하거나 새롭게 생성되었다.
&nbsp; 따라서 javax.validation은 Oracle이 관리하던 기간 동안의 Bean Validation API를 가리키며, jakarta.validation은 Eclipse Foundation 관리 아래에서 개발된 새로운 버전의 Bean Validation API를 가리킨다.<br><br>
&nbsp; 결론적으로 javax.validation은 기능이 추가되지 않는 개발이 멈춘 패키지이고, jakarta.validation이 보다 신버전이며 새로운 기능 추가, 버그 수정 등의 업데이트가 진행되는 현재 활발하게 개발되고 있는 패키지이다. 고로 나는 학습 차 `jakarta.validation` 패키지를 사용하여 최신 기능과 해당 패키지의 업데이트 정보를 팔로우하고자 하였다.

## 2. @Columns(nullable = false)

&nbsp; 그래서 결과적으로 내가 선택한 방법은 `@Columns` 어노테이션에서 타이틀과 같은 옵션을 주는 방법을 택했다. 다만 이 경우에는 유효성 검사를 하지 않고, Database Layer까지 가야 이를 확인할 수 있기 때문에 DTO에 `@NotNull` 어노테이션을 통해 NotNull을 체크하여 유효성 검사와 테이블의 NN 옵션 두 가지 모두 챙기고자 한다.

![image](https://user-images.githubusercontent.com/68031450/251349101-8b6bcd61-f9a6-4ef6-842d-7ee811081e8c.png)


---

## Reference

- [https://bottom-to-top.tistory.com/14](https://bottom-to-top.tistory.com/14)