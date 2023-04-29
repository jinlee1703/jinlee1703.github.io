---
layout: post
title: Secure Coding (시큐어 코딩)
description: >
  본 글은 SW마에스트로 과정에서 멘토링을 수강한 내용을 정리한 게시글입니다.
sitemap: false
hide_last_modified: true
---

---

# 프로그래밍 시 기본적으로 고려해야할 사항

## 변수 선언

1. 같은 줄에 서로 다른 타입을 선언하지 말자 (매우 좋지 않은 습관)

   ```java
   // Bad Case
   int foo, fooarray[];

   // Good Case
   int foo;
   int fooarray[];
   ```

2. 변수 선언 시, 초기화 습관 가지기

   ```java
   // Bad Case
   int totalWide;
   String nickname;

   // Good Case
   int firstWide = 0;
   int secondWide = 0;
   String firstName = "";
   String name = "";
   ```

## 카멜 표기법

- 메서드 이름에 소문자 카멜 표기법 적용`[method-lower-camelcase]`
- 동사사용 : `public void renderHtml()`
- Builder 패턴 적용한 클래스의 메서드의 전치사 : `public void withUserId(String id)`

## if 조건문

```java
// Bad Case
if (condition) { return x; } return y;
if (a == b && c == d)
if (superHero == theTick) System.out.println("Spoon!");
if (superHero == theTick)
	System.out.println("Spoon!");
if (superHero == theTick) { System.out.println("Spoon!"); }

// Good Case
if ((a == b) && (c == d))
if (condition) {
	statements;
} else if (condition) {
	statements;
} else {
	statements;
}
```

## Constatns

- 명명 규칙은 아래와 같음
  - 클래스 상수로 선언된 변수들은 모두 대문자로 사용
  - 각각의 단어는 언더바(”\_”)로 분리해야 함
  ```java
  static final int MIN_WIDTH = 4;
  static final int MAX_WIDTH = 999;
  static final int GET_THE_CPU = 1;
  ```

## try catch

```java
try [
	statements;
} catch (ExceptionClass e) {
	statements;
} finally {
	statements;
}
```

- 가급적 `try`, `catch`, `finally` 3개 모두 사용하기

## 파일 저장 타입

- 파일 인코딩은 UTF-8 : `[encoding-utf9]`

## 패키지명

- 패키지 이름은 소문자를 사용하여 작성
- 단어별 구문을 위해 언더스코어(\_)나 대문자를 섞지 않음

  ```java
  // Bad Case
  package com.navercorp.apiGateway;
  package com.navercorp.api_gateway;

  // Good Case
  package com.navercorp.apigateway;
  ```

## for 반복문

- i, j를 사용하지 말 것
  - i와 j가 IDE에서 구별하기 힘듦
  ```java
  for (int i = 0; i < vec.size(); i++) {
  	for (int j = 0; j < listVec.size(); j++) {
  		listVec.get(j);
  	}
  }
  ```

## SQL Injection이란

