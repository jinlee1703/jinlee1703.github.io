---
layout: post
title: 외래키(Foreign Key)에 대한 고찰
description: >
  .
sitemap: false
hide_last_modified: true
---

---

## Background

&nbsp; 프로젝트를 진행하면서 외래 키가 설정되어 있지 않은 것을 확인하게 되었고, 그에 대한 이유를 정리하고자 게시글을 작성하게 되었다.

---

## 외래키의 정의와 기본 개념

&nbsp; 외래키(Foreign Key, 이하 FK)는 관계형 데이터베이스(이하 RDB)에서 한 테이블의 필드 중 다른 테이블의 레코드를 식별할 수 있도록 지정하는 키를 의미한다. 주로 두 테이블 간의 관계를 정의하고 참조 무결성을 유지하는 데 사용된다.

- 정의: 한 테이블의 필드가 다른 테이블의 기본키(Primary Key, 이하 PK)를 참조하는 필드
- 목적: 테이블 간 관계 정의 및 데이터 무결성 유지
- 특징: 참조되는 테이블의 기본키 값만 가질 수 있음

## 외래키를 사용하는 이유

### 무결성 보장

&nbsp; 외래키는 DB의 참조 무결성(Referential Integrity)를 보장한다. 이는 관련된 테이블 간의 데이터 일관성을 유지하는 데 중요하다.

```asciidoc
Users 테이블:
+----+------+
| ID | Name |
+----+------+
| 1  | John |
| 2  | Jane |
+----+------+

Orders 테이블:
+----+---------+
| ID | User_ID |
+----+---------+
| 1  |    1    |
| 2  |    2    |
+----+---------+
```

&nbsp; 위의 경우, Orders 테이블의 User_ID는 Users 테이블의 ID를 참조하는 외래키이다. 이를 통해 알 수 있는 것은 다음과 같다.

- 존재하지 않는 사용자에 대한 주문 생성을 방지한다.
- 주문이 있는 사용자의 삭제를 방지하거나 관련 주문도 함께 삭제할 수 있다.

&nbsp; 이로써 데이터의 일관성과 정확성이 보장된다.

### 관계 명확성

&nbsp; 외래키는 테이블 간의 관계를 명확하게 정의한다. 이는 데이터베이스 구조를 이해하고 관리하는 데 도움이 된다.

```asciidoc
Books 테이블:
+----+----------+----------+
| ID | Title    | AuthorID |
+----+----------+----------+
| 1  | Book A   |    1     |
| 2  | Book B   |    2     |
+----+----------+----------+

Authors 테이블:
+----+------------+
| ID | Name       |
+----+------------+
| 1  | Author X   |
| 2  | Author Y   |
+----+------------+
```

&nbsp; Books 테이블의 AuthorID가 Authors 테이블의 ID를 참조하는 외래키로 설정되면, 각 책이 어떤 저자에 의해 쓰였는지 명확하게 알 수 있다. 이러한 관계는 데이터베이스 다이어그램에서도 시각적으로 표현되어 전체 구조를 쉽게 이해할 수 있게 해준다.

### 캐스케이딩 작업

&nbsp; 외래키를 사용하면 연관된 데이터에 대해 캐스케이딩 작업을 수행할 수 있다. 이는 부모 테이블의 레코드가 수정되거나 삭제될 때 자식 테이블의 관련 레코드도 자동으로 처리되게 하는 기능이다.

```sql
CREATE TABLE Departments (
    DeptID INT PRIMARY KEY,
    DeptName VARCHAR(50)
);

CREATE TABLE Employees (
    EmpID INT PRIMARY KEY,
    Name VARCHAR(50),
    DeptID INT,
    FOREIGN KEY (DeptID) REFERENCES Departments(DeptID)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);
```

&nbsp; 위 설정을 통해 수행하고자 하는 동작은 다음과 같다.

- 부서가 삭제되면, 해당 부서에 속한 모든 직원 레코드도 자동으로 삭제된다.
- 부서 ID가 변경되면, 해당 부서에 속한 모든 직원의 DeptID도 자동으로 업데이트된다.

### 데이터베이스 설계 개선

