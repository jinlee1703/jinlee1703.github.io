---
layout: post
title: Spring Initalizr
description: >
  소프트웨어 마에스트로 과정을 진행하면서 본격적인 팀 프로젝트를 진행하기 전, 간단하게 미니 프로젝트를 진행하기로 하였다. 나는 백엔드 파트를 담당하여 Spring Boot를 통한 API 서버 개발을 하게 되었고, Spring Initalizr를 사용하는 이유에 대해서 명확히 이해하고자 해당 문서를 작성하게 되었다.
sitemap: false
hide_last_modified: true
---

---

## Spring Initalizr란

&nbsp; 나는 이번 프로젝트를 진행하기 전에는 NestJS를 통한 BE 개발을 공부하였기 때문에 NestJS에서는 `nest new my-nest-project`라는 명령어로 NestJS의 Generator를 통해 프로젝트를 생성하여 개발을 시작하였다. 하지만 이번 프로젝트에서는 Spring Boot를 통해 BE 개발을 하기 위해서 Spring을 학습 중인데, Spring Boot를 개발하기 위해서는 일반적으로 Spring Initializr를 통해 프로젝트를 생성한다고 한다. <br>
&nbsp; **Spring Initalizr**란 **Spring Boot 프로젝트를 만들기 위한 방법** 중 하나로 Spring Boot 프로젝트의 스캐폴딩(Scaffolding)을 지원해주는 사이트이다.

사이트 주소는 다음과 같다.

