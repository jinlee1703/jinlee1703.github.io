---
layout: post
title: plainToInstance
description: >
  .
sitemap: false
hide_last_modified: false
---

---

## 정의

- `class-transformer` 라이브러리에서 제공하는 함수
- 평범한 자바스크립트 객체를 특정 클래스의 인스턴스로 변환하는 기능 제공
- 주로 DTO(Data Transfer Object)를 사용하여 데이터를 구조화하거나 검증할 때 사용

## 기본 사용법

### 설치

```bash
npm install class-transformer
```

### 예제1: 평범한 객체를 클래스 인스턴스로 변환

```tsx
import { plainToInstance } from "class-transformer";

class User {
  firstName: string;
  lastName: string;
  age: number;
}

const plainUser = {
  firstName: "John",
  lastName: "Doe",
  age: 25,
};

// 평범한 자바스크립트 객체를 User 클래스의 인스턴스로 변환
const userInstance = plainToInstance(User, plainUser);

console.log(userInstance instanceof User); // true
console.log(userInstance); // User { firstName: 'John', lastName: 'Doe', age: 25 }
```

### 예제2: 중첩된 객체 변환

```tsx
import { plainToInstance, Type } from "class-transformer";

class Address {
  street: string;
  city: string;
}

class User {
  firstName: string;
  lastName: string;

  @Type(() => Address) // Address 타입으로 변환
  address: Address;
}

const plainUser = {
  firstName: "John",
  lastName: "Doe",
  address: {
    street: "123 Main St",
    city: "Anytown",
  },
};

// 평범한 자바스크립트 객체를 User 클래스의 인스턴스로 변환 (중첩된 객체 포함)
const userInstance = plainToInstance(User, plainUser);

console.log(userInstance instanceof User); // true
console.log(userInstance.address instanceof Address); // true
console.log(userInstance);
// User {
//   firstName: 'John',
//   lastName: 'Doe',
//   address: Address { street: '123 Main St', city: 'Anytown' }
// }
```

### 예제3: 데코레이터 사용

```tsx
import { plainToInstance, Expose, Exclude } from "class-transformer";

class User {
  @Expose() // 이 속성은 변환에 포함됨
  firstName: string;

  @Expose() // 이 속성은 변환에 포함됨
  lastName: string;

  @Exclude() // 이 속성은 변환에서 제외됨
  password: string;
}

const plainUser = {
  firstName: "John",
  lastName: "Doe",
  password: "secret",
};

// 평범한 자바스크립트 객체를 User 클래스의 인스턴스로 변환 (데코레이터 적용)
const userInstance = plainToInstance(User, plainUser);

console.log(userInstance);
// User { firstName: 'John', lastName: 'Doe' }
```

## 결론

위와 같은 예제들을 통해, DTO 변환 과정에서 필요한 속성만 유지하고 나머지를 제외할 수 있도록 `class-transformer`의 `plainToInstance` 함수를 활용할 수 있다.
