---
title: heap 99%인 JVM 서비스 3개의 컨테이너 OOM 비교
date: '2026-09-25'
category: devops
published: true
description: 세 JVM 서비스가 모두 heap을 95~99% 쓰고 있었는데 OOM 위험은 서로 달랐다. 한 서비스는 30일간 OOMKilled가 55번 났고 나머지 둘은 0번이었다. 0번인 서비스 중 하나도 메모리 여유가 거의 없었다. heap 사용률만으로는 OOM을 예측할 수 없어서 종료 사유, 컨테이너 RSS, live set을 차례로 확인해보았다.
---

---


## 0. JVM 컨테이너의 메모리 예산

&nbsp; 우리 백엔드 서비스들은 쿠버네티스(k8s) 위에서 돌아간다. 각 서비스는 컨테이너로 패키징되어 파드(쿠버네티스가 배포하고 관리하는 가장 작은 실행 단위) 형태로 뜨고, 파드는 노드(파드가 실제로 올라가 돌아가는 서버)에 배치된다. 서비스마다 파드를 몇 개 띄울지는 replica 수로 정한다.

<svg viewBox="0 0 700 240" role="img" aria-labelledby="k8s-t k8s-d" style="max-width:100%;height:auto;font-family:inherit;display:block;margin:1.5rem auto">
  <title id="k8s-t">노드, 파드, replica의 관계</title>
  <desc id="k8s-d">쿠버네티스 클러스터에 노드 3대가 있고, 각 노드에 파드가 올라가 있다. 서비스 A는 replica 3이라 파드 3개가 노드 1, 2, 3에 하나씩 떠 있고, 서비스 B는 replica 2라 파드 2개가 노드 1, 2에 떠 있다.</desc>
  <text x="80" y="26" fill="currentColor" font-size="12" opacity="0.85">쿠버네티스 클러스터</text>
  <rect x="80" y="40" width="160" height="150" rx="6" fill="none" stroke="currentColor" stroke-width="1.3" opacity="0.55"/>
  <text x="160" y="62" text-anchor="middle" fill="currentColor" font-size="13" font-weight="600">노드 1</text>
  <rect x="270" y="40" width="160" height="150" rx="6" fill="none" stroke="currentColor" stroke-width="1.3" opacity="0.55"/>
  <text x="350" y="62" text-anchor="middle" fill="currentColor" font-size="13" font-weight="600">노드 2</text>
  <rect x="460" y="40" width="160" height="150" rx="6" fill="none" stroke="currentColor" stroke-width="1.3" opacity="0.55"/>
  <text x="540" y="62" text-anchor="middle" fill="currentColor" font-size="13" font-weight="600">노드 3</text>
  <rect x="100" y="76" width="120" height="26" rx="4" fill="#4E79A7"/>
  <text x="160" y="93" text-anchor="middle" fill="#fff" font-size="12">서비스 A 파드</text>
  <rect x="100" y="110" width="120" height="26" rx="4" fill="#B07AA1"/>
  <text x="160" y="127" text-anchor="middle" fill="#fff" font-size="12">서비스 B 파드</text>
  <rect x="290" y="76" width="120" height="26" rx="4" fill="#4E79A7"/>
  <text x="350" y="93" text-anchor="middle" fill="#fff" font-size="12">서비스 A 파드</text>
  <rect x="290" y="110" width="120" height="26" rx="4" fill="#B07AA1"/>
  <text x="350" y="127" text-anchor="middle" fill="#fff" font-size="12">서비스 B 파드</text>
  <rect x="480" y="76" width="120" height="26" rx="4" fill="#4E79A7"/>
  <text x="540" y="93" text-anchor="middle" fill="#fff" font-size="12">서비스 A 파드</text>
  <rect x="80" y="212" width="13" height="13" rx="2" fill="#4E79A7"/>
  <text x="99" y="223" fill="currentColor" font-size="12">서비스 A (replica 3)</text>
  <rect x="250" y="212" width="13" height="13" rx="2" fill="#B07AA1"/>
  <text x="269" y="223" fill="currentColor" font-size="12">서비스 B (replica 2)</text>
</svg>

&nbsp; 이번에는 운영계 서비스들의 replica를 줄여 필요한 노드 수를 줄이던 중이었다. 후보 서비스들을 모니터링 대시보드에서 나란히 열었더니 모두 heap을 95~99% 쓰고 있었다. 처음에는 메모리가 빡빡하니 함부로 줄이면 안 되겠다고 생각했다. 그런데 30일치 기록을 확인해 보니 한 서비스는 OOMKilled가 55번 났고 나머지는 0번이었다. heap 사용률은 비슷한데 실제 상태는 서비스마다 달랐다.

