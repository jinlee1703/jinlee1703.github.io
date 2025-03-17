---
layout: post
title: Spring Batch - 배치 작업과 스케줄러 연동하기
description: >
  다수의 시스템에서는 대용량 데이터 처리, 정기적인 리포트 생성, 데이터 마이그레이션 등 주기적으로 실행해야 하는 작업들이 많다. 필자 역시도 인턴십 등 서비스 개발을 진행하며 이러한 작업들을 마주하곤 했다. Spring 생태계에서는 이런 반복적인 작업들을 효율적으로 처리하기 위한 도구로 Spring Batch와 Scheduler를 제공한다. 본 글에서는 Spring Batch의 핵심 개념을 소개하고, 이를 Scheduler와 어떻게 효과적으로 연동할 수 있는지 실제 경험을 바탕으로 설명하고자 한다.
sitemap: false
hide_last_modified: false
toc: true
---

---

## 1. Spring Batch와 Scheduler: 명확히 다른 개념

### 1.1. Spring Batch: '무엇을' 처리할 것인가

### 1.2. Scheduler: '언제' 실행할 것인가

## 2. Spring Batch 기본 구조

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