- SQL 삽입 공격이라고도 함
- 코드 인젝션의 한 기법으로 클라이언트의 입력값을 조작하여 서버의 [데이터베이스](https://namu.wiki/w/%EB%8D%B0%EC%9D%B4%ED%84%B0%EB%B2%A0%EC%9D%B4%EC%8A%A4)를 공격할 수 있는 공격방식
- 주로 사용자가 입력한 데이터를 제대로 필터링, 이스케이핑하지 못했을 경우에 발생
- 공격의 쉬운 난이도에 비해 파괴력이 어마어마하기 때문에 시큐어 코딩을 하는 개발자라면 가장 먼저 배우게 되는 내용
- **최근에는 프레임워크가 SQL Injection을 차단해주기도 함**

---

# 시큐어 코딩

## SW 보안강화의 필요성

- 상당수 침해사고가 응용 SW에서 발생하고 있음에도 관련 보안 투자는 미흡
  - 응용 SW에 내재된 보안취안점을 악용, 계정탈취/정보유출 등 침해사고 유발
- 응용SW의 소스가 취약해서 발생하는 경우가 약 75%라고 함
  - Buffer overflows
  - Error handling
  - Command Injfection
  - Unnecessary code
  - Malicious code
  - Broken threads
  - Invalidated Parameters
  - Cross-site scripting
  - Caching, pooling and reuse errors

## 보안약점(Weakness) VS 보안취약점(vulnerability)

### 보안 약점(SW weakness)

- 해킹 등 실제 보안사고에 악용될 수 있는 보안취약점의 근본 원인

### 보안 취약점(SW Vulnerability)

- 소프트웨어 실행시점에 보안 약점이 원인이 되어 발생하는 실제적인 위협
- 보안 약점과 보안 취약점은 다름
  - 보안 약점은 100% 제거하기가 사실상 어려우나 보안 취약점은 100% 제거하는 것이 좋음
- 보안 취약점 예방 정책 : 보안약점 제거
- 소프트웨어가 가지는 만은 보안약점들 중 침해사고의 원인이 된 그 보안약점을 보안취약점이라고 함
  ![image](https://user-images.githubusercontent.com/68031450/235285352-bda3fa5d-6deb-4e1e-ae81-d0a85198fb6a.png)

# SW 보안 개발의 개념

## SW 개발보안

안전한 SW 개발을 위해 **소스코드 등에 존재할 수 있는 잠재적인 보안약점을 제거**하고, **보안을 고려하여 기능을 설계 및 구현**하는 등 SW 개발 과정에서 실행되는 일련의 보안활동

![image](https://user-images.githubusercontent.com/68031450/235285361-465b7488-0994-4896-b4ae-8f57d623a51c.png)

- 현재는 SW 개발 과정 중 소스코드 구현단계를 중심으로 SW 개발보안 적용
- 보안취약점(Vulnerability) : 해킹 등 실제 보안사고에 이용되는 SW 보안약점
- 보안약점 (Weakness) : 보안취약점의 근본 원인이 되는 SW 상의 허점, 결점, 오류 등

## 개발보안 비용효과

![image](https://user-images.githubusercontent.com/68031450/235285372-bc68ab8a-f347-4dbd-be8d-5a60142667e0.png)

# SW 개발보안 제도

## SW 보안약점 분류 (47개)

### 입력 데이터 검증 및 표현 (15)

프로그램 입력 값에 대한 부적절한 검증 등으로 인해 발생할 수 있는 보안 약점을 의미한다. 관련 취약점명은 아래와 같다.

- SQL 삽입
- 경로 조작 및 자원 삽입
- 크로스사이트 스크립트
- 운영체제 명령어 삽입
- 위험한 형식 파일 업로드
- 신뢰되지 않는 URL 주소로 자동 접속 연결
- XQuery 삽입
- XPath 삽입
- LDAP 삽입
- 크로스사이트 요청 위조
- HTTP 응답 분할
- 정수 오버플로우
- 보안 기능 결정에 사용되는 부적절한 입력값
- 메모리 버퍼 오버플로우
- 포맷 스트링 삽입

### 보안 기능 (16)

인증, 접근제어, 권한 관리 등을 적절하지 않게 구현시 발생할 수 있는 보안 약점을 의미한다. 관련 취약점명은 아래와 같다.

- 적절한 인증없는 중요기능 허용
- 부적절한 인가
- 중요한 자원에 대한 잘못된 권한 설정
- 취약한 암호화 알고리즘 사용
- 중요정보 평문저장
- 중요정보 평문전송
- 하드코드된 비밀번호
- 충분하지 않은 키 길이 사용
- 적절하지 않은 난수값 사용
- 하드코드된 암호화 키
- 취약한 비밀번호 허용
- 사용자 하드디스크에 저장되는 쿠키를 통한 정보노출
- 주석문 안에 포함된 시스템 주요 정보
- 솔트 없이 일방향 해쉬 함수 사용
- 무결성 검사 없는 코드 다운로드
- 반복된 인증시도 제한 기능 부재

### 시간 및 상태 (2)

멀티프로세스 동작환겨에서 부적절한 시간 및 상태 관리로 발생할 수 있는 보안 약점을 의미한다. 관련 취약점명은 아래와 같다.

- 검사시점과 사용시점(TOCTOU)
- 종료되지 않는 반복문 또는 재귀함수

### 에러처리 (3)

불충분한 에러처리로 주요정보가 에러 정보에 포함되어 바랭할 수 있는 보안 약점을 의미한다. 관련 취약점명은 아래와 같다.

- 오류메시지를 통한 정보 노출
- 오류 상황 대응 부재
- 부적절한 예외 처리

### 코드오류 (4)

개발자가 범할 수 있는 코딩오류로 인해 유발되는 보안 약점을 의미한다. 관련 취약점명은 아래와 같다.

- 널(NULL) 포인터 역참조
- 부적절한 자원 해제
- 해제된 자원 사용
- 초기화되지 않은 변수 사용

### 캡슐화 (5)

불충분한 캡슐화로 인가되지 않은 사용자에게 데이터가 노출될 수 있는 보안 약점을 의미한다. 관련 취약점명은 아래와 같다.

- 잘못된 세션에 의한 데이터 정보 노출
- 제거되지 않고 남은 디버그 코드
- 시스템 데이터 정보 노출
- Public 메소드로부터 반환된 Private 배열
- Private 배열에 Public 데이터 할당

### API 오용 (2)

부적절하거나 보안에 취약한 API 사용으로 발생할 수 있는 보안 약점을 의미한다. 관련 취약점명은 아래와 같다.

- DNS Lookup에 의존한 보안결정
- 취약한 API 사용

## Rerencee

---

- [https://namu.wiki/w/SQL injection](https://namu.wiki/w/SQL%20injection)
- [https://www.kisa.or.kr/](https://www.kisa.or.kr/)
