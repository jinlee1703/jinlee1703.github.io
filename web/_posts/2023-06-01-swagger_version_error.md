---
layout: post
title: Swagger 설정 시 Spring 버전에 따른 설정 오류
description: >
  소프트웨어 마에스트로 과정을 진행하면서 본격적인 팀 프로젝트를 진행하기 전, 간단하게 미니 프로젝트를 진행하기로 하였다. 나는 백엔드 파트를 담당하여 Spring Boot를 통한 API 서버 개발을 하게 되었고, Swagger를 통해 API 문서 생성을 자동화하고자 한다.
sitemap: false
hide_last_modified: true
---

---

### 설명

아래 블로그를 참고하여 Spring 3.0에서 Swagger를 설정하는데 계속 오류가 발생하였다. 여러가지 방법으로 회피를 시도해보았지만, 해결하지 못하다가 Spring 3부터는 springfox가 아닌 springdoc-openapi-ui 라이브러리를 사용해야 한다는 것을 알게 되었다. 그래서 springdoc 라이브러리를 통해 Swagger를 설정하여 오류를 해결하였다.

- 오류 참고 자료 : [https://resilient-923.tistory.com/414](https://resilient-923.tistory.com/414)

- 기존 Swagger 참고자료 : [https://velog.io/@borab/Spring-boot-Swagger-%EC%84%A4%EC%A0%95-gradle](https://velog.io/@borab/Spring-boot-Swagger-%EC%84%A4%EC%A0%95-gradle)

- springdoc-openapi-ui 참고자료
  - [https://velog.io/@devmin/springdoc](https://velog.io/@devmin/springdoc)
  - [https://overcome26.tistory.com/98](https://overcome26.tistory.com/98)

### Swagger No operations defined in spec! 에러 해결

&nbsp; swagger 페이지에 아무 api도 나오지 않는 에러이다.

&nbsp; 오류 원인은 base url 경로이다. 아래 블로그는 springfox로 구현하였기 때문에 약간 차이가 있지만, base url 문제인 것은 동일하기 때문에 나는 /\*\* 처리하여 모든 API를 읽어오도록 구현하였다.

![image](https://user-images.githubusercontent.com/68031450/244893853-d5977f79-2919-4d59-97eb-373a5d267230.png)

- [https://sudo-minz.tistory.com/112](https://sudo-minz.tistory.com/112)