[https://start.spring.io/](https://start.spring.io/)

### 스캐폴딩이란

&nbsp; 스캐폴딩이라는 단어는 본래 건축 분야에서 유래되었다고 한다. 공사 현장을 지나다보면 건물의 외벽에 임시로 작업자들이 지나다닐 수 있도록 만든 구조물이 있는데, 이것이 스캐폴드이다.<br><br>
&nbsp; 컴퓨터 프로그래밍에서도 **스캐폴딩**이라는 용어를 두 가지로 구분해서 사용된다고 한다. 우선 첫 번째는 **초기 프로젝트의 뼈대를 만들어주는 행위**이다. 어떤 프로젝트를 시작할 때 기본적인 README, License를 비롯한 디렉토리 구조, 컴파일 설정 등이 자동으로 생성하는 CLI 혹은 UI 도구가 이와 같다.<br>
&nbsp; 두 번째로는 **일부 MVC(Model-View-Controller) 프레임워크에서 개발자가 사용하고자 하는 모델을 정의하면 자동으로 관련된 보일러 플레이트 코드가 만들어지는 기법을 의미**한다. 루비 온 레일즈(Ruby on Rails)에서 처음 도입되었다고 한다. 만약 보일러 플레이트가 무엇인지 모른다면 필자가 작성한 문서에서 보일러 플레이트에 대한 내용을 짧게 읽어보길 권장한다.

[https://jinu0137.github.io/development/2022-09-12-webpack-babel-source_map-boilerplate/](https://jinu0137.github.io/development/2022-09-12-webpack-babel-source_map-boilerplate/)

&nbsp; 크게 두 가지로 나뉘긴 하지만 자동으로 보일러플레이트 코드를 만들어준다는 관점에서 볼때는 두 가지 모두 같은 행위를 한다고 볼 수 있다. 많은 프레임워크에서 첫 번째 의미에 해당하는 스캐폴딩을 아래와 같이 지원한다.

- React.js 의 **CRA (Create React Application)**
- Nest.js의 `nest new PROJECTNAME`
- C#(.Net)의 **Visual Studio에서 새 프로젝트 만들기**
- IntelliJ에서 **Java 프로젝트 만들기**

## Spring Initalizr 사용법

### 사이트 접속

![image](https://user-images.githubusercontent.com/68031450/244983084-737b2b77-0702-4534-9e96-c865a5e2963e.png)

&nbsp; 필자의 문서 작성 시간(`23. 6. 12. 09:00) 기준 [Spring Initalizr](https://start.spring.io/) 사이트에 접속하면 나오는 화면이다.

### Project

![image](https://user-images.githubusercontent.com/68031450/244983431-1c025955-2d28-42d5-ac79-49367cc918f6.png)

&nbsp; **프로젝트 관리 도구**이다. 라이브러리 다운로드/통합, 빌드 자동화 등의 역할을 한다. 크게 Gradle과 Maven으로 나뉘어져 있는데, **Maven**의 경우에는 Project Object Model 기반으로, `pom.xml` 파일을 통해 관리한다. **Gradle - Groovy**의 경우 Groovy 기반으로 `build.gradle` 파일을 통해 관리된다. 아마 **Gralde - Kotlin**의 경우에는 코틀린 기반으로 관리되지 않을까 추측한다.<br>
&nbsp; 추가로 Dependency를 추가할 때 [https://mvnrepository.com/](https://mvnrepository.com/) 해당 사이트를 통해 본인이 사용할 버전을 고르는 것을 추천한다. 필자의 선택 기준은 사용자가 많고, 보안이 안정적인 것을 우선으로 선택한다.

### Language

![image](https://user-images.githubusercontent.com/68031450/244984151-53d3905a-f208-4287-ab66-212c5429afd9.png)

&nbsp; 개발자가 개발을 진행하기 위한 개발 언어이다.

### Spring Boot

![image](https://user-images.githubusercontent.com/68031450/244984253-329eddd9-c89f-4ba5-ac60-22a5a1fabfce.png)

&nbsp; Spring Boot의 버전을 의미한다. 현재 사진에는 **SNAPSHOT**만 있으나 크게 아래의 유형이 존재한다. 만약 아무것도 붙어있지 않은 버전일 경우에는 안정화된 버전이므로 개발을 처음 시작한다면 아무것도 붙어있지 않은 버전을 사용하는 것을 추천한다.

- SNAPSHOT : 아직 개발이 완료되지 않은 버전
- M(Milestone) : 개발은 완료되었으나, 아직 기능들을 개선하는 중 또는 버그를 수정하고 있는 버전
- RC(Release Candidate) : 기능 개선과 버그 수정이 완료되었으나, 최종적으로 릴리즈되지는 않은 버전

### Project Metadata

![image](https://user-images.githubusercontent.com/68031450/244984508-e6c6e7eb-78d6-4a56-a2af-c2b0e0c85fcc.png)

&nbsp; 프로젝트의 정보를 입력하는 부분이다. 입력 항목과 이에 따른 의미는 아래와 같다.

- Group : 프로젝트를 만드는 그룹의 이름으로, 보통 기업의 도메인 명을 역순으로 입력
- Artifact : 빌드 결과물의 이름
- Name : 프로젝트의 이름
- Description : 프로젝트에 대한 간략한 설명
- Package name : 프로젝트에 생성할 패키지명
- Packaging : 배포를 위해 프로젝트를 압축하는 방법
- Java : PC에 설치된 JDK의 버전을 선택

### Dependencies

![image](https://user-images.githubusercontent.com/68031450/244984843-37fbcb0b-f1ff-4e1e-96d0-ccdbed367958.png)
[ADD DEPENDENCIES 버튼을 클릭했을 때 나오는 화면]

![image](https://user-images.githubusercontent.com/68031450/244984906-9eb67ace-4943-4695-9842-1c18e4ec799f.png)
[Dependency 추가 시 화면에서 확인할 수 있음]

&nbsp; 프로젝트를 통해 만들 애플리케이션의 동작에 필요한 라이브러리를 선택하는 항목이다. 만약 여기서 미처 선택하지 못하였다고 다시 라이브러리를 추가하고 Spring Initializr의 Generate 버튼을 누를 필요는 없다. 어차피 본인이 선택한 Project(Gralde, Maven)에 따라, 다른 방법으로 라이브러리를 어렵지 않게 추가할 수 있다.

### Generate

&nbsp; GENERATE를 누르면 설정한 내용을 바탕으로 프로젝트가 생성되고, 파일이 다운로드됨

### EXPLORE

![image](https://user-images.githubusercontent.com/68031450/244985036-7db8f461-df37-48e6-8ecd-660fe90827be.png)

&nbsp; EXPLORE 버튼을 클릭하면 위와 같이 본인이 설정한 프로젝트의 Preview를 볼 수 있다.

### SHARE

![image](https://user-images.githubusercontent.com/68031450/244985185-1dc6a068-b4a7-436a-ac28-20256dc70048.png)

&nbsp; SHARE 버튼을 통해 본인이 설정한 프로젝트를 링크를 통해 타인에게 공유도 할 수 있다.

## Reference

- [스캐폴딩이란](https://www.wisewiredbooks.com/term-dict/common/scaffolding.html)
- [Spring Initalizr](https://www.codestates.com/blog/content/%EC%8A%A4%ED%94%84%EB%A7%81-%EC%8A%A4%ED%94%84%EB%A7%81%EB%B6%80%ED%8A%B8)
