---
layout: post
title: GitHub Actions
description: >
  본 글은 기존 Notion에서 이전된 게시글입니다.
sitemap: false
hide_last_modified: true
---

---

# 1. GitHub Actions란

## 1.1. 정의

- 코드 저장소(repository)로 유명한 GitHub에서 제공하는 CI(Continuous Intergratiuon, 지속 통합)와 CD(Continuous Deployement, 지속 배포)를 위한 비교적 최근에 추가된 서비스
- GitHub에서 코드를 관리하고 있는 소프트웨어 프로젝트에서 사용할 수 있으며 개인은 누구나 GitHub에서 코드 저장소를 무료로 만들 수 있기 때문에 다른 CI/CD 서비스 대비 진입 장벽이 낮은 편
- GitHub Action을 사용하면 자동으로 코드 저장소에서 어떤 이벤트(event)가 발생했을 때 특정 작업이 일어나게 하거나 주기적으로 어떤 작업들을 반복해서 실행시킬 수도 있음
  - 누군가가 코드 저장소에 Pull Request를 생성하게 되면 GitHub Actions를 통해 해당 코드 변경분에 문제가 없는지 각종 검사를 진행할 수 있음
  - 어떤 새로운 코드가 메인(main) 브랜치에 유입(push)되면 GitHub Actions를 통해 소프트웨어를 빌드(build)하고 상용 서버에 배포(deploy)할 수도 있음
  - 매일 특정 시각에 그날 하루에 대한 통계 데이터를 수집시킬 수도 있음

## 1.2. GitHub Actions의 장점

- 소프트웨어 프로젝트에서 지속적으로 수행해야하는 반복 작업들을 CI/CD라고 함
- 사람이 매번 직접 하기에는 비효율적인데다가 실수할 위험도 있기 때문에 GitHub Actions와 같이 자동화시키는 것이 유리함
- 기존 CI/CD 서비스 대비 간편한 설정과 높은 접근성으로 특히 개발자들 사이에서 많은 호응을 얻고 있음
  - 예전에는 CI/CD가 DevOps 엔지니어의 전유물로만 여겨지곤 했음
  - 최근에는 GitHub Actions를 통해서 일반 개발자들도 어렵지 않게 CI/CD 설정을 스스로 하는 것을 볼 수 있음

# 2. 핵심 개념

## 2.1. Workflows

- 작업 흐름, **자동화 해놓은 작업 과정**
- 코드 저장소 내에서 .github/workflows 폴더 아래에 위치한 YAML 파일로 설정
  - 하나의 코드 저장소에는 여러 개의 워크플로우, 즉 여러 개의 YAML 파일을 생성할 수 있음
- on 속성 : 해당 워크플로우가 언제 실행되는 지를 정의함

  - ex) 코드 저장소의 main 브랜치에 push 이벤트가 발생할 때마다 워크 플로우를 실행

    ```yaml
    # .github/workflows/example.yml
    on:
      push:
        branches:
          - main

    jobs:
      # ...(생략)...
    ```

  - ex) 매일 자정에 워크플로우 실행

    ```yaml
    # .github/workflows/hello
    on:
      schedule:
        - cron: "0 0 * * *"

    jobs:
      # ...(생략)...
    ```

## 2.2. Jobs

- 해당 워크 플로우가 구체적으로 어떤 일을 해야하는지 명시
- 작업(job), 독립된 가상 머신(machine) 또는 컨테이너(container)에서 돌아가는 하나의 처리 단위를 의미
- 하나의 워크플로우는 여러 개의 작업으로 구성되며 적어도 하나의 작업은 있어야 함
  - 없을 경우, 실행할 작업이 없으니 워크플로우가 의미가 없음
