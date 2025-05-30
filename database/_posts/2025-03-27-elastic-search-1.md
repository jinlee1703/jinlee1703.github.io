---
layout: post
title: ElasticSearch란 무엇인가?
description: >
  ElasticSearch에 대해 알아보고자 한다.
sitemap: false
hide_last_modified: false
published: true
---

---

* this unordered seed list will be replaced by the toc
{:toc}

---

## 1. ElasticSearch 소개

### 1.1. ElasticSearch의 정의와 역사

ElasticSearch는 Lucene[^1] 기반의 오픈소스 분산형 검색 및 분석 엔진이다. 2010년 Shay Banon에 의해 처음 출시되었으며, 현재는 Elastic 회사에서 개발을 주도하고 있다. 텍스트, 숫자, 지리 정보 등 다양한 유형의 데이터를 저장하고 검색할 수 있으며, 실시간 분석에도 탁월한 성능을 보인다.

ElasticSearch는 처음에 **확장 가능한 검색 엔진의 필요성**에서 시작되었다. 초기 버전부터 분산 시스템 아키텍처를 채택하여 대량의 데이터를 효율적으로 처리할 수 있도록 설계되었다. 필자는 이러한 특징이 빅데이터 시대에 ElasticSearch가 널리 사용되는 주요 이유라고 생각한다.

### 1.2. ELK 스택(ElasticSearch, Logstash, Kibana)의 개요

ElasticSearch는 종종 ELK 스택의 일부로 활용된다. ELK 스택은 아래와 같다.

- **ElasticSearch**: 검색 및 분석 엔진
- **Logstash**: 다양한 소스에서 데이터를 수집하고 변환하는 데이터 파이프라인
- **Kibana**: ElasticSearch의 데이터를 시각화하고 탐색하는 대시보드 도구

이후 Beats라는 경량 데이터 수집기가 추가되면서 BELK 스택 또는 Elastic Stack으로도 불린다. 이 조합은 로그 분석, 시계열 데이터 분석, 보안 분석 등 다양한 사용 사례에 뛰어난 솔루션을 제공한다.

## 2. ElasticSearch의 핵심 특징

### 2.1. 분산 검색 엔진으로서의 특성

ElasticSearch는 기본적으로 **분산 시스템**으로 설계되었다. 여러 노드(서버)에 데이터를 분산 저장하고 처리할 수 있으며, 이를 통해 대량의 데이터도 효율적으로 처리한다. 클러스터 내에서 각 노드는 자동으로 조정되며, 새로운 노드를 추가하거나 제거할 때 데이터가 자동으로 재분배된다.

이러한 분산 특성은 대규모 데이터셋에서도 빠른 검색과 분석을 가능하게 하며, 시스템의 고가용성과 안정성을 보장한다.

### 2.2. 실시간 분석과 검색 기능

ElasticSearch는 거의 실시간(Near Real-Time, NRT) 검색 기능을 제공한다. 문서가 인덱싱된 후 통상 1초 이내에 검색 가능한 상태가 된다. 이는 로그 분석이나 모니터링 같은 **실시간성이 중요한 애플리케이션에 매우 유용**하다.

또한 ElasticSearch는 다양한 검색 기능을 제공한다.

- 전문 검색(Full-text search)
- 구조화된 검색(Structured search)
- 복잡한 쿼리 표현
- 필터링
- 집계 및 분석

### 2.3 RESTful API와 JSON 기반 통신

ElasticSearch는 RESTful API를 통해 모든 작업을 수행한다. HTTP 프로토콜을 사용하여 데이터를 추가, 삭제, 검색, 분석할 수 있으며, 요청과 응답은 모두 JSON 형식으로 이루어진다. 이러한 특성은 다양한 프로그래밍 언어와 환경에서 쉽게 통합할 수 있게 해준다.

아래는 API 예시이다.

```json
GET /my_index/_search
{
  "query": {
    "match": {
      "title": "elasticsearch"
    }
  }
}
```

## 3. ElasticSearch와 관계형 데이터베이스(MySQL) 비교

### 3.1. 데이터 구조와 스키마 차이점

ElasticSearch와 MySQL은 데이터 구조에서 근본적인 차이를 보인다.

| 요소 | ElasticSearch | MySQL |
| --- | --- | --- |
| 기본 단위 | 문서(Document) | 행(Row) |
| 저장 형태 | JSON | 테이블 형식 |
| 변경 유연성 | 동적 매핑 가능 | 스키마 변경 필요 |

