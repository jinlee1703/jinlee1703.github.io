---
layout: post
title: Spring Batch - 배치 작업과 스케줄러 연동하기
description: >
  다수의 시스템에서는 대용량 데이터 처리, 정기적인 리포트 생성, 데이터 마이그레이션 등 주기적으로 실행해야 하는 작업들이 많다. 필자 역시도 인턴십 등 서비스 개발을 진행하며 이러한 작업들을 마주하곤 했다. Spring 생태계에서는 이런 반복적인 작업들을 효율적으로 처리하기 위한 도구로 Spring Batch와 Scheduler를 제공한다. 본 글에서는 Spring Batch의 핵심 개념을 소개하고, 이를 Scheduler와 어떻게 효과적으로 연동할 수 있는지 실제 경험을 바탕으로 설명하고자 한다.
sitemap: false
hide_last_modified: false
---

---

* this unordered seed list will be replaced by the toc
{:toc}

## 1. Spring Batch와 Scheduler: 명확히 다른 개념

&nbsp; 필자를 포함한 많은 개발자들이 혼동하는 부분을 명확히 짚고 넘어가고자 한다. **Batch**와 **Schduler**는 서로 다른 개념이다.

### 1.1. Spring Batch: '무엇을' 처리할 것인가

&nbsp; Spring Batch는 **대용량 데이터 처리**를 위한 경량 프레임워크이다. 배치 작업의 실행 흐름, 데이터 처리 방식, 오류 처리 전략 등 '무엇을 어떻게 처리할 것인가'에 중점을 둔다. 주요 특징은 아래와 같다.

- 대용량 데이터의 효율적인 처리를 위한 청크(Chunk) 기반 처리
- 재시작 가능한 작업 (Restartbility)
- 단계별 처리 (Step-by-Step Processing)
- 트랜잭션 관리
- 작업 상태 및 통계 관리

&nbsp; 예를 들면, 수천만 건의 거래 내역을 '집계'하는 로직을 Spring Batch로 구현할 수 있다.

### 1.2. Scheduler: '언제' 실행할 것인가

&nbsp; 반면, Scheduler는 **작업의 실행 시점을 관리하는 도구**이다. 즉 '언제 실행할 것인가'에 중점을 둔다. 대표적인 스케줄러로는 Spring의 내장 Scheduler와 Quartz, cron 등이 있다. 주요 특징은 다음과 같다.

- 주기적 실행 (매일, 매주, 매월 등)
- 특정 시간 실행 (매일 오전 3시 등)
- 조건부 실행 (특정 이벤트 발생 시)
- 작업 실행 관리 (중지, 재개, 취소 등)

&nbsp; 예를 들면, 매일 자정에 특정 작업을 실행하게 하는 것이 Scheduler의 역할이다.ㄴ

## 2. Spring Batch 기본 구조

&nbsp; Spring Batch는 크기 `Job`, `Step`, `ItemReader`, `ItemProcessor`, `ItemWriter`로 구성된다.

### 2.1. Job

### 2.2. Step

### 2.3. ItemReader, ItemProcessor, ItemWriter

## 3. Spring Batch와 Scheduler 연동하기

### 3.1. Spring의 내장 Scheduler 사용

### 3.2. Quartz Scheduler 사용

## 4. 실제 활용 사례

### 4.1. 일일 매출 집계 시스템

### 4.2. 회원 등급 갱신 프로세스

## 5. 주의사항 및 베스트 프랙티스

## 6. 결론

---
