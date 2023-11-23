---
layout: post
title: 네이버 OAuth CORS 에러
description: >
  소프트웨어공학 강의를 수강하면서, 팀프로젝트를 진행하게 되었는데, 나는 백엔드이자 인프라 파트를 담당하고 있다.
sitemap: false
hide_last_modified: false
---

---

## 작성 배경

![error](/assets/img/docs/naver-oauth-error.png)

&nbsp; 프론트엔드에서 네이버 OAuth 로그인을 하기 위해 token을 받아오는 과정에서 CORS 에러가 발생하였고, 이를 해결하는 과정을 기록하고자 게시글을 작성하게 되었다.

## 원인

&nbsp; [이 블로그](https://velog.io/@iamminzzy/TIL-%EB%84%A4%EC%9D%B4%EB%B2%84-%EB%A1%9C%EA%B7%B8%EC%9D%B8-CORS-%EC%97%90%EB%9F%AC-%ED%95%B4%EA%B2%B0)를 참고하였다. 결론적으로 **네이버 API는 Javascript 환경에서 보안상의 이유로 인해 CORS를 허용하지 않는다고 한다.**

## 해결 방법

&nbsp; 백엔드에서 네이버 Token을 받아오는 API를 추가로 구현하고 프론트엔드에서는 이를 호출한 후, response를 통해 또다른 API를 호출하는 방식으로 구현하였다.

### JavaScript

```js
export async function getAccessNaverToken(authCode) {
  try {
    const token_response = await axios.get(`http://xxx.xxx.xxx.xxx:8080/api/auth/sign-in/naver/token?code=${authCode}`);
    const Navertoken = token_response.data['token'];

    const response = await axios.post('http://xxx.xxx.xxx.xxx:8080/api/auth/sign-in/naver', { token: Navertoken });

    localStorage.setItem('access_token', response.data['access_token']);
  } catch (error) {
    console.error('An error occurred:', error);
  }
};
```

### API

```java
@GetMapping("/sign-in/{platform}/token")
 ResponseEntity<OAuthTokenDto> signInWithToken(@PathVariable String platform, @RequestParam(name = "code") String code);
```

### Service

```java
public OAuthTokenDto getToken(String authorizationCode) {
  try {
   URL url = new URL(UriComponentsBuilder
     .fromUriString(naverConfig.getTokenUri())
     .queryParam("grant_type", "authorization_code")
     .queryParam("client_id", naverConfig.getClientId())
     .queryParam("client_secret", naverConfig.getClientSecret())
     .queryParam("code", authorizationCode)
     .build()
     .toString());

   HttpURLConnection con = (HttpURLConnection)url.openConnection();
   con.setRequestMethod("GET");

   int responseCode = con.getResponseCode();
   BufferedReader br;

   if (responseCode == 200) { // 정상 호출
    br = new BufferedReader(new InputStreamReader(con.getInputStream()));
   } else {  // 에러 발생
    br = new BufferedReader(new InputStreamReader(con.getErrorStream()));
   }

   String inputLine;
   StringBuffer response = new StringBuffer();
   while ((inputLine = br.readLine()) != null) {
    response.append(inputLine);
   }

   br.close();

   JsonElement element = parser.parse(response.toString());

   return new OAuthTokenDto(element.getAsJsonObject().get("access_token").getAsString());
  } catch (Exception e) {
   e.printStackTrace();
  }
  return null;
 }
```
