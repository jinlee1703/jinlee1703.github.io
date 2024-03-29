---
layout: post
title: Redis를 활용한 캐싱
description: >
  본 글은 네이버 부스트캠프 과정에서 학습한 내용의 게시글입니다.
sitemap: false
hide_last_modified: true
---

---

## I. 사전 지식 학습

### 1. 캐시

#### 1) 캐시란

&nbsp; 컴퓨터 과학에서 데이터나 값을 미리 복사해 놓는 임시 장소이다.

#### 2) 캐싱을 하는 이유

- 캐시의 접근 시간에 비해 원래 데이터를 접근하는 시간이 오래 걸리는 경우나 값을 다시 계산하는 시간을 절약하고 싶은 경우에 사용
- 캐시에 데이터를 미리 복사해 놓으면 계산이나 접근 시간 없이 더 빠른 속도로 데이터에 접근할 수 있음

#### 3) Cache hit와 Cache miss

- Cache hit (캐시 적중) : 캐시에 데이터가 있을 경우 바로 가져옴 (빠름)
- Cache miss (캐시 미스) : 캐시에 데이터가 없을 경우 DB에서 가져옴 (느림)
- Cache hit ratio (캐시 적중률) :  $H = \frac {캐시에 적중되는 횟수} {전체 액세스 횟수}$

### 2. 지역성

#### 1) 지역성이란

&nbsp; 캐시 적중률이 높아질 수록 평균 액세스 시간은 캐시의 액세스 시간에 근접하게 되고, 이는 캐시 사용의 효과가 더 커진다는 사실을 보여주는 것이다. 캐시 적중률은 프로그램과 데이터의 지역성(locality)에 크게 의존한다.<br>
&nbsp; 지역성은 데이터 접근이 시간적, 혹은 공간적으로 가깝게 일어나는 것을 의미한다. 캐시가 효율적으로 동작하기 위해, 캐시에 저장할 데이터는 지역성을 가져야 한다.

#### 2) **시간적 지역성 (Temporal locality)**

- 특정 데이터가 한번 접근되었을 경우, 가까운 미래에 또 한번 데이터에 접근할 가능성이 높다는 특성
- 메모리 상의 같은 주소에 여러 차례 읽기 쓰기를 수행할 경우 상대적으로 작은 크기의 캐시를 사용해도 효율성을 꾀할 수 있음

#### 3) **공간적 지역성 (Spatial locality)**

- 특정 데이터가 한번 접근되었을 경우, 서로 인접하여 저장되어 있는 데이터들이 연속적으로 액세스될 가능성이 높아진다는 특성
- 이때 메모리 주소를 오름차순이나 내림차순으로 접근한다면, 캐시에 이미 저장된 같은 블록의 데이터를 접근하게 되므로 캐시의 효율성이 크게 향상됨

#### 4) 순차적 지역성 (Sequential locality)

- 분기가 발생하는 비순차적인 실행이 아닌 이상, 명령어들이 메모리에 저장된 순서대로 실행된다는 특성을 이용하여 순차적일수록 데이터가 사용될 가능성이 높다는 특성
- 일반적인 프로그램에서는 순차적 실행과 비순차적 실행의 비율이 대략 5:1 정도라고 함

## II. 캐싱 전략 학습

### 1. 캐싱 전략

#### 1) 캐싱 전략을 세우는 이유

&nbsp; 캐싱 전략은 웹 서비스 환경에서 시스템 성능 향상을 기대할 수 있는 중요한 기술이다. 일반적으로 캐시(Cache)는 메모리(RAM)를 사용하기 때문에 데이터베이스보다 훨씬 빠르게 데이터를 응답할 수 있어 사용자에게 빠르게 서비스를 제공할 수 있다.<br>
&nbsp; 하지만 일반적으로 RAM의 용량은 커봐야 16 ~ 32GB 정도이기 때문에, 데이터를 모두 캐시에 저장해버리면 용량 부족 현상이 일어나 시스템이 다운될 수 있다. 캐시의 용량이 커질 수록 적중률이 높아지지만 비용도 상승하기 때문에 용량과 비용은 상호 조정을 통해 적절히 결정해야 한다.<br>
&nbsp; 그렇기 때문에 **어느 종류**의 데이터를 캐시에 저장할 지, **얼만큼** 데이터를 캐시에 저장할 지, **얼마동안** 오래된 데이터를 캐시에서 제거하는지에 대한 전략을 세울 필요가 있다.

