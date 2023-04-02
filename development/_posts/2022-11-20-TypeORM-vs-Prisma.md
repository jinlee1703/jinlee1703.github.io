---
layout: post
title: TypeORM vs Prisma
description: >
  본 글은 기존 velog에서 이전된 글입니다. ([https://velog.io/@jinu0137/TypeORM-vs-Prisma](https://velog.io/@jinu0137/TypeORM-vs-Prisma))
sitemap: false
hide_last_modified: true
---

---

## 1. ORM (Object Relation Mapping: 객체 관계 매핑)

### 1.1. ORM이란

- 객체와 관계형 데이터베이스의 데이터를 자동으로 매핑(연결)해주는 것을 의미
  - 객체 지향 프로그래밍은 클래스를 사용하고 관계형 데이터베이스는 테이블을 사용하는데, 객체 모델과 관계형 모델 간에 불일치가 존재하게 됨
  - ORM을 통해 객체 간의 관계를 바탕으로 SQL을 자동으로 생성하여 불일치를 해결함
- 객체를 통해 간접적으로 데이터베이스의 객체를 다룸
  - DB <= **ORM**(Mapping) => Object 필드

### 1.2. ORM을 사용하는 이유

- 객체 지향적인 코드로 인해 더 직관적이고 비즈니스 로직에 집중할 수 있게 해줌
- 재사용 및 유지보수의 편리성 증가
- DBMS에 대한 종속성이 줄어듦

<aside>
💡 **단, 완벽하게 ORM으로만 서비스를 구현하기는 어려움**

</aside>

> [ORM 정리](https://www.notion.so/ORM-2c95dc7f8e984d899f822a10c868b0f3)

---

## 2. TypeORM

### 2.1. TypeORM이란

- Node.js 등과 같은 플랫폼에서 JavaScript, TypeScript와 함께 사용할 수 있는 ORM

### 2.2. TypeORM의 장점

- 타 ORM과 달리 액티브 레코드 패턴과 데이터 매퍼 패턴을 모두 지원
- 다양한 데이터 베이스를 지원 (MariaDB,NOSQL 등)

---

## 3. Prisma

### 3.1. Prisma란

- [기존 ORM과 근본적으로 다른 ORM, 기존 ORM이 겪는 많은 문제들을 겪지 않음](https://www.prisma.io/docs/concepts/overview/prisma-in-your-stack/is-prisma-an-orm)
  - 전통적인 ORM들은 테이블을 모델 클래스에 매핑하여 관계형 데이터베이스 작업을 위한 객체 지향 방식을 제공
  - [이 접근 방식은 객체 관계형 임피던스 불일치로 인해 발생하는 많은 문제들을 야기함](https://coco-log.tistory.com/155)
  - [Prisma schema는 선언적인 모델을 정의해서 복잡한 인스턴스를 관리하는데 안전하게 데이터를 읽고 쓸 수 있음](https://fomaios.tistory.com/entry/Nodejs-Prisma%EB%9E%80-feat-%EC%82%AC%EC%9A%A9%ED%95%B4%EC%95%BC-%EB%90%98%EB%8A%94-%EC%9D%B4%EC%9C%A0)
- GraphQL 스키마를 기반으로 DB를 자동생성함
- 구성 요소
  - schema : model을 정의함
  - introspect : `npx prisma introspect`를 통해 기존의 DB 구조를 자동으로 schema로 불러오는 기능
  - migrate : DB를 변경하는 기능
  - client : 데이터에 맞춰 자동 생성되는 쿼리생성기, schema를 기반으로 DB에 요청
  - studio : GUI로 지원하는 DB 편집기

### 3.2. Prisma의 장점

- Prisma Studio라는 DB 접근 GUI를 제공함
- GraphQL의 장점
  - HTTP 요청 횟수를 줄일 수 있음
  - HTTP 응답 사이즈를 줄일 수 있음
  - API의 request/response에 비교적 덜 의존할 수 있음

> [참고1](https://ts2ree.tistory.com/155), [참고2](https://hahahoho5915.tistory.com/63)

---

<aside>
💡 **배경 : 백엔드 프레임워크는 NestJS + express를 사용하기로 결정된 상태에서 ORM 사용에 대해 의논하였음**

</aside>

## 4. 고려사항

### 4.1. 속도

- Fluent API를 통해 Join을 할 경우 여러 쿼리로 분리되서 호출된다고 함
  - ex) member 테이블과 Team 테이블을 Join할 경우 총 2번의 질의가 실행됨
- 아래 출처에서 10000개의 데이터로 테스트를 진행한 것을 참고하였음
  - Prisma의 경우 180-240ms, TypeORM의 경우 90-120ms가 걸렸음
  - [출처](https://wwlee94.github.io/category/blog/performance-comparison-prisma-typeorm/)

### 4.2. 과도한 러닝커브 우려

- 제공하는 기능이 너무 많음
  - Prisma의 경우 확실하게 Prisma Studio와 같이 편리한 기능을 제공해주지만 그만큼 러닝커브가 증가한다고 생각하였음
  - ex) 별도의 Schema 정의어 존재 ⇒ Schema 정의어 학습
- 추가적으로 GraphQL 학습이 필요함
  - Prisma를 사용하기 위해선 GraphQL 역시 학습해야 한다는 부담감이 있었음
- **우리 팀원 중 Prisma와 GraphQL을 사용해본 팀원이 없었음**
  - TypeORM은 내가 지난 프로젝트에서 사용해본 경험이 있었음

### 4.3. 부가적인 이유

- 화이트보드의 객체(드로잉, 포스트잇, 도형 등)를 어떻게 저장할 것인지 확정되지 않았음
  - GraphQL을 사용하게 되면, File 전송과 같이 Text로는 처리하기 힘들 경우 직접 구현해야함
- GraphQL을 사용하면 고정된 요청과 응답만 필요할 때에는 query로 인해 요청의 크기가 Restful보다 커질 수 있음
- Prisma의 경우 DateTime의 TimeZone 옵션이 존재하지 않음 (별도 구현해야함)
  - [출처](https://blog.ewq.kr/39)
- TypeORM의 경우, NestJS의 Default ORM이기 때문에 보다 많은 Reference들이 존재함

### 4.4. 결론 : TypeORM을 선택

1. ‘부끄럼’이라는 프로젝트는 실시간 공유 편집 기능이 매우 중요하다. 그렇기 때문에 ‘반응 속도’가 중요한 고려사항 중 하나이다.
   - ERD 설계 상 Join이 빈번하게 일어날 것이고, 이를 고려한다면 Join을 테이블 하나 당 속도가 배로 늘어나는 Prisma 보다는 TypeORM이 우리 프로젝트에 적합할 것이라고 판단하였다.
2. 6주 간 진행하는 프로젝트에서 Prisma와 GraphQL을 학습하며 구현하는 것은 부담이 될 수 있다.
   - NestJS와 ORM 두 가지 모두 학습해야 하는 팀원들도 있었는데, TypeORM에 비해 러닝커브가 높다고 판단되는 Prisma와 GraphQL을 추가로 학습하며 프로젝트를 진행하는 것은 부담이 된다고 판단하였다.
3. **기타 부가적인 이유를 포함해서 고민한 결과 우리는 TypeORM을 사용하기로 결정하였다.**

---

## 5. 성능 테스트

### 5.1. 계기

멘토님께 이 사안에 대해 말씀을 드렸고, 멘토님은 이 것을 주제로 기술 문서를 작성해보는 게 어떻냐는 의견을 주셨다. 그래서 내용을 보완할 겸, 주말에 직접 성능 테스트를 해보기로 마음을 먹었다.

### 5.2. 테스트 환경

- 운영체제 : Windows 10
- 데이터베이스 : MySQL 8.0.27 (로컬)
- 서버 프레임워크 : NestJS + express
- 자세한 테스트 모델은 링크를 참고하였다. [(참고)](https://wwlee94.github.io/category/blog/performance-comparison-prisma-typeorm/)

### 5.3. 테스트 방법

- MySQL은 로컬 환경에서 진행한다.
- Visual Studio Code를 통해 두 개의 서버를 동시에 실행한다.
- PostMan을 통해 무작위로 20번 API를 호출하고 JavaScript의 `console.time`을 통해 쿼리가 실행되는 시간을 출력한다.
- 그 후 실행 시간의 평균을 계산하여 비교한다.

### 5.4. 테스트 결과

![](https://velog.velcdn.com/images/jinu0137/post/4686f42d-dcf2-47b2-81ba-5089fee1cdcc/image.png)

|         | 최고 시간 | 평균 시간 | 최소 시간 |
| ------- | --------- | --------- | --------- |
| TypeORM | 175.656   | 83.996    | 62.263    |
| Prisma  | 142.241   | 105.2206  | 90.935    |
| 차이값  | 33.415    | -21.225   | 28.672    |

### 5.5. 결론

- 주의 : 본 테스트는 작성자의 컴퓨터 사양에 의존한다.
- 두 ORM 모두 처음 API를 호출했을 때는 두 ORM 모두 실행 시간이 가장 오래 걸린다.
- 최고 실행 시간은 TypeORM의 API가 가장 처음 실행된 시간이다.
- 평균적으로 TypeORM이 약 20ms 정도 빠른 속도를 보여준다. (첫 실행 시간을 제외하면 더 큰 성능차가 남)

### 5.6. 후기

결론적으로 TypeORM이 조금 더 빠른 성능을 보여주는 것은 맞는 것 같다. 이전에 [성능 테스트 게시글](https://wwlee94.github.io/category/blog/performance-comparison-prisma-typeorm/)을 참고하여 ORM을 결정하였는데, 2년 전 게시글이다 보니 Prisma와 TypeORM 모두 업데이트가 많이 되어 성능의 차이가 클 것이라고 생각했다. 특히 Prisma의 경우에는 비교적 최신의 ORM이라 성능적으로 큰 향상을 기대했고, 혹시 TypeORM보다 더 좋은 성능을 보여주진 않을까 생각하였다.

다행히(?) TypeORM이 Join을 사용한 쿼리의 경우에 아직 더 좋은 성능을 자랑한다. 이러한 성능 테스트을 진행해본 건 거의 처음이였는데, 앞으로도 이런 기술 스택을 결정할 때 성능 테스트를 진행해보면 프로젝트를 진행할 때 도움이 많이 될 것 같다.
