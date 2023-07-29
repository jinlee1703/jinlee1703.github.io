---
layout: post
title: Spring으로 개발한 WAS를 GitHub Actions와 Code Deploy로 CI/CD 파이프라인 구축하기
description: >
  소프트웨어 마에스트로 14기 팀 프로젝트에서 나는 백엔드 파트를 담당하여 Spring Boot를 통한 WAS 개발을 하게 되었다. WAS를 AWS EC2에 배포하는 과정을 직접 겪어보고, 기록하기 위해 게시글을 작성하게 되었다.
sitemap: false
hide_last_modified: true
---

---

## 0. 내가 생각한 CI/CD 시나리오

![image](https://user-images.githubusercontent.com/68031450/256964616-c340b28e-c827-45a0-bbe6-23d7e3f3d5c8.png)

- PR 제출 시
    - GitHub Actions를 통해 build 진행 (build 과정에서 테스트 코드 검증)
    - build의 결과물인 .jar 파일을 압축하여 AWS S3에 업로드
- PR 머지 시
    - AWS Code Deploy를 통해 AWS S3에 업로드된 압축 파일을 EC2 인스턴스에 가져와 압축을 풀고, .jar 파일을 배포 진행

## 1. GitHub Actions를 통한 build 진행하기

### 1.1. 배포를 하기 위한 GitHub Repository 접속 후 화면 상단의 Actions 탭 클릭

![image](https://user-images.githubusercontent.com/68031450/256623233-5e692b02-8165-4229-baa4-ba5b41e75acb.png)

&nbsp; 해당 레포지토리에서 GitHub Actions를 사용하기 위함이다.


### 1.2. Java with Gradle의 'Configure' 버튼 클릭

![image](https://user-images.githubusercontent.com/68031450/256624080-d0ce1622-eb45-440c-bd4a-7daea5a46446.png)

&nbsp; 화면에 있는 Actions들은 Actions Market Place에 있는 workflow들이다. 우리는 gradle을 통한 java build를 진행할 것이므로, `Java with Gradle`을 선택한다.

### 1.3. GitHub Actions 수정

![image](https://user-images.githubusercontent.com/68031450/256960710-a12c6718-46fb-43d3-8ff8-2e232e8e3713.png)

&nbsp; 자 이제 우리가 수정할 수 있는 `.yml` 파일이 `.github/workflows/`의 하위 경로에 생성할 수 있게 되었다. 여기에서 나는 아래와 같이 수정해보았다.

```yml
name: Java CI with Gradle

on:
  pull_request:
    branches: [ "dev", "main" ]   # [dev, main] 브랜치에 PR 시
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
  build:

    runs-on: ubuntu-22.04   # ubuntu 22.04 버전의 환경에서 실행

    steps:
    - uses: actions/checkout@v3
    - name: Set up JDK 17
      uses: actions/setup-java@v3
      with:
        java-version: '17'        # 자바 17 버전 사용
        distribution: 'temurin'
    - name: Build with Gradle
      uses: gradle/gradle-build-action@bd5760595778326ba7f1441bcf7e88b49de61a25 # v2.6.0
      with:
        arguments: build
```

&nbsp; 본인의 개발 환경에 맞게 수정하면 되는데, 내 경우에는 자바 버전과 우분투 버전, 브랜치를 수정해보았다. 추가로 `on` 옵션에서 `workflow_distpatch` 옵션을 추가하면 아래와 같이 Actions 탭에서 수동으로 workflow를 실행시킬 수 있다.

![image](https://user-images.githubusercontent.com/68031450/256961741-f771536b-dc55-4690-8b21-ef5ad0786e28.png)

&nbsp; 하지만 유감스럽게도 내 프로젝트에서 workflow는 동작하지 않았다... 에러 로그를 보니 테스트 실패라고 뜬다.

![image](https://user-images.githubusercontent.com/68031450/256961591-6c2b6247-6068-45ec-b34a-cb012117800b.png)

&nbsp; 원인을 분석해본 결과 2가지로 결론을 내렸다.

1. **`application.yml` 파일이 존재하지 않음** - 우리 프로젝트의 경우 `.gitignore` 파일을 통해 git을 통해 관리를 하지 않고 있는데, 그렇기 때문에 파일이 존재하지 않아 테스트 자체가 실패하는 것이다.
2. **MySQL 의존성 해결** - 우리 프로젝트에서는 MySQL을 통해 데이터를 관리하기 때문에 MySQL을 설치하고 연결해주어야 한다.

### 1.3.1. application.yml 파일 생성

![image](https://user-images.githubusercontent.com/68031450/256962514-3496a80d-7e54-463c-8b74-03e3dd93768f.png)

&nbsp; GitHub 레포지토리 페이지 상단에 `Settings` 탭을 클릭하고, 네비게이션바의 `Secrets and variables`의 하위 항목에서 `Actions`를 클릭하면 위와 같은 화면이 나온다. 여기서 `New repository secret` 버튼을 클릭한다.

![image](https://user-images.githubusercontent.com/68031450/256962946-303d1dea-b753-4037-9b5b-2dcdf695467e.png)

&nbsp; `Name`을 입력하고(필자는 `APPLICATION_YML`이라는 이름으로 입력했음) `Secret` 부분에 Spring에서 사용했던 application.yml의 내용을 전체 복사해서 붙여 넣고, `Add secret` 버튼을 클릭한다.

![image](https://user-images.githubusercontent.com/68031450/256963405-ed55791d-c870-428a-9f90-3f7d84cf7080.png)

&nbsp; 새롭게 Actions secret이 추가된 것을 확인해볼 수 있다. 그리고 workflow 파일에 다음과 같은 내용을 추가해주었다.

```yml
name: make application.yml
  run: |
    mkdir ./src/main/resources
    cd ./src/main/resources
    touch ./application.yml
    echo "${{ secrets.APPLICATION_YML }}" > ./application.yml
    pwd
  shell: bash
```

&nbsp; 프로젝트에서 application.yml 파일 생성 및 덮어쓰는 스크립트다. 순서대로 디렉토리를 생성하고 Actions secret을 통해 application.yml 파일 생성 및 내용을 덮어쓰도록 한다.

### 1.3.2. MySQL 설정

![image](https://user-images.githubusercontent.com/68031450/256964285-5a419356-1c94-47fe-8f4b-4068b2a30875.png)

&nbsp; Actions secret에 `MYSQL_PASSWORD`를 추가해준다.

```yml
- name: Setup MySQL
  uses: mirromutth/mysql-action@v1.1
  with:
    mysql database: 'gifthub' 
    mysql user: 'root'
    mysql password: ${{ secrets.MYSQL_PASSWORD }}
```

&nbsp; 그리고 위 내용을 workflow에 추가해준다. 파일을 정리하면 아래와 같다.

```yml
name: Java CI with Gradle

on:
  pull_request:
    branches: [ "dev", "main" ]
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
  build:
    runs-on: ubuntu-22.04

    steps:
      - name: Checkout PR
        uses: actions/checkout@v3
        with:
          ref: ${{ github.event.pull_request.head.ref }}
      
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17' 
          distribution: 'temurin'
      
      - name: Set up application.yml
        run: |
          mkdir ./src/main/resources
          cd ./src/main/resources
          touch ./application.yml
          echo "${{ secrets.APPLICATION_YML }}" > ./application.yml
          pwd
        shell: bash
        
      - name: Setup MySQL
        uses: mirromutth/mysql-action@v1.1
        with:
          mysql database: 'gifthub' 
          mysql user: 'admin'
          mysql password: ${{ secrets.MYSQL_PASSWORD }}
      
      - name: Build with Gradle
        uses: gradle/gradle-build-action@bd5760595778326ba7f1441bcf7e88b49de61a25
        with:
          arguments: build
```

![image](https://user-images.githubusercontent.com/68031450/256968989-27b455bf-fac2-4b24-ad30-9222ddc48e84.png)

&nbsp; 실행해본 결과 성공하는 것을 확인해볼 수 있다!

## 2. build 후 S3에 .jar 파일 저장하기

...계속

---

### Reference

- [https://ncookie21.tistory.com/m/23](https://ncookie21.tistory.com/m/23)