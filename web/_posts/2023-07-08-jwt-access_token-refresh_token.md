---
layout: post
title: JWT - Access Token & Refresh Token
description: >
  소프트웨어 마에스트로 14기 팀 프로젝트에서 나는 백엔드 파트를 담당하여 Spring Boot를 통한 WAS 서버 개발을 하게 되었다. WAS 서버를 개발하던 도중 내가 JWT의 동작 과정에 대해 100% 이해하지 못하고 있음을 깨닫게 되었고, 해당 게시글을 통해 복습을 하여 프로젝트에 완벽하게 녹여내고자 한다.
sitemap: false
hide_last_modified: true
---

---

# JWT

&nbsp; JWT는 JSON Web Token의 약자로, JSON 포맷을 이용하여 사용자에 대한 속성을 저장하는 Claim 기반의 Web Token이다. 토큰 자체를 정보로 사용하는 Self-Contained 방식으로 정보를 안전하게 전달한다. 주로 회원 인증이나 정보 전달에 사용된다.

## 구조

### 예시

![image](https://user-images.githubusercontent.com/68031450/252003747-3d34e949-17df-4c82-ad45-8ea5b315bb10.png)

&nbsp; JWT는 `Header`, `Payload`, `Signature`로 이루어져있다. JSON 형태로 이루어진 각 부분은 Base64Url로 인코딩되어 표현되고, 암호화된 문자열이 아닌, 같은 문자열에 대해 항상 같은 인코딩 문자열을 반환한다. 구별된 각각의 부분을 이어주기 위해 `.` 구분자를 사용한다.
&nbsp; 생성된 토큰은 HTTP 통신을 할 때 `Authorization`이라는 key의 value로 사용되고, 일반적으로 `Bearer`라는 prefix가 붙는다.

```json
{
  "Authorization": "Bearer myawesome_accesstoken"
}
```

### 1. Header

```json
{
   "alg": "HS256",
   "typ": "JWT"
 }
```

- 토큰의 헤더는 `alg`와 `typ` 두 가지 정보로 구성됨
- `type`: 토큰의 타입을 지정(`JWT`)
- `alg`: 알고리즘 방식을 지정, 서명(Signature) 및 토큰 검증에 사용됨

### 2. Payload

- 토큰에서 사용할 정보들의 조각들인 Claim(key-value의 한 쌍)이 담겨 있음
- 총 3가지로 나누어지며, JSON 형태로 다수의 정보를 넣을 수 있음
  - **등록된 클레임**: 토큰 정보를표현하기 위해 이미 정해진 종류의 데이터들
    - `iss`: 토큰 발급자 (issuer)
    - `sub`: 토큰 제목 (subject)
    - `aud`: 토큰 대상자 (audience)
    - `exp`: 토큰의 만료시간 (expiraton)
    - `nbf`: 토큰의 활성 날짜와 비슷한 개념
    - `iat`: 토큰이 발급된 시간 (issued at)
    - `jti`: JWT의 고유 식별자, 주로 중복적인 처리를 방지하기 위하여 사용됨
  - **공개 클레임**: 사용자 정의 클레임, 공개용 정보를 위해 사용됨, 충돌이 방지된 (collision-resistant) 이름을 가지고 있어야 함(충돌을 방지하기 위해 클레임 이름을 URI 형식으로 지음)
    ```json
    {
      "https://jinu0137.github.io/jwt_claims/is_admin": true
    }
    ```
  - **비공개 클레임**: 사용자 정의 클레임으로, 서버와 클라이언트 사이에 임의로 지정한 정보를 저장함
    ```json
    {
        "username": "jinu0137"
    }
    ```

### 3. Signature

- 헤더와 페이로드를 암호화하고, 그 결과를 다시 Base64Url로 인코드하여 생성
  - 이 과정에서 secret key가 사용되며, 이것은 토큰의 무결성을 검증하는 데 사용됨
- ex) `HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)`


## 사용 이유

