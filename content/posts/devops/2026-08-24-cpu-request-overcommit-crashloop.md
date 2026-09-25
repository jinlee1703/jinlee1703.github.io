---
title: 개발계 오버커밋 배포 장애 회고
date: '2026-08-24'
category: devops
published: true
description: 개발계 백엔드 20개 서비스의 CPU request를 낮추자 배포가 Progressing 상태에서 끝나지 않았다. 스케줄러가 request만 보고 한 노드에 파드를 몰아 배치했고, 동시에 부팅한 JVM들이 CPU를 제대로 받지 못해 CrashLoop이 반복됐다. 노드별 재시작 분포로 원인을 확인하고 재발 방지 방법을 정리했다.
---

---


## 0. request와 limit, 그리고 오버커밋

&nbsp; 우리 백엔드 서비스들은 쿠버네티스(k8s) 위에서 돌아간다. 각 서비스는 컨테이너로 패키징되어 파드(쿠버네티스가 배포하고 관리하는 가장 작은 실행 단위) 형태로 뜨고, 파드는 노드(파드가 실제로 올라가 돌아가는 서버)에 배치된다. 새로 만든 파드를 어느 노드에 놓을지는 쿠버네티스의 스케줄러가 정한다.

<svg viewBox="0 0 700 240" role="img" aria-labelledby="k8s-t k8s-d" style="max-width:100%;height:auto;font-family:inherit;display:block;margin:1.5rem auto">
  <title id="k8s-t">스케줄러가 파드를 노드에 배치하는 구조</title>
  <desc id="k8s-d">쿠버네티스 클러스터에 노드 3대가 있고, 각 노드에 서비스 파드가 올라가 있다. 새 파드가 만들어지면 스케줄러가 어느 노드에 놓을지 정해 배치한다.</desc>
  <defs><marker id="k8s-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
  <text x="170" y="26" fill="currentColor" font-size="12" opacity="0.85">쿠버네티스 클러스터</text>
  <rect x="16" y="92" width="116" height="52" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="74" y="115" text-anchor="middle" fill="currentColor" font-size="13" font-weight="600">스케줄러</text>
  <text x="74" y="132" text-anchor="middle" fill="currentColor" font-size="11" opacity="0.75">배치할 노드 결정</text>
  <path d="M132,126 C150,136 160,150 186,157" fill="none" stroke="currentColor" stroke-width="1.5" marker-end="url(#k8s-arrow)"/>
  <rect x="170" y="40" width="160" height="150" rx="6" fill="none" stroke="currentColor" stroke-width="1.3" opacity="0.55"/>
  <text x="250" y="62" text-anchor="middle" fill="currentColor" font-size="13" font-weight="600">노드 1</text>
  <rect x="350" y="40" width="160" height="150" rx="6" fill="none" stroke="currentColor" stroke-width="1.3" opacity="0.55"/>
  <text x="430" y="62" text-anchor="middle" fill="currentColor" font-size="13" font-weight="600">노드 2</text>
  <rect x="530" y="40" width="160" height="150" rx="6" fill="none" stroke="currentColor" stroke-width="1.3" opacity="0.55"/>
  <text x="610" y="62" text-anchor="middle" fill="currentColor" font-size="13" font-weight="600">노드 3</text>
  <rect x="190" y="76" width="120" height="26" rx="4" fill="#4E79A7"/>
  <text x="250" y="93" text-anchor="middle" fill="#fff" font-size="12">서비스 A 파드</text>
  <rect x="190" y="110" width="120" height="26" rx="4" fill="#B07AA1"/>
  <text x="250" y="127" text-anchor="middle" fill="#fff" font-size="12">서비스 B 파드</text>
  <rect x="190" y="144" width="120" height="26" rx="4" fill="none" stroke="currentColor" stroke-width="1.3" stroke-dasharray="4 3"/>
  <text x="250" y="161" text-anchor="middle" fill="currentColor" font-size="12">새 파드</text>
  <rect x="370" y="76" width="120" height="26" rx="4" fill="#4E79A7"/>
  <text x="430" y="93" text-anchor="middle" fill="#fff" font-size="12">서비스 A 파드</text>
  <rect x="370" y="110" width="120" height="26" rx="4" fill="#B07AA1"/>
  <text x="430" y="127" text-anchor="middle" fill="#fff" font-size="12">서비스 B 파드</text>
  <rect x="550" y="76" width="120" height="26" rx="4" fill="#4E79A7"/>
  <text x="610" y="93" text-anchor="middle" fill="#fff" font-size="12">서비스 A 파드</text>
  <rect x="170" y="212" width="13" height="13" rx="2" fill="#4E79A7"/>
  <text x="189" y="223" fill="currentColor" font-size="12">서비스 A (replica 3)</text>
  <rect x="340" y="212" width="13" height="13" rx="2" fill="#B07AA1"/>
  <text x="359" y="223" fill="currentColor" font-size="12">서비스 B (replica 2)</text>
