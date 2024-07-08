---
layout: post
title: TypeScript - 기초 타입 이론
description: >
  .
sitemap: false
hide_last_modified: false
---

---

## 서론

&nbsp; TypeScript(이하 TS)는 JavaScript(이하 JS)의 런타임 취약성(여기서 이야기 하는 취약성은 동적 타이핑)을 극복하고자, 타입 이론을 도입하여 정적 분석을 실현한 언어이다. 하지만 [NAVER ENGINEERING DAY 2024(5월)에서 발표되었던 세션](https://d2.naver.com/helloworld/7472830)에 따르면 대다수의 웹 애플리케이션 개발 과정에서 인터페이스를 선언하거나, Record와 같은 유틸리티 타입 일부를 쓰는 정도 외에는 TS의 기능을 깊게 사용할 일은 드물다고 한다.<br>

&nbsp; 하지만 라이브러리를 개발하게 된다면 이야기는 달라진다. 사실상 웹 어플리케이션을 개발할 때 TS를 사용하는 것이 필수가 되었고, 그렇지 않더라도 많은 사람들이 IDE의 타입 추론 기능을 활용하고 있기 때문에 '타입'은 빼놓을 수 없는 관심사가 되었다. 타입 추론이 제대로 이루어지지 않으면 라이브러리의 사용성은 현저하게 떨어질 것이다.

&nbsp; 제대로 된 타입 추론을 실현하기 위해 개발자는 어떠한 노력을 기울여야 할까? 위 세션에 따르면 제대로 된 타입 추론을 실현하기 위해서는 수학적으로 타입 이론을 이해하고 적용할 수 있어야 한다고 주장하고 있다. 해당 영상은 TS를 관통하는 타입 추론의 원리를 기초 타입 이론, 고급 타입 추론, 실전 문제 순으로 다루고 있다. 필자는 위 영상과 아래 게시글의 내용을 참고하여 정리하고자 한다.

### 타입 추론의 중요성

&nbsp; 타입 추론이 제대로 이루어지지 않으면 개발자는 라이브러리를 사용할 때 매번 타입을 명시적으로 작성해야 한다. 이는 번거롭고 시간 소모적이며, 개발 경험 및 생산성을 크게 저하시킬 수 있다. 또한 필자가 생각하는 IDE의 가장 큰 장점은 자동 완성 기능이다. 이는 타입 정보를 바탕으로 작동하며, 타입 추론이 제대로 되지 않으면 IDE는 정확한 자동 완성을 제공하지 못하고, 개발자는 코드의 의도를 파악하기 어려워져 문서나 소스 코드를 일일이 참고함으로써 다른 개발자가 코드를 이해하고 유지보수하는 데 어려움을 겪에 만든다.<br>

&nbsp; 또한, 타입 추론이 정확하게 이루어지지 않는다면 타입 오류를 사전에 검출하기 어려워지고, 이는 런타임 오류로 이어질 가능성을 높이며, 개발자가 디버깅에 많은 시간을 할애하게 된다. 또한 잘못된 타입을 사용하는 실수를 범하여, 보안 취약점이나 예상치 못한 버그를 발생시킬 수도 있다.

---

## 타입?

### 타입 이론의 역사적 배경

&nbsp; 타입 이론의 근간에는 [수학기초론](https://en.wikipedia.org/wiki/Foundations_of_mathematics)이 있다. 20세기 이전까지만 하더라도 수학은 생각보다 엄밀하지 않았는데, 1908년 [러셀의 역설(Russell's Paradox)](https://en.wikipedia.org/wiki/Russell%27s_paradox)이 발견되며 모든 수학이 기초인 '집합'이 흔들리게 된다. 이 문제를 해결하고자 ZFC 공리계, 괴델의 불안전성 정리 등의 엄밀한 고찰이 계속 되었다.<br>

&nbsp; 러셀의 역설을 간단히 살펴보면 다음과 같다.

```
자기 자신을 포함하지 않는 모든 집합의 집합 R을 상상하자.

만약 R이 R에 속한다면, R은 자기 자신에 속하지 않는게 아니므로 모순이다.

만약 R이 R에 속하지 않는다면, R은 자기 자신에 속하지 않는 집합이므로 R에 속해야 한다. 그러니 모순이다.

그러므로 그런 집합은 존재할 수 없다.
```

\*nbsp; 타입 이론은 위대한 과학 자 중 하나인 앨런조 처치(Alanzo Church)가 [람다 대수(lambda calculus)](https://en.wikipedia.org/wiki/Lambda_calculus)를 고찰하면서 탄생했다고 한다. 처치 외에도 수많은 수학자가 유사한 시도를 했고, 비교적 최근까지도 학계에서 다뤄지는 주제라고 한다.

### TypeScript와 타입 이론의 연관성

TS 1.8까지는 [공식 문서](https://javascript.xgqfrms.xyz/pdfs/TypeScript%20Language%20Specification.pdf)가 존재하였으나, 이후 Microsoft에서 문서 유지보수를 포기하면서, 현재 TS의 사양은 TypeScript 컴파일러(이하 tsc)의 구현 그 자체가 된 상황이다. 게다가 구버전 문서에서도 일관성 있는 타입 추론 알고리즘에 대한 정보는 찾아보기가 어렵다고 한다.<br>

&nbsp; 레퍼런스에서는 tsc를 블랙박스로 간주하고, 수학적 일관성과 실험을 근거로 얻을 내용을 서술하였다.

---

## TypeScript - 타입이란

&nbsp; 타입은 아래와 같이 정의할 수 있다.

```
어떤 심벌(symbol, 변수명)에 역인(binded) 메모리 공간에 존재할 수 있는 값(value)의 집합과 그 값들이 가질 수 잇는 성질(properties)
```

아래는 `3.141592`라는 값이 타입 `number`에 속한다는 것을 표현한 것이다

```
3.141592 : number
```

- number 타입으로 엮인 메모리 공간에는 `'foo'`, `null`과 같은 값은 올 수 없다.
  - 당연히 이는 `'foo'`와 `null`은 number 타입에 속하지 않는다는 것과 같은 의미이다.
- number 타입은 덧셈, 곱셈 등의 산술 연산을 할 수 있으며, `toString`, `toFixed` 등의 속성이 있다.

&nbsp; 타입과 타입 간에도 관계가 존재하는데, 타입 A가 다음을 만족할 때 타입 B의 서브타입이라고 한다.

```
타입 B의 모든 속성이 타입 A에도 있을 것
```

### 서브타입(subtype)

```typescript
type B = {
  id: number;
  name: string;
};

type A = {
  id: number;
  name: string;
  age: number;
};
```

&nbsp; 타입 A는 타입 B의 모든 속성(`id`, `name`)을 가지고 있으며, 추가적인 속성(`age`)을 포함하고 있다. 따라서 타입 A는 타입 B의 서브타입이 된다. 이는 타입 A를 타입 B로 예상하는 곳에 사용할 수 있음을 의미한다.

```typescript
function greet(user: B): string {
  return `Hello, ${user.name}! Your ID is ${user.id}.`;
}

const userA: A = {
  id: 1,
  name: "Alice",
  age: 30,
};

console.log(greet(userA)); // "Hello, Alice! Your ID is 1."
```

&nbsp; 위 코드에서 `great` 함수는 타입 B를 매개변수로 받지만, 타입 A의 객체 `userA`를 전달할 수 있다. 이는 타입 A가 타입 B의 서브타입이기 때문이다. 타입 A는 타입 B의 모든 속성을 포함하므로, 타입 B로 예상되는 모든 곳에 타입 A를 사용할 수 있다.<br>

&nbsp; 또한 타입 간의 서브타입 관계는 인터페이스에서도 동일하게 적용된다.

```typescript
interface B {
  id: number;
  name: string;
}

interface A extends B {
  age: number;
}

const userA: A = {
  id: 1,
  name: "Alice",
  age: 30,
};

function greet(user: B): string {
  return `Hello, ${user.name}! Your ID is ${user.id}.`;
}

console.log(greet(userA)); // "Hello, Alice! Your ID is 1."
```

&nbsp; 위 예시에서도 인터페이스 A는 인터페이스 B를 확장(extends)하여 모든 속성을 포함하고 있으며, 따라서 인터페이스 B의 서브타입이 된다. 인터페이스 B를 기대하는 곳에 인터페이스 A를 활용할 수 있다. 이러한 서브타입 관계는 코드의 재사용성과 유연성을 높이며, 타입 시스템을 활용하여 더 안전하고 명확한 코드를 작성할 수 있게 한다.

## 타입은 부분순서집합

&nbsp; 앞서 살펴보았듯, **타입은 비교 가능하다.** 비교 가능한 집합 중 가장 익숙한 것으로 실수(real number)가 있는데, 타입의 대소 관계와 실수의 대소 관계는 약간의 차이가 있다.<br>

&nbsp; 모든 임의의 두 실수는 다음의 둘 중 최소한 하나를 만족한다.

- a ≥ b
- a ≤ b

&nbsp; 특별히 a ≥ b이면서 a ≤ b인 관계를 a = b라고 하는데, 이러한 집합을 [전순서집합(totally ordered set)](https://en.wikipedia.org/wiki/Total_order)이라고 한다. 엄밀하게는 몇 가지 조건이 붙지만 우선은 숙지만 하고 넘어가도록 하자.<br>

&nbsp; 타입은 조금 다르다. 다음 4가지 조건 중 하나만 만족한다.

- a ≳ b
- a ≲ b
- a ≳ b 이면서 a ≲ b
- a ≄ b

&nbsp; 특별히 a ≳ b이면서 a ≲ b인 경우를 a ≃ b라고 표현한다면, 여기서 중요한 점은 a ≳ b가 아니라고 해서 a ≲ b라고 할 수 없다는 점이다. 이런 집합을 부분순서집합(partially ordered set)이라고 한다.<br>

&nbsp; 아래 예시를 보고 기호를 체화해 보자.

1. `number ≳ 42`

- 의미: `number` 타입은 `42`와 같거나 크다는 의미이다.
- 설명: 여기서 `≳` 기호는 `nubmer` 타입이 `42`를 포함하거나 `42`보다 더 큰 범위를 가지는 타입임을 의미한다. 수학적으로, `number`는 모든 숫자를 포함하는 타입이므로 특정 값 `42`보다 큰 범위를 갖는다. 따라서 `number ≳ 42`는 타입 간의 포함 관계를 나타낸다.

2. `symbol | string ≲ number | symbol | string`

- 의미: `symbol | string` 타입은 `number | symbol | string` 타입의 서브타입이다.
- 설명: 여기서 `≲` 기호는 서브타입 관계를 나타낸다. `symbol | string`은 `number | symbol | string`의 부분 집합이다. 즉, `symbol | string` 타입의 값은 `number | symbol | string` 타입의 값으로도 사용할 수 있다.

3. `{ x?: number } ≃ { x: number | undefined }`

- 의미: `{ x?: number }` 타입은 `{ x: number | undefined }` 타입과 동등하거나 거의 동일하다.
- 설명: 여기서 `≃` 기호는 두 타입이 거의 같거나 동듬함을 의미한다. `{ x?: number }`는 선택적 속성 `x`를 가지며, 이는 존재하지 않거나 `number` 타입일 수 있다. `{ x: number | undefined }`는 속성 x가 존재하며, number 또는 undefined 타입일 수 있다. 따라서 두 타입은 거의 동일한 의미를 가진다.

4. `number ≄ { x: number }`

- 의미: `number` 타입은 `{ x: number }` 타입과 동등하지 않다.
- 설명: 여기서 `≄` 기호는 두 타입이 동등하지 않음을 의미한다. `number`는 단순히 숫자 타입이고, `{ x: number }`는 `x`라는 속성을 가지는 객체이다. 이 두 타입은 구조적으로 다르므로 서로 동등하지 않다.

## 타입과 값의 대입

&nbsp; 위에서 대소 비교를 알아본 이유는, 값을 대입하는 조건을 정의하기 위함이었다. TS는 안전한 대입과 참조를 실현하는 방법으로서 타입 이론을 사용한다.

```
lval의 타입 ≳ rval의 타입 ⇔ lval := rval는 올바른 대입
```

&nbsp; 아래 코드를 살펴보자.

```typescript
const x: number = 42; // number ≳ number이므로, 대입 가능

const x: string = 42; // string ≄ number이므로, 대입 불가능

const x: string | number = 42; // string | number ≳ number이므로, 대입 가능
```

&nbsp; 이렇게 동작하는 이유는, 서브타입은 반드시 슈퍼타입이 가지는 성질을 갖기 때문이다. 즉, 속성에 대한 안전함 참조를 할 수 있다. 개발을 하다보면 값이 null이나 undefined인 변수를 대상으로 `.toString()` 등의 참조를 하면 런타임 오류가 발생하는 경우를 심심치 않게 본 적이 있다. 타입 이론은 이를 null 타입이 toString이라는 속성을 가지지 않았기 때문으로 본 것이다.

## 타입의 종류에 따른 대소 비교

### 원시 타입(primitive type)

&nbsp; 원시 타입이란 다음 6가지를 말한다.

- boolean
- number
- string
- symbol
- null
- undefined

&nbsp; 위들은 공리적으로 정의한다. null을 제외하면, JS에 존재할 수 잇는 값에 typeof를 수행했을 때 결과가 저 중 하나라면 그것이 곧 자신의 타입 이름이다. 예를 들어 typeof 3.141592 === 'number'이면 해당 리터럴은 `number` 타입이다.<br>

&nbsp; 이들은 자기 자신과는 서브타입 관계이고, 다른 타입과는 무관계이다.<br>

&nbsp; 참고로 TS에서는 null을 객체(object)의 서브타입으로 **간주하지 않는데**, null은 참조할 수 있는 속성이 하나도 없기 때문이다. JS에서 역사적인 이유로 인해 `typeof null === 'object'`인 것과 대조적이다.

#### `typeof null === 'object'`?

&nbsp; JS에서 `typeof null === 'object'`가 되는 이유는 초기 설계상의 버그 때문이다. 이 버그는 자바스크립트가 처음 개발될 때부터 존재해 왔으며, 그 이후로 수정되지 않고 그대로 남아 있다. 자바스크립트가 처음 만들어졌을 때, 값의 타입을 나타내기 위해 type tag라는 내부 구조를 사용했다. 각 값은 **해당 값의 타입을 나타내는 비트**를 가지고 있었고, 객체 타입은 `000`으로 표시되었습니다. null 값도 이러한 타입 태그를 가져야 했는데, null의 타입 태그가 우연히도 `000`으로 설정되었다. 즉, 객체를 나타내는 타입 태그와 동일했다.<br>

&nbsp; 자바스크립트에서 타입을 확인하기 위해 typeof 연산자를 사용하는데, typeof 연산자는 내부적으로 이 타입 태그를 확인하여 결과를 반환한다. 따라서 null의 타입 태그가 000이기 때문에 typeof null이 'object'를 반환하게 된 것이다.<br>

&nbsp; 자바스크립트는 웹 브라우저에서 널리 사용되는 언어이기 때문에, 기존 코드와의 호환성을 유지하는 것이 매우 중요하고, 이 버그를 수정하면 많은 기존 코드가 깨질 수 있다. 또한, 자바스크립트가 ECMAScript 표준으로 자리잡으면서, 이러한 동작도 표준에 포함되었고, 따라서 의도적으로 이 동작을 유지하게 되었다.

### 리터럴 타입(literal type)

&nbsp; 리터럴 타입이란 어떤 슈퍼타입에 속한 값 '1개'만으로 구성된 타입이다. 예를 들어 `let num: 6`과 같은 경우가 있다.<br>

&nbsp; 대부분의 경우, 리터럴을 쓰면 해당 심벌을 원시 타입으로 간주된다. 강제로 리터럴 타입으로 변환할 필요가 있다면 `as const` 키워드를 붙이면 된다.

### 객체 타입(object type)

&nbsp; 객체 타입은 개별 속성의 방향이 일치할 때, 전체의 대소 방향도 똑같이 따라간다.

```typescript
type A = {
  x: number;
  y?: string;
  z: boolean;
};

type B = {
  x: number;
  z: false;
  a: "foo";
};
```

&nbsp; tsc는 A ≳ B인지 궁금해 한다고 가정했을 때, 타입에서 잠시 보았던 '슈퍼타입의 모든 속성'을 따지기 시작한다. A가 슈퍼타입인지 물어봤으니, A의 속성을 나열해보자.

A는 `x`, `y`, `z`라는 속성을 가지고 있으며, 각각 `number`, `string | undefined`, `boolean`을 타입으로 갖는다. 이제 각 속성 이름에 대해, B에서 해당 속성이 무슨 타입인지 확인한다. 이를 간결하게 나타내면 다음과 같다.

```typescript
A['x'] = number             ≳ number    = B['x']
A['y'] = string | undefined ≳ undefined = B['y']
A['z'] = boolean            ≳ false     = B['z']
```

&nbsp; B['a']는 왜 비교하지 않는 걸까? 슈퍼타입인 A에는 a라는 속성이 없기 때문이다. B 타입의 값은 A 타입에 대입할 수 있고, A 타입을 통해선 a 속성에 접근하지 못한다. 따라서 a의 타입은 중요하지 않다.<br>

&nbsp; 이렇게 **어떤 더 작은 관심사에서의 방향이 거시적인 대소 관계 방향과 일치할 때** 그 성질을 **공변성(covariance)**이라고 한다. 객체 타입의 대소 관계는 각 타입이 가진 성질에 대하여 공변적이다. 만약 하나라도 방향이 일치하지 않을 경우, 두 타입은 무관계이다.

### 배열/튜플 타입

&nbsp; 배열도 객체이다. 튜플은 배열의 일종이고. 따라서 이들은 객체와 동일한 원리가 적용된다.<br>

&nbsp; 배열의 타입은 개별 원소 타입에 대하여 공변적이다.<br>

&nbsp; 객체와 배열의 차이가 있다면, number를 키 값으로 갖는다는 점이다. 다만 keyof string[]이 number를 직접 반환하지는 않는데, 배열에는 concat과 같은 다른 속성도 많이 있기 때문이다. 하지만 명백하게 keyof string[] ≳ number는 맞다.<br>

&nbsp; 튜플 타입은 length가 number의 리터럴 타입이라는 점이 배열과 다르다. 만약 length 범위 밖의 인덱스를 참조 시, 타입 오류를 발생시키며 해당 참조값은 any로 추론한다.

### 키 타입(keyof)

&nbsp; 키 타입이란 객체 타입의 속성 이름의 합집합(|)으로 이루어진 타입이다. 모든 키 타입은 `number | string | symbol`의 서브타입이다.

### 함수 타입

&nbsp; 함수 타입은 반환형과 인자형의 타입으로 구성되며 호출이 가능하다. 함수 타입의 포함 관계는 반환형에서는 공변적, 인자형에서는 반변적이다.

#### 반환형에 공변적

- 의미: 반환형의 포함 관계가 전체 함수 타입의 포함 관계를 결정한다.
- 이유: 반환값은 rvalue로 사용되며, lvalue에는 그 서브타입의 rvalue를 넣을 수 있기 때문이다.
- 예시:

  ```typescript
  const fa: () => A = ...
  const fb: () => B = ...

  let a: A
  let f: () => A

  // () => A ≳ () => B라면, fb를 f에 대입할 수 있음
  f = fb
  a = f()
  ```

#### 인자형에 반변적

- 의미: 인자형의 포함 관계의 역전이 전체 함수 타입의 포함 관계를 결정한다.
- 이유: 인자는 lvalue로 사용되며, 반변성은 인자를 받는 데 문제가 없도록 보장한다.
- 예시:

  ```typescript
  const fa: (a: A) => void;
  const fb: (b: B) => void;

  let f: (b: B) => void;

  // b는 A의 서브타입인 B 타입이므로, A에 대입이 가능합니다.
  f = fa;
  f(b);
  ```

#### 인자의 길이

- 원칙: 인자가 적은 함수 타입은 인자가 많은 함수 타입의 서브타입이다.
- 이유: 인자가 적은 함수는 더 많은 인자를 받아도 문제가 없지만, 인자를 많이 요구하는 함수가 더 적게 받으면 안 된다.
- 예시:

  ```typescript
  function consume1Arg(x: X): void;
  function consume2Arg(x: X, y: Y): void;

  let wide: (x: X, y: Y) => void;

  wide = consume1Arg; // OK
  wide(x, y); // consume1Arg는 y를 무시함

  let narrow: (x: X) => void;

  narrow = consume2Arg; // Error
  narrow(x); // consume2Arg의 y가 결정되지 못함
  ```

#### 요약

- 반환형은 공변적: 더 작은 타입의 함수를 큰 타입에 대입할 수 있다.
- 인자형은 반변적: 더 작은 타입의 함수로 치환되더라도 인자를 받는 데 문제가 없다.
- 인자의 길이: 인자가 적은 함수 타입은 인자가 많은 함수 타입의 서브타입이다.

### 특수 타입

&nbsp; 특수 타입이란 JS에서 값으로 존재하지 않고 TS에서만 존재하는 타입인 `never`, `unknown`, `any`, `void`를 의미한다.

#### never, unknown

&nbsp; 상단에서 서술한대로 우리는 값의 안전한 대입을 타입의 대소 관계로서 다루기로 했다. 이 관점에서 never와 unknown은 간단하다.<br>

&nbsp; 모든 타입 T에 대하여, never는 T의 서브타입이며, T는 unknown의 서브타입이다.<br>

&nbsp; `never`는 존재할 수 있는 가장 좁은 타입으로, 그 어떤 값도 대입할 수 없는데, 심지어 `undefined` 조차 대입할 수 없다. 일반적인 상황에서는 거의 쓰이지 않지만, 복잡한 제네릭을 구성 시 잘못된 대입에 대한 징벌적 오류를 발생시킬 때 유용하다고 한다.<br>

&nbsp; 반대로 `unknown`은 존재할 수 있는 가장 넓은 타입으로, 그 어떤 값도 대입할 수 있다. 심지어 `never` 타입으로 강제로 형변환한 값도 말이다.

```typescript
const thisIsNever: never = undefined; // 'undefined' 타입은 'never' 타입에 할당할 수 없음

const thisIsUnknown: unknown = 0; // 정상 작동

const neverCantReceiveAnything: never = {} as unknown; // 'unknown' 타입은 'never' 타입에 할당할 수 없음

const unknownCanReceiveAnything: unknown = {} as never; // 정상 작동

const unknownCantBeAssigned: number = 0 as unknown; // 'unknown' 타입은 'number' 타입에 할당할 수 없음
```

#### any

&nbsp; `any`는 never를 제외한 모든 타입 T에 대하여 서로 서브타입 관계이다.<br>

&nbsp; 서로 서브타입 관계이기 때문에 any를 number에 대입할 수도 있고, number를 any에 대입할 수도 있다. 단, never에 any를 대입할 수는 없다.

#### void

&nbsp; void는 함수의 반환형을 서술할 때 유의미한 타입으로, undefined의 슈퍼타입이다. undefined과 특수 타입을 제외한 모든 타입과는 무관계아다.

```
undefined ≲ void
```

&nbsp; 즉, undefined를 void에는 대입할 수 있지만 그 역은 허용하지 않는다. 이는 함수를 정의할 때를 생각하면 이해가 쉬운데, void형 함수에 return 문은 사실상 return undefined와 동일하기 때문이다. 하지만 이 함수의 반환값이 사용되지 않아야 하므로, 다른 타입에 대입은 불가능하다.

```typescript
function f(): void {
  return undefined; // 정상 작동
}

const x: number = f(); // 'void' 타입은 'number' 타입에 할당할 수 없음

const y: undefined = f(); // 'void' 타입은 'undefined' 타입에 할당할 수 없음
```

---

## Reference

- [infer, never만 보면 두려워지는 당신을 위한 타입 추론 - 기초 타입 이론](https://d2.naver.com/helloworld/9283310)
