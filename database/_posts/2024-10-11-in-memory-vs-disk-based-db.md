---
layout: post
title: 인메모리 vs 디스크 기반 데이터베이스
description: >
  최근 프로젝트에서 인증 코드 저장에 Redis와 MySQL 중 어느 것을 사용할지 고민하게 되었다. 이 글은 두 시스템을 비교 분석하여 팀원들과 최적의 선택을 논의하기 위해 작성하게 되었다.
sitemap: false
hide_last_modified: true
---

---

## 1. 서론

### 1.1. 데이터베이스의 중요성

&nbsp; 현대 사회에서 데이터베이스는 정보 관리의 핵심 요소로 자리 잡았다. 기업, 정부, 그리고 개인의 일상생활에 이르기까지 데이터베이스는 우리 삶의 모든 영역에 깊숙이 관여하고 있다. 효율적인 데이터 저장, 검색, 그리고 분석은 현대 비즈니스의 성공을 좌우하는 매우 중요한 요소가 되었다.

### 1.2. 데이터베이스 분류의 다양한 기준들

&nbsp; 데이터베이스는 다양한 기준에 따라 분류될 수 있다. 이러한 분류를 이해한다면, 각 데이터베이스의 특성과 용도를 이해하는 데 도움이 될 것 이다. 필자의 경우에는 이 글을 통해서 데이터 저장 위치에 따른 분류에 초점을 맞추고자 한다. 하지만 먼저 다른 분류 방식들을 간략히 살펴보는 것이 전체적인 맥락을 이해하는 데 도움이 될 것으로 판단하였다.

## 2. 데이터베이스 분류 방식 개요

&nbsp; 데이터베이스는 아래와 같은 다양한 기준으로 분류될 수 있다.

### 2.1. 데이터 모델에 따른 분류

- 관계형 데이터베이스 (RDBMS): MySQL, PostgreSQL
- NoSQL 데이터베이스: MongoDB, Cassandra

### 2.2. 사용 목적에 다른 분류

- 트랜잭션 처리용 (OLTP): Oracle, SQL Server
- 분석용 (OLAP): Snowflake, Amazon Redshift

### 2.3. 배포 모델에 따른 분류

- 온프레미스 데이터베이스
- 클라우드 데이터베이스

### 2.4. 확장 방식에 따른 분류

- 수직 확장(Scale-up) 데이터베이스
- 수평 확장(Scale-out) 데이터베이스

### 2.5. 오픈 소스 여부에 따른 분류

- 오픈 소스 데이터베이스: MySQL, PostgreSQL
- 상용 데이터베이스: Oracle, Microsoft SQL Server

&nbsp; 위와 같은 다양한 분류 방식 중, 필자는 '데이터 저장 위치에 따른 분류'에 초점을 맞추고자 한다.

## 3. 데이터 저장 위치에 따른 분류: 심층 분석

<div style="display: flex; justify-content: space-around; margin-bottom: 20px;">
    <div style="text-align: center;">
        <div style="width: 200px; height: 100px; background-color: #FFB3BA; border: 2px solid #FF6B6B; display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
            <span style="font-weight: bold;">메모리 (RAM)</span>
        </div>
        <div style="font-weight: bold;">인메모리 DB</div>
    </div>
    <div style="text-align: center;">
        <div style="width: 200px; height: 50px; background-color: #BAFFC9; border: 2px solid #69B578; display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
            <span style="font-weight: bold;">메모리 (RAM)</span>
        </div>
        <div style="width: 200px; height: 50px; background-color: #BAE1FF; border: 2px solid #5DA2D5; display: flex; align-items: center; justify-content: center;">
            <span style="font-weight: bold;">디스크</span>
        </div>
        <div style="font-weight: bold;">디스크 기반 DB</div>
    </div>
</div>

&nbsp; 데이터베이스는 데이터를 저장하는 위치에 따라 크게 두 가지로 나눌 수 있다. `인메모리 데이터베이스`와 `디스크 기반 데이터베이스`이다. 각각의 특징과 장단점을 자세히 살펴보자.

### 3.1. 인메모리 데이터베이스 (In-Memory DB)

#### 3.1.1. 정의 및 작동 원리

&nbsp; 인메모리 데이터베이스는 모든 데이터베이스를 주 메모리(RAM)에 저장하고 관리하는 데이터베이스 시스템이다. 이는 디스크 접근 없이 빠른 데이터 처리를 가능하게 한다.

#### 3.1.2. 주요 특징

- 초고속 데이터 접근 및 처리
- 실시간 분석에 적합
- 메모리 용량에 따른 확장성 제한
- 전원 차단 시 데이터 손실 위험

#### 3.1.3. 장점 및 단점

