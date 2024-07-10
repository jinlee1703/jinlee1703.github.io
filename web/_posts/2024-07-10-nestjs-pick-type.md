---
layout: post
title: NestJS - PickType
description: >
  .
sitemap: false
hide_last_modified: false
---

---

## 정의

&nbsp; NestJS에서 재공하는 유틸리티 타입으로, DTO(Data Transfer Object)에서 특정 속성들만 선택하여 새로운 DTO 클래스를 생성할 때 사용된다.<br>

&nbsp; 참고로 클래스 변환 라이브러리인 `class-transformer`와 `class-validator`를 기반으로 작동한다.

## Usecase

- 기존 DTO 클래스에서 일부 속성만을 선택하여 새로운 DTO 클래스를 만들고 싶을 때
- 선택된 속성들에 대해 동일한 검증 규칙을 유지하고 싶을 때

## Example

&nbsp; 아래와 같은 기존의 DTO 클래스가 있다.

```typescript
import { IsString, IsNumber } from "class-validator";

class CreateUserDto {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsNumber()
  age: number;
}
```

&nbsp; 이제 `PickType`을 사용하여 `CreateUserDto`에서 `username`과 `password`만 포함하는 새로운 DTO를 생성해보자.

```typescript
import { PickType } from "@nestjs/mapped-types";

class LoginUserDto extends PickType(CreateUserDto, [
  "username",
  "password",
] as const) {}
```

&nbsp; 위의 예제를 살펴보면 `LoginUserDto`는 `CreateUserDto`에서 `username`과 `password` 속성만을 선택하여 생성된 새로운 DTO 클래스이다. 이를 활용하면 `CreateUserDto`에 정의된 검증 규칙(`@IsString`, `@IsNumber` 등)을 그대로 사용할 수 있다.

## My Opinion

&nbsp; 조회를 하기 위한 `UserDto`(슈퍼 타입)를 정의하고, `CreateUserDto`, `LoginUserDto`, `UpdateUserDto` 등 다양하게 활용한다면 보다 유지보수성이 높은 코드를 작성할 수 있을 것으로 판단된다.
