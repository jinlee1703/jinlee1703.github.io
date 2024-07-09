---
layout: post
title: TypeScript - 고급 타입 추론
description: >
  .
sitemap: false
hide_last_modified: false
---

---

## 서론

&nbsp; TS의 궁극적인 목표는 안전한 대입과 참조를 실현하는 것이다. 이전 글에서는 타입과 그 대소 관계를 정의하고, 안전한 대입이 무엇인지 살펴보았다면 본 글에서는 TS가 어떻게 안전하지 않은 대입이나 참조를 잡아내는 지 알아보도록 한다.

## 본론

### Type 검사(type checking)

&nbsp; **타입 검사**란, 어떤 심벌에 대한 각종 대입/참조/연산이 가능한지 확인하는 과정이다. 어떻게 보면 자동 증명이라고도 할 수 있는데, 단순히 증명에서 그치는 것이 아닌, 구체적으로 어떤 맥락 하에 심벌이 가질 수 있는 타입은 무엇인지도 찾아낸다. 타입 가드를 수행한 if문 블록이나 IDE 자동 완성이 그 예이다.<br>

&nbsp; 학술적으로 이는 [제약 충족 문제(CSP: Constrainted Statisfaction Proglem)](https://en.wikipedia.org/wiki/Constraint_satisfaction_problem)의 일종이지만 NP-완전(NP-complete)하기 때문에, 현실적으로 컴파일러가 풀기엔 너무 어려운 문제이다. 따라서 tsc는 그리디(greedy)한 알고리즘을 구현한 것으로 추정(실제로 지수 복잡도 케이스를 테스트해보면, 백트래킹을 하지 않는다는 것을 알 수 있다고 함)된다.

#### 제약 충족 문제 (CSP: Constrained Satisfaction Problem)

&nbsp; 주어진 변수들의 값이 특정 조건(제약)을 만족하도록 값을 할당하는 문제를 말한다. 각 변수는 일정한 도메인(값의 집합)을 가지며, 여러 변수에 대한 제약 조건이 주어진다. CSP의 목표는 모든 제약을 만족하는 변수 값의 조합을 찾는 것이다.<br>

&nbsp;

### 타입 검사는 증명

&nbsp; tsc는 개발자가 입력한 소스 코를 기반 지식(knowledge base)으로 사용한다. 즉, 엉터리 타입을 주거나 엉터리 대입을 하더라도 그것을 참인 명제로 간주한다. 대신 그 소스 코드를 정적 분석하며넛 모순이 발생할 경우, tsc에 내재하는 사실은 참이므로 소스 코드에 오류가 있다고 결론을 내리게 된다.<br>

&nbsp; 예를 들어, 다음과 같은 상수 선언문이 있다고 생각하자.

```typescript
const x: number = "a";
```

&nbsp; 상수 식별자 x, 타입 키워드 number, 문자열 리터럴 'a'가 있다.

1. `as const`가 없으니 리터럴 `'a'`의 타입은 `string`이다.
2. 식별자 `x`는 `number` 타입이다.
3. rvalue의 타입은 lvalue의 서브타입이므로, `number ≳ string`이다.
4. 하지만 공리적으로 number ≄ string이므로 모순이다.
5. tsc는 상수 선언문에서 리터럴에게 그 책임을 묻고 빨간줄을 긋도록 한다.

### 제네릭(generic)

&nbsp; 제네릭이란, 타입의 함수이기도 하지만, 타입간의 관계 그 자체를 표현한 것(사실 수학적으로 함수는 관계의 일종)이기도 하다. 제네릭은 일종의 1차 논리로도 볼 수 있는데, 제네릭의 제네릭처럼 고차 논리는 사용이 불가능하다. (예: F<T> = T<number>)

&nbsp; 제네릭의 인자 타입에 `extends` 키워드를 붙여서, 허용하는 슈퍼 타입을 지정할 수 있다.

```typescript
type OnlyArray<T extends unknown[]> = ...

type X = OnlyArray<number>  // 'number' 타입은 'unknown[]' 제약 조건을 만족하지 않음
```

&nbsp; 제네릭이 포함된 소스 코드의 타입 검사는 두 가지 유형으로 나뉜다.

#### 명시적 타입 전달(explicit type argument passing)

&nbsp; 제네릭 타입 인자에 명시적으로 타입을 기술하는 형태이다. 전달한 정보를 전제(premise)로 활용한다.

```typescript
useState<{ foo?: number }>({});
```

&nbsp; 제어 흐름(control flow)상 제네릭이 선언된 심벌 다음부터는, 타입의 올바름 유무에 관계없이 해당 인자로 추론할 수 있는 모든 타입이 결정된다. 예를 들어 아래의 소스 코드는 잘못된 인자를 대입하고 있지만, 그것과 관계없이 반환형은 제네릭에만 의존한다.

```typescript
function processList<T>(list: T[]): T[] {
  ...
}

const list = processList(new Promise())  // 'Promise<unknown>' 타입의 인수는 'unknown[]' 타입의 매개변수에 할당할 수 없음

list.forEach((x) => console.log(x))  // 타입 오류가 난 것과 별개로 `list`는 `unknown[]`으로 간주하여 계속 진행
```

#### 타입 인자 추론(type argument inference)

제네릭에 타입 인자를 생략한 경우에 수행하는 추론이다. 라이브러리 제작자가 자주 고려해야할 방식으로, 사용성에 지대한 영향을 미친다. 제네릭 외에도 타입 선언을 하지 않은 심벌이나, infer 키워드 등을 사용한 경우에도 동일한 원리가 적용된다.<br>

&nbsp; 이 방식은 tsc가 정적 분석으로 얻어낸 정보를 토대로, 최대한 인자를 추론한다. 만약 추론에 실패한 경우 unknown으로 간주한다. 이 알고리즘은 명시적으로 알려져 있지 않으며, 때로는 일관성이 없기도 하다. 많은 경우 tsc는 가장 비관적이고 보수적인 관점으로 타입을 추론한다. 또한 그리디하고 휴리스틱한 추론 알고리즘을 사용하며, tsc가 업데이트되면서 동작이 소폭 바뀌기도 하니 주의가 필요하다.

```typescript
function f<T>(value: Promise<T>): T
function f<T>(value: T): T[]
function f<T>(value: number): string

function f(value: any): any { ... } // 구현체

const x = f(3) // x의 타입은 number[]
```

&nbsp; 위 예시에서 `f(3)` 호출문을 만족하는 **가장 첫 번째 시그니처**는 `function f<T>(value: T)`이다. number라는 구체적인 타입이 아래에 있지만, 이미 만족한 시그니처가 있으므로 무시된다.

### 조건부 타입(conditional type)

&nbsp; 제네릭 정의문에서 특정 타입이 다른 타입의 서브타입인지 확인한 뒤 분기하는 구문이다. infer와 밀접한 연관이 있다.

```typescript
type IsNever<T> = [T] extends [never] ? true : false;
```

&nbsp; 이때 extends `... infer` 키워드로, 특정 타입 표현식을 만족하는 가장 작은 슈퍼타입을 추론할 수도 있다.

```typescript
type GetElement<T> = T extends (infer R)[] ? R : never;

type ShouldNumber = GetElement<number[]>;
// number[]의 슈퍼타입은 (number | string)[], unknown[], number[] | string 등 다양하지만
// 가장 작은 슈퍼타입은 number[]이므로, R은 number로 추론된다.
```

#### 주의 사항

&nbsp; 인자의 T에 대한 정보가 하나도 없는 경우, 항상 모든 분기의 결과를 합연산하지는 않는다는 것을 주의해야 한다.<br>

&nbsp; 가령 아래의 코드는 얼핏 이해가 되지 않을 수 있는데, `x ≲ T`이면서 `x ≲ string`이라고 해서 `T ≲ string`이라는 보장이 없기 때문이다. 이 상황에서 T에 관해서는 어떠한 전제도 할 수 없고, 결과적으로 `F<T>`도 결정을 못하는 상황이 된다. 상식적으로 생각하면 `true | false`나 `boolean`으로 반환할 것 같지만, 적어도 5 버전까지의 tsc는 그냥 타입 오류를 내버린다고 한다.

```typescript
type F<T> = T extends string ? true : false;
function foo<T>(x: T): F<T> {
  if (typeof x === "string") {
    return true; // 'boolean' 타입은 'F<T>' 타입에 할당할 수 없습니다.
  }
  return false; // 'boolean' 타입은 'F<T>' 타입에 할당할 수 없습니다.
}
```

#### 조건부 타입의 분배 법칙(distributive law)

&nbsp; 조건부 타입에는 특수한 기능이 있다. 바로 extends 키워드가 합집합에 대한 분배를 수행한다는 점이다. 다음 두 제네릭을 보면 단적으로 이해할 수 있다.

```typescript
type F<T> = T[];
type G<T> = T extends unknown ? T[] : never;

type T1 = F<string | number>; // (string | number)[]
type T2 = G<string | number>; // string[] | number[]
```

&nbsp; unknown은 항상 모든 타입의 슈퍼타입이기 때문에, G는 묻지도 따지지도 않고 배열을 반환한다. 그런데 F는 개별 요소가 합집합인 반면, G는 개별 요소는 분리되고 그 결과가 합집합이 됩니다. 이 사실은 고급 타입을 설계할 때 매우 중요하게 작용합니다. 경우에 따라서는 저 성질을 억제해야 할 때도 있는데, 그럴 땐 튜플로 감싸주면 된다.<br>

&nbsp; 조건부 타입의 예시를 들 때 특정 타입이 never인지 확인하는 IsNever를 다시 보면 분배 법칙을 억제하고 있다.

```typescript
type WrongIsNever<T> = T extends never ? true : false;
type IsItTrue = WrongIsNever<never>; // never
```

&nbsp; 바로 never가 공집합의 성질을 갖기 때문이다. 조건부 타입은 T를 대상으로 합집합에 대한 분배를 수행한다. 즉, 내부적으로 타입 인자를 대상으로 하나씩 map을 수행하는 것과 유사한 동작을 하는 것이다. 그런데 never는 빈 배열, 혹은 공집합과 다를 바가 없어, 해당 연산을 아예 수행하지 않는다. 그래서 true도 false도 아닌, 빈 타입인 never가 반환된 것이다. 그러나 튜플로 감쌀 경우, [never]는 엄연히 비어있지 않은 타입이고, [...]가 1개 있는 타입의 합집합이므로 의도한 대로 추론한 것이다.

---

## Reference

- [infer, never만 보면 두려워지는 당신을 위한 타입 추론 - 고급 타입 추론](https://d2.naver.com/helloworld/3713986)
