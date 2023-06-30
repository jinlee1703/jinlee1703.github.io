---
layout: post
title: 관계(Relationship)
description: >
  본 게시글은 소프트웨어 마에스트로 과정에서 김태완 멘토님의 특강을 듣고 내용을 보충하여 작성한 내용입니다.
sitemap: false
hide_last_modified: true
---

---

## Relation vs Relationship

- Relation : 서로 다른 속성으로 관계형 모델 기반의 데이터베이스의 테이블 혹은 Entity `(테이블)`
- Relationship : 관계 모델 기반 데이터베이스에서 두 실체 사이의 연관성을 의미 `(두 테이블이 연결되는 방식)`

## 관계(Relationship)의 종류

![image](https://user-images.githubusercontent.com/68031450/237739053-68595332-bf81-4ec5-b0bd-0d005cc266d4.png)

&nbsp; RDBMS의 테이블을 생성하고, 각 테이블마다 관계를 설정하기 위해 일반적으로 외래키를 사용한다. 외래키를 통해 다른 테이블과 같은 키를 공유하고 이를 이용하여 Join을 통해 관계를 이용하는 방식을 사용한다. 외래키를 사용하여 테이블 간 관계를 정립하기 위해서는 크게 `식별 관계`와 `비식별 관계` 전략이 있다. 아래에서 알아보자.

### 식별 관계

- `부모 테이블의 기본키 혹은 유니크키를 자식 테이블이 자신의 기본키로 사용`하는 관계
- 부모 테이블의 키가 자신의 기본키에 포함되기 때문에 반드시 부모 테이블에 존재하는 데이터만 자식 테이블의 기본키로 입력할 수 있음
- ERD 상에서는 실선으로 표시
- 부모 테이블에 자식 테이블이 종속됨

### 비식별 관계

- `부모 테이블의 기본키 혹은 유니크키를 자신의 기본키로 사용하지 않고, 외래키로 사용`하는 관계
- 자식 데이터는 부모 데이터가 없어도 독립적으로 생성될 수 있음
- 부모와의 의존성을 줄일 수 있어 조금 더 자유로운 데이터 생성과 수정이 가능

### 각각의 전략으로 테이블을 구성할 때

&nbsp; 4륜 자동차를 생성하려고 하는 상황을 생각해보자. 우선 식별 관계에서는 다음과 같이 데이터를 넣을 수 있다.

| 자동차\_아이디(PK) | 이름  | 가격  |
| :----------------: | :---: | :---: |
|       12345        | 3륜차 | 10000 |

&nbsp; 바퀴의 데이터는 다음과 같이 입력할 수 있다. 바퀴 데이터는 아래 4개의 키가 묶여 복합 기본키를 가진다.

| 자동차\_아이디(PK, FK) | 바퀴\_위치(PK) |
| :--------------------: | :------------: |
|         12345          |  "FRONT_LEFT"  |
|         12345          | "FRONT_RIGHT"  |
|         12345          |  "BACK_LEFT"   |
|         12345          |  "BACK_RIGHT"  |

&nbsp; 이어서 참고 : https://deveric.tistory.com/108

## Reference

- [http://taewan.kim](http://taewan.kim)
- [https://jee00609.github.io/dbms/difference-of-relation-and-relationship-in-rdbms/](https://jee00609.github.io/dbms/difference-of-relation-and-relationship-in-rdbms/)