</svg>

&nbsp; 이 글은 개발계에서 CPU request를 낮췄다가 배포가 끝나지 않았던 일에 대한 회고다. 원인을 이해하려면 쿠버네티스가 CPU를 다루는 방식을 알아야 해서 request, limit, 오버커밋을 먼저 설명한다. CPU 양은 m(millicore) 단위로 적는다. 1코어를 1000으로 나눈 단위라 1000m가 1코어, 25m는 1코어의 2.5%다.

### request

&nbsp; request는 스케줄러가 파드를 어느 노드에 놓을지 정할 때 쓰는 값이다. 노드마다 CPU 총량이 정해져 있고(예: 8코어 = 8000m), 스케줄러는 그 노드에 이미 올라간 파드들의 request를 모두 더해 남은 자리를 계산한다. 파드에 `CPU request 25m`이라고 적으면 이 파드가 25m만큼 자리를 차지한다고 계산하고, request 합계가 노드 총량을 넘지 않을 때까지 파드를 배치한다.

&nbsp; request를 적어도 실제 CPU가 따로 떼어지지는 않는다. `25m`라고 적었다고 그 파드에 25m가 보장되거나 25m로 제한되지 않는다. 배치 계산에만 쓰이는 값이라, 파드가 실행 중에 CPU를 실제로 얼마나 쓰는지와는 관계가 없다. 스케줄러는 실사용량을 보지 않고 request 합계만으로 노드의 여유를 판단한다.

&nbsp; 실사용량은 오토스케일러가 본다. HPA(Horizontal Pod Autoscaler)는 사용량에 따라 파드 수를 늘리고 줄이며, VPA(Vertical Pod Autoscaler)는 사용량을 보고 request 값을 조정한다. 그래도 새 파드를 어느 노드에 놓을지는 스케줄러가 request만 보고 정한다. 이번 장애도 이 배치 단계에서 시작됐다.

### limit

&nbsp; limit은 파드가 실제로 쓸 수 있는 CPU의 상한이다. limit을 걸면 파드는 그 이상 CPU를 쓰지 못한다. 이 글의 서비스들은 CPU limit이 없었다(그래서 QoS 등급이 Burstable이다). limit이 없으면 노드에 남는 CPU가 있을 때 request(25m)보다 훨씬 많이 가져다 쓸 수 있다. JVM 부팅처럼 CPU가 순간적으로 많이 필요한 구간에서는 이게 유리하다. 다만 노드에 남는 CPU가 있어야 가능하다.

### 오버커밋

&nbsp; 오버커밋은 request로 잡아 둔 양보다 실제 CPU 수요가 커진 상태를 말한다. 항공사 오버부킹과 비슷하다. 항공사는 좌석 수보다 표를 더 판다. 보통은 오지 않는 승객이 있어서 괜찮지만, 예약자가 전부 나타나면 좌석이 모자란다. request를 낮게 잡을 때도 파드들이 한꺼번에 CPU를 많이 쓰지는 않을 거라고 기대하고 잡는다. 이 서비스들은 운영 중 CPU 사용량이 평균 3~15m라 평소에는 문제가 없었다. 그런데 20개 JVM이 동시에 부팅하면서 각자 코어 단위의 CPU를 쓰기 시작하자 노드의 물리 CPU가 부족해졌다.

### CPU 경합과 cpu.shares