&nbsp; 이유를 이해하려면 컨테이너 안에서 JVM이 메모리를 어떻게 쓰는지 먼저 알아야 한다. 쿠버네티스는 heap 사용량을 보고 파드를 종료하지 않는다. 컨테이너 전체가 쓰는 물리 메모리(RSS)를 기준으로 삼는다.

&nbsp; RSS(Resident Set Size)는 프로세스가 실제로 물리 메모리(RAM)에 올려 두고 쓰는 양이다. 가상 메모리로 예약만 해 둔 공간은 빼고, 지금 RAM을 차지하는 부분만 센다. JVM 프로세스의 RSS는 대략 세 부분으로 나뉜다.

```
RSS ≈ heap committed + non-heap + native
```

- **heap**: `new`로 만든 객체가 저장되는 공간이다. GC(Garbage Collector)가 더 이상 쓰지 않는 객체를 찾아 자동으로 회수한다. heap 크기는 두 가지로 본다. committed는 JVM이 OS에게서 받아 확보해 둔 크기이고, used는 그 안을 실제 객체가 채운 양이다. JVM은 한 번 확보한 공간을 OS에 잘 돌려주지 않아서 RSS에는 committed만큼 잡힌다.
- **non-heap**: JVM이 heap 밖에서 따로 관리하는 영역이다. 로딩한 클래스의 구조와 메서드 정보를 담는 metaspace, JIT 컴파일러가 만든 기계어를 저장하는 code cache가 대표적이다. JIT(Just-In-Time) 컴파일러는 자주 실행되는 바이트코드를 실행 중에 기계어로 바꿔 더 빠르게 돌린다.
- **native**: JVM이 관리하는 영역 밖에서 OS에게 직접 받아 쓰는 메모리다. 모니터링 도구에 따로 표시되지 않아서, RSS에서 heap과 non-heap을 빼서 추정하는 경우가 많다. 주로 아래 항목이 차지한다.
  - 스레드 스택: 스레드마다 따로 잡는 호출 스택 공간이다. 스레드가 많을수록 커진다.
  - 다이렉트 버퍼: 네트워크나 파일 I/O를 빠르게 하려고 heap 밖에 잡는 버퍼다. Netty 같은 네트워크 라이브러리가 많이 쓴다.
  - JIT 작업 메모리: JIT 컴파일러가 컴파일하는 동안 쓰는 메모리다.
  - 에이전트: Datadog 같은 모니터링 에이전트가 JVM에 붙어 쓰는 메모리다.
  - malloc arena: C 라이브러리(glibc)의 메모리 할당 함수 `malloc`이 스레드 간 충돌을 줄이려고 여러 개로 나눠 잡는 메모리 풀이다. 스레드가 많으면 arena 수도 늘어나 메모리를 꽤 많이 차지할 수 있다.

&nbsp; 메모리 상한도 두 가지를 구분해야 한다. Xmx는 heap이 커질 수 있는 최대 크기다. `-Xmx512m`처럼 JVM 옵션으로 직접 지정할 수도 있고, 컨테이너 환경에서는 `-XX:MaxRAMPercentage`로 컨테이너 메모리 limit 대비 비율을 지정할 수도 있다. 이 글의 서비스들은 비율 방식을 썼다. limit이 1Gi이고 비율이 50%면 Xmx는 512Mi다. (Gi, Mi는 1024 단위로 세는 용량 표기로, 1Gi = 1024Mi다.)

&nbsp; 컨테이너 limit은 파드 설정의 `resources.limits.memory` 값으로, 컨테이너가 쓸 수 있는 메모리 전체의 상한이다. heap, non-heap, native가 모두 이 안에 들어가야 한다. Xmx를 limit의 50%로 잡으면 나머지 절반이 heap 밖 메모리 몫으로 남는다.

&nbsp; 그래서 OOM(Out Of Memory)도 두 종류로 나뉜다.

