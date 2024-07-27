---
layout: post
title: RxJS와 Promise, Observable - 비동기 프로그래밍의 차이점과 활용
description: >
  .
sitemap: false
hide_last_modified: false
---

---

## Background

&nbsp; 이전에 다른 사람이 작성한 NestJS 코드를 보다가 `firstValueFrom`과 `lastValueFrom` 함수가 있다는 것을 알게 되었다. 이를 찾아보던 중 필자가 비동기 프로그래밍에 대해 보다 깊이 있는 이해가 필요하다는 것을 깨닫게 되었고, 이를 정리하고자 한다.

---

## Contents

### RxJS

&nbsp; `RXJS(Reactive Extensions for JavaScript`는 비동기 프로그래밍을 위한 강력한 라이브러리이다. observable sequences와 연산자를 사용하여 데이터 스트림을 쉽게 처리할 수있게 해준다. 이를 통해 이벤트 기반 프로그래밍, 비동기 호출, 데이터 스트림 등을 단순하고 효율적으로 처리할 수 있다.

### Promise

&nbsp; `Promise`는 비동기 작업의 완료 또는 실패를 나타내는 객체이다. 비동기 작업이 완료되면 결과 값을 반환하거나, 오류가 발생하면 그 이유를 알려준다. Promise는 다음 세 가지 상태를 가질 수 있다.

- `Pending`: 대기중인 상태
- `Fulfilled`: 작업이 성공적으로 완료된 상태
- `Rejected`: 작업이 실패한 상태

#### Promise 사용 예시

```javascript
const myPromise = new Promise((resolve, reject) => {
  setTimeout(() => resolve("Promise resolved!"), 1000);
});
myPromise.then((value) => console.log(value));
```

&nbsp; 1초 후에 `Promise resolved!`라는 문자열이 콘솔에 출력된다.

### Observable

&nbsp; `Observable`은 RxJS의 핵심 개념으로, 데이터 스트림을 나타낸다. 시간이 지남에 다라 여러 값을 방출할 수 있으며, 구독(subscribe)하여 각 값을 처리할 수 있다. Observable은 다음 네 가지 중요 기능을 제공한다.

- `Next`: 새로운 값을 방출
- `Error`: 오류 발생 시 통지
- `Complete`: 모든 값 방출 시 통지
- `Subscribe`: Observable의 방출된 값을 구독하고 처리

#### Observable 사용 예시

```javascript
import { Observable } from "rxjs";

const myObservable = new Observable((observer) => {
  setTimeout(() => observer.next("Observable value 1"), 1000);
  setTimeout(() => observer.next("Observable value 2"), 2000);
  setTimeout(() => observer.complete(), 3000);
});

myObservable.subscribe({
  next(value) {
    console.log(value);
  },
  complete() {
    console.log("Observable complete!");
  },
});
```

&nbsp; 1초 후에 `Observable value 1`, 2초 후에 `Observable value 2`를 출력하며, 3초 후에 `Observable complete!`이 출력된다.

### Promise vs. Observable

- `Promise`: 단일 비동기 작업을 처리하며, 한 번만 값을 반환한다.
- `Observable`: 여러 값을 스트림으로 처리할 수 있으며, 구독자가 이를 실시간으로 처리할 수 있다. 이는 이벤트 기반 시스템, 실시간 데이터 업데이트, 스트리밍 데이터 등에 유용하다.

### toPromise, firstValueFrom, lastValueFrom

- `toPromise`: observable을 promise로 변환한다. 첫 번째 값을 resolve하여 완료도니다. (RxJS 7부터 deprecated 됨)
- `firstValueFrom`: observable의 첫 번째 값을 반환하는 promise를 만든다. `toPromise`의 직접적인 대체제이다.
- `lastValueFrom`: observable이 완료될 때 마지막 값을 반환하는 promise를 만든다.

#### 사용 예시

```javascript
import { firstValueFrom, lastValueFrom } from "rxjs";

// Observable 생성
const myObservable = new Observable((observer) => {
  setTimeout(() => observer.next("First value"), 1000);
  setTimeout(() => observer.next("Second value"), 2000);
  setTimeout(() => observer.complete(), 3000);
});

// firstValueFrom 예시
const firstValue = await firstValueFrom(myObservable);
console.log(firstValue); // 1초 후 'First value' 출력

// lastValueFrom 예시
const lastValue = await lastValueFrom(myObservable);
console.log(lastValue); // 3초 후 'Second value' 출력
```

- `firstValueFrom`: 첫 번째 값을 반환하여 1초 후에 First value를 출력한다.
- `lastValueFrom` 마지막 값을 반환하여 3초 후에 Second value를 출력한다.

---

## Summary

&nbsp; RxJS와 Promise, Observable을 사용하면 비동기 프로그래밍을 간단하게 구현할 수 있다. 각각의 특성과 장점을 이해하고 상황에 맞게 사용한다면, 더 효율적이고 관리하기 쉬운 비동기 코드를 작성할 수 있다. 특히 RxJS를 사용한다면 복잡한 비동기 작업을 매우 간단하게 처리할 수 있어 유용하다.