- **장점**
  - 매우 빠른 읽기/쓰기 속도
  - 낮은 지연 시간
  - 실시간 데이터 처리에 적합
- **단점**
  - 상대적으로 높은 비용
  - 메모리 용량의 제한
  - 휘발성 메모리로 인한 데이터 지속성 문제

#### 3.1.4. 대표적인 인메모리 DB: Redis, Memcached

&nbsp; `Redis`와 `Memcached`가 가장 널리 사용되는 인메모리 데이터베이스이다. Redis는 Key-Value 구조 외에도 다양한 데이터 구조를 지원하며, Memcached는 단순하고 빠른 Key-Value 저장소로 사용된다.

#### 3.1.5. 적합한 사용 사례

- 실시간 분석 및 보고
- 세션 관리
- 캐싱
- 실시간 추천 시스템

### 3.2. 디스크 기반 데이터베이스 (Disk-based DB)

#### 3.2.1. 정의와 작동 원리

&nbsp; 디스크 기반 데이터베이스는 데이터를 하드 디스크나 SSD와 같은 영구 저장 장치에 저장하는 시스템이다. 데이터의 지속성과 대용량 저장이 가능하다.

#### 3.2.2. 주요 특징

- 대용량 데이터 저장 가능
- 데이터 지속성 보장
- 상대적으로 느린 접근 속도
- 복잡한 쿼리 처리 가능

#### 3.2.3. 장점 및 단점

- **장점**
  - 대용량 데이터 저장
  - 데이터 지속성 및 내구성
  - 비용 효율적
  - 복잡한 트랜잭션 처리 가능
- **단점**
  - 상대적으로 느린 READ/WRITE 속도
  - 디스크 I/O로 인한 성능 병목 현상

#### 3.2.4. 대표적인 디스크 기반 DB: MySQL, PostgreSQL

&nbsp; `MySQL`과 `PostgreSQL`은 가장 널리 사용되는 오픈 소스 관계형 데이터베이스 관리 시스템(RDBMS)이다. 이들은 강력한 SQL 지원과 ACID 속성을 제공한다.

#### 3.2.5. 적합한 사용 사례

- 트랜잭션 중심의 비즈니스 애플리케이션
- 대용량 데이터 저장 및 분석
- 복잡한 관계를 가진 데이터 관리
- 장기 데이터 보관이 필요한 시스템

## 4. 인메모리 DB vs 디스크 기반 DB 비교 분석

### 4.1. 컴퓨터 구조와 데이터 접근 속도

<div style="width: 500px; margin: 20px auto; font-family: Arial, sans-serif;">
    <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <div style="width: 120px; height: 60px; background-color: #FFB3BA; border: 2px solid #FF6B6B; display: flex; align-items: center; justify-content: center; font-weight: bold;">
            CPU
        </div>
        <div style="width: 120px; height: 60px; background-color: #BAFFC9; border: 2px solid #69B578; display: flex; align-items: center; justify-content: center; font-weight: bold;">
            메모리 (RAM)
        </div>
    </div>
    <div style="display: flex; justify-content: center; margin-bottom: 20px;">
        <div style="width: 300px; height: 40px; background-color: #BAE1FF; border: 2px solid #5DA2D5; display: flex; align-items: center; justify-content: center; font-weight: bold;">
            시스템 버스
        </div>
    </div>
    <div style="display: flex; justify-content: center;">
        <div style="width: 200px; height: 60px; background-color: #FFFFBA; border: 2px solid #FFFF6B; display: flex; align-items: center; justify-content: center; font-weight: bold;">
            하드 디스크 (HDD/SSD)
        </div>
    </div>
</div>

&nbsp; 컴퓨터의 주요 구성 요소와 그들 간의 관계를 이해하면 인메모리 데이터베이스가 디스크 기반 데이터베이스보다 빠른 이유를 쉽게 이해할 수 있다.

1. `CPU(중앙처리장치)`: 컴퓨터의 "두뇌"로, 모든 계산과 데이터 처리를 수행한다.
2. `메모리 (RAM)`: CPU가 직접 접근할 수 있는 고속 저장 장치이다. 현재 실행 중인 프로그램과 처리 중인 데이터를 저장한다.
3. `시스템  버스`: CPU, 메모리, 그리고 다른 하드웨어 구성 요소들 사이에서 데이터를 전송하는 통로이다.
4. `하드 디스크 (HDD/SDD)`: 대용량 데이터를 영구적으로 저장하는 장치이다. CPU가 직접 접근할 수 없으며, 데이터를 읽거나 쓰려면 먼저 메모리로 전송해야 한다.

#### 4.1.1. 데이터 접근 속도 비교