- **컨테이너 OOM(OOMKilled)**: RSS가 컨테이너 limit에 닿으면 리눅스 커널의 OOM killer가 프로세스를 강제로 종료한다. JVM은 예외를 던지지 못하고 바로 죽으며, 파드에는 종료 사유 `OOMKilled`(exit code 137)가 남는다. 판단 기준은 `heap committed + non-heap + native`의 합이다.
- **heap OOM(OutOfMemoryError)**: GC를 돌려도 살아 있는 객체가 Xmx 안에 다 들어가지 않으면 JVM이 `java.lang.OutOfMemoryError` 예외를 던진다. 컨테이너 limit과 상관없이 heap 안에서 생기며, 살아 있는 객체의 양(live set)과 Xmx를 비교해 판단한다.

&nbsp; heap 사용률(heap used ÷ Xmx)로는 두 OOM 모두 예측하기 어렵다. GC가 동작하는 방식 때문이다.

## 1. heap 사용률만 보면 안 되는 이유

&nbsp; GC는 heap에 자리가 남아 있으면 일찍 청소하지 않는다. Java 9부터 기본 GC인 G1을 예로 들면, 새로 만든 객체는 먼저 heap 안의 eden 영역에 쌓인다. eden이 가득 차면 GC가 돌면서 쓰지 않는 객체를 한꺼번에 치우는데, 이것을 young GC라고 한다. 여러 번의 GC에서 살아남은 객체는 old 영역으로 옮겨진다. heap 전체를 한 번에 정리하는 full GC도 있는데, 이때는 애플리케이션이 오래 멈춘다. G1은 old 영역을 조금씩 나눠 정리하고, 그래도 공간이 모자랄 때만 full GC를 한다.

&nbsp; 그래서 heap used를 시계열로 보면 Xmx 근처까지 톱니처럼 올라갔다가 GC 때 뚝 떨어지기를 반복한다. 그래프가 꼭대기에 있을 때 스냅숏을 보면 heap이 99%로 보이지만, 이 값은 GC 직전의 순간값이라 실제로 필요한 메모리 양과는 다르다.

<svg viewBox="0 0 700 200" role="img" aria-labelledby="fig1-t fig1-d" style="max-width:100%;height:auto;font-family:inherit;display:block;margin:1.5rem auto">
  <title id="fig1-t">heap 톱니와 live set</title>
  <desc id="fig1-d">heap used는 Xmx까지 톱니처럼 차올랐다 GC로 떨어진다. 꼭대기(used max)는 GC 전 쓰레기를 포함한 값이고, 실제 필요량은 톱니의 바닥(live set)이다.</desc>
  <path d="M80,150 L175,52 L175,150 L270,52 L270,150 L365,52 L365,150 L460,52 L460,150 L555,52 L555,150 L600,98 L600,168 L80,168 Z" fill="#4E79A7" opacity="0.16"/>
  <path d="M80,150 L175,52 L175,150 L270,52 L270,150 L365,52 L365,150 L460,52 L460,150 L555,52 L555,150 L600,98" fill="none" stroke="#4E79A7" stroke-width="2"/>
  <line x1="80" y1="48" x2="610" y2="48" stroke="currentColor" stroke-width="1.3" stroke-dasharray="4 3" opacity="0.65"/>
  <text x="80" y="40" fill="currentColor" font-size="12" opacity="0.85">Xmx (heap 상한)</text>
  <text x="616" y="52" fill="currentColor" font-size="12">used max</text>
  <text x="616" y="66" fill="currentColor" font-size="11" opacity="0.7">GC 직전 꼭대기</text>
  <line x1="80" y1="150" x2="610" y2="150" stroke="#E15759" stroke-width="1.3" stroke-dasharray="4 3" opacity="0.8"/>
  <text x="616" y="150" fill="currentColor" font-size="12">live set</text>
  <text x="616" y="164" fill="currentColor" font-size="11" opacity="0.7">실제 필요량</text>
  <line x1="66" y1="52" x2="66" y2="150" stroke="currentColor" stroke-width="1" opacity="0.45"/>
  <text x="60" y="101" fill="currentColor" font-size="11" opacity="0.7" text-anchor="middle" transform="rotate(-90 60 101)">착시 구간</text>
</svg>

&nbsp; 실제로 필요한 양은 GC 직후의 바닥값인 live set으로 본다. live set은 GC가 돌고 나서도 heap에 남아 있는 객체, 즉 코드 어딘가에서 아직 참조하고 있어 치울 수 없는 객체의 총량이다. heap을 볼 때는 아래 세 값을 구분한다.

