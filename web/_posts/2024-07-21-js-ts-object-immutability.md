---
layout: post
title: JS & TS - 객체 불변성과 읽기 전용 속성
description: >
  .
sitemap: false
hide_last_modified: false
---

---

## Background

&nbsp; 최근 코드 리뷰에서 다음과 같은 피드백을 받았다.

```typescript
const updated = { ...type, ...updateTypeDto };
```

&nbsp; 이 코드에 대해 "내가 생성하지 않은 객체는 다양한 이유로 수정하지 않는 것이 좋습니다. (내가 생성한 객체도 왠만하면 수정 안하는게 좋습니다.)"라는 의견을 들었다. 이는 객체 불변성의 중요성을 강조하는 피드백이었다. 코드 리뷰를 통해 객체 불변성과 관련된 JavaScript와 TypeScript의 주요 개념들을 이해할 필요가 있다는 생각이 들게 되었고, 본 게시글을 작성하게 되었다.

---

## Subject

### 1. 객체 불변성의 중요성

&nbsp; 객체 불변성은 한번 생성된 객체의 상태를 변경하지 않는 프로그래밍 패러다임이다. JavaScript(이하 JS)에서 이는 특히 중요한 개념으로, 다음과 같은 이유로 널리 사용된다.

#### 1.1. 예측 가능성 향상

&nbsp; 불변 객체를 사용하면 코드의 동작을 더 쉽게 예측할 수 있다. 객체의 상태가 변경되지 않으므로, 해당 객체를 사용하는 다른 부분의 코드에 예기치 않은 영향을 미칠 가능성이 줄어든다.

```javascript
const user = { name: "Alice", age: 30 };
// user 객체를 여러 함수에서 사용해도 원본이 변경될 걱정이 없다
```

#### 1.2. 부작용(side effects) 감소

&nbsp; 불변성을 유지하면 함수의 부작용(side effects)을 줄일 수 있다. 함수가 받은 인자를 직접 수정하지 않고 새로운 객체를 반환하므로, 예상치 못한 상태 변경을 방지할 수 있다.

```javascript
// 나쁜 예
function addYear(user) {
  user.age += 1; // 원본 객체 수정
  return user;
}

// 좋은 예
function addYear(user) {
  return { ...user, age: user.age + 1 }; // 새 객체 반환
}
```

#### 1.3. 참조 동일성을 통한 최적화

&nbsp; React와 같은 프레임워크에서 불변성은 성능 최적화에 중요한 역할을 한다. 객체의 참조가 변경되었는지만 확인하여 렌더링 여부를 결정할 수 있기 때문이다.

```javascript
// React 컴포넌트에서
if (prevProps.user !== nextProps.user) {
  // user 객체가 새로운 객체라면 렌더링
}
```

#### 1.4. 시간 여행 디버깅 용이

&nbsp; 상태 변경의 히스토리를 쉽게 추적할 수 있어, 시간 여행 디버깅(time-travel debugging)이 가능해진다. 이는 Redux와 같은 상태 관리 라이브러리에서 특히 유용하다.

#### 1.5. 동시성 및 병렬 처리

&nbsp; 불변 객체는 여러 스레드에서 동시에 안전하게 접근할 수 있어, 동시성 프로그래밍에서 발생할 수 있는 문제를 줄일 수 있다.

#### 1.6. 불변성을 유지하는 방법

```javascript
// 1. 얕은 복사 (Shallow Copy)
const original = { a: 1, b: 2 };
const copy = { ...original };

// 2. 깊은 복사 (Deep Copy)
const original = { a: 1, b: { c: 2 } };
const copy = JSON.parse(JSON.stringify(original));

// 3. Object.freeze() 사용
const obj = Object.freeze({ a: 1, b: 2 });
// obj.a = 2; // 엄격 모드에서 에러 발생

// 4. 불변성 라이브러리 사용 (예: Immutable.js, Immer)
```

#### 1.7. 주의 사항

&nbsp; 불변성을 과도하게 적용하면 메모리 사용량이 증가하고 성능이 저하될 수 있다. 따라서 상황에 따라 적절히 사용해야 한다. 큰 객체나 빈번한 업데이트가 필요한 경우, 불변성 라이브러리를 사용하거나 가변(mutable) 업데이트를 고려할 수 있다.<br>

&nbsp; 객체 불변성은 코드의 안정성과 예측 가능성을 높이는 강력한 도구지만 상황에 맞게 적절히 사용하는 것이 중요하며, 때로는 성능과 불변성 사이의 균형을 잡아야 한다.

### 2. `Object.assign` vs 스프레드 연산자(`...`)

&nbsp; 객체의 불변성을 유지하면서 새로운 객체를 생성하는 방법으로 Object.assign()과 스프레드 연산자(...)가 자주 사용된다.

#### 2.1. `Object.assign`

```javascript
const original = { a: 1, b: 2 };
const copy = Object.assign({}, original, { c: 3 });
console.log(copy); // { a: 1, b: 2, c: 3 }
```

&nbsp; Object.assign()은 첫 번째 인자로 전달된 객체에 이후의 모든 인자들의 속성을 복사한다.

#### 2.2. 스프레드 연산자(`...`)

```javascript
const original = { a: 1, b: 2 };
const copy = { ...original, c: 3 };
console.log(copy); // { a: 1, b: 2, c: 3 }
```

&nbsp; 스프레드 연산자는 Object.assign()보다 더 간결하고 읽기 쉬운 문법을 제공한다.

### 3. TypeScript - `readonly` 키워드

&nbsp; TypeScript에서는 readonly 키워드를 사용하여 속성을 읽기 전용으로 만들 수 있다. 이는 컴파일 시점에 불변성을 강제하는 방법이다.

```typescript
interface Person {
  readonly name: string;
  age: number;
}

let person: Person = { name: "Alice", age: 30 };
person.age = 31; // OK
person.name = "Bob"; // Error: Cannot assign to 'name' because it is a read-only property.
```

#### 3.1. readonly vs const

- const는 변수 자체를 재할당할 수 없게 만든다.
- readonly는 객체의 속성을 변경할 수 없게 만든다.

```typescript
const person = { name: "Alice" };
person.name = "Bob"; // This is allowed

interface Person {
  readonly name: string;
}
let person: Person = { name: "Alice" };
person.name = "Bob"; // This is not allowed
```

#### 3.2. Readonly<T> 유틸리티 타입

&nbsp; TypeScript는 Readonly<T> 유틸리티 타입을 제공하여 모든 속성을 읽기 전용으로 만들 수 있다:

```typescript
interface Mutable {
  x: number;
  y: number;
}

type Immutable = Readonly<Mutable>;

let mutable: Mutable = { x: 1, y: 2 };
mutable.x = 3; // OK

let immutable: Immutable = { x: 1, y: 2 };
immutable.x = 3; // Error: Cannot assign to 'x' because it is a read-only property.
```

---

## Summary

&nbsp; 객체 불변성은 안정적이고 예측 가능한 코드를 작성하는 데 중요한 개념이다. JavaScript에서는 Object.assign()이나 스프레드 연산자를 사용하여 이를 구현할 수 있으며, TypeScript에서는 readonly 키워드를 통해 컴파일 시간에 불변성을 강제할 수 있다. 이러한 도구들을 적절히 활용하면 더 안전하고 효율적인 코드를 작성할 수 있다.