#### 2) 캐싱에 적합한 데이터

- 자주 조회되는 데이터
- 결과값이 자주 변동되지 않고 일정한 데이터
- 조회하는데 연산이 필요한 데이터

#### 3) 데이터 정합성

&nbsp; 어느 한 데이터가 캐시와 데이터베이스 두 곹에서 같은 데이터임에도 불구하고 데이터 정보값이 서로 다른 현상을 말한다. 캐시를 사용하지 않는다면 그냥 데이터베이스에서 데이터를 처리하였기 때문에 문제가 없었지만, 캐시라는 또 다른 데이터 저장소를 이용하게 되면서 같은 종류의 데이터라도 두 저장소에서 저장된 값이 서로 다를 수 있는 현상이 발생하는 것이다.<br>
&nbsp; 따라서 적절한 캐시 읽기 전략(Read Cache Strategy)과 캐시 쓰기 전략(Write Cache Strategy)을 통해, 캐시와 DB간의 데이터 불일치 문제를 극복하면서도 빠른 성능을 읽지 않게 하기 위해 전략을 세울 필요가 있다.

#### 4) Cache Warming

&nbsp; 미리 캐시로 데이터베이스의 데이터를 밀어 넣어두는 작업을 의미한다. 이 작업을 수행하지 않으면 서비스 초기에 트래픽 급증 시 대량의 cache miss가 발생하여 데이터베이스 부하가 급증할 수 있다. 다만, 캐시 자체는 용량이 작아 무한정으로 데이터를 들고 있을 수는 없어 일정시간이 지나면 expire 되는데, 그러면 다시 Thundering Herd가 발생될 수 있기 때문에 캐시의 TTL을 잘 조정할 필요가 있다.<br>
&nbsp; Thundering Herd는 모든 지점에서 발생되는 것이 아닌, 서비스의 첫 페이지와 같은 대부분의 조회가 몰리는 시점에서 주로 발생된다.

### 2. 캐시 읽기 전략 (Read Cache Strategy)

#### 1) Look Aside 패턴

- 데이터를 찾을 때 우선 캐시에 저장된 데이터가 있는지 우선적으로 확인하는 전략
  - 만일 캐시에 데이터가 없으면 DB에서 조회함
- **반복적인 읽기가 많은 호출에 적합**
- 캐시와 DB가 분리되어 가용되기 때문에 **원하는 데이터만 별도로 구성하여 캐시에 저장**
- 캐시와 DB가 분리되어 가용되기 때문에 **캐시 장애 대비 구성**이 되어 있음
  - 만일 캐시가 다운 되더라도 DB에서 데이터를 가져올 수 있어 서비스 자체는 문제가 없음
  - 단 캐시에 붙어있던 connection이 많았다면, redis가 **다운된 순간 순간적으로 DB로 몰려서 부하 발생**
- 장점
  - 캐시에 장애가 발생하더라도 DB에 요청을 전달함으로써 캐시 장애로 인한 서비스 문제를 대비할 수 있음
- 단점
  - 캐시와 데이터베이스 간 정합성 유지 문제가 발생할 수 있음
  - 초기 조회 시 무조건 데이터베이스를 호출해야 함
- 고려사항
  - 단건 호출 빈도가 높은 서비스에 적합하지 않음
  - 반복적으로 동일 쿼리를 수행하는 서비스에 적합
  - Cache Warming을 수행하기도 함

#### 2) Read Through 패턴

- 캐시에서만 데이터를 읽어오는 전략 (inline cache)
- Look Aside와 비슷하지만 **데이터 동기화를 라이브러리 또는 캐시 제공자에게 위임**하는 방식이라는 차이가 있음
  - 캐시에 데이터를 저장하는 주체가 Server 인지, 데이터베이스 인지가 Look Aside와 다름
