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

![image](https://user-images.githubusercontent.com/68031450/256619538-094de40f-7e51-40f0-88c9-355b04275fc7.png)

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

### 1.3. 