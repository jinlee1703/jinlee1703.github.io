---
layout: post
title: Project Loom 실험기
description: >
  필자는 강남언니(힐링페이퍼)의 기술블로그를 읽고 이벤트 소싱 패턴에 대해 관심을 가지게 되었고, 이에 대한 학습을 진행하면서 기존의 Platform Thread와 Virtual Thread에 대해 비교하는 글을 정리해보기로 하였다.
sitemap: false
hide_last_modified: false
published: true
---

---

* this unordered seed list will be replaced by the toc
{:toc}

## 1. 서론

동시성 프로그래밍은 혀낻 서버 애플리케이션에서 핵심적인 주제이다. 기존의 Java는 운영체제 스레드 기반인 `Platform Thread` 방식을 사용해왔지만, 이는 스레드 수 증가 시 높은 메모리 사용량과 컨텍스트 스위칭 비용 문제를 안고 있었다. 이러한 문제를 해결하기 위해 Java 21에서는 Project Loom이 정식 도입되어 Virtual Thread라는 새로운 모델을 제시하였다.
필자는 이번 글에서 Virtual Thread와 Platform Thread를 비교 실험하여 동시성 처리 방식의 변화를 체감하고자 한다.

## 2. 본문

### 3.1. Platform Thread vs Virtual Thread

두 방식을 표로 비교해보자.

| 구분 | Platform Thread | Virtual Thread |
| --- | --- | --- |
| 실행 단위 | OS 스레드 | JVM 내부 경량 스레드 |
| 생성 비용 | 무겁다 (MB 단위 스택 메모리) | 가볍다 (KB 단위 스택 메모리) |
| 컨텍스트 스위칭 | OS 레벨에서 발생 | JVM 레벨에서 관리 |
| 동시 실행 수 | 수천 개 수준 한계 | 수십만 개도 가능 |
| 적합한 작업 | CPU 바운드 | I/O 바운드 |

즉, Virtual Thread는 대규모 동시성 처리를 위한 경량 스레드 모델로, 특히 I/O 대기 시간이 많은 애플리케이션에서 강력한 이점을 발휘할 수 있다.

### 3.2. I/O 바운드 vs CPU 바운드

- **I/O 바운드**: 작업의 대부분 시간이 I/O 대기(네트워크, DB, 파일 입출력 등)에 소요된다. CPU는 대기 시간 동안 쉬고 있기 때문에 스레드를 효율적으로 교체하면 성능이 향상된다.
- **CPU 바운드**: 계산(연산) 자체가 시간이 오래 걸리는 경우. CPU 점유가 길어지므로 Virtual Thread의 장점은 줄어든다.

### 3.3. 실험 코드

아래 코드는 Spring Boot 애플리케이션에서 Platform Thread와 Virtual Thread를 각각 이용해 500개의 I/O 바운드 작업을 실행한 예시이다.

```java
@GetMapping("/concurrency/loom-demo")
public String loomDemo() {
    int taskCount = 500;

    // Platform threads
    Instant start1 = Instant.now();
    ExecutorService platformExecutor = Executors.newFixedThreadPool(100);
    try {
        platformExecutor.invokeAll(
                IntStream.range(0, taskCount)
                        .mapToObj(i -> (Callable<String>) () -> slowJob(i))
                        .toList()
        );
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
    } finally {
        platformExecutor.shutdown();
    }
    long platformTime = Duration.between(start1, Instant.now()).toMillis();

    // Virtual threads
    Instant start2 = Instant.now();
    try (var virtualExecutor = Executors.newVirtualThreadPerTaskExecutor()) {
        virtualExecutor.invokeAll(
                IntStream.range(0, taskCount)
                        .mapToObj(i -> (Callable<String>) () -> slowJob(i))
                        .toList()
        );
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
    }
    long virtualTime = Duration.between(start2, Instant.now()).toMillis();

    return "Platform threads: " + platformTime + "ms, Virtual threads: " + virtualTime + "ms";
}
```

### 3.4. 실험 결과 분석

테스트 결과는 아래와 같다.

| 실행 방식            | 실행 시간 (ms) |
| ---------------- | ---------- |
| Platform threads | 524ms      |
| Virtual threads  | 120ms      |

> Virtual Thread가 동일한 I/O 바운드 작업에서 약 4배 이상 빠른 성능을 보였다.

### 3.5. 결과 해석

#### 왜 Virtual Thread가 더 빠른가?

Virtual Thread는 I/O 대기 시 즉시 다른 작업으로 스케줄링을 넘긴다. 즉, 스레드가 블로킹 되더라도 JVM이 내부적으로 관리하여 대규모 동시서응ㄹ 저비용으로 처리할 수 있다.

#### CPU 바운드 상황에서는?

CPU 연산이 주가 되는 경우에는 Virtual Thread와 Platform Thread 간 차이가 크지 않다. '실제 서비스에서는 I/O 바운드 작업이 많기 때문에 Virtual Thread가 특히 유리하지 않을까'라고 유추된다.

## 4. 결론 및 인사이트

본 실험을 통해 Virtual Thread가 I/O 바운드 상황에서 기존 Platform Thread보다 훨씬 효율적임을 확인하였다.
특히 DB 쿼리, 외부 API 호출, 파일 입출력처럼 대기 시간이 긴 작업이 많은 웹 애플리케이션에서는 Virtual Thread가 서버 리소스 절약 및 응답 지연 단축에 기여할 수 있다.

다만 아래와 같은 점에 유의해야 한다.

1. CPU 바운드 작업에서는 큰 성능 차이가 없으며, 오히려 조율 비용이 생길 수 있음을 유의해야 한다.
2. Spring, Hibernate 등 기존 프레임워크와의 호환성은 계속 개선 중이므로 적용 전 충분한 테스트가 필요하다.
3. Virtual Thread는 "블로킹 코드를 논블로킹처럼 다룰 수 있다"는 장점이 있지만, 잘못 설계된 코드 구조는 여전히 병목을 만들 수 있음을 주의해야 한다.

## 5. 참고 자료

- [GitHub: loom-java](https://github.com/loom/loom-java)
- [강남언니 기술블로그: [SaaS] 시간여행이 가능한 시스템 아키텍처](https://blog.gangnamunni.com/post/saas-event-sourcing)