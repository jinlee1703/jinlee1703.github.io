---
layout: post
title: Spring + Docker + GitHub Actions를 통한 CI/CD 파이프라인 구축
description: >
  소프트웨어 마에스트로 14기 팀 프로젝트에서 나는 백엔드 파트를 담당하여 Spring Boot를 통한 WAS 개발을 하게 되었다. Docker를 도입하고, WAS를 AWS EC2에 배포하는 과정을 직접 겪어보고, 기록하기 위해 게시글을 작성하게 되었다.
sitemap: false
hide_last_modified: true
---

---

## 0. 목차

- [1. 작성 배경](#1-작성-배경)
  - [1.1. Docker를 도입하게 된 계기](#11-docker를-도입하게-된-계기)
  - [1.2. Docker Hub를 선택한 이유](#12-docker-hub를-선택한-이유)
  - [1.3. CI/CD 파이프라인 시나리오](#13-cicd-파이프라인-시나리오)
- [2. Docker 환경 파일](#2-docker-환경-파일)
  - [2.1. Dockerfile](#21-dockerfile)
  - [2.2. docker-compose.yml](#22-docker-composeyml)
- [3. CI](#3-ci)
  - [3.1. Compare branch 코드 내려 받기](#31-compare-branch-코드-내려-받기)
  - [3.2. 자바 환경 설정](#32-자바-환경-설정)
  - [3.3. Spring 환경 변수 설정](#33-spring-환경-변수-설정)
  - [3.4. 테스트를 위한 MySQL 설정](#34-테스트를-위한-mysql-설정)
  - [3.5. 테스트를 위한 빌드 실행](#35-테스트를-위한-빌드-실행)
  - [3.6. Docker 이미지 build 및 push](#36-docker-이미지-build-및-push)
- [4. CD](#4-cd)
  - [4.1. dev branch 코드 내려 받기](#41-dev-branch-코드-내려-받기)
  - [4.2. 자바 환경 설정](#42-자바-환경-설정)
  - [4.3. AWS SSM을 통한 Run-Command (Docker 이미지 pull 후 docker-compose를 통한 실행)](#43-aws-ssm을-통한-run-command-docker-이미지-pull-후-docker-compose를-통한-실행)
- [5. 결론](#5-결론)
- [Reference](#reference)

## 1. 작성 배경

&nbsp; [기존 GitHub Actions + AWS CodeDeploy를 통한 CI/CD 파이프라인을 구축하는 과정](https://jinlee1703.github.io/devops/2023-07-28-Spring-CICD/)에서 어려움을 겪었다. 특히 Docker를 도입하면서 알게된 사실이지만 AWS EC2의 IAM Role과 AWS CodeDeploy의 IAM Role을 개별로 부여해야 된다는 것을 몰랐었다.<br>
&nbsp; Spring Boot를 통한 WAS 개발을 처음하는 주니어 개발자들에게 도움이 되고자 문서를 작성하게 되었다.

### 1.1. Docker를 도입하게 된 계기

&nbsp; 궁극적인 이유는 CI/CD 파이프라인을 보다 쉽고 빠르게 구축할 수 있을 거 같다는 점이었다. `기존 AWS CodeDeploy를 통한 CI/CD 파이프라인`과 현재 `Docker를 통한 CI/CD 파이프라인`은 GitHub Actions Runner 환경을 기반으로 실행 및 배포된다는 점에서는 동일하지만, 이전 파이프라인은 우리 프로젝트에서의 AWS EC2의 환경과 달라 의존성과 환경 변수 주입에 대해 어려움을 겪었다. 그 중에서도 `VPC` 내의 `Private Subnet` 안에 있는 was 서버에 대한 접근을 하는 것 자체에 굉장히 어려움(이건 사실 Docker를 통해 해결했다기 보다는 추후 나올 AWS SSM을 통해 해결한 것에 가깝다)을 겪었다.<br>
&nbsp; Docker를 도입함으로써 **GitHub Actions Runner 환경과 우리 개발 환경에 대한 일관성을 제공**하고, 추후 **개발 환경이 변경되더라도 손쉽게 배포를 할 수 있도록 파이프라인을 구축**하고, **이미지 버전 관리를 통해 이전 버전으로 쉽게 롤백**하고자 도입하게 되었다. 또한, 기존 AWS CodeDeploy를 사용한 CI/CD 파이프라인의 경우에는 비교적 레퍼런스도 적었고, 최신의 것도 아니였던 점도 Docker를 도입하는데 작은 영향이 있었다.

### 1.2. Docker Hub를 선택한 이유

&nbsp; [이전 문서](https://jinlee1703.github.io/devops/2023-08-01-Docker/)에서 간단하게 `Docker Hub`와 `AWS ECR`에 대해서 간단하게 비교해보았다. 사실 이번 프로젝트에 도입하기 위해 비교해본 것이였는데 결론적으로 우리 프로젝트에서는 `Docker Hub`를 통해 이미지를 저장 및 관리하기로 했다. 그 이유는 아래와 같다.

- Docker Hub는 Docker의 공식 이미지 레지스트리 서비스이므로 AWS에 종속적이지 않기 때문에 인프라 환경이 변경되더라도 문제가 없을 거라고 판단됨
- Docker Hub에는 방대한 양의 퍼블릭 레포지토리가 있음 => 레퍼런스가 많다는 의미
- 기존 구글 팀 계정을 통해 Organization을 대체하고, 하나의 계정 당 하나의 Private 레포지토리를 만들 수 있다는 점을 통해 이를 해결함

### 1.3. CI/CD 파이프라인 시나리오

![image](https://user-images.githubusercontent.com/68031450/258661534-2cbdf967-fa2f-4d61-9e9b-d280f66dfe9e.png)

&nbsp; 궁극적으로 내가 설계한 CI/CD 파이프라인은 위와 같다. 자세한 내용은 아래에서 한 단계씩 자세히 설명하도록 하겠다.

## 2. Docker 환경 파일

### 2.1. Dockerfile

```yaml
# base-image
FROM openjdk:17
# build file path
ARG JAR_FILE=build/libs/*.jar
# copy jar file to container
COPY ${JAR_FILE} app.jar
# copy application.yml to container
VOLUME ["./src/main/resources/application.yml", "/src/main/resources/application-prod.yml"]
# run jar file
ENTRYPOINT ["java","-jar","/app.jar", "--spring.profiles.active=prod"]
```

&nbsp; Spring Boot 애플리케이션을 위한 `Dockerfile`이다. 우리 프로젝트는 `java 17` 버전을 사용하기 때문에 base-image를 `FROM` 키워드로 설정해주었다. 그리고 `ARG`와 `COPY` 키워드를 통해 java 실행 파일을 `app.jar`라는 이름으로 복사하여 실행하도록 하였고, Spring 환경 변수인 `application.yml`을 컨테이너 내에 종속시키기 위해 `VOLUME` 키워드를 사용하였다. 최종적으로는 `ENTRYPOINT` 키워드를 통해 복사한 `app.jar` 파일을 `prod`(production) 환경에서 실행하도록 하였다.

### 2.2. docker-compose.yml

```yaml
version: '3'
services:
  was:
    container_name: gifthub-was
    image: repl4242/gifthub-was
    expose:
      - 8080
    ports:
      - 8080:8080
```

&nbsp; 우리 Docker Hub 레포지토리의 컨테이너 이름과 이미지 이름을 기입해주었고, 실제 서비스할 포트를 설정해주었다.

## 3. CI

```yaml
# on_pull_request.yml
name: Continuous Integration

on:
  pull_request:
    branches: [ "dev" ]
  workflow_dispatch:
    inputs:
      logLevel:
        description: 'Log level'
        required: true
        default: 'warning'
        type: choice
        options:
          - info
          - warning
          - debug
      tags:
        description: 'Test scenario tags'
        required: false
        type: boolean
      environment:
        description: 'Environment to run tests against'
        type: environment
        required: false

permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-22.04

    steps:
      # 1. Compare branch 코드 내려 받기
      - name: Checkout PR
        uses: actions/checkout@v3
        with:
          ref: ${{ github.event.pull_request.head.ref }}

      # 2. 자바 환경 설정
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'

      # 3. Spring 환경 변수 설정
      - name: Set up application.yml
        run: |
          mkdir ./src/main/resources
          cd ./src/main/resources
          touch ./application.yml
          echo "${{ secrets.APPLICATION }}" > ./application.yml
          touch ./application-dev.yml
          echo "${{ secrets.APPLICATION_DEV }}" > ./application-dev.yml
          touch ./application-prod.yml
          echo "${{ secrets.APPLICATION_PROD }}" > ./application-prod.yml
        shell: bash

      # 4. 테스트를 위한 MySQL 설정
      - name: Setup MySQL
        uses: mirromutth/mysql-action@v1.1
        with:
          mysql database: ${{ secrets.MYSQL_DATABASE }}
          mysql user: ${{ secrets.MYSQL_USER }}
          mysql password: ${{ secrets.MYSQL_PASSWORD }}

      # 5. 테스트를 위한 빌드 실행
      - name: Build with Gradle
        uses: gradle/gradle-build-action@bd5760595778326ba7f1441bcf7e88b49de61a25
        with:
          arguments: build

      # 6. Docker 이미지 build 및 push
      - name: docker build and push
        run: |
          docker login -u ${{ secrets.DOCKER_USERNAME }} -p ${{ secrets.DOCKER_PASSWORD }}
          docker build -t gifthub-was .
          docker tag gifthub-was:latest repl4242/gifthub-was:latest
          docker push repl4242/gifthub-was:latest
```

&nbsp; 위의 파일이 필자가 작성한 GitHub Actions CI 파이프라인이다. 각 `step`에 따른 설명은 아래에서 자세히 풀어쓰도록 하겠다.

### 3.1. Compare branch 코드 내려 받기

```yaml
- name: Checkout PR
  uses: actions/checkout@v3
  with:
    ref: ${{ github.event.pull_request.head.ref }}
```

&nbsp; compare branch의 소스 코드를 사용하기 위한 actions이다. `with: ref:`에 `${{ github.event.pull_request.head.ref }}`를 입력하면, pull_request를 한 브랜치의 소스 코드를 참조할 수 있다. 예를 들어 `dev` 브랜치에 `feat` 브랜치가 pr을 제출하면 `feat` 브랜치의 소스 코드를 활용한다. GitHub Actions Marketplace에 올라와 있는 `actions/checkout@v3`를 활용하였다. 자세한 내용은 [해당 문서](https://github.com/actions/checkout)를 참고하길 바란다.

### 3.2. 자바 환경 설정

```yaml
- name: Set up JDK 17
  uses: actions/setup-java@v3
  with:
    java-version: '17'
    distribution: 'temurin'
```

&nbsp; 자바 환경 설정을 하기 위한 actions이다. 우리 프로젝트는 `java 17` 버전을 사용하고 있으므로 이에 맞게 설정해두었다. 마찬가지로 GitHub Actions Marketplace에 올라와 있는 `actions/setup-java@v3`를 활용하였다. 자세한 내용은 [해당 문서](https://github.com/actions/setup-java)를 참고하길 바란다.

### 3.3. Spring 환경 변수 설정

```yaml
- name: Set up application.yml
  run: |
    mkdir ./src/main/resources
    cd ./src/main/resources
    touch ./application.yml
    echo "${{ secrets.APPLICATION }}" > ./application.yml
    touch ./application-dev.yml
    echo "${{ secrets.APPLICATION_DEV }}" > ./application-dev.yml
    touch ./application-prod.yml
    echo "${{ secrets.APPLICATION_PROD }}" > ./application-prod.yml
  shell: bash
```

&nbsp; Spring Boot 환경 변수 파일을 생성하기 위한 스크립트이다. 우리 프로젝트의 경우에는 `.gitignore` 파일을 통해 `application.yml` 등의 파일을 git에서 관리하지 않도록 제외하였으므로 해당 파일을 생성해주는 별도 스크립트를 추가하였다.

### 3.4. 테스트를 위한 MySQL 설정

```yaml
- name: Setup MySQL
  uses: mirromutth/mysql-action@v1.1
  with:
    mysql database: ${{ secrets.MYSQL_DATABASE }}
    mysql user: ${{ secrets.MYSQL_USER }}
    mysql password: ${{ secrets.MYSQL_PASSWORD }}
```

&nbsp; 우리 프로젝트에서는 `@SpringBootTest`를 많이 사용하고 있는데, 이를 위해 DB Connection(우리 프로젝트에서는 MySQL)이 필요하여 사용하게 된 Actions이다. 마찬가지로 GitHub Actions Marketplace에 올라와 있는 `mirromutth/mysql-action@v1.1`를 활용하였다. 자세한 내용은 [해당 문서](https://github.com/mirromutth/mysql-action)를 참고하길 바란다.

### 3.5. 테스트를 위한 빌드 실행

```yaml
- name: Build with Gradle
  uses: gradle/gradle-build-action@bd5760595778326ba7f1441bcf7e88b49de61a25
  with:
    arguments: build
```

&nbsp; 작성한 테스트 코드 성공 여부를 체크하기 위해 build를 실행하는 Actions이다. 테스트가 실패할 경우 build가 되지 않기 때문에 결과적으로 전체 workflow가 실패하게 되고, 결과적으로 CI가 중지되게 된다. 마찬가지로 GitHub Acitons Marketplace에 올라와 있는 `gradle/gradle-build-action`를 활용하였다. 자세한 내용은 [해당 문서](https://github.com/gradle/gradle-build-action)를 참고하길 바란다.

### 3.6. Docker 이미지 build 및 push

```yaml
- name: docker build and push
  run: |
    docker login -u ${{ secrets.DOCKER_USERNAME }} -p ${{ secrets.DOCKER_PASSWORD }}
    docker build -t gifthub-was .
    docker tag gifthub-was:latest repl4242/gifthub-was:latest
    docker push repl4242/gifthub-was:latest
```

&nbsp; `Docker Hub`에 login 후 이미지를 build, push하는 스크립트이다.

## 4. CD

```yaml
name: Continuous Deployment

on:
  push:
    branches: [ "dev" ]
  workflow_dispatch:
    inputs:
      logLevel:
        description: 'Log level'
        required: true
        default: 'warning'
        type: choice
        options:
          - info
          - warning
          - debug
      tags:
        description: 'Test scenario tags'
        required: false
        type: boolean
      environment:
        description: 'Environment to run tests against'
        type: environment
        required: false

permissions:
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-22.04

    steps:
      # 1. dev branch 코드 내려 받기
      - name: Checkout PR
        uses: actions/checkout@v3
        with:
          path: dev

      # 2. 자바 환경 설정
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'

      # AWS SSM을 통한 Run-Command (Docker 이미지 pull 후 docker-compose를 통한 실행)
      - name: AWS SSM Send-Command
        uses: peterkimzz/aws-ssm-send-command@master
        id: ssm
        with:
          aws-region: ${{ secrets.AWS_REGION }}
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          instance-ids: ${{ secrets.INSTANCE_ID }}
          working-directory: /home/ubuntu
          command: |
            docker login -u ${{ secrets.DOCKER_USERNAME }} -p ${{ secrets.DOCKER_PASSWORD }}
            docker pull repl4242/gifthub-was:latest
            docker-compose up
```

&nbsp; 위의 파일이 필자가 작성한 GitHub Actions CD 파이프라인이다. 마찬가지로 각 `step`에 따른 설명은 아래에서 자세히 풀어쓰도록 하겠다.

### 4.1. dev branch 코드 내려 받기

```yaml
- name: Checkout PR
  uses: actions/checkout@v3
  with:
    path: dev
```

&nbsp; dev branch의 소스 코드를 사용하기 위한 actions이다. merge가 된 이후 실행되는 workflow이기 때문에 compare 브랜치가 아닌 base 브랜치인 dev 브랜치의 소스 코드를 사용하도록 한다. actions에 대한 설명은 위에서 서술하였으므로 생략한다.

### 4.2. 자바 환경 설정

```yaml
- name: Set up JDK 17
  uses: actions/setup-java@v3
  with:
    java-version: '17'
    distribution: 'temurin'
```

&nbsp; 자바 환경 설정을 하기 위한 actions이다. 이 내용은 삭제하여도 아마 별 문제없이 동작할 것이다. actions에 대한 설명은 위에서 서술하였으므로 생략한다.

### 4.3. AWS SSM을 통한 Run-Command (Docker 이미지 pull 후 docker-compose를 통한 실행)

```yaml
- name: AWS SSM Send-Command
  uses: peterkimzz/aws-ssm-send-command@master
  id: ssm
  with:
    aws-region: ${{ secrets.AWS_REGION }}
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    instance-ids: ${{ secrets.INSTANCE_ID }}
    working-directory: /home/ubuntu
    command: |
      docker login -u ${{ secrets.DOCKER_USERNAME }} -p ${{ secrets.DOCKER_PASSWORD }}
      docker pull repl4242/gifthub-was:latest
      docker-compose up
```

&nbsp; 이 workflow의 꽃이라고 볼 수 있다. `AWS SSM`이란 AWS에서 제공하는 관리 서비스로, 인스턴스 및 리소스를 효과적으로 관리하고 자동화하기 위한 기능이다. 그중에서도 나는 `Run-Command`라는 기능을 통해 EC2 인스턴스에 원격으로 명령을 실행하도록 하였다.<br>
&nbsp; GitHub Acitons Marketplace에 올라와 있는 `peterkimzz/aws-ssm-send-command@master`를 활용하였다. 추가적으로 이 actions를 사용하기 위해 반드시 USER ROLE IAM과 EC2 ROLE IAM에 `AmazonSSMFullAccess`를 추가해주도록 한다. 자세한 내용은 [해당 문서](https://github.com/marketplace/actions/aws-ssm-send-command#Usage-example)를 참고하길 바란다.

## 5. 결론

&nbsp; 기존 `AWS CodeDeploy`에서 `Docker` 도입을 통해 해결하고자 하는 CI/CD 파이프라인의 문제점은 세 가지 였다.

- VPC 내의 AWS EC2 인스턴스 접근이 어려움
- 애플리케이션 버전 rollback의 어려움 (추후 개선 가능)
- 추후 배포 환경 변경에 따른 우려

&nbsp; 첫 번째 문제점인 **VPC 내의 AWS EC2 인스턴스 접근이 어려운 점**은 기존 EC2 IAM Role의 충돌 해결과 AWS SSM을 사용하였으므로 `Docker`를 도입하면서 해결된 문제라고 보기에는 어렵다.<br>
&nbsp; 두 번째 문제점인 **애플리케이션 버전 rollback의 어려움**은 `AWS S3`에 build된 파일을 압축하고 이에 대한 파일명을 다르게 가져감으로써 해결할 수 있었던 부분이기 때문에 마찬가지로 `Docker`를 도입하면서 해결된 문제라고 보기에는 어렵다.<br>
&nbsp; 마지막으로 **추후 배포 환경 변경에 따른 우려**의 경우에는 Docker를 통해 이식성을 높일 수 있을 것으로 기대된다.

---

## Reference

- [https://velog.io/@dhk22/Docker-spring-boot-프로젝트-도커-이미지로-빌드](https://velog.io/@dhk22/Docker-spring-boot-프로젝트-도커-이미지로-빌드)
- [https://velog.io/@rmswjdtn/Spring-Docker-Github-Action-Spring-Boot-%EC%9E%90%EB%8F%99%EB%B0%B0%ED%8F%AC%ED%99%98%EA%B2%BD-%EB%A7%8C%EB%93%A4%EA%B8%B0](https://velog.io/@rmswjdtn/Spring-Docker-Github-Action-Spring-Boot-%EC%9E%90%EB%8F%99%EB%B0%B0%ED%8F%AC%ED%99%98%EA%B2%BD-%EB%A7%8C%EB%93%A4%EA%B8%B0)
- [https://github.com/marketplace/actions/aws-ssm-send-command#Usage-example](https://github.com/marketplace/actions/aws-ssm-send-command#Usage-example)
