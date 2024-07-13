---
layout: post
title: JS - Currying function
description: >
  .
sitemap: false
hide_last_modified: false
---

---

## Background

팀원들과 코드 리뷰를 진행하던 중 '함수형 프로그래밍 언어들은 함수를 반환할 수 있다. 커링과 유사한 개념을 활용해 보아라.'라는 피드백을 받았다. 이를 이해하기 위해 Currying이라는 개념을 탐구하게 되었고, 그 결과를 이 글로 정리하게 되었다.

## Define

&nbsp; `Currying`은 함수형 프로그래밍에서 등장하는 개념 중 하나로, 여러 개의 인자를 받는 함수를 인자 하나를 받는 함수들의 연속으로 변환하는 기법을 의미한다. 쉽게 말해, 원래는 여러 개의 인자를 받아야 하는 함수를 하나의 인자만 받는 함수들로 쪼개어 나가는 방식이다.<br>

&nbsp; 커링은 고차 함수(higher-order function)와 밀접한 관련이 있는데, 고차 함수는 함수를 인수로 받거나 함수를 반환하는 함수이다. 커링은 고차 함수의 일종이다.

## Example code

```javascript
// 일반적인 함수
function add(x, y) {
  return x + y;
}

console.log(add(2, 3)); // 출력: 5

// Currying을 적용한 함수
function curriedAdd(x) {
  return function (y) {
    return x + y;
  };
}

const addTwo = curriedAdd(2);
console.log(addTwo(3)); // 출력: 5

// 혹은 한 줄로 표현할 수도 있음
const curriedAdd = (x) => (y) => x + y;

console.log(curriedAdd(2)(3)); // 출력: 5
```

### `add` 함수

&nbsp; 두 개의 인자 `x`와 `y`를 받아서 더하는 일반적인 함수

### `curriedAdd` 함수

&nbsp; 하나의 인자 `x`를 받아서 또 다른 함수(그 안에서 `y`를 받아서 처리)를 반환하는 형태로 변환된 것을 볼 수 있다. 이렇게 변환된 함수는 인자를 하나씩 따로 받을 수 있다.

## Advantages

1. **재사용성 증가**: 부분적으로 적용된 함수를 쉽게 재사용할 수 있다.
2. **가독성 향상**: 특정 인자가 고정된 상태로 함수를 호출할 수 있어 코드가 더 명확해진다.
3. **함수 조합**: 작은 함수들을 조합하여 더 복잡한 로직을 구성할 수 있다.
4. **지연 평가(Lazy evauluation)**: 커링된 함수는 일부 인수만으로도 호출이 가능하고, 나머지 인수들은 나중에 제공할 수 있다.

## Usecase

&nbsp; 실제 프로그래밍 사례를 통해 조금 더 살펴보자.

### 1. 로그 함수

```javascript
const log = (level) => (message) => console.log(`[${level}] ${message}`);

const infoLog = log("INFO");
const errorLog = log("ERROR");

infoLog("Application started"); // 출력: [INFO] Application started
errorLog("An error occurred"); // 출력: [ERROR] An error occurred
```

&nbsp; 이 예제는 커링(currying)을 사용한 로그 함수를 정의한다.<br>

&nbsp; log 함수는 두 개의 인자(level과 message)를 받지만, 이를 두 단계로 나눠 받도록 구현하였다. `log('INFO')` 호출은 새로운 함수를 반환하며, 이 함수는 메시지를 인자로 받아 로그를 출력한다. `infoLog`와 `errorLog`는 각각 'INFO'와 'ERROR' 레벨이 미리 설정된 로그 함수이다.

### 2. HTTP 요청 함수

```javascript
const httpRequest = (method) => (url) => (data) => {
  console.log(`Making ${method} request to ${url} with data:`, data);
};

const getRequest = httpRequest("GET");
const postRequest = httpRequest("POST");

const getUserData = getRequest("/api/user");
getUserData({ id: 1 }); // 출력: Making GET request to /api/user with data: {id: 1}

postRequest("/api/user")({ name: "John", age: 30 });
// 출력: Making POST request to /api/user with data: {name: 'John', age: 30}
```

&nbsp; 이 예제는 커링을 사용해 HTTP 요청 함수를 정의한다. `httpRequest` 함수는 세 개의 인자(method, url, data)를 세 단계로 나눠 받는다. getRequest와 postRequest는 각각 'GET'과 'POST' 메소드가 미리 설정된 요청 함수이다.<br>

## Summary

&nbsp; 커링은 함수형 프로그래밍의 강력한 도구로, 함수의 인수를 부분적으로 적용하여 새로운 함수를 생성하고 재사용성을 높일 수 있다. 이를 통해 코드의 가독성과 유지보수성을 향상시킬 수 있다. 다양한 언어와 라이브러리에서 커링을 지원하므로, 필요에 따라 커링을 활용해보면 보다 나은 코드를 작성할 수 있을 것으로 판단된다.