&nbsp; CPU가 부족해 여러 파드가 경합할 때도 request가 쓰인다. 쿠버네티스는 컨테이너를 리눅스의 cgroup(프로세스 묶음별로 CPU와 메모리를 나눠 주고 제한하는 커널 기능)으로 격리하는데, 이때 request 값이 cgroup의 CPU 가중치(`cpu.shares`)로 설정된다. 리눅스는 이 가중치에 비례해 CPU를 나눠 준다. 1코어(1000m)가 가중치 1024에 해당하므로 request 25m인 파드의 가중치는 약 25다. 1코어짜리 파드와 경합하면 약 40분의 1밖에 받지 못한다. request를 낮추면 배치가 조밀해지고, 경합이 생겼을 때 받는 CPU도 줄어든다.

&nbsp; 정리하면 request는 스케줄러의 배치 밀도와 경합 시 CPU 배분 비율을 함께 정한다. 이번에는 request를 낮추면서 두 가지가 모두 나빠졌다.

## 1. 증상

&nbsp; 개발계 백엔드 20개 서비스(Spring Boot / JVM)의 CPU request를 낮추는 PR을 머지했다. Argo CD는 Git 저장소에 적힌 설정과 클러스터 상태를 맞춰 주는 배포 도구로, 자동 동기화(auto sync)를 켜 두면 설정이 머지되는 즉시 클러스터에 반영한다. 그래서 배포가 바로 시작됐고, 08:21:04부터 08:21:22까지 약 13초 만에 20개 앱의 신규 파드가 한꺼번에 생성됐다.

&nbsp; 그런데 배포가 끝나지 않았다. 신규 파드 다수가 Ready 상태가 되지 못하고 재시작을 반복했고, rollout은 아래 메시지에서 멈췄다.

```
Waiting for rollout to finish: 1 old replicas are pending termination
```

&nbsp; rollout은 Deployment가 구 버전 파드를 새 버전 파드로 교체하는 과정이고, Ready는 파드가 readinessProbe를 통과해 트래픽을 받을 수 있게 된 상태다. 위 메시지는 구 버전 파드 1개가 종료를 기다리고 있어서 교체가 끝나지 않았다는 뜻이다.

&nbsp; `maxUnavailable 0` 설정 덕분에 구 버전 파드가 계속 떠 있어서 서비스 장애는 없었다. 다만 새 파드가 Ready가 되지 못하니 구 버전 파드도 종료되지 못했고, 배포는 계속 Progressing(rollout이 진행 중이라는 Deployment 상태)에 머물렀다.

&nbsp; 당시 리소스와 프로브 설정은 아래와 같았다.

- CPU request 25m, CPU limit 미설정(Burstable), memory 512Mi, replicas 1
- RollingUpdate `maxSurge 1 / maxUnavailable 0`
- liveness `initialDelay 40s / period 5s / failureThreshold 3`, readiness `initialDelay 20s`, `startupProbe` 없음

&nbsp; 생소할 수 있는 설정부터 설명한다.

- **Burstable**: 쿠버네티스는 request와 limit 설정에 따라 파드의 QoS(서비스 품질) 등급을 나눈다. 둘이 같으면 Guaranteed, 둘 다 없으면 BestEffort, 이 글처럼 request만 있고 limit이 없으면 Burstable이다. Burstable 파드는 request만큼은 확보하고, 노드에 CPU가 남으면 그 이상도 쓸 수 있다. 대신 노드가 붐비면 우선순위가 밀린다.
- **maxSurge / maxUnavailable**: RollingUpdate가 구 버전 파드를 새 버전으로 교체하는 속도를 정한다. `maxSurge 1`은 교체 중에 정해진 개수보다 파드를 최대 1개 더 띄울 수 있다는 뜻이고, `maxUnavailable 0`은 교체 중에도 사용 가능한 파드 수가 정해진 개수 아래로 내려가면 안 된다는 뜻이다. 두 설정을 함께 쓰면 새 파드가 Ready가 된 뒤에만 구 버전 파드를 내린다. 서비스 장애가 없었던 것도 이 설정 덕분이다.

&nbsp; 프로브는 쿠버네티스가 컨테이너 상태를 주기적으로 확인하는 헬스체크로, 세 종류가 있다.