- **used max**: 톱니의 꼭대기다. GC가 아직 치우지 않은 쓰레기 객체까지 포함한 값이라, 이 값만으로 Xmx가 부족하다고 판단하면 안 된다.
- **avg**: 톱니의 평균이다. 메모리가 계속 부족하면 Xmx 가까이 붙어 있고, 여유가 있으면 절반쯤에 머문다.
- **GC 후 바닥(live set)**: Datadog에서는 `jvm.gc.old_gen_size`의 최솟값 등으로 확인한다. Xmx가 정말 부족한지는 이 값으로 판단한다.

&nbsp; heap이 99%라는 것만으로는 판단할 수 있는 게 거의 없다. OOM을 진단할 때는 다음 세 가지를 확인해보았다.

1. 종료 사유: 실제로 OOMKilled가 찍혔는지, 찍혔다면 몇 번인지
2. 컨테이너 RSS와 limit: RSS가 limit에 붙어 있는지(컨테이너 OOM 위험), 여유가 있는지
3. live set과 Xmx: GC 후 바닥이 Xmx에 가까운지(heap OOM 위험), 작은지

&nbsp; 이 세 가지를 기준으로 실제 서비스들을 살펴봤다.

## 2. 세 서비스 비교

&nbsp; 세 서비스를 A, B, C라 하자. 셋 다 Spring Boot 기반 JVM 서비스이고, 모니터링 스냅숏에서는 heap 사용률이 95~99%였다. 30일치 지표를 나란히 놓으면 아래와 같다.

| 지표 | 서비스 A | 서비스 B | 서비스 C |
|---|---|---|---|
| 컨테이너 limit | 1Gi(1024Mi) | 2Gi(2048Mi) | 1.5Gi(1536Mi) |
| Xmx (MaxRAMPercentage 50%) | 512Mi | 1024Mi | 768Mi |
| heap used max | 486Mi (95%) | 1011Mi (99%) | 731Mi (95%) |
| 종료 사유(OOMKilled) | 55회 | 0회 | 0회 |
| RSS max ÷ limit | 1016Mi (99%) | 1507Mi (74%) | 1384Mi (90%) |
| live set(GC 후 바닥) | 작음 | 206~268Mi (Xmx의 ~26%) | 47~87Mi (Xmx의 ~11%) |

&nbsp; RSS max는 30일 중 RSS가 가장 높았던 순간의 값이다. heap 사용률만 보면 세 서비스 모두 비슷하게 위험해 보인다. 실제로 죽고 있던 건 A뿐이었고, B는 문제가 없었으며, C는 아직 죽지 않았지만 여유가 거의 없었다. RSS를 기준으로 보면 차이가 드러난다.

<svg viewBox="0 0 700 280" role="img" aria-labelledby="fig2-t fig2-d" style="max-width:100%;height:auto;font-family:inherit;display:block;margin:1.5rem auto">
  <title id="fig2-t">세 서비스의 컨테이너 메모리 예산</title>
  <desc id="fig2-d">같은 heap 95~99%인데 RSS는 A 99%(꽉 참, OOM), B 74%(여유), C 90%(한계에 가까움)로 갈린다. 각 막대는 heap committed, non-heap, native의 합이며 오른쪽 점선이 컨테이너 limit(100%)이다.</desc>
  <line x1="640" y1="28" x2="640" y2="214" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.6"/>
  <text x="640" y="20" text-anchor="middle" fill="currentColor" font-size="12" opacity="0.85">limit = 100%</text>
  <text x="80" y="48" fill="currentColor" font-size="13" font-weight="600">서비스 A: RSS 99%, 이미 OOMKilled 55회</text>
  <rect x="80" y="54" width="268.8" height="30" fill="#4E79A7"/>
  <rect x="348.8" y="54" width="128.8" height="30" fill="#B07AA1"/>
  <rect x="477.6" y="54" width="156.8" height="30" fill="#E15759"/>
  <text x="80" y="106" fill="currentColor" font-size="13" font-weight="600">서비스 B: RSS 74%, 여유</text>
  <rect x="80" y="112" width="280" height="30" fill="#4E79A7"/>
  <rect x="360" y="112" width="63.8" height="30" fill="#B07AA1"/>
  <rect x="423.8" y="112" width="68.3" height="30" fill="#E15759"/>
  <text x="80" y="164" fill="currentColor" font-size="13" font-weight="600">서비스 C: RSS 90%, OOM 0회지만 한계에 가까움</text>
  <rect x="80" y="170" width="268.8" height="30" fill="#4E79A7"/>
  <rect x="348.8" y="170" width="117.6" height="30" fill="#B07AA1"/>
  <rect x="466.4" y="170" width="117.6" height="30" fill="#E15759"/>
  <rect x="80" y="244" width="13" height="13" fill="#4E79A7"/>
  <text x="99" y="255" fill="currentColor" font-size="12">heap committed</text>
  <rect x="232" y="244" width="13" height="13" fill="#B07AA1"/>
  <text x="251" y="255" fill="currentColor" font-size="12">non-heap</text>
  <rect x="344" y="244" width="13" height="13" fill="#E15759"/>
  <text x="363" y="255" fill="currentColor" font-size="12">native</text>
