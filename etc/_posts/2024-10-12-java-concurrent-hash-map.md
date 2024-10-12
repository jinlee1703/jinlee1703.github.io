---
layout: post
title: 앱 광고 (우리 서비스에 적합한 광고 매체는 무엇일까)
description: >
  최근 프로젝트에서 인증 코드 저장을 위해 Redis와 자바의 자료구조인 ConcurrentHashMap 중 ConcurrentHashMap을 사용하기로 결정하였고, 이에 대한 깊은 이해를 위해 게시글을 작성하게 되었다.
sitemap: false
hide_last_modified: false
---

---

## 1. 소개

### 1.1. 멀티스레드 환경에서의 동시성 문제

<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h3>1. 멀티스레드 동시성 문제</h3>
  <div style="display: flex; justify-content: space-between; align-items: center; height: 300px; position: relative; border: 2px solid #ddd; padding: 20px; border-radius: 10px; background-color: #f9f9f9;">
    <div style="width: 30%; height: 100%; display: flex; flex-direction: column; justify-content: space-around; border: 2px solid #4CAF50; border-radius: 5px; padding: 10px; background-color: #E8F5E9;">
      <div style="font-weight: bold; text-align: center; margin-bottom: 10px; color: #2E7D32;">Thread 1</div>
      <div style="background-color: white; border: 1px solid #81C784; border-radius: 3px; padding: 5px; margin: 5px 0; text-align: center;">Read: 100</div>
      <div style="background-color: white; border: 1px solid #81C784; border-radius: 3px; padding: 5px; margin: 5px 0; text-align: center;">Add 50</div>
      <div style="background-color: white; border: 1px solid #81C784; border-radius: 3px; padding: 5px; margin: 5px 0; text-align: center;">Write: 150</div>
    </div>
    <div style="width: 25%; height: 60%; border: 2px solid #2196F3; border-radius: 50%; display: flex; flex-direction: column; justify-content: center; align-items: center; background-color: #E3F2FD; position: relative;">
      <div style="font-weight: bold; margin-bottom: 10px; color: #1565C0;">Shared Resource</div>
      <div style="font-size: 24px; font-weight: bold; color: #0D47A1;">100</div>
      <div style="position: absolute; width: 0; height: 0; border-top: 15px solid transparent; border-bottom: 15px solid transparent; left: -20px; border-right: 20px solid #2196F3;"></div>
      <div style="position: absolute; width: 0; height: 0; border-top: 15px solid transparent; border-bottom: 15px solid transparent; right: -20px; border-left: 20px solid #2196F3;"></div>
    </div>
    <div style="width: 30%; height: 100%; display: flex; flex-direction: column; justify-content: space-around; border: 2px solid #4CAF50; border-radius: 5px; padding: 10px; background-color: #E8F5E9;">
      <div style="font-weight: bold; text-align: center; margin-bottom: 10px; color: #2E7D32;">Thread 2</div>
      <div style="background-color: white; border: 1px solid #81C784; border-radius: 3px; padding: 5px; margin: 5px 0; text-align: center;">Read: 100</div>
      <div style="background-color: white; border: 1px solid #81C784; border-radius: 3px; padding: 5px; margin: 5px 0; text-align: center;">Add 30</div>
      <div style="background-color: white; border: 1px solid #81C784; border-radius: 3px; padding: 5px; margin: 5px 0; text-align: center;">Write: 130</div>
    </div>
    <div style="position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); background-color: #FF5252; color: white; padding: 10px 20px; border-radius: 20px; font-weight: bold;">동시 접근 충돌!</div>
  </div>
</div>

&nbsp; 멀티스레드 프로그래밍은 현대 소프트웨어 개발에서 필수적인 요소이다. 하지만 여러 스레드가 동시에 같은 데이터에 접근할 때 발생하는 동시성 문제의 경우에는 개발자들에게 큰 도전 과제 중 하나이다. 데이터 불일치, 레이스 컨디션, 데드락 등의 문제가 발생할 수 있어 신중한 접근이 필요하다.

