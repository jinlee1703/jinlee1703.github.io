---
layout: post
title: User-Agent (UA)
description: >
  본 글은 SW마에스트로에서 진행된 멘토링을 통해 학습의 계기를 얻어 작성한 게시글입니다.
sitemap: false
hide_last_modified: true
---

---

&nbsp; 웹 개발을 하기 위해 Chrome에서 `F12` 키를 입력하여 개발자 도구로 들어가 `Console`을 보다보면 종종 뭔가 싶은 문자열이 있다. 과연 이 문자열은 무엇일까?

![image](https://user-images.githubusercontent.com/68031450/236124043-0d2f347a-ee6b-4529-8e52-a0f2d0f6e657.png)

&nbsp; 이 문자열은 신분을 대신할 수 있는 소프트웨어인 User Agent(UA) 스트링이다. 웹과 관련된 맥락에서는 일반적으로 브라우저 종류나 버전 번호, 호스트 운영체제 등의 정보를 의미한다. <br>

![image](https://user-images.githubusercontent.com/68031450/236124958-7829b2ba-b39b-4642-8376-77c79fc84275.png)

&nbsp; 사실 UA는 HTTP 헤더에서도 볼 수 있지만, JavaScript에서 UA는 `navigator` 인터페이스의 속성 중 하나로, `navigator.userAgent`라는 읽기 전용 속성을 통해 UA 스트링을 확인할 수 있다. 이를 이용해 사용자 환경에 맞는 맞춤 기능을 제공할 수 있다고 한다. <br>

![image](https://user-images.githubusercontent.com/68031450/236124043-0d2f347a-ee6b-4529-8e52-a0f2d0f6e657.png)

&nbsp; 다시 내가 Console에서 출력한 UA 스트링을 살펴보자. 나는 분명 Windows10 운영체제를 사용하고 있고, Chrome에서 `navigator.userAgent`라는 속성을 출력하였는데 Mozila니, AppleWebkit이니, Safari니 하는 내용은 왜 출력되는 것일까? <br>

&nbsp; 결론은 `호환성을 유지하기 위함`이라고 한다. 아래 내용은 인터넷 브라우저의 역사 이야기이다.

1. **인터넷 익스플로러(IE)가 넷스케이프 브라우저의 UA를 흉내냄으로써, 가장 먼저 UA가 더러워져 버렸다.** 기존 Mozila 재단의 넷스케이프 브라우저는 약 90% 정도의 점유율을 유지하고 있었고, UA 스트링은 `Mozila`로 시작하였다. 그 이전의 브라우저인 `모자이크`라는 브라우저와 가장 큰 차이점은 `<frame>`이라는 태그를 통해 HTML 파일 내에서 또다른 HTML 파일의 콘텐츠를 불러올 수 있는 기능을 지원했다. 후속 주자인 IE 역시 프레임 태그를 지원하였으나 당시 웹 서버들은 오직 선두주자인 넷스케이프 브라우저인지 아닌지만 판단하여 프레임 태그를 지원해주는 방법을 사용하였다고 한다. 그래서 IE는 자기 자신의 UA를 넷스케이프 브라우저와 마찬가지로 `Mozila`로 시작하게 만들어버린 것이라고 한다.

2. **Mozila 재단이 넷스케이프 브라우저의 렌더 엔진을 오픈소스 프로젝트로 공개하면서 브라우저 렌더 엔진 정보도 UA에 추가되기 시작하였다고 한다.** 추후 IE는 1999년에 웹 브라우저 시장에서 99%라는 괴랄한 점유율을 찍어버리고 만다. 결국 넷스케이프 개발자들은 넷스케이프를 오픈소스로 만들고, 비영리재단인 모질라를 만들게 되는데, 이때 넷스케이프 6의 렌더 엔진인 `게코(Gecko)`을 공개한다. 이 게코에서 UA가 지켜야할 사양을 추가적으로 적어놓았는데, 이때부터 UA가 괴랄해져 버렸다. 그래서 게코 엔진을 기반으로 한 브라우저는 아래와 같은 UA를 기본적으로 따른다고 한다.

```
# 양식
Mozilla/Version (Platform; Encryption; OS-or-CPU; Language; PrereleaseVersion)Gecko/GeckoVersion ApplicationProduct/ApplicationProductVersion

# 예시
Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:0.9.4) Gecko/20011128 Netscape6/6.2.1
```

3. **게코 엔진이 등장하면서부터 제일 앞에 붙은 `Mozila/5.0`은 더 이상 유명무실한 존재가 되었지만, 예전 코드와의 호환성을 위해, 마치 흔적기관 같은 존재로 남겨져 버렸다고 한다.** 그래서 이때부터 모든 UA 스트링의 시작은 항상 `Mozila/5.0`로 시작하게 된다.

4. **2003년, 애플은 웹킷(WebKit) 기반의 웹 브라우저인 사파리(Safari)를 발표한다.** 웹킷은 리눅스 기반의 렌더 엔진인 KHTML에서 파생된 프로젝트로, 애플이 이런저런 기능을 추가하여 별도의 프로젝트로 분리하였다고 한다. 애플이 독자적인 브라우저와 렌더 엔진을 만들면서 위의 IE와 동일한 상황에 놓여져버리는데, 결과적으로 IE와 동일한 선택을 해버린다. **UA에 `KHTML, like Gecko`라는 스트링을 집어 넣는 방식으로 이 상황을 해결해버린다.**

```
# 양식
Mozilla/5.0 (Platform; Encryption; OS-or-CPU; Language) AppleWebKit/AppleWebKitVersion (KHTML, like Gecko) Safari/SafariVersion

# 예시
Mozilla/5.0 (Macintosh; U; PPC Mac OS X; en) AppleWebKit/522.15.5 (KHTML, like Gecko) Version/3.0.3 Safari/522.15.5
```

5. 우리는 크롬의 사례만 살펴보기로 하자. 크롬 역시 웹킷 기반 브라우저였기 때문에 렌더 엔진이 사파리처럼 인식되기를 원했고, 결과적으로 사파리의 UA를 따라하면서 거기에 `Chrome`이라는 스트링을 끼워넣었다.

```
# 양식
Mozilla/5.0 (Platform; Encryption; OS-or-CPU; Language) AppleWebKit/AppleWebKitVersion (KHTML, like Gecko) Chrome/ChromeVersion Safari/SafariVersion

# 예시
Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.13 (KHTML, like Gecko) Chrome/0.2.149.27 Safari/525.13
```

UA 스트링을 해석하면 다음과 같다.

- 윈도우에서 동작하는 크롬 브라우저임
- 크롬은 웹킷 기반 브라우저임
- 크롬은 서버에서 자기 자신이 사파리처럼 인식되기를 원하기 때문에 사파리 UA를 따라함
- 웹킷은 KHTML 엔진 기반임
- KHTML은 게코 엔진처럼 인식되기를 원함
- 모든 브라우저의 UA는 기본적으로 넷스케이프 호환임을 따라하는 상황임

&nbsp; 결론적으로 이와 같이 UA 스트링은 호환성을 이유로 쓸모없는 정보들로 가득 차있다. 이 때문에 UA를 직접 파싱해서 쓰지 않기 위한 방법들도 있다고 한다. 또한, 크롬에서는 UA 스트링을 점진적으로 폐기하려는 움직임도 보이고 있다고 한다.

---

## Reference

- [https://yozm.wishket.com/magazine/detail/1307/](https://yozm.wishket.com/magazine/detail/1307/)