ElasticSearch는 **문서 지향적 데이터베이스**로, **각 문서는 자체적으로 완결된 JSON 객체**이다. 반면 MySQL은 구조화된 테이블에 데이터를 저장하며, 스키마 변경에 제약이 있다. ElasticSearch는 스키마를 미리 정의하지 않고도 데이터를 저장할 수 있어 상대적으로 유연성이 높다는 강점을 가지고 있다.

### 3.2. 검색 성능과 확장성 비교

검색 측면에서 ElasticSearch는 MySQL보다 월등한 성능을 보인다.

- ElasticSearch는 역색인(Inverted Index)[^2] 구조를 사용하여 전문 검색에 최적화되어 있다.
- 대량의 텍스트 데이터에서 특정 단어나 구문을 찾는 속도가 매우 빠르다.
- MySQL의 LIKE 검색은 대량 데이터에서 성능이 저하된다.

확장성 측면에서도 ElasticSearch는 수평적 확장(더 많은 서버 추가)이 용이하다. MySQL은 주로 수직적 확장(더 강력한 서버로 업그레이드)에 의존하며, 샤딩이나 클러스터링은 복잡한 설정이 필요하다.

### 3.3 트랜잭션 처리와 ACID 속성

MySQL은 ACID(원자성, 일관성, 고립성, 지속성) 속성을 완전히 지원하여 트랜잭션 처리에 우수하다. 반면 ElasticSearch는 기본적으로 이러한 트랜잭션 기능을 제공하지 않는다.

필자가 만약 시스템을 설계한다면, 금융 거래나 재고 관리와 같이 데이터 정합성이 중요한 시스템에서는 ElasticSearch보다 MySQL을 채택할 것이다.

### 3.4 사용 사례별 적합성

각 데이터베이스의 적합한 사용 사례는 아래와 같다.

#### 3.4.1. ElasticSearch가 적합한 경우

- 로그 데이터 분석
- 전문 검색 기능이 필요한 애플리케이션
- 실시간 데이터 분석
- 대시보드 및 시각화

#### 3.4.2. MySQL이 적합한 경우

- 트랜잭션 처리가 중요한 애플리케이션
- 관계형 데이터 모델이 필요한 경우
- 정규화된 데이터 저장이 필요한 경우
- 엄격한 데이터 일관성이 요구되는 경우

## 4. ElasticSearch와 NoSQL(MongoDB) 비교

### 4.1. 문서 지향적 데이터 저장 방식 비교

ElasticSearch와 MongoDB는 모두 문서 지향적 데이터베이스지만 몇 가지 중요한 차이점이 있다.

- 두 시스템 모두 JSON 형식의 문서를 저장한다.
- MongoDB는 일반적인 문서 저장과 검색에 초점을 맞추고 있다.
- ElasticSearch는 문서 저장뿐만 아니라 고급 검색과 분석에 특화되어 있다.
- MongoDB는 BSON(Binary JSON) 형식으로 데이터를 내부 저장하는 반면, ElasticSearch는 최적화된 내부 형식으로 변환하여 저장[^3]한다.

### 4.2. 쿼리 메커니즘과 검색 능력 차이

특히 검색 기능에서 ElasticSearch는 MongoDB보다 우수한 성능을 보인다.

- ElasticSearch는 Lucene 기반의 강력한 전문 검색 기능을 제공한다.
- 텍스트 분석, 자연어 처리, 유사도 검색 등 고급 검색 기능이 풍부하다.
- MongoDB의 텍스트 검색 기능은 ElasticSearch에 비해 제한적이다.
- ElasticSearch는 다양한 언어에 대한 분석기와 토크나이저를 제공한다.

필자는 복잡한 검색 요구사항이 있을 경우 MongoDB보다 ElasticSearch를 선택하는 것이 적절하다고 판단하였다.

### 4.3. 분산 아키텍처와 확장성 특징

두 시스템 모두 분산 아키텍처를 지원하지만 접근 방식에 사소한 차이가 있다.

- MongoDB는 샤딩을 통한 수평적 확장과 레플리카 셋을 통한 고가용성을 제공한다.
- ElasticSearch는 처음부터 분산 시스템으로 설계되어 샤드와 레플리카 개념이 기본 아키텍처에 내장되어 있다.
- ElasticSearch는 노드 추가/제거 시 자동으로 데이터를 재분배한다.
- MongoDB에서는 샤딩 구성과 관리가 상대적으로 더 복잡[^4]할 수 있다.

