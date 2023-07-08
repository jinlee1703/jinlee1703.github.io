---
layout: post
title: Jekyll을 활용한 github.io 만들기
description: >
  본 글은 기존 Notion에서 이전된 글입니다.
sitemap: false
hide_last_modified: true
---

---

## 1. 새로운 GitHub Repository 생성

1. Repository name은 `username.github.io`로 만들기

   ![image](https://user-images.githubusercontent.com/68031450/230421214-d9e2272a-f827-4de2-b368-2e702aae1c41.png)

2. Repository 유형은 `Public`으로 만들기

   ![image](https://user-images.githubusercontent.com/68031450/230421381-74bc6c81-55ff-4bc8-a7a3-db18540494a4.png)

3. `Add a README file` 체크하기

   ![image](https://user-images.githubusercontent.com/68031450/230421491-dd269849-4fa9-49aa-89f0-9c24f125ef71.png)

## 2. Local 환경에 repository를 clone

### 1. Clone을 위한 주소 복사

![image](https://user-images.githubusercontent.com/68031450/230421565-5413aecb-9c46-4ed9-9eca-3f4e0b1fc1fa.png)

### 2. Git Bash를 통해 원하는 위치에 git clone

![image](https://user-images.githubusercontent.com/68031450/230421686-ffca8522-745f-4587-aae5-8f93717d5d98.png)

## 3. 테스트를 위해 index.html 파일 생성

### 1. 파일 생성 및 내용 입력

- cd 명령어를 통해 Git Bash의 현재 경로를 username.github.io 디렉토리로 변경하거나 username.github.io 디렉토리 내에서 Git Bash 창을 열어서 조작해야 함

![image](https://user-images.githubusercontent.com/68031450/230421986-c45f8d28-1179-4bf9-916e-6475b0f86684.png)

![image](https://user-images.githubusercontent.com/68031450/230422062-fa95ac72-eb11-43bf-bba4-c1bd18e26461.png)

### 2. 원격 저장소로 Push

![image](https://user-images.githubusercontent.com/68031450/230422203-5b1f679e-2c3a-47ed-9ea5-9dc62f929aab.png)

## 4. 결과 확인

- 브라우저에서 username.github.io로 확인해보면 잘 반영된 것을 확인해볼 수 있다.

![image](https://user-images.githubusercontent.com/68031450/230422311-7e04a123-36d7-401d-bc3c-3a40e3524f54.png)

---

## 5. Jekyll 사용하기

### 0. Ruby 설치

- 루비 설치 : [https://rubyinstaller.org/downloads/](https://rubyinstaller.org/downloads/)
- 참고 : [https://wormwlrm.github.io/2018/07/13/How-to-set-Github-and-Jekyll-environment-on-Windows.html](https://wormwlrm.github.io/2018/07/13/How-to-set-Github-and-Jekyll-environment-on-Windows.html)
- toolkit의 경우 설치하지 않아도 됨

### 1. Jekyll 다운 받기

- Git Bash에서 아래 명령어들을 실행

```bash
gem install bundler
gem install jekyll
```

### 2. 기존 index.html 삭제

```bash
rm -f index.html
```

[https://supermemi.tistory.com/entry/나만의-블로그-만들기-Git-hub-blog-GitHubio](https://supermemi.tistory.com/entry/%EB%82%98%EB%A7%8C%EC%9D%98-%EB%B8%94%EB%A1%9C%EA%B7%B8-%EB%A7%8C%EB%93%A4%EA%B8%B0-Git-hub-blog-GitHubio)

### 3. jekyll 프로젝트 생성

```bash
jekyll new ./ --force
```

- 해당 디렉토리가 비어있지 않아서 conflict가 발생했다.
- conflict를 해결하기 위해 --force 옵션을 추가하여 해결하였다.

![image](https://user-images.githubusercontent.com/68031450/230422575-6eb4760e-109e-4aea-867e-47081857d2ff.png)

### 4. jekyll을 로컬 서버에 띄우기

```bash
bundle exec jekyll serve
```

![image](https://user-images.githubusercontent.com/68031450/230422821-7720ff68-2e05-4297-bbfc-65ba74c2a16c.png)

![image](https://user-images.githubusercontent.com/68031450/230422990-5d1bd73d-ba96-464c-95cb-c6d383fec708.png)

- 사소한 경고들이 나오긴 하지만 정상적으로 동작하는 것을 확인할 수 있다.

### 5. Push

```bash
git add .
git commit -m "initialize jekyll"
git push
```

![image](https://user-images.githubusercontent.com/68031450/230423092-5a4b045d-2837-4438-ab03-af360e87d2d6.png)

- 정상적으로 Push 된 것을 확인할 수 있다.

## Jekyll Hidejack 테마 적용

### 1. HydeJack Download

![image](https://user-images.githubusercontent.com/68031450/230423242-4b196122-fe33-4b9c-b67e-8dc6125fec33.png)

- download 페이지로 이동

![image](https://user-images.githubusercontent.com/68031450/230423381-6c6addd2-1c75-4251-9c17-57894d1a7768.png)

- zip으로 설치 후 압축 해제

![image](https://user-images.githubusercontent.com/68031450/230423550-b004d293-8b44-4626-bcc4-ae0f90186816.png)

- 압축 해제한 모든 파일들을 붙여넣기 (이미 존재할 경우 덮어쓰기 실행)
- 이후 `bundle exec jekyll serve`로 테스트 진행

### 2. 오류 해결

1. bundler::GemNotFound

   ![image](https://user-images.githubusercontent.com/68031450/230423629-882af38c-34b5-4b73-a26b-5c38cedb1e5c.png)

   - `bundler` 실행

2. 파일 오류

   ![image](https://user-images.githubusercontent.com/68031450/230423742-636288fc-02e9-47d8-bd21-51516bf13a91.png)

   - 루트 디렉토리에서 404.html, about.markdown, index.markdown 파일 삭제

3. Dart Sass 오류

   ![image](https://user-images.githubusercontent.com/68031450/230423877-6817f925-b04e-40e7-981b-3979b94ccdfb.png)

   - 일단 스킵

### 3. `bundle exec jekyll serve`로 테스트 진행

![image](https://user-images.githubusercontent.com/68031450/230424053-72758fd9-8449-43eb-ad7f-ea7a39e8bc01.png)

- 정상적으로 동작하는 것을 확인할 수 있다.

### 4. Push

```bash
git add .
git commit -m "jekyll-hydejack theme applied"
git push
```

- build 실패
  ![image](https://user-images.githubusercontent.com/68031450/230424169-8ccd27fa-7311-481d-84ba-31b758511be2.png)
  - 해결법 : blog 폴더 내의 \_config.yml 파일 편집
    ![image](https://user-images.githubusercontent.com/68031450/230424243-492084f0-0321-48d6-a6a9-7d9d40c7483e.png)
    - theme 부분을 주석 처리 (# 추가)
    - remote_theme 부분을 주석 해제 (# 제거)
    ```bash
    git add .
    git commit -m "fix: theme applied"
    git push
    ```

### 5. 확인

![image](https://user-images.githubusercontent.com/68031450/230424438-248ae3da-4041-4201-9dc6-334e7ffccc65.png)

- 정상적으로 Push 된 것을 알 수 있다! 이제 본격적으로 블로그를 활용해보자!

---

### Reference

- [https://supermemi.tistory.com/146](https://supermemi.tistory.com/146)
- [https://github.com/hydecorp/hydejack/issues/159](https://github.com/hydecorp/hydejack/issues/159)
- [https://m.blog.naver.com/PostView.naver?isHttpsRedirect=true&blogId=cyydo96&logNo=221588642260](https://m.blog.naver.com/PostView.naver?isHttpsRedirect=true&blogId=cyydo96&logNo=221588642260)
- [https://kdevkr.github.io/no-emit-deprecation-warnings-of-dart-sass/](https://kdevkr.github.io/no-emit-deprecation-warnings-of-dart-sass/)
- [https://supermemi.tistory.com/entry/Build-Warning-Layout-page-requested-in-docsadvancedmd-does-not-exist](https://supermemi.tistory.com/entry/Build-Warning-Layout-page-requested-in-docsadvancedmd-does-not-exist)
