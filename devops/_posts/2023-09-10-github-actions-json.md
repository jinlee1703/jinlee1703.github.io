---
layout: post
title: GitHub Actions - JSON 파일 생성
description: >
  소프트웨어 마에스트로 14기로 활동하면서 프로젝트를 진행하던 중, 발생한 트러블 슈팅에 대해 기록해두고자 게시글을 작성하게 되었다.
sitemap: false
hide_last_modified: true
---

---

### 작성 배경

&nbsp; SW마에스트로 14기 활동도 어느새 80일 밖에 남지 않았다. 나는 우리 프로젝트에서 푸시 알림 기능을 위해 Firebase의 FCM을 사용하여 해당 기능을 구현하게 되었다. 해당 기능을 구현하기 위해 **GitHub Actions**의 Secret에서 JSON 파일의 내용을 작성하고, `.json` 파일을 생성하는 과정을 통해 FCM의 키를 관리하게 되었다.

- 파일 경로
    <img width="545" alt="image" src="https://user-images.githubusercontent.com/68031450/266814237-8e5040d6-c51a-4535-8b7e-1ef2c26dbb36.png">
- 파일 내용
    <img width="1185" alt="image" src="https://user-images.githubusercontent.com/68031450/266814290-5b590094-b97b-4390-ba68-3eda988c7e42.png">

### 발생 오류

<img width="980" alt="image" src="https://user-images.githubusercontent.com/68031450/266814431-d45ee742-00d7-45ba-b266-7cd1408912ac.png">

&nbsp; 우리 팀은 `GitHub Actions`를 통해 **CI/CD 파이프라인**을 구축(자세한 내용은 [해당 게시글](https://jinlee.kr/devops/2023-08-06-Spriung-Docker-CICD/)을 참고하길 바란다)하였다. Actions를 통한 Spring 어플리케이션 빌드 시 실행되는 테스트에 실패 케이스가 발생하는 것이였다. 기존 경험 상 `contextLoads()` 테스트의 실패는 경험 상, `application.yml`과 같은 환경 변수를 로드할 때 발생하는 경우가 많았다. 하지만 이번 Feature에서 별도로 `application.yml`을 수정한 적은 없었기 때문에 위에서 추가했던 **firebase.json** 파일이 문제가 되고 있다는 가설(결과적으로 해당 가설이 맞았다)을 세우게 되었다.

### 해결 방법

`
To help ensure that GitHub redacts your secret in logs, avoid using structured data as the values of secrets. For example, avoid creating secrets that contain JSON or encoded Git blobs.
`

&nbsp; 한 마디로 요약하자면 `JSON 쓰지 마라`라는 뜻이다. 하지만 Firebase에서는 `.json` 파일을 주기 때문에 해당 경고를 우회하는 방법이 필요했다.

```yaml
- name: Create Json
  uses: jsdaniell/create-json@v1.2.2
  with:
    name: "./src/main/resources/firebase/gifthub-b2dcb-firebase-adminsdk-yj7uq-912097b9ae.json"
    json: ${{ secrets.FIREBASE_JSON }}
```

&nbsp; 나는 GitHub Actions Marketplace의 [`create-json`](https://github.com/marketplace/actions/create-json)라는 actions를 통해 해당 경고를 우회하였다. 위 actions를 사용하면 **Actions Secret에 저장된 json을 파일로 만들 수 있다.**

### 느낀 점

&nbsp; 현재는 GitHub Actions의 경고를 우회하는 방법(json 파일을 생성하는)으로 해결을 하고 있지만, 보다 좋은 방법이 있는지 찾아보고 우회하는 방식이 보다 좋은 방식이 있을 지 살펴보는 과정이 필요해보인다.

---

### 참고 자료

- [using-secrets-in-github-actions](https://docs.github.com/ko/actions/security-guides/using-secrets-in-github-actions)