- 메모리 접근
  - CPU는 메모리에 직접 접근할 수 있다.
  - 접근 속도: 나노초 (10^-9초) 단위
- 디스크 접근
  - CPU가 디스크의 데이터에 접근하려면 여러 단계를 거쳐야 한다.
    - 디스크에서 데이터를 읽음
    - 시스템 버스를 통해 데이터를 메모리로 전송
    - 메모리에서 CPU가 데이터에 접근
  - 접근 속도: 밀리초 (10^-3초) 단위 (SSD의 경우 마이크로초 10^-6초 단위)

&nbsp; 이러한 구조적 차이로 인해 인메모리 데이터베이스는 디스크 기반 데이터베이스보다 훨씬 빠른 데이터 접근 및 처리 속도를 제공할 수 있다. 인메모리 데이터베이스는 모든 데이터를 RAM에 저장하므로 CPU가 즉시 접근할 수 있지만, 디스크 기반 데이터베이스는 데이터를 디스크에서 메모리로 로드하는 추가적인 단계가 필요하다.

### 4.2. 성능 및 지연 시간

<div style="width: 400px; height: 300px; margin: 20px auto;">
    <div style="display: flex; height: 100%;">
        <div style="width: 50px; writing-mode: vertical-rl; text-orientation: mixed; text-align: center; padding: 10px;">
            성능 (처리량)
        </div>
        <div style="flex-grow: 1;">
            <div style="height: 80%; background-color: #FFB3BA; display: flex; align-items: flex-end; margin-bottom: 10px;">
                <div style="width: 100%; height: 90%; background-color: #FF6B6B;"></div>
            </div>
            <div style="text-align: center;">인메모리 DB</div>
        </div>
        <div style="flex-grow: 1;">
            <div style="height: 80%; background-color: #BAFFC9; display: flex; align-items: flex-end; margin-bottom: 10px;">
                <div style="width: 100%; height: 30%; background-color: #69B578;"></div>
            </div>
            <div style="text-align: center;">디스크 기반 DB</div>
        </div>
    </div>
</div>

&nbsp; 인메모리 DB는 디스크 기반 DB에 비해 압도적으로 빠른 성능을 보인다. 밀리초 단위의 응답 시간을 제공하며, 실시간 데이터 처리에 적합하다. 반면 디스크 기반 DB는 상대적으로 느리지만, 대용량 데이터를 안정적으로 처리할 수 있다.

### 4.3. 데이터 지속성과 내구성

&nbsp; 디스크 기반 DB는 데이터의 지속성 내구성에서 우위를 가진다. 전원이 꺼져도 데이터가 유지되며, 다양한 백업 및 복구 옵션을 제공한다. 인메모리 DB는 기본적으로 휘발성이지만, 영속성을 위한 옵션(예: Rdis의 AOF, RDB)를 지원한다.

### 4.4. 확장성과 용량

&nbsp; 디스크 기반 DB는 테라바이트, 페타바이트 단위의 대용량 데이터를 저장할 수 있다. 인메모리 DB는 메모리 용량의 제한을 받지만, 클러스터링을 통해 수평적 확장이 가능하다.

### 4.5. 비용 효율성

&nbsp; 일반적으로 디스크 저장이 메모리 저장보다 저렴하다. 따라서 대용량 데이터를 다룰 때는 디스크 기반 DB가 비용 효율적이다. 그러나 고성능이 필요한 경우, 인메모리 DB의 투자 비용이 정당화될 수 있다.

### 4.6. 데이터 일관성 및 트랜잭션 지원

&nbsp; 디스크 기반 RDBMS는 강력한 ACID 속성과 복잡한 트랜잭션 지원한다. 인메모리 DB도 트랜잭션을 지원하지만, 일부 시스템에서는 제한적일 수 있다.

### 4.7. 복구 및 백업 방식

&nbsp; 디스크 기반 DB는 다양하고 강력한 백업 및 복구 옵션을 제공한다. 인메모리 DB도 스냅샷이나 로그 기반의 백업을 지원하지만, 대규모 데이터의 경우 복구 시간이 길어질 수 있다.

## 5. 하이브리드 접근: 두 시스템의 장점을 결합

<div style="width: 400px; margin: 20px auto; text-align: center;">
    <div style="background-color: #FFB3BA; border: 2px solid #FF6B6B; padding: 10px; margin-bottom: 10px;">
        <span style="font-weight: bold;">인메모리 DB (캐시 계층)</span>
    </div>
    <div style="font-size: 24px; margin-bottom: 10px;">↕️</div>
    <div style="background-color: #BAE1FF; border: 2px solid #5DA2D5; padding: 10px;">
        <span style="font-weight: bold;">디스크 기반 DB (영구 저장소)</span>
    </div>