</svg>

&nbsp; 세 신호를 서비스별로 판정하면 아래와 같다.

<svg viewBox="0 0 800 250" role="img" aria-labelledby="sig-t sig-d" style="max-width:100%;height:auto;font-family:inherit;display:block;margin:1.5rem auto">
  <title id="sig-t">세 신호로 본 서비스별 판정</title>
  <desc id="sig-d">서비스 A는 종료 사유 55회, RSS 99%로 위험하고 live set은 작아 여유가 있다. 서비스 B는 종료 사유 0회, RSS 74%, live set 약 26%로 모두 여유가 있다. 서비스 C는 종료 사유 0회, live set 약 11%로 여유가 있지만 RSS가 90%(피크 94%)로 주의 상태다.</desc>
  <text x="255.0" y="30" text-anchor="middle" fill="currentColor" font-size="14" font-weight="600">서비스 A</text>
  <text x="465.0" y="30" text-anchor="middle" fill="currentColor" font-size="14" font-weight="600">서비스 B</text>
  <text x="675.0" y="30" text-anchor="middle" fill="currentColor" font-size="14" font-weight="600">서비스 C</text>
  <text x="20" y="68" fill="currentColor" font-size="13">종료 사유</text>
  <rect x="156" y="44" width="198" height="36" rx="5" fill="#E15759" opacity="0.28"/>
  <text x="255.0" y="67" text-anchor="middle" fill="currentColor" font-size="13">55회</text>
  <rect x="366" y="44" width="198" height="36" rx="5" fill="#59A14F" opacity="0.28"/>
  <text x="465.0" y="67" text-anchor="middle" fill="currentColor" font-size="13">0회</text>
  <rect x="576" y="44" width="198" height="36" rx="5" fill="#59A14F" opacity="0.28"/>
  <text x="675.0" y="67" text-anchor="middle" fill="currentColor" font-size="13">0회</text>
  <text x="20" y="112" fill="currentColor" font-size="13">RSS ÷ limit</text>
  <rect x="156" y="88" width="198" height="36" rx="5" fill="#E15759" opacity="0.28"/>
  <text x="255.0" y="111" text-anchor="middle" fill="currentColor" font-size="13">99%</text>
  <rect x="366" y="88" width="198" height="36" rx="5" fill="#59A14F" opacity="0.28"/>
  <text x="465.0" y="111" text-anchor="middle" fill="currentColor" font-size="13">74%</text>
  <rect x="576" y="88" width="198" height="36" rx="5" fill="#F28E2B" opacity="0.28"/>
  <text x="675.0" y="111" text-anchor="middle" fill="currentColor" font-size="13">90% (피크 94%)</text>
  <text x="20" y="156" fill="currentColor" font-size="13">live set ÷ Xmx</text>
  <rect x="156" y="132" width="198" height="36" rx="5" fill="#59A14F" opacity="0.28"/>
  <text x="255.0" y="155" text-anchor="middle" fill="currentColor" font-size="13">작음</text>
  <rect x="366" y="132" width="198" height="36" rx="5" fill="#59A14F" opacity="0.28"/>
  <text x="465.0" y="155" text-anchor="middle" fill="currentColor" font-size="13">약 26%</text>
  <rect x="576" y="132" width="198" height="36" rx="5" fill="#59A14F" opacity="0.28"/>
  <text x="675.0" y="155" text-anchor="middle" fill="currentColor" font-size="13">약 11%</text>
  <line x1="20" y1="178" x2="780" y2="178" stroke="currentColor" stroke-width="1" opacity="0.4"/>
  <text x="20" y="204" fill="currentColor" font-size="13" font-weight="600">판정</text>
  <text x="255.0" y="204" text-anchor="middle" fill="currentColor" font-size="13" font-weight="600">OOM 발생 중</text>
  <text x="465.0" y="204" text-anchor="middle" fill="currentColor" font-size="13" font-weight="600">문제 없음</text>
  <text x="675.0" y="204" text-anchor="middle" fill="currentColor" font-size="13" font-weight="600">OOM 직전</text>
  <rect x="150" y="226" width="13" height="13" rx="2" fill="#E15759" opacity="0.5"/>
  <text x="169" y="237" fill="currentColor" font-size="12">위험</text>
  <rect x="240" y="226" width="13" height="13" rx="2" fill="#F28E2B" opacity="0.5"/>
  <text x="259" y="237" fill="currentColor" font-size="12">주의</text>
  <rect x="330" y="226" width="13" height="13" rx="2" fill="#59A14F" opacity="0.5"/>
  <text x="349" y="237" fill="currentColor" font-size="12">여유</text>