&nbsp; 주로 `인증`과 `정보 교환`의 목적으로 사용된다.
&nbsp; `인증`의 목적으로는 클라이언트가 로그인 후, 서버는 클라이언트에게 JWT를 발행하고 클라이언트는 이후 요청에서 이 JWT를 헤더에 포함시켜 서버에 전송함으로써, 서버는 JWT를 검증하고 클라이언트가 인증되었음을 알 수 있다.
&nbsp; `정보 교환`의 목적으로는 JWT는 서명되므로 정보의 보호와 무결성을 유지할 수 있기 때문에 사용된다.

## 단점

- **Self-contained**: 토큰 자체에 정보를 담고 있으므로 양날의 검이 될 수 있음
- **토큰 길이**: 토큰의 페이로드에 3종류의 클레임을 저장하기 때문에, 정보가 많아질수록 토큰의 길이가 늘어나 네트워크에 부하를 줄 수 있음
- **Payload 인코딩**: 페이로드 자체는 암호화 된 것이 아니라 BASE64Url로 인코딩 된 것이기 때문에, 중간에 Payload를 탈취하여 디코딩하면 데이터를 볼 수 있음
  - JWE로 암호화하거나 Payload에 중요 데이터를 넣지 않아야 함
- Stateless: JWT는 상태를 저장하지 않기 때문에 한 번 만들어지면 제어가 불가능하기 때문에, 토큰을 임의로 삭제하는 것이 불가능하므로 토큰 만료 시간을 꼭 넣어주어야 함
- **Store Token**: 토큰은 클라이언트 측에서 관리해야 하기 때문에, 토큰이 탈취되거나 노출될 위험이 있으므로 보안에 주의해야 함

---

# Access Token & Refresh Token

## Access Token

&nbsp; **사용자가 시스템에 접근하는 데 필요한 자격 증명을 위해 사용**된다. 위에서 언급한대로 API 요청을 보낼 때 보내는 JWT가 이 `Access Token`이며, 헤더에 포함시켜 사용자를 인증한다. 토큰이 노출되더라도 짧은 기간 내에 만료되어 악용하는 것을 방지하기 위해 일반적으로 만료 시간을 짧게 설정한다.

## Referesh Token

&nbsp; Refresh Token의 가장 큰 목적은 **Access Token의 유효 기간을 짧고, 자주 재발급 하도록 만들어 보안을 강화**하면서도 **사용자에게 잦은 로그아웃 경험을 주지 않도록 하는 것**이다.
&nbsp; Access Token은 리소스에 접근하기 위해서 사용되는 토큰이라면, Refresh Token은 `기존에 클라이언트가 가지고 있던 Access Token이 만료되었을 때 Access Token을 새로 발급받기 위해 사용`한다.

## 유효 기간

&nbsp; Refresh Token은 Access Token 대비 긴 유효 기간을 갖는다. Refresh Token을 사용하는 상황에서는 일반적으로 Access Token의 유효기간은 15분 - 1시간 사이, Refresh Token의 유효기간은 1주 - 수달까지 다양하게 설정한다고 한다. 서비스의 성격에 따라 적절하게 선택해야할 필요가 있을 것으로 보인다.

## 동작 방식

```mermaid
sequenceDiagram
    participant Client
    participant Server
    Client->>+Server: 로그인 (username, password)
    Server-->>-Client: Access Token, Refresh Token 발급
    Client->>+Server: Header에 Access Token을 담아 요청
    Server-->>-Client: 요청에 대한 응답
    Client->>+Server: 만료된 Access Token을 담은 요청
    Server-->>-Client: 권한 없음
    Client->>+Server: Refresh Token을 통해 새로운 Access Token 요청
    Server-->>-Client: 새로운 Access Token 발급
    Client->>+Server: Header에 새로운 Access Token을 담아 요청
    Server-->>-Client: 요청에 대한 응답
```

## JWT 검증 사이트

&nbsp; 마지막으로 JSON Web Tokens(JWT)을 디버그하고, 디코딩하며, 검증하는 데 도움이 되는 웹사이트를 소개한다.

- [https://jwt.io/](https://jwt.io/)

---

## Reference

- [https://velopert.com/2389](https://velopert.com/2389)
- [https://hudi.blog/refresh-token/](https://hudi.blog/refresh-token/)