&nbsp; 외래키를 사용하면 데이터베이스 정규화를 보다 효과적으로 수행할 수 있다. 이는 데이터 중복을 줄이고 데이터 일관성을 향상시킨다.

#### 정규화 전

```asciidoc
Orders 테이블:
+----+----------+-------------+----------+
| ID | Product  | CustomerName| City     |
+----+----------+-------------+----------+
| 1  | Laptop   | John Doe    | New York |
| 2  | Phone    | John Doe    | New York |
| 3  | Tablet   | Jane Smith  | London   |
+----+----------+-------------+----------+
```

#### 정규화 후

```asciidoc
Customers 테이블:
+----+-------------+----------+
| ID | Name        | City     |
+----+-------------+----------+
| 1  | John Doe    | New York |
| 2  | Jane Smith  | London   |
+----+-------------+----------+

Orders 테이블:
+----+----------+------------+
| ID | Product  | CustomerID |
+----+----------+------------+
| 1  | Laptop   |     1      |
| 2  | Phone    |     1      |
| 3  | Tablet   |     2      |
+----+----------+------------+
```

&nbsp; 이렇게 정규하고 외래키로 연결하면 데이터 중복이 줄어들고, 고객 정보 업데이트가 더 용이해진다.

### 쿼리 최적화

&nbsp; 외래키는 데이터베이스 관리 시스템(DBMS)이 쿼리를 최적화하는 데 도움을 준다. DBMS는 외래키 정보를 사용하여 더 효율적인 실행 계획을 생성할 수 있다.

```sql
SELECT o.ID, o.Product, c.Name, c.City
FROM Orders o
JOIN Customers c ON o.CustomerID = c.ID
WHERE c.City = 'New York';
```

&nbsp; 위 쿼리에서 외래키 관계 정의를 통해 얻을 수 있는 것은 다음과 같다.

- DBMS는 두 테이블 간의 관계를 이미 알고 있어, 조인 연산을 보다 효율적으로 수행할 수 있다.
- 인덱스가 자동으로 생성되어 있을 가능성이 높아, 조인 성능이 향상된다.
- 쿼리 옵티마이저가 더 나은 실행 계획을 선택할 수 있다.

## 외래를 사용하지 않는 상황과 그 이유

### 환경

&nbsp; 대규모 시스템이나 유연성이 필요한 환경에서 많이 볼 수 있다. 예를 들어, 엄청난 양의 데이터를 다루는 빅데이터 시스템에서는 외래키로 인한 성능 저하가 큰 문제가 될 수 있다. 또한 요즘 많이 사용되는 마이크로서비스 구조에서도 각 서비스의 독립성을 위해 외래키 사용을 피하는 경우가 많다.

### NoSQL

&nbsp; NoSQL의 유연한 구조를 최대한 활용하기 위함이다. 빠르게 변화하는 스타트업 환경이나 애자일 방식의 개발에서도 스키마를 자주 바꿔야 할 때가 있는데, 이럴 때 외래키가 있으면 변경이 번거로워질 수 있다.

### Legacy

&nbsp; 오래된 시스템과 새 시스템을 연결할 때도 외래키 사용이 어려울 수 있다. 기존 구조를 크게 바꾸기 어려운 경우가 있기 때문이다. 대규모 데이터 분석을 위한 데이터 웨어하우스나, 실시간으로 엄청난 양의 데이터를 처리해야 하는 시스템에서도 성능상의 이유로 외래키 사용을 꺼리는 경우가 많다.

### Etc.

1. `의도치 않은 데이터 손실`: cascade delete를 설정해놓으면, 부모 레코드 삭제 시 관련된 모든 자식 레코드가 자동으로 삭제된다. 이는 때때로 의도치 않은 대규모 데이터 손실을 초래할 수 있다.
2. `성능 이슈`: 많은 양의 관련 레코드가 있을 경우, cascade 작업으로 인해 삭제나 업데이트 작업이 매우 느려질 수 있다.
3. `복잡성 증가`: 여러 테이블에 걸쳐 cascade가 설정되어 있으면, 데이터 변경의 영향을 예측하기 어려워진다. 이는 시스템의 복잡성을 크게 증가시킨다.
4. `트랜잭션 관리의 어려움`: 대량의 cascade 작업은 긴 트랜잭션을 유발할 수 있어, 데이터베이스 락(lock)이나 동시성 문제를 일으킬 수 있다.
5. `애플리케이션 로직과의 불일치`: 데이터베이스 레벨의 cascade 동작이 애플리케이션의 비즈니스 로직과 맞지 않을 수 있다.