</svg>

### 서비스 A

- 종료 사유: OOMKilled 55회
- RSS: limit의 99% (1016Mi / 1024Mi)
- live set: 작음 (heap에는 여유가 있음)

&nbsp; 문제는 RSS 쪽에 있었다. RSS를 세 부분으로 나누면 아래와 같다.

```
RSS 1016Mi ≈ heap committed 495 + non-heap 231 + native ~290
limit 1024Mi − (495 + 231) = 298Mi  ← 이 자리를 native가 ~290Mi 먹어 여유 8Mi
```

&nbsp; heap committed가 Xmx(512Mi) 가까이 커진 상태로 유지됐고, non-heap과 native가 더해져 여유가 8Mi만 남았다. 순간적으로 메모리를 조금만 더 할당해도 커널이 프로세스를 종료했고, 30일 동안 55번 죽은 것도 이 때문이다. 트래픽 증가나 버그로 생긴 문제는 아니었고, 컨테이너 메모리 예산이 처음부터 빠듯하게 잡혀 있었다.

### 서비스 B

- 종료 사유: 0회
- RSS: limit의 74% (1507Mi / 2048Mi)
- live set: 206~268Mi (Xmx 1024Mi의 약 26%), heap avg 56%, 30일간 full GC 0회

&nbsp; heap used 99%는 앞에서 설명한 GC 직전 꼭대기 값이었다. heap과 컨테이너 메모리 모두 여유가 있어서 두 종류의 OOM 모두 걱정할 상황이 아니었다. heap이 99%로 보인 건 JVM이 heap이 찰 때까지 GC를 미루기 때문이다.

### 서비스 C

- 종료 사유: 0회
- RSS: limit의 90% (1384Mi / 1536Mi), 순간 피크는 working_set 기준 94%
- live set: 47~87Mi (Xmx 768Mi의 약 11%), full GC 거의 없음
- heap 밖 메모리: non-heap 326Mi, native 약 316Mi

&nbsp; working_set은 쿠버네티스(kubelet)가 컨테이너 메모리 사용량을 판단할 때 쓰는 값으로, RSS에 바로 비우기 어려운 파일 캐시 일부를 더한 값이라 RSS보다 조금 크게 나온다.

&nbsp; heap OOM 위험은 낮은데 컨테이너 OOM 위험은 높은 상태였다. non-heap과 native가 커서 RSS를 limit 가까이 끌어올렸다. 종료 사유만 봤다면 B와 같은 상태로 판단했을 것이고, RSS까지 확인하고 나서야 A에 가깝다는 걸 알았다.

## 3. 서비스별 조치

&nbsp; 원래 목표는 세 서비스 모두 replica를 줄여 CPU와 메모리 request 총량을 낮추고 노드를 절감하는 것이었다. request는 스케줄러가 파드를 어느 노드에 놓을지 정할 때 쓰는 값이라, 총량이 줄면 노드 하나에 파드가 더 많이 들어가 노드 수를 줄일 수 있다. 진단 결과가 서비스마다 달라서 조치도 서비스별로 정했다.

| 서비스 | 진단 | 조치 |
|---|---|---|
| B | heap과 RSS 모두 여유 | replica 바로 축소 |
| A | RSS 99%, OOMKilled 55회 | limit 1Gi → 1.25Gi, MaxRAMPercentage 50% → 40% 적용 후 replica 축소 |
| C | RSS 90%, OOMKilled 0회 | limit 1.5Gi → 1.75Gi, MaxRAMPercentage 43% 적용 후 replica 축소 |

### 서비스 B의 replica 축소