### 1.2. HashMap과 HashTable의 한계

&nbsp; Java에서 전통적으로 사용되던 HashMap은 동기화되지 않아 멀티스레드 환경에서 안전하지 않다. 반면 Hashtable의 경우에는 모든 메서드에 synchronized 키워드를 사용하여 동기화하지만, 이로 인해 성능이 크게 저하된다. 이러한 하계를 극복하기 위해 ConcurrentHashMap이 등장했다.<br><br>
&nbsp; 이전에 [필자가 작성한 게시글](https://jinlee.kr/web/2023-10-19-hash-map-and-hash-table/)을 참고하여도 좋을 것 같다.

## 2. ConcurrentHashMap 개요

### 2.1. ConcurrentHashMap의 탄생 배경

&nbsp; ConcurrentHashMap은 Java 5에서 처음 도입되었다. 기존의 동기화된 컬렉션들의 성능 문제를 해결하고, 동시성과 확장성을 개선하기 위해 설계되었다.

### 2.2. 주요 특징 및 장점

- `세밀한 락킹`: 전체 맵이 아닌 일부분만 락을 걸어 동시성을 높인다.
- `락-프리 읽기 연산`: 대부분의 읽기 작업에서 락을 사용하지 않아 성능이 향상된다.
- `원자적 업데이트 연산`: 복합 연산을 원자적으로 수행할 수 있는 메서드를 제공한다.
- `확장성`: 동시에 많은 스레드가 접근해도 좋은 성능을 유지한다.

## 3. ConcurrentHashMap의 내부 구조

### 3.1. 세그먼트 개념 (Java 7 이전)

<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="border: 2px solid #ddd; padding: 15px; border-radius: 10px;">
    <div style="display: flex; flex-direction: column; align-items: center;">
      <div style="font-weight: bold; margin-bottom: 10px;">ConcurrentHashMap (Java 7)</div>
      <div style="display: flex; justify-content: space-around; width: 100%; margin-bottom: 15px;">
        <div style="background-color: #2196F3; color: white; padding: 5px; border-radius: 5px; width: 30%;">Segment 1</div>
        <div style="background-color: #2196F3; color: white; padding: 5px; border-radius: 5px; width: 30%;">Segment 2</div>
        <div style="background-color: #2196F3; color: white; padding: 5px; border-radius: 5px; width: 30%;">Segment 3</div>
      </div>
      <div style="display: flex; justify-content: space-around; width: 100%;">
        <div style="width: 30%;">
          <div style="background-color: #4CAF50; color: white; padding: 5px; border-radius: 5px; margin-bottom: 5px;">버킷 1</div>
          <div style="background-color: #4CAF50; color: white; padding: 5px; border-radius: 5px;">버킷 2</div>
        </div>
        <div style="width: 30%;">
          <div style="background-color: #4CAF50; color: white; padding: 5px; border-radius: 5px; margin-bottom: 5px;">버킷 1</div>
          <div style="background-color: #4CAF50; color: white; padding: 5px; border-radius: 5px;">버킷 2</div>
        </div>
        <div style="width: 30%;">
          <div style="background-color: #4CAF50; color: white; padding: 5px; border-radius: 5px; margin-bottom: 5px;">버킷 1</div>
          <div style="background-color: #4CAF50; color: white; padding: 5px; border-radius: 5px;">버킷 2</div>
        </div>
      </div>
      <div style="margin-top: 15px; text-align: center; font-style: italic;">
        각 세그먼트마다 별도의 락을 사용
      </div>
    </div>
  </div>
  <p style="text-align: justify; margin-top: 15px;">
    Java 7 이전의 ConcurrentHashMap은 세그먼트라는 개념을 사용했다. 맵을 여러 개의 세그먼트로 나누고, 각 세그먼트마다 별도의 락을 사용했다. 이를 통해 스레드가 서로 다른 세그먼트에 동시에 접근할 수 있었다.
  </p>
</div>

&nbsp; Java 7 이전의 ConcurrentHashMap은 세그먼트라는 개념을 사용했다. 맵을 여러 개의 세그먼트로 나누고, 각 세그먼트마다 별도의 락을 사용했다. 이를 통해 스레드가 서로 다른 세그먼트에 동시에 접근할 수 있었다.

### 3.2. 노드 기반 구조 (Java 8 이후)

<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="border: 2px solid #ddd; padding: 15px; border-radius: 10px;">
    <div style="display: flex; flex-direction: column; align-items: center;">
      <div style="font-weight: bold; margin-bottom: 10px;">ConcurrentHashMap (Java 8+)</div>
      <div style="display: flex; justify-content: space-around; width: 100%; margin-bottom: 15px;">
        <div style="background-color: #FF9800; color: white; padding: 5px; border-radius: 5px; width: 23%;">버킷 1</div>
        <div style="background-color: #FF9800; color: white; padding: 5px; border-radius: 5px; width: 23%;">버킷 2</div>
        <div style="background-color: #FF9800; color: white; padding: 5px; border-radius: 5px; width: 23%;">버킷 3</div>
        <div style="background-color: #FF9800; color: white; padding: 5px; border-radius: 5px; width: 23%;">버킷 4</div>
      </div>
      <div style="display: flex; justify-content: space-around; width: 100%;">
        <div style="width: 23%;">
          <div style="background-color: #9C27B0; color: white; padding: 5px; border-radius: 5px; margin-bottom: 5px;">노드</div>
        </div>
        <div style="width: 23%;">
          <div style="background-color: #9C27B0; color: white; padding: 5px; border-radius: 5px; margin-bottom: 5px;">노드</div>
          <div style="background-color: #9C27B0; color: white; padding: 5px; border-radius: 5px; margin-bottom: 5px;">노드</div>
        </div>
        <div style="width: 23%;">
          <div style="background-color: #E91E63; color: white; padding: 5px; border-radius: 5px; margin-bottom: 5px;">트리 루트</div>
        </div>
        <div style="width: 23%;">
          <div style="background-color: #9C27B0; color: white; padding: 5px; border-radius: 5px; margin-bottom: 5px;">노드</div>
        </div>
      </div>
      <div style="margin-top: 15px; text-align: center; font-style: italic;">
        노드 기반 구조, 연결 리스트 또는 레드-블랙 트리 사용
      </div>
    </div>
  </div>
  <p style="text-align: justify; margin-top: 15px;">
    Java 8 부터는 세그먼트 대신 노드 기반의 구조를 사용한다. 각 버킷이 하나의 노드를 가리키며, 해시 충돌 시 연결 리스트나 레드-블랙 트리를 사용한다. 이 구조는 더욱 세밀한 락킹을 가능하게 하며, 메모리 사용량도 줄였다.
  </p>
  <p style="text-align: justify;">
    필자는 이러한 구조적 변화를 통해 ConcurrentHashMap의 성능과 확장성을 크게 향상시켰다고 본다.
  </p>
</div>

&nbsp; Java 8 부터는 세그먼트 대신 노드 기반의 구조를 사용한다. 각 버킷이 하나의 노드를 가리키며, 해시 충돌 시 연결 리스트나 레드-블랙 트리르 사용한다. 이 구조는 더욱 세밀한 락킹을 가능하게 하며, 메모리 사용량도 줄였다.<br><br>
&nbsp; 필자는 이러한 구조적 변화를 통해 ConcurrentHashMap의 성능과 확장성을 크게 향상시켰다고 본다.

## 4. 동시성 제어 메커니즘

### 4.1. 세그먼트 락킹 (Java 7 이전)

&nbsp; Java 7 이전에는 각 세그먼트마다 ReentrantLock을 사용했다. 특정 세그먼트에 접근할 때만 해당 세그먼트의 락을 획득하여 작업을 수행했다.

### 4.2. CAS(Compare-and-Swap) 연산 (Java 8 이후)

<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="display: flex; flex-direction: column; align-items: center; border: 2px solid #ddd; padding: 20px; border-radius: 10px;">
    <div style="width: 200px; padding: 10px; margin: 10px; background-color: #4CAF50; color: white; text-align: center; border-radius: 5px;">시작</div>
    <div style="width: 0; height: 30px; border-left: 2px solid #333;"></div>
    <div style="width: 200px; padding: 10px; margin: 10px; background-color: #2196F3; color: white; text-align: center; border-radius: 5px;">현재 값 읽기</div>
    <div style="width: 0; height: 30px; border-left: 2px solid #333;"></div>
    <div style="width: 200px; padding: 10px; margin: 10px; background-color: #2196F3; color: white; text-align: center; border-radius: 5px;">새 값 계산</div>
    <div style="width: 0; height: 30px; border-left: 2px solid #333;"></div>
    <div style="width: 250px; padding: 10px; margin: 10px; background-color: #FFC107; color: black; text-align: center; border-radius: 5px;">현재 값 == 예상 값?</div>
    <div style="display: flex; justify-content: space-between; width: 300px;">
      <div style="display: flex; flex-direction: column; align-items: center;">
        <div style="width: 0; height: 30px; border-left: 2px solid #333;"></div>
        <div style="width: 100px; padding: 10px; margin: 10px; background-color: #4CAF50; color: white; text-align: center; border-radius: 5px;">Yes</div>
        <div style="width: 0; height: 30px; border-left: 2px solid #333;"></div>
        <div style="width: 100px; padding: 10px; margin: 10px; background-color: #2196F3; color: white; text-align: center; border-radius: 5px;">값 갱신</div>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center;">
        <div style="width: 0; height: 30px; border-left: 2px solid #333;"></div>
        <div style="width: 100px; padding: 10px; margin: 10px; background-color: #F44336; color: white; text-align: center; border-radius: 5px;">No</div>
        <div style="width: 0; height: 30px; border-left: 2px solid #333;"></div>
        <div style="width: 100px; padding: 10px; margin: 10px; background-color: #2196F3; color: white; text-align: center; border-radius: 5px;">재시도</div>
      </div>
    </div>
    <div style="width: 0; height: 30px; border-left: 2px solid #333;"></div>
    <div style="width: 200px; padding: 10px; margin: 10px; background-color: #4CAF50; color: white; text-align: center; border-radius: 5px;">종료</div>
  </div>
</div>

&nbsp; Java 8부터는 CAS 연산을 주로 사용한다. CAS는 락을 사용하지 않고도 원자적 업데이트를 가능하게 하는 저수준 연산이다.

### 4.3. 세밀한 락킹 전략

&nbsp; 노드 기반 구조에서는 각 버킷 단위로 락을 사용할 수 있어, 더욱 세밀한 동시성 제어가 가능하다.

### 4.4. 읽기 작업의 락-프리(lock-free) 구현

&nbsp; 대부분의 읽기 작업은 락을 사용하지 않고 수행된다. 이는 높은 동시성과 성능을 제공한다.

## 5. 주요 연산의 동시성 처리

<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="display: flex; justify-content: space-around; border: 2px solid #ddd; padding: 20px; border-radius: 10px;">
    <div style="width: 30%;">
      <h4 style="text-align: center;">put</h4>
      <div style="display: flex; flex-direction: column; align-items: center;">
        <div style="width: 100px; padding: 5px; margin: 5px; background-color: #4CAF50; color: white; text-align: center; border-radius: 5px;">시작</div>
        <div style="width: 0; height: 20px; border-left: 2px solid #333;"></div>
        <div style="width: 100px; padding: 5px; margin: 5px; background-color: #2196F3; color: white; text-align: center; border-radius: 5px;">해시 계산</div>
        <div style="width: 0; height: 20px; border-left: 2px solid #333;"></div>
        <div style="width: 100px; padding: 5px; margin: 5px; background-color: #2196F3; color: white; text-align: center; border-radius: 5px;">버킷 찾기</div>
        <div style="width: 0; height: 20px; border-left: 2px solid #333;"></div>
        <div style="width: 100px; padding: 5px; margin: 5px; background-color: #FFC107; color: black; text-align: center; border-radius: 5px;">CAS 연산</div>
        <div style="width: 0; height: 20px; border-left: 2px solid #333;"></div>
        <div style="width: 100px; padding: 5px; margin: 5px; background-color: #4CAF50; color: white; text-align: center; border-radius: 5px;">종료</div>
      </div>
    </div>
    <div style="width: 30%;">
      <h4 style="text-align: center;">get</h4>
      <div style="display: flex; flex-direction: column; align-items: center;">
        <div style="width: 100px; padding: 5px; margin: 5px; background-color: #4CAF50; color: white; text-align: center; border-radius: 5px;">시작</div>
        <div style="width: 0; height: 20px; border-left: 2px solid #333;"></div>
        <div style="width: 100px; padding: 5px; margin: 5px; background-color: #2196F3; color: white; text-align: center; border-radius: 5px;">해시 계산</div>
        <div style="width: 0; height: 20px; border-left: 2px solid #333;"></div>
        <div style="width: 100px; padding: 5px; margin: 5px; background-color: #2196F3; color: white; text-align: center; border-radius: 5px;">버킷 찾기</div>
        <div style="width: 0; height: 20px; border-left: 2px solid #333;"></div>
        <div style="width: 100px; padding: 5px; margin: 5px; background-color: #2196F3; color: white; text-align: center; border-radius: 5px;">값 반환</div>
        <div style="width: 0; height: 20px; border-left: 2px solid #333;"></div>
        <div style="width: 100px; padding: 5px; margin: 5px; background-color: #4CAF50; color: white; text-align: center; border-radius: 5px;">종료</div>
      </div>
    </div>
    <div style="width: 30%;">
      <h4 style="text-align: center;">remove</h4>
      <div style="display: flex; flex-direction: column; align-items: center;">
        <div style="width: 100px; padding: 5px; margin: 5px; background-color: #4CAF50; color: white; text-align: center; border-radius: 5px;">시작</div>
        <div style="width: 0; height: 20px; border-left: 2px solid #333;"></div>
        <div style="width: 100px; padding: 5px; margin: 5px; background-color: #2196F3; color: white; text-align: center; border-radius: 5px;">해시 계산</div>
        <div style="width: 0; height: 20px; border-left: 2px solid #333;"></div>
        <div style="width: 100px; padding: 5px; margin: 5px; background-color: #2196F3; color: white; text-align: center; border-radius: 5px;">버킷 찾기</div>
        <div style="width: 0; height: 20px; border-left: 2px solid #333;"></div>
        <div style="width: 100px; padding: 5px; margin: 5px; background-color: #FFC107; color: black; text-align: center; border-radius: 5px;">CAS 연산</div>
        <div style="width: 0; height: 20px; border-left: 2px solid #333;"></div>
        <div style="width: 100px; padding: 5px; margin: 5px; background-color: #4CAF50; color: white; text-align: center; border-radius: 5px;">종료</div>
      </div>
    </div>
  </div>
</div>

### 5.1. put 연산

&nbsp; put 연산은 해당 버킷에 대해 동기화를 수행한다. 비어있는 버킷에 새 노드를 삽입할 때는 CAS 연산을 사용하며, 기존 노드가 있을 경우 해당 버킷에 대한 락을 획득한다.

### 5.2. get 연산

&nbsp; get 연산은 기본적으로 락을 사용하지 않는다. volatile 변수를 사용하여 최신 값을 읽어오며 최신 값을 읽어오며, 필요한 경우에만 동기화 배리어를 사용한다.

### 5.3. remove 연산

&nbsp; remove 연산은 put과 유사하게 동작한다. 해당 버킷에 대한 락을 획득한 후 노드를 제거한다.

### 5.4. size 연산

&nbsp; size 연산은 맵의 전체 크기를 계산한다. 정확한 크기를 얻기 위해 모든 버킷에 락을 걸어야 하므로, 비용이 큰 연산이다. 대신 추정치를 반환하는 빠른 버전의 메서드도 제공한다.

## 6. 성능 최적화 기법

### 6.1. 리사이징 최적화

<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="display: flex; flex-direction: column; align-items: center; border: 2px solid #ddd; padding: 20px; border-radius: 10px;">
    <div style="width: 400px; padding: 10px; margin: 10px; background-color: #2196F3; color: white; text-align: center; border-radius: 5px;">임계값 도달: 리사이징 시작</div>
    <div style="width: 0; height: 30px; border-left: 2px solid #333;"></div>
    <div style="width: 400px; padding: 10px; margin: 10px; background-color: #4CAF50; color: white; text-align: center; border-radius: 5px;">새로운 크기의 배열 생성</div>
    <div style="width: 0; height: 30px; border-left: 2px solid #333;"></div>
    <div style="width: 400px; padding: 10px; margin: 10px; background-color: #FFC107; color: black; text-align: center; border-radius: 5px;">기존 배열을 청크로 분할</div>
    <div style="width: 0; height: 30px; border-left: 2px solid #333;"></div>
    <div style="width: 400px; padding: 10px; margin: 10px; background-color: #FF5722; color: white; text-align: center; border-radius: 5px;">각 청크를 새 배열로 이동 (병렬 처리)</div>
    <div style="width: 0; height: 30px; border-left: 2px solid #333;"></div>
    <div style="width: 400px; padding: 10px; margin: 10px; background-color: #9C27B0; color: white; text-align: center; border-radius: 5px;">기존 배열 참조를 새 배열로 변경</div>
    <div style="width: 0; height: 30px; border-left: 2px solid #333;"></div>
    <div style="width: 400px; padding: 10px; margin: 10px; background-color: #2196F3; color: white; text-align: center; border-radius: 5px;">리사이징 완료</div>
  </div>
</div>

&nbsp; ConcurrentHashMap은 리사이징 과정에서도 다른 스레드의 읽기/쓰기 작업을 허용한다. 리사이징은 점진적으로 수행되며, 전체 맵에 대한 락을 사용하지 않는다.

### 6.2. 읽기 연산 최적화

&nbsp; volatile 변수와 메모리 배리어를 사용하여 락 없이도 최신 값을 읽을 수 있도록 최적화되어 있다.

### 6.3. 쓰기 연산 최적화

&nbsp; CAS 연산과 세밀한 락킹을 통해 쓰기 연산의 동시성을 최대화한다.

## 7. ConcurrentHashMap의 API와 사용 패턴

<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
  <div style="display: flex; justify-content: center; border: 2px solid #ddd; padding: 20px; border-radius: 10px;">
    <div style="display: flex; flex-direction: column;">
      <div style="background-color: #2196F3; color: white; padding: 10px; border-radius: 5px; text-align: center; font-weight: bold;">ConcurrentHashMap</div>
      <div style="display: flex; justify-content: space-around; margin-top: 20px;">
        <div style="display: flex; flex-direction: column; align-items: center;">
          <div style="background-color: #4CAF50; color: white; padding: 5px; border-radius: 5px; text-align: center; width: 120px;">기본 연산</div>
          <div style="border-left: 2px solid #4CAF50; height: 20px;"></div>
          <div style="background-color: #81C784; color: white; padding: 5px; border-radius: 5px; text-align: center; width: 100px; margin: 5px;">put()</div>
          <div style="background-color: #81C784; color: white; padding: 5px; border-radius: 5px; text-align: center; width: 100px; margin: 5px;">get()</div>
          <div style="background-color: #81C784; color: white; padding: 5px; border-radius: 5px; text-align: center; width: 100px; margin: 5px;">remove()</div>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center;">
          <div style="background-color: #FFC107; color: black; padding: 5px; border-radius: 5px; text-align: center; width: 120px;">원자적 연산</div>
          <div style="border-left: 2px solid #FFC107; height: 20px;"></div>
          <div style="background-color: #FFD54F; color: black; padding: 5px; border-radius: 5px; text-align: center; width: 100px; margin: 5px;">putIfAbsent()</div>
          <div style="background-color: #FFD54F; color: black; padding: 5px; border-radius: 5px; text-align: center; width: 100px; margin: 5px;">replace()</div>
          <div style="background-color: #FFD54F; color: black; padding: 5px; border-radius: 5px; text-align: center; width: 100px; margin: 5px;">remove()</div>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center;">
          <div style="background-color: #9C27B0; color: white; padding: 5px; border-radius: 5px; text-align: center; width: 120px;">대량 연산</div>
          <div style="border-left: 2px solid #9C27B0; height: 20px;"></div>
          <div style="background-color: #BA68C8; color: white; padding: 5px; border-radius: 5px; text-align: center; width: 100px; margin: 5px;">forEach()</div>
          <div style="background-color: #BA68C8; color: white; padding: 5px; border-radius: 5px; text-align: center; width: 100px; margin: 5px;">search()</div>
          <div style="background-color: #BA68C8; color: white; padding: 5px; border-radius: 5px; text-align: center; width: 100px; margin: 5px;">reduce()</div>
        </div>
      </div>
    </div>
  </div>
</div>

### 7.1. 기본 API 소개

&nbsp; ConcurrentHashMap은 기본적인 Map 인터페이스 메서드(`put`, `get`, `remove` 등)를 제공한다.

### 7.2. 원자성 연산 메서드

&nbsp; `putIfAbset`, `replace`, `computeIfAbsent` 등의 원자적 연산 메서드를 제공한다. 이들은 복합 연사을 안전하게 수행할 수 있게 해준다.

### 7.3. 벌크 연산과 스트림 지원

&nbsp; Java 8부터는 `forEach`, `reduce`, `search` 등의 벌크 연산과 스트림 API를 지원한다.

## 8. 실제 사용 사례 및 성능 비교

<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="border: 2px solid #ddd; padding: 20px; border-radius: 10px;">
    <div style="display: flex; justify-content: space-between; height: 200px; position: relative;">
      <div style="display: flex; flex-direction: column; justify-content: flex-end; align-items: center; width: 30%;">
        <div style="background-color: #2196F3; width: 100%; height: 60%;"></div>
        <div style="margin-top: 10px;">HashMap</div>
      </div>
      <div style="display: flex; flex-direction: column; justify-content: flex-end; align-items: center; width: 30%;">
        <div style="background-color: #FFC107; width: 100%; height: 40%;"></div>
        <div style="margin-top: 10px;">Hashtable</div>
      </div>
      <div style="display: flex; flex-direction: column; justify-content: flex-end; align-items: center; width: 30%;">
        <div style="background-color: #4CAF50; width: 100%; height: 80%;"></div>
        <div style="margin-top: 10px;">ConcurrentHashMap</div>
      </div>
      <div style="position: absolute; left: -30px; bottom: 0; top: 0; display: flex; flex-direction: column; justify-content: space-between;">
        <div>성능</div>
        <div>높음</div>
        <div></div>
        <div></div>
        <div>낮음</div>
      </div>
    </div>
    <div style="text-align: center; margin-top: 20px;">동시성 처리</div>
  </div>
</div>

### 8.1. 캐시 구현

&nbsp; ConcurrentHashMap은 멀티스레드 환경에서의 캐시 구현에 적합하다. 높은 동시성과 좋은 성능을 제공한다.

### 8.2. 공유 데이터 저장소

&nbsp; 여러 스레드가 동시에 접근하는 공유 데이터 저장소로 사용될 수 있다.

### 8.3. HashMap, Hashtable과의 성능 비교

&nbsp; 일반적으로 ConcurrentHashMap은 Hashtable보다 훨씬 좋은 성능을 보이며, 멀티스레드 환경에서는 HashMap보다 안전하고 효율적이다.

## 9. 주의사항 및 모범 사례

### 9.1. Null 키/값 사용 금지

&nbsp; ConcurrentHashMap은 null 키와 값을 허용하지 않는다. 이는 동시성 문제를 방지하기 위함이다.

### 9.2. 반복자(Iterator) 사용 시 주의점

&nbsp; 반복자는 `fail-safe`이며, 생성 시점의 맵의 상태를 반영하다. 반복 중 맵이 변경되어도 `ConcurrentModificationException`이 발생하지 않는다.

### 9.3. 동시성 레벨 설정

&nbsp; Java 7 이전 버전에서는 생성자를 통해 동시성 레벨(세그먼트 수)을 설정할 수 있었다. Java 8 이후로는 이 설정이 무시된다.

## 10. Java 버전별 ConcurrentHashMap의 변화

### 10.1. Java 7에서의 구현

&nbsp; 세그먼트 기반 구조를 사용했으며, 기본적으로 16개의 세그먼트를 가졌다.

### 10.2. Java 8에서의 개선사항

&nbsp; 노드 기반 구조로 변경되었으며, 레드-블랙 트리를 도입하여 해시 충돌 시 성능을 개선했다.

### 10.3. 최신 Java 버전에서의 추가 기능

&nbsp; Java 9 이후로 적은 원소 수에 대한 최적화, 직렬화 개선 등의 기능이 추가되었다.

## 11. 결론

<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="border: 2px solid #ddd; padding: 20px; border-radius: 10px; background-color: #f0f0f0;">
    <div style="text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #2196F3;">ConcurrentHashMap</div>
    <div style="display: flex; justify-content: space-around; margin-bottom: 20px;">
      <div style="background-color: #4CAF50; color: white; padding: 10px; border-radius: 5px; width: 45%;">
        <div style="font-weight: bold; margin-bottom: 5px;">장점</div>
        <ul style="list-style-type: none; padding-left: 0;">
          <li>높은 동시성</li>
          <li>스레드 안전</li>
          <li>빠른 성능</li>
        </ul>
      </div>
      <div style="background-color: #FFC107; color: black; padding: 10px; border-radius: 5px; width: 45%;">
        <div style="font-weight: bold; margin-bottom: 5px;">활용 분야</div>
        <ul style="list-style-type: none; padding-left: 0;">
          <li>멀티스레드 환경</li>
          <li>캐시 구현</li>
          <li>고성능 애플리케이션</li>
        </ul>
      </div>
    </div>
    <div style="text-align: center; font-style: italic; color: #666;">
      "동시성과 성능을 모두 잡는 최적의 선택"
    </div>
  </div>
</div>

### 11.1. ConcurrentHashMap의 중요성

&nbsp; ConcurrentHashMap은 멀티스레드 환경에서 안전하고 효율적인 데이터 구조로, 현대 Java 프로그래밍에서 중요한 역할을 한다.

### 11.2. 멀티스레드 프로그래밍에서의 할용

&nbsp; 적절히 사용한다면 동시성 문제를 해결하면서도 높은 성능을 얻을 수 있어, 멀티스레드 프로그래밍에서 매우 유용하다.