## NestJS의 외래키를 사용하지 않고 연관 관계 설정하는 방법

&nbsp; NestJS에서는 TypeORM을 주로 사용하여 데이터베이스와의 연동을 처리한다. TypeORM에서는 외래키 없이도 엔티티 간의 관계를 정의할 수 있다. 다양한 방법이 있지만 이 포스트에서 소개할 내용은 `가상 관계(Virtual Relations)`를 사용하는 방법이다.

```typescript
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];
}

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.posts, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: "userId" })
  user: User;
}
```

&nbsp; `createForeignKeyConstraints: false` 옵션을 통행 실제 외래키 제약조건 생성을 방지한다.<br>

&nbsp; 이러한 방법들은 데이터베이스 레벨의 외래키 제약 없이도 애플리케이션 레벨에서 엔티티 간의 관계를 유지할 수 있게 해준다. 하지만 데이터 정합성 유지를 위한 추가적인 로직이 필요하며, 성능 최적화에 더 많은 주의를 기울여야 할 수 있다.<br>

&nbsp; 또한, 이런 방식은 데이터베이스의 참조 무결성을 애플리케이션 로직에 의존하게 만들므로, 잘못 사용하면 데이터 불일치 문제를 야기할 수 있다. 따라서 이 접근 방식을 채택할 때는 신중한 설계와 구현이 필요하다.

## Spring에서 외래키를 사용하지 않고 연관 관계 설정하는 방법

```java
@ManyToOne
@JoinColumn(name = "user_id", foreignKey = @ForeignKey(value = ConstraintMode.NO_CONSTRAINT))
private User user;
```

&nbsp; 이 설정은 NestJS의 `createForeignKeyConstraints: false` 옵션과 동일하게 데이터베이스 레벨에서 외래키 제약조건을 생성하지 않는다.

---

## Summary

&nbsp; 외래키는 관계형 데이터베이스에서 테이블 간의 관계를 정의하고 데이터 무결성을 유지하는 중요한 개념이다. 데이터의 일관성, 관계 명확성, 쿼리 최적화 등 여러 이점을 제공하지만, 대규모 시스템이나 유연성이 필요한 환경에서는 사용을 피하기도 한다.<br>

&nbsp; 외래키 없이도 NestJS나 Spring과 같은 프레임워크에서 가상 관계를 설정하거나 특정 어노테이션을 사용해 연관 관계를 구현할 수 있다. 그러나 이 경우 데이터 정합성 유지를 위한 추가적인 로직이 필요하며, 신중한 설계와 구현이 요구될 수 있다. 결국 외래키 사용 여부는 프로젝트의 요구사항과 상황에 따라 신중히 결정해야 한다.

--

## Reference

- [실무에서 외래키를 사용하지 않는 이유가 궁금합니다. - inflearn](https://www.inflearn.com/community/questions/629396/%EC%8B%A4%EB%AC%B4%EC%97%90%EC%84%9C-%EC%99%B8%EB%9E%98%ED%82%A4%EB%A5%BC-%EC%82%AC%EC%9A%A9%ED%95%98%EC%A7%80-%EC%95%8A%EB%8A%94-%EC%9D%B4%EC%9C%A0%EA%B0%80-%EA%B6%81%EA%B8%88%ED%95%A9%EB%8B%88%EB%8B%A4)
- [TypeORM에서 연관관계 유지한채 FK만 제거하기 (w. NestJS)](https://jojoldu.tistory.com/605)
- [외래키를 지양하라는 질문에 대한 궁금증](https://www.inflearn.com/community/questions/1109451/%EC%99%B8%EB%9E%98%ED%82%A4%EB%A5%BC-%EC%A7%80%EC%96%91%ED%95%98%EB%9D%BC%EB%8A%94-%EC%A7%88%EB%AC%B8%EC%97%90-%EB%8C%80%ED%95%9C-%EA%B6%81%EA%B8%88%EC%A6%9D)
