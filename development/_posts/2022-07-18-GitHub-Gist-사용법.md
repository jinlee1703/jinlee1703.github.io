---
layout: post
title: GitHub Gist 사용법
description: >
  본 글은 기존 velog에서 이전된 글입니다. ([https://velog.io/@jinu0137/GitHub Gist 사용법](https://velog.io/@jinu0137/GitHub Gist 사용법))
sitemap: false
hide_last_modified: true
---

---

## 참고

- 깃허브 로그인을 해야 한다. (회원이 아닐 경우 회원가입)
- 본 게시물은 Visual Studio Code를 기준으로 작성하였습니다. (사용자 환경에 따라 다를 수 있음)

## 1. https://gist.github.com/"GitHub아이디"를 통해 본인의 GitHub Gist 페이지로 이동

![](https://velog.velcdn.com/images/jinu0137/post/e23e1cd1-d1ee-49d9-a067-05aefd19c194/image.png)

(현재 작성자의 GitHub Gist)

## 2. Gist 생성하기

![](https://velog.velcdn.com/images/jinu0137/post/97d801f4-918f-42ee-87f0-a27fc5abbbf7/image.png)

본인의 GitHub Gist 페이지 우측 상단 '+' 버튼을 클릭하여 새로운 Gist 만들기

## 3. Gist 작성하기

![](https://velog.velcdn.com/images/jinu0137/post/17d0a7ea-93f1-41ef-a486-e8a577974073/image.png)

'Gist description'에 Gist에 대한 설명을 적어주고 README.md 파일과 내용을 작성하여 'Create secret gist' 버튼을 클릭하여 secret gist를 만든다
(Gist를 처음 Create할 때 파일과 내용이 존재하지 않을 경우 만들어지지 않기 때문에 README.md를 대충 작성해주도록 하자)

## 4. Gist 확인하기

![](https://velog.velcdn.com/images/jinu0137/post/cee8b137-bd4f-40c0-bfe5-9851e0d97fd0/image.png)

(해당 Gist 세부 페이지)

![](https://velog.velcdn.com/images/jinu0137/post/f9521de0-e274-4732-971a-7dadea96ad48/image.png)

(작성자의 Gist 페이지)

Gist가 정상적으로 작성된 것을 확인할 수 있다.

## 5. Local에서 Gist clone하기

사전작업1) 작성한 Gist 세부페이지에서 주소창의 링크를 그대로 복사한다.

![](https://velog.velcdn.com/images/jinu0137/post/fb9651a3-73e2-4949-bd9f-76782dad3204/image.png)

Visual Studio Code를 열고 'Ctrl + `'를 클릭하여 터미널을 열어준 후 **"git clone 복사한\_gist주소"**를 입력해준다.

![](https://velog.velcdn.com/images/jinu0137/post/30554d95-dac0-40db-9105-e8967d0fc6a8/image.png)

탐색기를 확인해보면 우리가 작성한 'gist주소' 이름의 폴더와 'README.md' 파일이 만들어진 것을 확인해볼 수 있다.

## 6. Local에서 Gist Commit하기

참고) 테스트를 위해 test.html을 만들었다. 실제로 사용할 때는 본인이 작성할 파일을 만들면 된다.

![](https://velog.velcdn.com/images/jinu0137/post/011e9f5b-4557-49a3-9731-83621999dfea/image.png)

0. test.html이라는 파일을 새로 만들어주고 'html:5' 자동완성을 통해 html5 표준 양식으로 작성하였다.
1. "cd 명령어"를 통해 생성된 gist 폴더로 들어간다. (Tab 키를 통해 자동완성으로 쉽게 타이핑하자)
2. "git add 명령어"를 통해 test.html을 현재 working directory에서 staging area에 추가해준다.
3. "git commit -m "커밋메시지" 명령어"를 통해 커밋해준다.

## 7. Local에서 Gist Push하기

![](https://velog.velcdn.com/images/jinu0137/post/68bd2624-876b-4366-8837-782c2a67f1f6/image.png)

"git push" 명령어만 입력하면 push가 성공적으로 될 것이다.

이제 GitHub Gist 페이지에서 확인해보자.

## 8. Local에서 Push한 Gist 확인하기

![](https://velog.velcdn.com/images/jinu0137/post/8e2fdeb0-27e0-4295-a840-563412bc74df/image.png)

정상적으로 push된 것을 확인할 수 있다.

끝.