- **livenessProbe**: 컨테이너가 살아있는지 확인한다. 실패하면 kubelet(각 노드에서 파드를 실제로 띄우고 프로브를 수행하는 에이전트)이 컨테이너를 재시작한다.
- **readinessProbe**: 트래픽을 받을 준비가 됐는지 확인한다. 실패하면 서비스에서 잠시 빼고, 재시작은 하지 않는다.
- **startupProbe**: 부팅이 끝났는지 확인한다. 이 프로브가 통과하기 전까지 liveness와 readiness 검사를 미루기 때문에, 부팅이 느려도 liveness 실패로 재시작되지 않는다.

&nbsp; 파라미터 중 `initialDelay`는 컨테이너 시작 후 첫 검사까지 기다리는 시간, `period`는 검사 주기, `failureThreshold`는 몇 번 연속 실패하면 조치할지를 정한다. 위 설정이면 liveness는 컨테이너가 뜨고 40초 뒤부터 5초 간격으로 검사하고, 3번 연속 실패하면 재시작한다. readiness는 20초 뒤부터 검사를 시작해 통과하기 전까지는 트래픽을 주지 않는다. startupProbe가 없으니 부팅이 약 55초를 넘기면 liveness 실패로 재시작된다.

## 2. 원인

&nbsp; 파드가 프로브 실패로 재시작되고 있었으니 프로브 설정부터 의심했다. 그런데 20개 앱의 프로브 설정은 모두 같았다. 설정이 원인이었다면 재시작이 노드와 관계없이 고르게 나타났어야 했다.

&nbsp; 노드별로 신규 파드 수와 재시작 횟수를 세어 보니, 파드가 많은 노드일수록 재시작도 많았다.

| 노드 | 신규 파드 수 | 재시작 횟수 |
|---|---|---|
| Node 1 | 12 | 44 |
| Node 2 | 5 | 2 |
| Node 3 | 3 | 0 |
| Node 4 | 2 | 0 |
| Node 5 | 1 | 0 |

&nbsp; 전체 재시작 46회 중 44회(96%)가 파드 12개가 몰린 Node 1에서 발생했고, 파드가 1~3개인 노드에서는 재시작이 없었다. 설정 문제였다면 이런 분포가 나오기 어렵다. 그래서 Node 1에 파드가 과밀 배치되면서 자원 경합이 생겼다고 판단했다.

&nbsp; 다른 기록도 같은 판단을 뒷받침했다.

- **`PodScheduled = True`**: 스케줄링은 모두 성공했다(Pending 없음). 스케줄러는 노드에 여유가 있다고 판단했고, 그래서 Cluster Autoscaler도 동작하지 않았다. Cluster Autoscaler는 자리가 없어 Pending(배치 대기)에 걸린 파드가 생겨야 노드를 추가한다.
- **exit code 143 (SIGTERM)**: exit code는 컨테이너가 종료될 때 남기는 숫자다. 시그널을 받아 종료되면 `128 + 시그널 번호`가 되는데, 143은 128 + 15(SIGTERM, 종료 요청)이고 137은 128 + 9(SIGKILL, 강제 종료)다. 메모리 limit을 넘겨 커널이 종료시키는 OOMKill은 SIGKILL이라 137이 남는다. 143이었으므로 메모리 부족은 원인에서 제외했고, liveness 실패로 kubelet이 컨테이너에 종료를 요청했다고 봤다.
- **직전 컨테이너 로그**: MongoDB 토폴로지 탐색 중 종료, ping RTT 4.68초. 토폴로지 탐색은 MongoDB 드라이버가 접속 직후 클러스터 구성(어느 서버가 primary인지 등)을 확인하는 단계이고, ping RTT는 요청을 보내고 응답이 돌아오기까지 걸린 시간이다. 같은 클러스터 안에서는 밀리초 단위로 나와야 하는 값이 4초를 넘었다. CPU를 받지 못해 스레드가 제때 실행되지 못했다고 볼 수 있다.
- **재시작 주기**: 컨테이너는 74초 동안 떠 있다가 종료되기를 반복했다(`restartCount 4`, 컨테이너가 재시작된 횟수).

## 3. 원인 분석