### 4.4. 언제 MongoDB 대신 ElasticSearch를 선택해야 하는가?

필자라면 아래 상황에서는 MongoDB 대신 ElasticSearch를 고려할 것이다.

- 검색이 애플리케이션의 핵심 기능인 경우
- 로그 데이터나 시계열 데이터의 분석이 필요한 경우
- 복잡한 전문 검색 쿼리를 자주 수행해야 하는 경우
- 실시간 분석 대시보드가 필요한 경우

반면, 일반적인 CRUD 작업이 주를 이루거나 복잡한 트랜잭션이 필요한 경우에는 MongoDB가 더 적합할 수 있다.

## 5. ElasticSearch의 주요 개념

### 5.1. 인덱스와 타입

ElasticSearch에서 인덱스는 관련된 문서들의 모음이다. 관계형 데이터베이스의 테이블과 유사한 개념이지만, 보다 유연하다. 하나의 ElasticSearch 클러스터는 여러 인덱스를 포함할 수 있다.

타입은 인덱스 내에서 논리적 카테고리/파티션을 의미했으나, ElasticSearch 7.0부터는 타입 개념이 더 이상 사용되지 않으며 인덱스당 하나의 타입만 허용된다. 이는 데이터 모델의 단순화를 위한 결정[^5]이다.

### 5.2. 문서와 필드

문서는 ElasticSearch의 기본 정보 단위로, JSON 형식으로 표현된다. 각 문서는 고유한 ID를 가지며, 여러 필드로 구성된다. 필드는 키-값 쌍으로, 문자열, 숫자, 날짜, 객체 등 다양한 데이터 타입을 지원한다.

아래는 간단한 문서의 예시이다.

```json
{
  "id": "1",
  "title": "ElasticSearch 입문",
  "content": "ElasticSearch는 분산 검색 엔진입니다.",
  "date": "2025-03-27",
  "tags": ["검색", "데이터베이스", "분석"],
  "author": {
    "name": "홍길동",
    "email": "hong@example.com"
  }
}
```

### 5.3. 샤딩과 레플리케이션

샤딩은 데이터를 여러 노드에 분산 저장하는 기술이다. ElasticSearch는 인덱스를 여러 샤드로 나누어 저장하며, 이를 통해 대용량 데이터 처리와 병렬 처리가 가능해진다. 기본적으로 인덱스 생성 시 5개의 기본 샤드가 할당된다(최신 버전에서는 1개로 변경됨).

레플리케이션은 데이터의 복제본을 생성하여 다른 노드에 저장하는 기술이다. 이를 통해 고가용성과 장애 복구 능력을 확보할 수 있다. 기본적으로 각 샤드는 1개의 레플리카를 가진다.

필자는 이러한 샤딩과 레플리케이션 메커니즘이 ElasticSearch의 뛰어난 확장성과 안정성의 기반이라고 생각한다.

### 5.4. 매핑과 분석기

매핑은 인덱스에 저장될 문서의 필드와 데이터 타입을 정의하는 것이다. MySQL의 테이블 스키마와 유사하지만, 더 유연하다. ElasticSearch는 동적 매핑을 지원하여 명시적 정의 없이도 데이터를 인덱싱할 수 있다.

분석기는 문서를 인덱싱하거나 검색할 때 텍스트를 처리하는 방법을 정의한다. 분석기는 문자 필터, 토크나이저, 토큰 필터로 구성되며, 언어별 특성에 맞는 다양한 내장 분석기가 제공된다.

## 6. ElasticSearch의 활용 사례

### 6.1. 전문 검색(Full-text search) 시스템

ElasticSearch는 대규모 문서 컬렉션에서의 검색에 탁월하다. 우리가 웹상에서 흔하게 볼 수 있는 온라인 쇼핑몰, 지식 베이스, 콘텐츠 관리 시스템 등에서 검색 엔진으로 활용된다. 사용자 쿼리에 대한 정확하고 관련성 높은 결과를 빠르게 제공할 수 있다는 장점이 있다.

### 6.2. 로그 분석과 모니터링

ElasticSearch는 로그 데이터 분석을 위한 강력한 도구이다. 서버, 애플리케이션, 네트워크 장비 등에서 생성되는 방대한 양의 로그를 수집, 저장, 분석할 수 있다. Logstash와 Kibana를 함께 사용하면 완벽한 로그 분석 솔루션을 구축할 수 있다.

