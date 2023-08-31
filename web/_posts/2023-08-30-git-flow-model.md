---
layout: post
title: Git-flow 전략
description: >
  Git-flow 전략을 100% 이해하고, 실제 운영 환경에서 
sitemap: false
hide_last_modified: true
---

---

## 서론

### 배경

&nbsp; 소프트웨어 마에스트로 과정이 어느새 중반을 넘어섰다. 우리 팀의 서비스가 배포에 임박했고, 전담 멘토님들께서 실제 서비스를 운영하기 위해서는 운영 환경과 개발 환경을 분리해야 한다는 피드백을 주셨다. 우리의 GitHub 레포지토리는 현재 Git-flow 모델을 채택하고 있는데 보다 잘 녹여내보기 위해 게시글을 작성하게 되었다

### 주의 사항

&nbsp; `Git-flow` 전략은 2010년에 Vincet Driessesn으로부터 고안된 전략이다. 현재는 10년이 넘은 전략이고, 지난 10년 동안 Git-flow는 Git Branching Model 중 표준으로 자리 매김할 정도로 많은 소프트웨어 팀 사이에서 인기를 끌고 있다.<br>
&nbsp; 하지만 `Git-flow`는 만병통치약이 아니다. 현재 본인의 팀에 적합한 브랜치 모델을 찾는 것이 중요하다. 예로 `GitHub-flow`와 비교해보면 GitHub-flow는 비교적 단순한 구조를 가지고 있기 때문에 비교적 개발 속도를 빠르게 가져감으로써 빠르게 배포할 수 있고, 이를 통해 더 빠른 피드백을 얻을 수 있다.<br>
&nbsp; 결과적으로 어떤 모델을 선택하느냐는 프로젝트의 특성, 프로젝트 규모, 팀원의 개발 방식, 팀원들의 역량 등에 따라 다르고, 선택을 하는 것은 본인의 몫이고 스스로 결정해야 한다.

## Git-flow

### The main braches

&nbsp; 기본적으로 중앙 저장소(이하 `origin`)에는 수명이 무한한 두 개의 주요 브랜치가 있다.

- `master`
- `develop`

&nbsp; `master` 브랜치의 경우에는 모든 Git 사용자에게 익숙할 것이다. 추가로 Git-flow 모델에서는 `master` 브랜치와 함께 사용하는 `develop` 브랜치가 존재한다. `origin/master`는 `HEAD`의 소스 코드가 항상 운영 준비 상태를 반영하는 브랜치이고, `origin/develop`은 `HEAD`의 소스 코드가 항상 최신 개발 변경 사항이 포함된 상태를 반영하는 브랜치로 간주된다. `origin/develop` 브랜치의 소스 코드가 안정적인 지점에 도달하고 릴리즈할 준비가 되었다면, 모든 변경 사항을 `origin/master`에 병합하고, 태그를 통해 릴리즈 번호를 지정한다.<br>
&nbsp; **결과적으로 변경 사항이 `origin/master`에 병합될 때마다 새로운 버전이 애플리케이션이 배포되는 것이다.**

### Supporting branches

&nbsp; 기본 브랜치인 `master`와 `develop` 브랜치 외에도 다양한 지원 브랜치를 사용하여 팀원 간의 병렬 개발을 지원하고 기능 추적을 용이하게 하여 배포 및 운영에 관련된 문제를 신속하게 해결하는데 도움을 준다. `main branches`와 달리, 이 브랜치들은 `origin`에서 제거되기 때문에 항상 수명이 제한되어 있다. 브랜치의 종류는 아래와 같다.

- `feature`
- `release`
- `hotfix`

&nbsp; 각 브랜치에는 특정한 목적이 있으며, 각 브랜치는 `base(병합 당하는 대상)`가 될 수 도 있고, `head(병합 하려는 대상)`이 될 수 있다.
