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

---

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

&nbsp; 각 브랜치에는 특정한 목적이 있으며, 각 브랜치는 `base(병합 당하는 대상)`가 될 수 도 있고, `head(병합 하려는 대상)`이 될 수 있다. 이제 아래에서 각 브랜치들에 대해 좀 더 자세하게 살펴보자.

#### feature

![image](https://user-images.githubusercontent.com/68031450/264684839-4d5b9621-a8cb-4fb9-aa7e-53694886d52a.png)

&nbsp; `feature` 브랜치는 곧 릴리즈되거나 먼 미래의 릴리즈를 위한 **새로운 기능을 개발하는 데 사용**된다. feature 브랜치는 `develop` 브랜치에서 분기되고, 다시 `develop` 브랜치로 병합된다.  기능 개발을 시작할 때 이 기능이 통합될 대상 릴리즈를 해당 시점에서 알 수 없을 수 있다. feature 브랜치의 본질은 기능이 개발 중인 동안 존재하지만 결국에는 다시 `병합(향후 릴리즈에 새로운 기능을 추가하기 위해)`되거나 `폐기(해당 기능을 추가하지 않을 경우)`된다는 것이다.<br>
&nbsp; `feature` 브랜치는 일반적으로 개발자의 local 저장소에만 존재한다.

#### release

![image](https://user-images.githubusercontent.com/68031450/264738852-c508428d-bc05-4d97-87c0-08b6e282d5ad.png)

&nbsp; `release` 브랜치는 릴리즈를 준비하고 테스트하는 단계에서 사용되는 브랜치이다. 이 브랜치를 사용하여 새로운 기능을 추가하지 않고, 오직 버그 수정이나 릴리즈 관련 작업만을 진행한다. 다음 릴리즈 버전을 준비하는 브랜치이기 때문에 버그 수정, 문서 업데이트, 릴리즈 노트 작성이 주요 작업사항이 된다. `develop` 브랜치에서 분기되고, `master` 브랜치와 `develop` 브랜치로 다시 병합된다.
&nbsp; 회사 내부에서 자체적으로 진행되는 자체 테스트(알파 테스트) 시 사용되는 브랜치이다. release 브랜치에서 릴리즈를 준비하는 동안 테스팅과 QA(Quality Assurance)가 진행된다. 릴리즈 후에 문제가 발생하지 않도록 릴리즈 전에 문제를 해결하고 확인하는 단계이다.

#### hotfix

![image](https://user-images.githubusercontent.com/68031450/264743520-b1f8508d-64a5-496d-9d17-eadcbe1e6667.png)

&nbsp; `hotfix` 브랜치는 배포된 애플리케이션에서 발생한 긴급한 버그를 수정하기 위해 사용되는 브랜치이다. 이 브랜치를 사용하여 신속하게 버그를 수정하고, 수정한 내용을 배포 버전에 적용할 수 있도록 한다. hotfix 브랜치는 master 브랜치에서 분기되고, master 브랜치와 develop 브랜치에 병합하도록 한다.
&nbsp; 이미 배포된 애플리케이션에 발생한 긴급한 버그나 보안 취약점을 수정하기 위한 목적으로 사용됨으로써, master 브랜치에서 바로 분기되기 때문에 빠르게 수정 작업을 시작하고 배포 버전에 반영할 수 있다.

---

### Reference

- [https://nvie.com/posts/a-successful-git-branching-model/](https://nvie.com/posts/a-successful-git-branching-model/)
- [https://techblog.woowahan.com/2553/](https://techblog.woowahan.com/2553/)