&nbsp; B는 컨테이너 RSS에 여유가 있고(74%) live set이 작아서, replica를 줄여 파드 하나가 받는 요청이 늘어나도 괜찮다고 판단했다. B는 파드당 RSS가 트래픽과 거의 관계없이 일정했는데, 이유는 두 가지다. 첫째, heap committed가 이미 Xmx에 닿아 있어 부하가 늘어도 heap이 더 커질 수 없다. RSS에서 heap이 차지하는 몫은 이미 최대치로 고정돼 있었다. 둘째, 늘어난 요청이 만드는 객체는 금방 쓰레기가 되고, live set이 작으니 GC가 조금 더 자주 돌면서 치운다. 실제로 replica를 줄인 뒤에도 파드당 RSS는 그대로였고 limit 안에 여유 있게 들어왔다.

### 서비스 A의 메모리 확보와 replica 축소

&nbsp; A는 이미 55번 죽고 있어서, replica를 줄이면 남은 파드에 부하가 몰려 OOM이 더 자주 날 수 있었다. 여러 파드가 동시에 죽으면 서비스가 멈출 수도 있다. 그래서 replica 축소는 미루고 컨테이너 메모리부터 늘렸다.

&nbsp; limit은 1Gi에서 1.25Gi(1280Mi)로 올리고, `MaxRAMPercentage`는 50%에서 40%로 낮췄다. limit만 올리고 비율을 그대로 두면 Xmx가 512Mi에서 640Mi(1280Mi × 50%)로 같이 커져서, 늘린 256Mi 중 절반을 heap이 차지하게 된다. A는 heap이 부족한 상황이 아니었으므로 비율을 낮춰 Xmx를 512Mi(1280Mi × 40%)로 유지하고, 늘린 256Mi를 모두 non-heap과 native가 쓸 수 있게 했다.

```
변경 전: Xmx 512 + non-heap 231 + native 290 ≈ 1033 > limit 1024  → OOM
변경 후: Xmx 512 + non-heap 231 + native 290 ≈ 1033 < limit 1280  → 여유 247
```

<svg viewBox="0 0 700 220" role="img" aria-labelledby="fixA-t fixA-d" style="max-width:100%;height:auto;font-family:inherit;display:block;margin:1.5rem auto">
  <title id="fixA-t">서비스 A의 limit 변경 전후</title>
  <desc id="fixA-d">변경 전에는 heap committed, non-heap, native의 합이 limit 1024Mi를 거의 채워 여유가 8Mi였다. limit을 1280Mi로 올리고 Xmx는 512Mi로 유지하자 메모리 사용량은 그대로인 채 limit까지 여유가 생겼다.</desc>
  <text x="100" y="38" fill="currentColor" font-size="13" font-weight="600">변경 전: limit 1Gi, MaxRAMPercentage 50%</text>
  <rect x="100" y="46" width="216.6" height="30" fill="#4E79A7"/>
  <rect x="316.6" y="46" width="101.1" height="30" fill="#B07AA1"/>
  <rect x="417.6" y="46" width="126.9" height="30" fill="#E15759"/>
  <line x1="548.0" y1="42" x2="548.0" y2="82" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3"/>
  <text x="554.0" y="66" fill="currentColor" font-size="12">limit 1024Mi, 여유 8Mi</text>
  <text x="100" y="118" fill="currentColor" font-size="13" font-weight="600">변경 후: limit 1.25Gi, MaxRAMPercentage 40% (Xmx 512Mi 유지)</text>
  <rect x="100" y="126" width="216.6" height="30" fill="#4E79A7"/>
  <rect x="316.6" y="126" width="101.1" height="30" fill="#B07AA1"/>
  <rect x="417.6" y="126" width="126.9" height="30" fill="#E15759"/>
  <rect x="544.5" y="126" width="115.5" height="30" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3" opacity="0.6"/>
  <text x="602.2" y="146" text-anchor="middle" fill="currentColor" font-size="12">여유</text>
  <line x1="660.0" y1="122" x2="660.0" y2="162" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3"/>
  <text x="660.0" y="176" text-anchor="end" fill="currentColor" font-size="12">limit 1280Mi</text>
  <rect x="100" y="194" width="13" height="13" fill="#4E79A7"/>
  <text x="119" y="205" fill="currentColor" font-size="12">heap committed</text>
  <rect x="252" y="194" width="13" height="13" fill="#B07AA1"/>
  <text x="271" y="205" fill="currentColor" font-size="12">non-heap</text>
  <rect x="364" y="194" width="13" height="13" fill="#E15759"/>
  <text x="383" y="205" fill="currentColor" font-size="12">native</text>
</svg>