</div>

### 5.1. 캐싱 계층으로서의 인메모리 DB 활용

&nbsp; 많은 시스템에서 인메모리 DB를 디스크 기반 DB의 캐시 계층으로 사용한다. 이 방식은 빠른 읽기 성능과 데이터 지속성을 동시에 얻을 수 있다.

### 5.2. 디스크 기반 DB의 인메모리 최적화 기능

&nbsp; 최신 디스크 기반 DB 시스템들은 인메모리 기능을 포함하고 있다. 예를 들어, MySQL의 InnoDB 버퍼 풀이나 PostgreSQL의 공유 버퍼는 자주 접근하는 데이터를 메모리에 캐시한다.

### 5.3. 하이브리드 아키텍처의 실제 사례

&nbsp; 많은 대규모 웹 서비스들이 Redis나 Memcached를 MySQL이나 PostgreSQL과 함께 사용하여 성능을 최적화하고 있다. 이러한 하이브리드 접근은 높은 처리량과 낮은 지연 시간을 동시에 달성할 수 있게 한다.

## 6. 클라우드 환경에서의 인메모리 및 디스크 기반 DB

### 6.1. AWS ElastiCache (Redis, Memcahced)

&nbsp; AWS ElastiCache는 완전 관리형 인메모리 데이터 스토어 서비스로, Redis와 Memcached를 지원한다. 이를 통해 사용자는 인프라 관리 부담 없이 고성능 인메모리 DB를 사용할 수 있다.

### 6.2. AWS RDS (MySQL, PostgreSQL 등)

&nbsp; AWS RDS는 관계형 데이터베이스를 위한 관리형 서비스로, MySQL, PostgreSQL, Oracle 등 당야한 DB 엔진을 지원한다. 자동 백업, 패치 관리, 확장성 등의 추가 기능도 사용할 수 있다.

### 6.3. 클라우드 관리형 서비스의 이점과 고려사항

&nbsp; 클라우드 관리형 서비스는 개발자 입장에서 운영 부담을 크게 줄이고, 탄력적인 확장성을 제공한다. 하지만 벤더 종속성과 데이터 주권 문제 등을 고려해야 한다.

## 7. 데이터베이스 선택 가이드

### 7.1. 애플리케이션 요구사항 분석

&nbsp; 데이터베이스 선택 시 가장 중요한 것은 애플리케이션의 요구사항을 정확히 파악하는 것이다. 데이터의 특성, 처리 패턴, 성능 요구사항 등을 면밀히 분석해야 한다.

### 7.2. 성능 vs 데이터 지속성 우선순위 결정

&nbsp; 실시간 처리가 중요한 경우 인메모리 DB가 적합할 수 있다. 반면, 데이터의 안정성과 지속성이 중요하다면 디스크 기반 DB가 더 나은 선택이 될 수 있다.

### 7.3. 비용 대비 효과 분석

&nbsp; 인메모리 솔루션은 높은 성능을 제공하지만 비용도 높다. 따라서 성능 향상으로 인한 익과 비용을 균형있게 고려해야 한다.

### 7.4. 미래 확장성 고려

&nbsp; 비즈니스 성장에 따른 데이터 증가와 처리량 증가를 예측하고, 이에 대응할 수 있는 확장성을 가진 솔루션을 선택해야 한다.

## 8. 결론

### 8.1. 인메모리와 디스크 기반 DB의 상호보완적 관계

&nbsp; 인메모리 DB와 디스크 기반 DB는 각각의 장단점을 가지고 있으며, 많은 경우 이 둘을 조합하여 사용하는 것이 최적의 해결책이 될 수 있다.

### 8.2. 기술 발전에 따른 경계의 모호화

&nbsp; 최신 데이터베이스 시스템들은 인메모리와 디스크 기반 기술을 혼합하여 사용하는 경향이 있다. 이로 인해 두 유형의 명확한 구분이 점점 모호해지고 있다.

### 8.3. 미래 전망: 새로운 저장 기술의 등장과 영향

&nbsp; 비휘발성 메모리(NVMe) 등 새로운 저장 기술의 등장은 데이터베이스 기술의 새로운 지평을 열고 있다. 이러한 기술은 인메모리의 속도와 디스크의 지속성을 동시에 제공할 수 있는 잠재력을 가지고 있다.<br><br>
&nbsp; 데이터베이스 기술은 계속해서 진화하고 있으며, 개발자와 아키텍트는 이러한 변화를 주시하고 적절히 대응해야 한다. 올바른 데이터베이스 선택은 애플리케이션의 성공에 결정적인 역할을 할 수 있으므로, 신중하고 체계적인 접근이 필요하다.