- 모든 작업은 기본적으로 동시에 실행되며 필요 시 작업 간에 의존 관계를 설정하여 작업이 실행되는 순서를 제어할 수도 있음
- 워크 플로우 YAML 파일 내에서 job 속성을 사용하며 작업 식별자(ID)와 작업 세부 내용 간의 맵핑(mapping) 형태로 명시됨

  - ex) job1, job2, job3라는 작업 ID를 가진 3개의 작업을 추가

    ```yaml
    # .github/workflows/example.yml

    # ...(생략)...
    jobs:
      job1:
        # job1에 대한 세부 내용
      job2:
        # job2에 대한 세부 내용
      job3:
        # job3에 대한 세부 내용
    ```

- 작업의 세부 내용으로는 여러 가지 내용을 명시할 수 있음

  - 필수로 들어가야하는 runs-on 속성을 통해 해당 리눅스나 윈도우와 같은 실행 환경을 지정해줘야 함
  - ex) 우분투 최신 실행 환경에서 해당 작업 실행

    ```yaml
    # .github/workflows/example.yml

    # ...(생략)...
    jobs:
      job1:
        runs-on: ubuntu-latest
        steps:
          # ...(생략)...
    ```

## 2.3. Steps

- 작업 순서 정의
- 정말 단순한 작업이 아닌 이상 하나의 작업은 일반적으로 여러 단계의 명령을 순차적으로 실행하는 경우가 많음
  - GitHub Actions에서는 각 작업(job)이 하나 이상의 단계(stop)로 모델링이 됨
- 작업 단계는 단순한 커맨드(command)나 스크립트(script)가 될 수도 있고 액션(action)이라는 좀 더 복잡한 명령일 수도 있음
  - run 속성 : 커맨드나 스크립트를 실행할 때 사용
  - uses 속성 : 액션 사용
- ex) 자바스크립트 프로젝트에서 테스트를 실행할 때

  1. 코드 저장소에 코드를 작업 실행 환경으로 내려 받음
  2. 패키지 설치
  3. 테스트 스크립트 실행

  ```yaml
  # ...(생략)...

  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - run: npm install
        - run: npm test
  ```

  - 워크 플로우 파일 내에서 작업 단계를 명시해줄 때, YAML 문법에서 시퀀스(sequence) 타입을 사용하기 때문에 각 단계 앞에 반드시 - 를 붙여줘야 함

## 2.4. Actions

- GitHub Acitons에서 빈번하게 필요한 반복 단계를 재사용하기 용이하도록 제공되는 일종의 작업 공유 메커니즘
- 하나의 코드 저장소 범위 내에서 여러 워크플로우 간에서 공유를 할 수 있음
- 또한, 공개 코드 저장소를 통해 액션을 공유하면 GitHub 상의 모든 저장소에서 사용이 가능해짐
- GitHub에서 제공하는 공개 액션으로는 위 예제에서도 사용했던 체크 아웃 액션(`actions/checkout`)`이 있음`
  - 대부분의 CI/CD 작업은 코드 저장소로부터 코드를 작업 실행 환경으로 내려받는 것으로 시작하므로 이 액션은 매우 빈번하게 사용됨
  - 또한, GitHub Marketplace에서는 수 많은 벤더(vendor)가 공개해놓은 다양한 액션을 쉽게 접할 수 있음
    - 액션을 중심으로 하나의 큰 커뮤니티가 형성이 되고 더 많은 사용자와 벤더가 GitHub Actions으로 몰려드는 선순환이 일어나고 있음

# 3. 결론

- **워크플로우(workflow)** : 자동화 시켜놓은 작업 과정을 뜻하며 YAML 파일을 통해 어떤 작업(job)들이 언제 실행되야 하는지를 설정
- 각 **워크플로우**는 독립된 환경에서 실행되는 **작업(job)이 적어도 한 개 이상으로 구성**되며, 각 작업에는 **작업 ID**가 부여되고 **세부 내용**(실행 환경, 작업 단계 등)이 명시
- **하나의 작업**은 보통 순차적으로 수행되는 **여러 개의 단계(step)로 정의**되며, 각 단계는 단순한 **커맨드(command)**일 수도 있고 **추상화된 액션(action)**일 수도 있음

---

### Reference

[GitHub Actions의 소개와 핵심 개념](https://www.daleseo.com/github-actions-basics/)
