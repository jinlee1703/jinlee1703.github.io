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

   ![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/6ac6c79d-53c5-448a-8bb1-98532cc47179/Untitled.png)

2. Repository 유형은 `Public`으로 만들기

   ![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/717a6df3-208d-471a-ab82-14ee05d22458/Untitled.png)

3. `Add a README file` 체크하기

   ![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/56b9af37-b457-41ed-ba61-d08f49acae8a/Untitled.png)

## 2. Local 환경에 repository를 clone

### 1. Clone을 위한 주소 복사

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/11df4b1b-238e-4fe4-b78c-96d1df804359/Untitled.png)

### 2. Git Bash를 통해 원하는 위치에 git clone

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/ee12244f-0515-49d7-ac86-3828db043d07/Untitled.png)

## 3. 테스트를 위해 index.html 파일 생성

### 1. 파일 생성 및 내용 입력

- cd 명령어를 통해 Git Bash의 현재 경로를 username.github.io 디렉토리로 변경하거나 username.github.io 디렉토리 내에서 Git Bash 창을 열어서 조작해야 함

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/cefedcea-d8fa-40dd-9a69-d0c11ea767ac/Untitled.png)

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/bdea8deb-e663-490f-bdef-b0560269bc5e/Untitled.png)

### 2. 원격 저장소로 Push

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/e8e27055-cdec-4a4a-9f07-82645af327a3/Untitled.png)

## 4. 결과 확인

- 브라우저에서 username.github.io로 확인해보면 잘 반영된 것을 확인해볼 수 있다.

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/5f3af154-a35a-4a9c-9ac0-c65207c6a994/Untitled.png)

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

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/7cfc47bf-a779-40f7-8b8a-4e3af7910873/Untitled.png)

### 4. jekyll을 로컬 서버에 띄우기

```bash
bundle exec jekyll serve
```

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/fdd75b03-0915-4e60-b356-22771465fdf6/Untitled.png)

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/361bdb2e-80b0-409b-9f47-554112d56247/Untitled.png)

- 사소한 경고들이 나오긴 하지만 정상적으로 동작하는 것을 확인할 수 있다.

### 5. Push

```bash
git add .
git commit -m "initialize jekyll"
git push
```

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/11ba7bf1-f67a-47b3-bb2a-54ab0543d430/Untitled.png)

- 정상적으로 Push 된 것을 확인할 수 있다.

## Jekyll Hidejack 테마 적용

### 1. HydeJack Download

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/b1e5cb7f-df97-4fdd-98aa-b8aebb798ee3/Untitled.png)

- download 페이지로 이동

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/ccd9dd03-cfc9-4f54-bb80-ef9302f0f54e/Untitled.png)

- zip으로 설치 후 압축 해제

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/90f525ef-6488-4301-910c-307cc7cae12a/Untitled.png)

- 압축 해제한 모든 파일들을 붙여넣기 (이미 존재할 경우 덮어쓰기 실행)
- 이후 `bundle exec jekyll serve`로 테스트 진행

### 2. 오류 해결

1. bundler::GemNotFound

   ![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/441dbbec-405a-4949-9264-c2256b8ee033/Untitled.png)

   - `bundler` 실행

2. 파일 오류

   ![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/08853fc7-9179-4a45-8e97-344408d54971/Untitled.png)

   - 루트 디렉토리에서 404.html, about.markdown, index.markdown 파일 삭제

3. Dart Sass 오류

   ![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/9d77fcfd-7bd5-450f-b108-577532b7be86/Untitled.png)

   - 일단 스킵

### 3. `bundle exec jekyll serve`로 테스트 진행

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/94573299-1e46-4528-b89b-7533fd01ca59/Untitled.png)

- 정상적으로 동작하는 것을 확인할 수 있다.

### 4. Push

```bash
git add .
git commit -m "jekyll-hydejack theme applied"
git push
```

- build 실패
  ![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/f062941d-0ac0-4f6d-9776-c50d42c89d21/Untitled.png)
  - 해결법 : blog 폴더 내의 \_config.yml 파일 편집
    ![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/6ac0d085-f97f-48d0-a98f-52ad3dede6cf/Untitled.png)
    - theme 부분을 주석 처리 (# 추가)
    - remote_theme 부분을 주석 해제 (# 제거)
    ```bash
    git add .
    git commit -m "fix: theme applied"
    git push
    ```

### 5. 확인

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/0a7c5627-f5c0-4991-9504-e24e205ef4f8/Untitled.png)

- 정상적으로 Push 된 것을 알 수 있다! 이제 본격적으로 블로그를 활용해보자!

---

### Reference

- [https://supermemi.tistory.com/146](https://supermemi.tistory.com/146)
- [https://github.com/hydecorp/hydejack/issues/159](https://github.com/hydecorp/hydejack/issues/159)
- [https://m.blog.naver.com/PostView.naver?isHttpsRedirect=true&blogId=cyydo96&logNo=221588642260](https://m.blog.naver.com/PostView.naver?isHttpsRedirect=true&blogId=cyydo96&logNo=221588642260)
- [https://kdevkr.github.io/no-emit-deprecation-warnings-of-dart-sass/](https://kdevkr.github.io/no-emit-deprecation-warnings-of-dart-sass/)
- [https://supermemi.tistory.com/entry/Build-Warning-Layout-page-requested-in-docsadvancedmd-does-not-exist](https://supermemi.tistory.com/entry/Build-Warning-Layout-page-requested-in-docsadvancedmd-does-not-exist)
