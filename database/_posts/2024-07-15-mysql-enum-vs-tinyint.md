---
layout: post
title: MySQL - ENUM vs TINYINT
description: >
  .
sitemap: false
hide_last_modified: true
---

---

## Background

&nbsp; 필자가 이 글을 쓰게 된 건 실제 프로젝트에서 겪은 경험 때문이다. ENUM과 TINYINT를 사용하면서 각각의 장단점을 직접 체감했고, 특히 Cycle enum에서 데이터 의미와 실제 값의 불일치로 인한 문제를 겪었다.<br>

&nbsp; 이러한 경험은 필자와 같은 주니어 개발자들에게도 유용할 거라 생각했고, 데이터 모델링에서 의미와 일관성의 중요성을 강조하고 싶었다. 또한 실무에서 마주칠 수 있는 문제와 해결책에 대해서 고민해보게 되었다.<br>

&nbsp; 결론적으로 이 글은 필자가 경험을 통해 배운 것을 공유하고, 더 나은 개발 방식에 대해 고민해보자는 취지에서 작성하게 되었다.

---

## Subject

### ENUM

&nbsp; `ENUM` 타입은 MySQL에서 열거형 데이터를 저장하기 위한 데이터 타입이다. **사전에 정의된** 문자열 집합 중 하나를 값으로 가질 수 있다.<br>
&nbsp; 특정 컬럼에 대해 제한된 선택지 . 중하나만 저장할 수 있도록 하는 경우에 사용된다. 예를 들어 `status`라는 컬럼에 `ready`, `active`, `stop`과 같은 정해진 상태만 저장하고자 할 때 사용한다.

#### Advantage

- 데이터 무결성을 유지할 수 있다. 즉, 정의되지 않은 값이 저장되는 것을 방지할 수 있다.
- 특정 컬럼의 값 선택지를 명확히 알 수 있다.

#### Disadvantage

- 새 값을 추가하거나 기존 값을 변경하는 것이 상대적으로 번거롭다.
- 내부적으로 함수로 저장되지만, 이는 사용자가 직접적으로 활용하기 어려울 수 있다.

#### Example

```sql
CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    status ENUM('ready', 'active', 'stop') NOT NULL
);
```

### TINYINT

&nbsp; `TINYINT` 타입은 MySQL에서 정수형 데이터를 저장하기 위한 데이터 타입으로, 1바이트의 크기를 가진다. 즉 `-128 ~ 127`까지의 정수 값(UNSIGNED일 경우 `0 ~ 255`)을 저장할 수 있다.<br>
&nbsp; 작은 범위의 정수를 저장할 때 유용하며 `true` / `false` 값을 저장할 때 0과 1로 표현하거나, 상태 값을 정수로 표현할 때 사용하기도 한다.

#### Advantage

- 메모리 절약이 가능하다. `TINYINT`는 1바이트만 사용하기 때문에 큰 데이터셋에서도 효율적으로 메모리를 절약할 수 있다.
- 숫자 값을 빠르게 비교하고 계산할 때 유용하다.

#### Disadvandate

- `ENUM`과 달리 명확한 의미를 부여하기 어렵다. 숫자의 의미를 이해하기 위해 추가적인 문서화가 요구될 수 있다.

#### Example

```sql
CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    is_active TINYINT(1) NOT NULL -- 0: inactive, 1: active
);
```

### My Opinion

&nbsp; 필자가 해당 게시글을 작성하게 된 이유인 세 번째 케이스에 대해 작성해 보고자 한다.

1. 상태값을 저장해야 할 경우 => `ENUM` 사용
2. boolean 값을 저장해야 할 경우 => `is_xxx`
3. **데이터 용도로 값을 가지게 할 경우**

#### 데이터 용도로 가지게 하기

&nbsp; 아래 예제에서는 주 단위 수행 횟수를 enum 타입으로 정의하고 있다. 이 값들은 화면 표현용으로 사용되고 있으며, 실제 주당 횟수를 나타내는 값과 일치하지 않는다.<br>

&nbsp; 예를 들어, `ONCE_A_WEEK`는 주 1회를 의미하지만, 코드에서는 0으로 정의되어 있다. 이는 데이터의 실제 의미와 맞지 않는 상황인데, 이러한 경우에는 데이터 처리 시 혼란을 초래할 수 있으며, 코드의 의미를 파악하기 어렵게 만들 수 있기 때문에 바로잡을 필요가 있다.

```typescript
enum Cycle {
  ONCE_A_WEEK = 0,
  TWICE_A_WEEK = 1,
  THREE_TIMES_A_WEEK = 2,
  FIVE_TIMES_A_WEEK = 3,
  DAILY = 4,
}
```

&nbsp; 각 enum 값을 실제 주당 수행 횟수와 일치하도록 변경해야 한다. 예를 들어, `ONCE_A_WEEK`는 1로, `DAILY`는 7로 설정한다. 이렇게 하면 데이터의 의미가 명확해지고, 코드의 가독성도 향상된다.

```typescript
enum Cycle {
  ONCE_A_WEEK = 1,
  TWICE_A_WEEK = 2,
  THREE_TIMES_A_WEEK = 3,
  FIVE_TIMES_A_WEEK = 5,
  DAILY = 7,
}
```

&nbsp; 이제 각 enum 값이 실제 주당 수행 횟수를 정확하게 나타내므로, 데이터 처리와 해석이 쉬워진다.

---

## Summary

&nbsp; enum 값을 데이터 용도로 사용할 때는 실제 값과의 일치성을 고려하는 것이 중요하다.

### ENUM

- 사용자가 읽기 쉽게 값을 정의할 수 있다.
- 값의 의미가 명확해진다.
- 새로운 값을 추가하거나 기존 값을 변경하는 것이 번거롭다.

### TINYINT

- 메모리를 적게 사용한다.
- 숫자 비교 및 계산이 효율적이다.
- 값의 의미를 이해하기 위해 문서화가 필요할 수 있다.
- 새로운 값을 추가하거나 변경하는 것이 상대적으로 쉽다.

### 선택 기준

- 열거형 데이터로 문자열 값의 의미를 명확히 하고 싶다면 ENUM을 사용하는 것이 좋다.
- 값의 범위가 작고 정수로 표현해도 문제가 없다면 TINYINT를 사용하는 것이 좋다. 예를 들어, 불리언 값이나 작은 범위의 정수 값을 표현할 때 TINYINT를 사용할 수 있다.