- 따라서 데이터를 조회하는데 있어 **전체적으로 속도가 느림**
- 장점
  - 캐시와 DB간의 데이터 동기화가 항상 이루어져 데이터 정합성 문제에서 벗어날 수 있음
- 단점
  - 데이터 조회를 전적으로 캐시에만 의지하므로, 캐시가 다운될 경우 **서비스 이용에 차질**이 생길 수 있음.
- 고려사항
  - 읽기가 많은 워크로드에 적합
  - 캐시에 문제가 발생하였을 경우 서비스 전체 중단으로 이어질 수 있기 때문에, redis와 같은 구성 요소를 Replication 또는 Cluster로 구성하여 가용성을 높여야 함
  - Cache Warming을 수행하기도 함

### 3. 캐시 쓰기 전략 (Write Cache Strategy)

#### 1) Write Back 패턴

- 캐시와 DB 동기화를 비동기하기 때문에 동기화 과정이 생략됨
- 데이터를 저장할 대 DB에 바로 쿼리하지 않고, 캐시에 모아서 일정 주기 배치 작업을 통해 DB에 반영
- 캐시에 모아놨다가 DB에 쓰기 때문에 쓰기 쿼리 회수 비용과 부하를 줄일 수 있음
- 장점
  - Write가 빈번하면서 Read를 하는데 많은 양의 Resource가 소모되는 서비스에 적합
  - 데이터 정합성 확보
- 단점
  - 자주 사용되지 않는 불필요한 리소스 저장
  - 캐시에서 오류가 발생하면 데이터를 영구 소실함
- 고려사항
  - 데이터를 저장할 때 DB가 아닌 먼저 캐시에 저장하여 뫃아놓았다가 특정 시점마다 DB로 쓰는 방식으로 캐시가 일종의 Queue 역할을 겸하게 됨
  - 데이터베이스에 장애가 발생하더라도 지속적인 서비스를 제공할 수 있도록 보장하기도 함
  - 캐시에 Replication이나 Cluster 구조를 적용함으로써 캐시의 가용성을 높이는 것이 좋음
  - 읽기 전략인 Read-Through와 결합하여 가장 최근에 업데이트된 데이터를 항상 캐시에서 사용할 수 있는 혼합 워크로드에 적합함

#### 2) Write Through 패턴

- 데이터베이스와 캐시에 동시에 데이터를 저장하는 전략
- 데이터를 저장할 때 먼저 캐시에 저장한 다음 바로 DB에 저장 (모아놓았다가 나중에 저장이 아닌 바로 저장)
- Read Through와 마찬가지로 DB 동기화 작업을 캐시에게 위임
- 장점
  - DB와 캐시가 항상 동기화 되어 있어, 캐시의 데이터는 항상 최신 상태로 유지
  - 캐시와 백업 저장소에 업데이트를 같이 하여 데이터 일관성을 유지할 수 있어서 안정적
  - 데이터 유실이 발생하면 안되는 상황에 적합
- 단점
  - 자주 사용되지 않는 불필요한 리소스 저장
  - 매 요청마다 두 번의 Write가 발생하게 됨으로써 빈번한 생성, 수정이 발생하는 서비스에서는 성능 이슈 발생
  - 기억장치 속도가 느릴 경우, 데이터를 기록할 때 CPU가 대기하는 시간이 필요하기 때문에 성능 감소
- 고려사항
  - 저장할 때마다 2단계 과정을 거쳐지기 때문에 상대적으로 느림
  - 무조건 일단 캐시에 저장을 하기 때문에 캐시에 넣은 데이터를 저장만 하고 사용하지 않을 가능성이 있어서 리소스 낭비 가능성이 있음
  - write throuth 패턴과 write back 패턴 둘 다 모두 자주 사용되지 않는 데이터가 저장되어 리소스 낭비가 발생되는 문제점을 안고 있기 때문에, 이를 해결하기 위해 TTL을 꼭 사용하여 사용되지 않는 데이터를 반드시 삭제해야 함
  - Write-Through 패턴과 Read-Through 패턴을 함께 사용하면, 캐시의 최신 데이터 유지와 더불어 정합성 이점을 얻을 수 있음 (ex: DynamoDB Accelerator(DAX))