&nbsp; 확인한 내용을 순서대로 정리하면 다음과 같다. 각 단계에 번호를 붙였고, 재발 방지 방법도 이 번호를 기준으로 정리했다.

```
① CPU request 25m 하향
   → 스케줄러가 request 합계만 보고 노드를 여유롭다고 판단
② 한 노드에 신규 파드 12개 집중 배치 (request 합계는 겨우 300m)
③ 12개 JVM이 동시 콜드스타트 → 실수요가 코어 단위로 급증 → 노드 물리 CPU 한계 초과
④ cpu.shares 가중치 25/1024 인 파드들이 CPU 기아
⑤ 부팅이 liveness 임계(initialDelay 40s + 5s×3 ≈ 55s)를 초과 → kubelet SIGTERM(exit 143)
⑥ 재시작 → 경합 재발 → CrashLoop 반복
```

- **콜드스타트**: 프로세스를 처음부터 새로 띄우는 것이다. JVM은 부팅할 때 클래스 로딩(필요한 클래스 파일을 읽어 메모리에 올리는 작업)과 JIT 컴파일(자주 쓰는 코드를 기계어로 바꾸는 작업)이 몰려서, 운영 중일 때보다 CPU를 훨씬 많이 쓴다.
- **CPU 기아(starvation)**: 실행할 준비는 됐는데 CPU를 배정받지 못해 계속 기다리는 상태다.
- **CrashLoop**: 컨테이너가 뜨자마자 종료되고, 재시작되고, 다시 종료되기를 반복하는 상태다.

&nbsp; 스케줄러가 계산한 사용량(request 합계 300m)과 노드의 실제 CPU 사용량 사이에 큰 차이가 있었다. request를 낮추자 스케줄러가 파드를 한 노드에 몰아서 배치했고, 부팅 시점에 그 노드의 CPU가 부족해졌다. 흐름은 ①의 request 하향에서 시작됐다.

## 4. 재발 방지 방법

&nbsp; 위 단계 중 하나만 막아도 CrashLoop은 이어지지 않는다. 단계별로 적용할 수 있는 대책은 아래와 같다.

| 대책 | 막는 단계 | 효과 |
|---|---|---|
| request를 부팅 피크 기준으로 설정 | ① | 스케줄러가 부팅 부하를 반영해 파드를 덜 몰아서 배치한다. 운영 평균인 3~15m는 부팅 때 부족하므로, 하한을 콜드스타트 피크로 잡는다 |
| Pod Topology Spread / anti-affinity | ② | 같은 서비스군을 여러 노드에 나눠 배치해, 부팅 피크가 한 노드에 겹치지 않게 한다 |
| Argo CD sync wave로 롤아웃 분할 | ③ | 20개를 한꺼번에 배포하지 않고 웨이브로 나눠, 동시에 부팅하는 파드 수를 제한한다 |
| CPU limit 명시 + JVM `ActiveProcessorCount` 고정 | ③④ | 컨테이너가 인식하는 코어 수를 정해 스레드풀과 JIT 병렬도를 예측할 수 있게 하고, 부팅 때 CPU 사용이 급증하지 않게 한다 |
| `startupProbe` 도입 | ⑤ | 부팅 구간과 운영 구간을 나눠, 부팅이 느려도 liveness 실패로 재시작되지 않게 한다 |

&nbsp; 표에 나온 설정은 아래와 같다.

- **Pod Topology Spread / anti-affinity**: 파드를 노드에 어떻게 나눠 배치할지 정하는 규칙이다. Topology Spread는 "노드마다 파드 수 차이가 N개를 넘지 않게", anti-affinity는 "이 라벨이 붙은 파드와 같은 노드에 놓지 마라"처럼 지정한다.
- **sync wave**: Argo CD가 리소스를 동기화하는 순서를 번호로 정하는 기능이다. 번호가 낮은 웨이브가 정상화된 뒤에 다음 웨이브를 배포하므로, 한꺼번에 뜨는 파드 수를 나눌 수 있다.
- **`ActiveProcessorCount`**: JVM이 사용할 수 있다고 인식하는 CPU 코어 수를 직접 지정하는 옵션(`-XX:ActiveProcessorCount`)이다. JVM은 이 값을 보고 GC 스레드 수, JIT 컴파일 스레드 수, 기본 스레드풀 크기 등을 정한다. CPU limit이 없으면 노드 전체 코어 수를 기준으로 잡아 스레드를 많이 만들 수 있다.

