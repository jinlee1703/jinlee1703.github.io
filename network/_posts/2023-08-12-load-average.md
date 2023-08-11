---
layout: post
title: load average
description: >
  소프트웨어 마에스트로 14기 팀 프로젝트에서 나는 백엔드 파트를 담당하여 Spring Boot를 통한 API 서버 개발을 하게 되었다. DNS 설정을 하면서 'load average'이라는 키워드를 접하게 되었고, 정확한 정의를 학습하기 위해 게시글을 작성하게 되었다.
sitemap: false
hide_last_modified: true
---

---

### 작성 계기

![image](https://user-images.githubusercontent.com/68031450/260078480-cf76d53d-57ac-4350-9317-3a3a53f56e13.png)

&nbsp; linux에서 `top` 명령어를 실행하면 위 이미지와 같은 화면을 볼 수 있다. 여기서 첫 번째 줄을 보면 `load average`라는 단어를 보게 되었고 해당 수치가 의미하는 것이 무언인지 알기 위해 게시글을 작성하게 되었다.

### 정의

&nbsp; `Load Average`란 얼마나 많은 프로세스가 실행 중 혹은 실행 대기 중인지를 의미하는 수치이다.`R(Running)`과 `D(Unnterruptible waiiting)` 상태 프로세스의 개수를 1분, 5분, 15분마다 평균낸 값을 의미한다. 일반적으로는 1분보다는 5분, 15분의 값을 더 많이 사용한다고 한다.

#### 프로세스 상태

- `R(Runnig)` : CPU에서 실행되고 있는 중 혹은 실행 가능한 상태를 의미한다.
- `D(Unnterruptible waiiting)` : I/O에 의해 대기하는 상태로 다른 어떤 일도 할 수 없음을 의미한다.

### 의미

&nbsp; `Load Average` 값은 CPU의 코어 수에 따라 숫자가 달라지며 각 CPU 코어가 100% Load가 발생할 경우, 1코어는 `1`, 2코어는 값 `2`, 4코어는 값 `4`로 표현된다. 시스템 운영 시 권장되는 수치는 70% 이하인 0.7 이하이며 그 이상일 경우 시스템에 이상이 없는 지 체크할 필요가 있다.<br>
&nbsp; 추가로 1코어에서 2라는 숫자가 나올 수도 있는데, 이 경우에는 100%는 로드된 상태이고 100%는 대기 중인 상태를 의미한다.

### Load Average 확인 방법

- `top` 명령어
- `uptime` 명령어
- `op` 명령어
- `cat /proc/loadavg` 명령어

---

### Reference

- [https://kim-dragon.tistory.com/45](https://kim-dragon.tistory.com/45)
