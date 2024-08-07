---
layout: post
title: 카테고리 관리 위치 (Table vs Enum)
description: >
  .
sitemap: false
hide_last_modified: false
---

---

## 1. 데이터베이스에서 저장 및 관리

### 1.1. 장점

#### 1. 데이터 일관성 및 무결성

데이터베이스는 기본적으로 데이터의 무결성을 유지할 수 있는 기능을 제공한다. 외래 키(foreign key) 제약 조건을 사용하여 잘못된 차몾가 발생하지 않도록 보장할 수 있다.

또한 트랜잭션을 통해 데이터의 일관성을 유지할 수 있다. 여러 개의 데이터베이스 조작을 하나의 작업 단위로 묶어 원자성을 보장한다.

#### 2. 확장성

데이터베이스 테이블에 새로운 행을 추가하는 방식으로 쉽게 확장할 수 있다.

또한, 대규모 데이터를 효율적으로 처리할 수 있다. 인덱싱, 파티셔닝 등 다양한 기법을 사용하여 성능을 최적화할 수 있다.

#### 3. 복잡한 쿼리 지원

SQL을 사용하여 복잡한 쿼리를 작성하고, 데이터를 다양한 방법으로 검색, 필터링, 정렬, 집계할 수 있다. 또한, Join을 통해 여러 테이블에서 데이터를 결합하여 필요한 정보를 쉽게 얻을 수 있다.

#### 4. 보안 및 백업

데이터베이스는 데이터 접근 권한을 제어하고, 인증 및 인가 메커니즘을 제공하여 데이터 보안을 강화한다. 또한, 정기적인 백업 및 복구 기능을 통해 데이터 손실을 방지할 수 있다.

### 1.2. 단점

#### 1. 설정 및 유지 관리의 복잡성

데이터베이스 시스템의 설정 및 유지 관리가 복잡할 수 있다. 데이터베이스 스키마 설계, 인덱스 최적화, 성능 튜닝 등 다양한 관리 작업이 필요하다.

#### 2. 성능 이슈

복잡한 쿼리나 대규모 데이터 처리 시 성능 문제가 발생할 수 있다. 이러한 경우 성능 최적화를 위한 추가 작업이 필요하다.

또한, 네트워크를 통해 데이터베이스에 접근하는 경우 Latency(지연)가 발생할 수 있다.

#### 3. 의존성

애플리케이션이 데이터베이스에 의존하게 되므로, 데이터베이스가 다운된다면 애플리케이션에도 영향을 미칠 수 있다.

또한 데이터베이스 시스템의 종류와 버전에 따라 특정 기능이 달라질 수 있어, 데이터베이스 변경 시 호환성 문제가 발생할 수 있다.

## 2. TypeScript의 union types를 통한 관리

### 2.1. 장점

#### 1. 간결성

코드를 통해 바로 정의할 수 있어 상대적으로 설정이 간단하다. 데이터베이스 없이도 데이터를 정의하고 사용할 수 있다. 상대적으로 작은 프로젝트 규모나 간단한 데이터 구조에 적합할 것으로 보인다.

#### 2. 타입 안전성

컴파일 시점에 타입을 체크할 수 있어, 런타임 오류를 사전에 방지할 수 있다. 코드 작성 시 IDE의 도움을 받아 자동 완성 기능을 활용할 수도 있다.

데이터의 구조가 명확하게 정의되므로, 코드의 가독성이 높아지고 유지 보수가 용이하다.

#### 3. 성능

데이터베이스 쿼리를 사용하지 않으므로, 데이터 접근 속도가 상대적으로 빠를 것이다. 메모리 내에서 데이터를 처리하기 때문에 데이터베이스를 거치는 것보다 성능이 뛰어나다. 상대적으로 작은 데이터셋에 대해서는 빠른 접근과 처리가 가능하다.

#### 4. 의존성 감소

데이터베이스 없이도 동작할 수 있기 때문에 애플리케이션 입장에서는 독립적으로 동작할 수 있다느 ㄴ의미이다. 이는 데이터베이스 설정 및 관리에 대한 부담을 줄일 수 있다는 장점이 있다.

### 2.2. 단점

#### 1. 확장성 부족

새로운 카테고리나 하위 카테고리를 추가할 때마다 코드를 수정해야 한다. 이는 배포 과정에서 번거로울 수 있다. 이를테면 하나의 카테고리를 추가할 때마다 코드를 수정하여, 리뷰를 받아야하는 과정을 의미한다. 데이터 구조가 변경될 때마다 전체 어플리케이션을 다시 컴파일 해야한다는 점도 유의할 필요가 있다.

#### 2. 데이터 관리의 어려움

많은 양의 데이터를 관리하기 어렵다. 데이터의 일관성을 유지하기 힘들고, 데이터 중복 혹은 불일치 문제가 발생할 수 있다. 데이터에 대한 검색, 필터링, 정렬, 집계 등의 작업을 효율적으로 수행하기 어렵다.

#### 3. 데이터 공유의 어려움

애플리케이션 레벨에서 관리하기 때문에 다른 시스템 혹은 애플리케이션과 데이터를 공유 혹은 통합이 어렵다. 데이터베이스와 달리 중앙 집중식으로 데이터를 관리할 수 없기 때문이다. 비슷한 이유로 분산 환경에서 데이터 일관성을 유지하기 어려울 수 있다.

#### 4. 메모리 사용

모든 데이터를 메모리에 저장하므로, 대량의 데이터를 다룰 때 메모리 사용이 비효율적일 수 있다. 또한, 메모리 부족 문제가 발생할 수도 있다.

---

## 결론

### 데이터베이스를 이용하여 카테고리 관리

현재 개발하고 있는 서비스는 여러 서비스(WAS)에서 하나의 데이터베이스를 참조하고 있으며, 현재도 계속 마이그레이션을 진행하고 있는 상태이다. 이러한 점에서 추후 다른 서비스에서 카테고리를 참조하게 될 경우에 불일치 문제가 발생할 수도 있다.

또한 개발 관점에서 카테고리를 enum으로 관리하게 된다면, 새로운 카테고리가 생길 때마다 소스코드를 수정하고, 이를 새로 컴파일하고 배포해야 하는 비용이 추가로 발생하게 된다. 이러한 관점으로 필자는 카테고리를 DB에서 관리하도록 결정하였다.