### 6.3. 비즈니스 인텔리전스와 데이터 분석

ElasticSearch의 강력한 집계 기능은 비즈니스 인텔리전스와 데이터 분석에 활용된다. 대량의 데이터에서 패턴을 발견하고, 통계를 추출하며, 비즈니스 의사 결정에 필요한 인사이트를 제공한다.

### 6.4. 실시간 애플리케이션

ElasticSearch의 거의 실시간 특성은 실시간 모니터링, 이상 감지, 보안 분석 등의 애플리케이션에 적합하다. 예를 들어, 사이버 보안 영역에서는 ElasticSearch를 활용하여 실시간으로 위협을 감지하고 대응할 수 있다.

## 7. ElasticSearch 도입 시 고려사항

### 7.1. 성능 최적화 방안

ElasticSearch의 성능을 최적화하기 위해 고려해야 할 사항은 아래와 같다.

- 적절한 하드웨어 리소스 할당 (특히 메모리와 디스크 I/O)
- 인덱스 설계 최적화
- 매핑 설정 최적화
- 쿼리 최적화
- 인덱싱 성능 튜닝
- 캐싱 전략 수립

### 7.2. 확장성 전략

ElasticSearch 클러스터의 확장성을 위해 고려해야 할 사항은 아래와 같다.

- 적절한 샤드 수 설정
- 데이터 노드와 마스터 노드의 분리
- 클라이언트 노드 활용
- 인덱스 라이프사이클 관리
- 롤링 인덱스 전략 도입

필자는 시스템 설계 초기부터 확장성을 고려한 설계가 중요하다고 생각한다. 특히 샤드 수는 후에 변경이 어려우므로 신중하게 결정해야 한다.

### 7.3. 주의해야 할 제한사항

ElasticSearch 사용 시 주의해야 할 제한사항은 아래와 같다. 만약 해당되는 사항이 있을 경우 다른 솔루션을 사용하는 것을 고려해 보아야 할 것이다.

- 트랜잭션 기능 부재
- 조인 연산의 제한
- 분산 시스템에 따른 일관성 문제 (eventual consistency)
- 메모리 사용량이 많음
- 클러스터 관리의 복잡성

## 8. 결론 및 다음 단계

### 8.1. ElasticSearch의 적합한 사용 환경

ElasticSearch는 대용량 데이터의 검색과 분석이 필요한 환경에 이상적인 솔루션이다. 특히 전문 검색, 로그 분석, 실시간 모니터링과 같은 영역에서 뛰어난 성능을 발휘한다.

관계형 데이터베이스와 비교했을 때 검색 능력과 확장성이 탁월하며, MongoDB와 같은 NoSQL 데이터베이스와 비교했을 때는 검색과 분석 기능이 더 강력하다.

필자는 ElasticSearch를 단독으로 사용하기보다 기존 데이터베이스와 함께 사용하는 것이 효과적이라고 생각한다. 예를 들어, 트랜잭션이 필요한 데이터는 MySQL에 저장하고, 검색이 필요한 데이터는 ElasticSearch에 복제하는 방식을 고려할 수 있다.

### 8.2 다음 포스트 예고: Mac에서 ElasticSearch 설치하기

다음 포스트에서는 Mac 환경에서 ElasticSearch를 설치하고 기본 설정하는 방법에 대해 알아볼 예정이다. Docker를 이용한 설치 방법과 직접 설치하는 방법 모두 다룰 것이며, 기본적인 클러스터 구성과 테스트 방법까지 포함해 볼 계획이다.

ElasticSearch의 기능을 직접 체험해보고 싶은 독자들에게 실질적인 도움이 되고자 한다.

---

[^1]: 아파치 소프트웨어 재단에 의해 지원되는 자바 기반의 정보 검색 라이브러리 오픈 소스 소프트웨어
[^2]: 키워드를 통해 문서를 찾아내는 방식
[^3]: ElasticSearch는 JSON 문서를 내부적으로 최적화된 형식으로 변환하여 저장하고, 이를 통해 역색인을 구축하고, 빠른 전문 검색을 지원함
[^4]: MongoDB의 샤딩은 config 서버, mongos 라우터, 실제 샤드 서버 등 여러 컴포넌트를 필요로 하여 구성이 비교적 복잡
[^5]: 매핑 충돌 문제를 방지하고 데이터 모델을 단순화하기 위한 결정