&nbsp; 이런 오버커밋은 Cluster Autoscaler로도 막을 수 없다. 파드가 Pending 없이 바로 배치되기 때문에 Cluster Autoscaler가 개입하지 않는다. 그래서 노드 수가 그대로여도 CPU는 부족할 수 있다.

> **참고. request를 낮추면 관측 지표가 빠질 수 있다**
>
> Datadog `dd-java-agent`(JVM에 붙어 트레이스와 지표를 수집하는 Datadog의 Java 에이전트)는 컨테이너가 뜰 때 JMXFetch로 JVM 지표를 수집한다. JMXFetch는 JMX(JVM이 heap, GC, 스레드 같은 내부 상태를 밖으로 노출하는 표준 인터페이스)에서 지표를 읽어 오는 구성 요소다. request가 25m처럼 낮으면 초기화 단계에서 CPU를 받지 못해 JMXFetch가 뜨지 못하고, JVM 지표가 전부 빠진다. 개발계 4개 서비스에서 실제로 지표가 빠졌고, request를 50m로 올리자 다시 수집됐다. 그래서 request를 줄일 때는 성능과 함께 모니터링 에이전트가 동작할 최소 CPU도 확인해야 한다.

## 5. 저절로 복구된 과정

&nbsp; 리소스를 따로 조정하지 않았는데도 시간이 지나자 20개 서비스가 모두 `Synced`로 돌아왔고 대부분 `Healthy`가 됐다. 둘 다 Argo CD의 상태값으로, Synced는 Git의 설정과 클러스터 상태가 일치한다는 뜻이고 Healthy는 배포된 리소스가 정상 동작 중이라는 뜻이다.

&nbsp; 복구에는 쿠버네티스의 CrashLoopBackOff 동작이 영향을 줬다. 컨테이너가 반복해서 종료되면 kubelet은 재시작 간격을 지수적으로 늘린다(10s → 20s → 40s → … → 최대 5분). 처음에는 12개 파드가 거의 동시에 재시작해 경합이 다시 생겼지만, 재시작이 반복될수록 대기 시간이 길어지면서 파드마다 재시작 시점이 조금씩 어긋났다.

&nbsp; 동시에 부팅하는 파드 수가 줄자 노드의 순간 CPU 수요도 물리 한계 아래로 내려갔고, 파드들이 하나씩 부팅에 성공했다. JVM은 부팅할 때 클래스 로딩과 JIT 컴파일로 CPU를 많이 쓰고, 부팅이 끝나면 사용량이 운영 수준(이 서비스들은 평균 3~15m)으로 떨어진다. 파드 하나가 Ready가 되면 그만큼 노드에 여유가 생겼고, 다음 파드가 그 여유로 부팅할 수 있었다.

&nbsp; 결과적으로 backoff가 4절의 sync wave와 비슷한 역할을 했다. 배포를 나눠서 했어야 할 일을 재시작 대기 시간이 대신 해 줬다. 다만 이번에는 운이 좋았다. 노드가 더 붐볐거나 liveness 설정이 더 빡빡했다면 backoff 간격이 벌어지기 전에 더 큰 장애로 번졌을 수 있다. 그래서 저절로 복구됐더라도 4절의 대책은 필요하다고 봤다.

## 6. 마무리

&nbsp; request 값이 낮을수록 파드는 노드에 더 조밀하게 배치되고, 부팅 시점이 겹치면 이번처럼 CPU가 부족해진다. request는 콜드스타트 때 필요한 CPU를 기준으로 잡고, 그것만으로 부족하면 배치 분산(topology spread), 배포 분할(sync wave), 부팅 구간 분리(startupProbe)를 함께 적용할 수 있다.

&nbsp; 이번 장애는 request를 낮춰 파드가 한 노드에 몰렸고, 그 파드들이 동시에 부팅하면서 노드의 물리 CPU를 넘어서 발생했다. request 합계는 300m로 여유가 있어 보였지만, 실제 부팅에 필요한 CPU는 그보다 훨씬 컸다.