&nbsp; 배포 후 RSS는 limit의 99%에서 75%로 내려갔고 OOMKilled도 더 이상 발생하지 않았다. heap 크기는 그대로라 애플리케이션 동작에도 변화가 없었다. RSS에 여유가 생긴 걸 확인한 뒤에 replica를 줄였다. 메모리 변경과 replica 변경을 나눠서 배포했기 때문에 각각의 효과를 따로 확인할 수 있었다.

### 서비스 C의 메모리 확보와 replica 축소

&nbsp; C도 원래 replica를 줄일 후보였다. 종료 사유가 0회라 B처럼 바로 줄여도 될 것 같았지만, RSS가 이미 90%(순간 피크 94%)였다. replica를 줄여 파드당 부하가 늘면 non-heap이나 native가 조금만 커져도 limit을 넘을 수 있었다. 그래서 A와 같은 방법으로 limit을 1.5Gi에서 1.75Gi로 올리고 `MaxRAMPercentage`를 43%로 낮춰 Xmx를 768Mi로 유지했고, 메모리 여유를 확보한 뒤에 replica를 줄였다. A는 이미 OOM이 나고 있는 상황에서 조치했고, C는 OOM이 나기 전에 같은 조치를 먼저 적용했다.

## 4. 진단 체크리스트

&nbsp; 세 사례를 겪으면서 정리한 확인 순서다. Pod Restart나 메모리 알림을 받았을 때, 또는 리소스를 조정하기 전에 이 순서로 본다.

1. **종료 사유 확인**: Datadog에서는 `kubernetes.containers.last_state.terminated` 지표를 `reason` 태그로 나눠 OOMKilled가 실제로 찍혔는지, 몇 번인지 센다. heap 사용률이나 restart 횟수보다 먼저 본다. restart 횟수는 파드가 새로 만들어지면 0부터 다시 세기 때문에 실제 OOM 횟수보다 적게 보일 수 있다.
2. **컨테이너 RSS와 limit 비교**: RSS가 limit의 90%를 넘으면 컨테이너 OOM 위험이 있다. 이때는 RSS를 `heap committed + non-heap + native`로 나눠 어디서 많이 쓰는지 확인한다. native가 크다면 heap 설정을 바꿔서는 해결되지 않는다.
3. **live set으로 heap 여유 판단**: heap used max 대신 GC 후 바닥값을 Xmx와 비교한다. 바닥이 작으면 heap used가 99%여도 여유가 있다. 바닥이 Xmx에 붙은 채 계속 오르면 메모리 누수(다 쓴 객체를 어딘가에서 계속 참조하고 있어 GC가 치우지 못하고 쌓이는 현상)를 의심한다.

&nbsp; 진단 결과에 따른 조치는 아래처럼 정리했다.

- RSS가 limit에 닿았고 native가 원인이면 limit을 올린다. heap은 키울 필요가 없다면 `MaxRAMPercentage`를 낮춰 Xmx를 유지하고, 늘린 공간을 heap 밖 메모리가 쓰게 한다.
- heap은 꽉 차 보이지만 live set이 작고 RSS에 여유가 있으면 리소스는 그대로 둔다. replica 축소 같은 조정도 할 수 있다.
- OOMKilled가 0회여도 replica 축소처럼 파드당 부하가 늘어나는 변경 전에는 RSS 여유를 확인한다. RSS가 90% 이상이면 메모리를 먼저 확보한 뒤 줄인다.
- live set이 Xmx까지 차오르며 계속 오르면 메모리를 늘려도 시점만 늦춰진다. heap dump를 떠서 원인을 찾고 코드를 고쳐야 한다. heap dump는 특정 시점의 heap 내용을 통째로 파일로 저장한 것으로, VisualVM 같은 도구로 열어 어떤 객체가 메모리를 잡고 있는지 확인할 수 있다.

## 5. 정리

&nbsp; 처음에는 heap이 꽉 찼으니 건드리면 안 되겠다고 판단했다. 확인해 보니 세 서비스 중 하나는 이미 OOM으로 죽고 있었고, 하나는 문제가 없었고, 하나는 지금은 괜찮지만 부하가 늘면 위험한 상태였다. 종료 사유, 컨테이너 RSS, live set을 차례로 보고 나서야 이 차이를 구분할 수 있었다.

&nbsp; 앞으로 메모리 알림을 받으면 heap 그래프보다 종료 사유를 먼저 확인하고, 그다음 컨테이너 RSS와 live set을 볼 생각이다.
