---
layout: post
title: GitHub Pull Request Template 생성 방법
description: >
   소프트웨어 마에스트로 14기 팀 프로젝트에서 나는 백엔드 파트를 담당하여 Spring Boot를 통한 API 서버 개발을 하게 되었다. GitHub 레포지토리에서 Pull Request를 통해 base 브랜치에 분기 브랜치를 merge하려고 하는데, Pull Request 템플릿을 만들기 위해 이 게시글을 작하게 되었다.
sitemap: false
hide_last_modified: false
---

---

## 파일 생성

&nbsp; 아래의 경로 이외에도 여러 방식으로 템플릿 파일을 생성할 수 있지만 아래의 두 가지 방식이 가장 간단한 방식이다.

1. `레포지토리/PULL_REQUEST_TEMPLATE.md`
2. `레포지토리/.github/PULL_REQUEST_TEMPLATE.md`

## 생성 방법

&nbsp; 위의 경로 중 임의의 방식으로 파일을 생성한 후 파일의 내용을 작성한다.

```markdown
### PR 타입(하나 이상의 PR 타입을 선택해주세요)

- [ ] 기능 추가
- [ ] 기능 삭제
- [ ] 버그 수정
- [ ] 의존성, 환경 변수, 빌드 관련 코드 업데이트
- [ ] 문서 작성

### 작업사항

### 화면캡처(선택)

### 의문점(선택) 
```

&nbsp; 나는 팀원과 상의 후 템플릿 내용을 결정하였다. 꼭 아래와 같은 내용이 아니더라도 PR에 기술되면 좋은 내용은 어렵지 않게 찾을 수 있으므로 여러 레퍼런스를 참고하면 좋은 PR 템플릿을 작성할 수 있을 것이다.<br><br>

&nbsp; 그 후 `add`, `commit`, `push` 명령어(리모트 환경일 경우 GUI)를 통해 PR 템플릿을 GitHub에 추가한 후 GitHub를 통해 PR을 올리면 아래와 같은 화면을 확인할 수 있다.

![image](https://user-images.githubusercontent.com/68031450/250363674-73c061f8-fc0e-4a55-b9da-95251ffe947e.png)


## 주의사항

- 파일을 생성하는 브랜치는 반드시 **default branch**여야 함
- 로컬과 리모트 환경 모두 가능함

---

## Reference

- [https://velog.io/@ye-ji/Git-PR-ISSUE-%ED%85%9C%ED%94%8C%EB%A6%BF-%EB%93%B1%EB%A1%9D%ED%95%98%EB%8A%94-%EB%B0%A9%EB%B2%95](https://velog.io/@ye-ji/Git-PR-ISSUE-%ED%85%9C%ED%94%8C%EB%A6%BF-%EB%93%B1%EB%A1%9D%ED%95%98%EB%8A%94-%EB%B0%A9%EB%B2%95)
- [https://hbase.tistory.com/59](https://hbase.tistory.com/59)