#### 3) Write Around 패턴

- Write Through 보다 훨씬 빠름
- 모든 데이터는 DB에 저장 (캐시를 갱신하지 않음)
- Cache miss가 발생하는 경우에만 DB와 캐시에도 데이터를 저장
- 따라서 캐시와 DB 내의 데이터가 다를 수 있음 (데이터 불일치)

## III. 부끄럼 프로젝트에 적용

### 1. 부끄럼에서 캐싱하려는 데이터

#### 1) Object Data

&nbsp; 그림판의 객체들에 관한 데이터로 비정형 데이터이고, 데이터의 읽기/쓰기가 자주 일어난다. Redis에 대해 학습을 한 이유가 이 데이터를 캐싱하려고 한 것이 주 목적이었다.

#### 2) Socket-User Data

&nbsp; 소켓 아이디에 해당되는 사용자의 데이터가 1:1로 저장되는 데이터이다. 데이터의 읽기는 자주 일어나지만 쓰기는 상대적으로 적게 일어나는 편이다.

#### 3) Workspace-User Data

&nbsp; 현재 워크스페이스에 접속하고 있는 사용자의 데이터가 1:N으로 저장되는 데이터이다. 마찬가지로 데이터의 읽기는 자주 일어나지만 쓰기는 상대적으로 적게 일어나는 편이다.

### 2. 각 데이터들의 Redis 적용

#### 1) Object Data

&nbsp; Redis를 통해 캐싱을 하지 않기로 결정했다. 캐싱을 하기 위해 적합한 데이터는 자주 읽히지만, 쓰기가 적게 일어나는 데이터라고 한다. 물론 캐싱을 할 수는 있겠지만, 해당 데이터를 캐싱을 할 경우 쓰기 정책까지 고려해야할 텐데 이는 오히려 캐싱을 적절하게 활용을 못한다고 생각하였다.

#### 2) Socket-User Data

&nbsp; Redis의 set 명령어를 통해 1:1로 매칭시켜주었다. value는 객체였기 때문에 JSON.stringify()와 JSON.parse() 메서드를 사용해서 객체를 직렬화/반직렬화 해주어야 했는데, 이에 대한 간단한 성능 테스트를 진행해본 결과 무리가 없다고 판단하였다.

#### 3) Workspace-User Data

&nbsp; Redis rpush 명령어를 통해 1:N으로 매칭시켜주었다. 이 데이터 역시 value는 객체였기 때문에 JSON.stringify()와 JSON.parse() 메서드를 사용해서 객체를 직렬화/반직렬화해주었다. rpush 명령어는 배열을 저장하는 방식인데 [”obj1”, “obj2”, …]와 같이 배열의 가장 오른쪽에 push해주는 명령어이다(key가 존재하지 않을 경우에는 하나의 원소를 가진 배열을 생성해준다). 조회는 lrange 명령어를 통해서 조회를 진행하였는데, `lrange key 0 -1` 명령어를 사용하면 해당 key에 대한 모든 리스트를 출력한다.

---

### Reference

- [https://ko.wikipedia.org/wiki/캐시](https://ko.wikipedia.org/wiki/%EC%BA%90%EC%8B%9C)
- [https://inpa.tistory.com/entry/REDIS-📚-캐시Cache-설계-전략-지침-총정리](https://inpa.tistory.com/entry/REDIS-%F0%9F%93%9A-%EC%BA%90%EC%8B%9CCache-%EC%84%A4%EA%B3%84-%EC%A0%84%EB%9E%B5-%EC%A7%80%EC%B9%A8-%EC%B4%9D%EC%A0%95%EB%A6%AC)
- 김종현, [컴퓨터구조론(개정5판)], 생능출판
- <https://ellune.tistory.com/72>
