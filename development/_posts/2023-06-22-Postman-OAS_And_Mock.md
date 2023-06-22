---
layout: post
title: Postman으로 Mock Server 및 API 생성하고 OAS 문서 만들기
description: >
  소프트웨어 마에스트로 14기 팀 프로젝트에서 나는 백엔드 파트를 담당하여 Spring Boot를 통한 API 서버 개발을 하게 되었다. 이를 위해 학습 차 게시글을 작성하게 되었다.
sitemap: false
hide_last_modified: true
---

---

## OAS가 무엇인지 모른다면...

&nbsp; 이전에 OAS 문서에 대한 내용을 다룬 적이 있다. 혹시 OAS가 무엇인지 모르겠다면 해당 글들을 참고하면 좋을 것 같다.

- [https://jinu0137.github.io/development/2023-06-19-OAS/](https://jinu0137.github.io/development/2023-06-19-OAS/)
- [https://jinu0137.github.io/development/2023-06-21-OAS-YAML/](https://jinu0137.github.io/development/2023-06-21-OAS-YAML/)

---

# Postman

&nbsp; Postman은 API 개발 및 테스트를 위한 협업 도구의 일종이다. 개발자들은 Postman을 사용하여 API 요청을 만들고, 테스트하고, 문서화할 수 있다. 또한 사용자 친화적인 인터페이스를 제공하며, 다양한 기능을 제공하여 API 개발 과정을 간소화하고 효율적으로 관리할 수 있도록 도와준다.

## Postman을 사용하는 이유

1. **API 개발 및 테스트**: 개발자가 API 요청을 만들고, 테스트하고, 디버깅할 수 있는 직관적인 인터페이스를 제공한다. API를 호출하고 응답을 확인하며, 요청 매개변수, 헤더, 본문 등을 쉽게 조작해볼 수 있다.

2. **팀 협업**: 여러 개발자가 동시에 작업하고 API 관련 정보를 공유할 수 있는 Team Workspace와 같은 협업 기능을 제공한다. 팀원들은 컬렉션을 공유하고, 주석을 달며, 작업을 동기화하여 효율적인 협업을 할 수 있습니다.

3. **자동화 및 테스트 환경 구축**: 테스트 스크립트 작성을 통해 자동화된 테스트를 수행할 수 있다. 테스트 환경을 설정하고, 테스트 스크립트를 작성하여 반복적인 테스트를 자동화하고, 결과를 확인할 수 있다.

4. **문서화**: API 요청과 응답 예시를 기반으로 문서를 생성하고 관리할 수 있다. OAS 문서를 자동으로 생성하거나, 사용자 정의 템플릿을 사용하여 API 문서를 작성할 수 있다.

5. **확장성**: 다양한 플러그인과 통합 기능을 제공하여 개발자들이 자신들의 워크플로우와 도구들과 통합하여 사용할 수 있다. Jenkins, Git, Slack 등과 연동하여 CI/CD 파이프라인을 구축할 수도 있다고 한다.

# Mock

&nbsp; 소프트웨어 개발에서 사용되는 개념으로, 실제 구현이 아니라 가짜로 대체되는 객체 또는 동작을 가리키는데, 주로 테스트나 프로토타이핑 과정에서 사용된다.

## Mock Server란

&nbsp; 실제 서비스와 동일한 API 엔드포인트 및 동작을 가지지만, 실제 데이터나 비즈니스 로직을 사용하지 않고 가짜 응답을 제공하는 서버를 의미한다. 주로 개발 및 테스트 환경에서 사용된다.

## Mock API란

&nbsp; 실제 API 서비스와 유사한 동작을 가지지만, 가짜 데이터 또는 정의된 응답을 제공하는 가짜 API이다. 개발자들은 Mock API를 사용하여 실제 API가 아직 개발되지 않았거나, 외부 의존성을 피하고 개발 또는 테스트를 진행할 수 있다.

# PostMan으로 Mock Server와 Mock API 만들기

## 1. Collection 생성

![image](https://user-images.githubusercontent.com/68031450/247841355-f2464163-d0c3-42f6-a7e0-a21af2562305.png)

&nbsp; 화면 상단의 `New` 버튼을 클릭하고 `Collection`을 선택하여 새로운 Collection을 생성한다. 단, 기존에 작성된 Collection에서 작업을 하려는 경우에는 생략하여도 무방하다.

## 2. Mock Server 생성

![image](https://user-images.githubusercontent.com/68031450/247842467-8442f171-f0fe-4b58-804f-2a84acbbb806.png)

&nbsp; 생성된 Collection의 미트볼 버튼(`...`)을 클릭하고 `Mock Collection`을 클릭하면 Mock Server를 생성하는데 필요한 양식들이 나온다.

![image](https://user-images.githubusercontent.com/68031450/247842796-bbbaf831-717f-4ec7-bc0a-30bdb94b42dd.png)

&nbsp; 위와 같이 Mock Server의 이름을 입력하고, `save the mock server url as a new environment variable`을 체크 표시하고 `Create Mock Server` 버튼을 클릭한다.

![image](https://user-images.githubusercontent.com/68031450/247843081-347876a4-82b8-4844-a380-646c219a39c1.png)

&nbsp; 그 후 좌측 탭의 `Mock Server`를 클릭하면 생성된 Mock Server의 존재 여부와 해당 Mock Server의 URL을 확인할 수 있다.

![image](https://user-images.githubusercontent.com/68031450/247846309-2421af09-e917-4288-89dc-06f0d673af09.png)

&nbsp; 위와 같이 Mock Server의 API의 호출 내역도 조회가 가능하다!

## 3. Mock API 생성 및 실행

![image](https://user-images.githubusercontent.com/68031450/247844903-05616e84-0093-4f39-95a0-f2b475cf22b4.png)

&nbsp; 다시 `Collections` 탭으로 돌아가 아까 만들었던 Collection의 하위 항목으로 Test Request를 만들어 주고, URL을 설정하였다. 그 다음 해당 Request의 미트볼 버튼을 클릭하고 `Add Example` 버튼을 클릭하면 Mock API가 생성된다.

![image](https://user-images.githubusercontent.com/68031450/247845349-4e0a63b3-e8ea-44d9-889e-983024b033c0.png)

&nbsp; Mock API에서는 Param, Header, Body 등을 자유롭게 수정하고, Response 역시도 설정해줄 수 있다. 나는 그냥 Response Body만 수정해두었다. 그 다음 우측 상단의 `Try` 버튼을 클릭하면 Mock API를 실행시켜 볼 수 있다.

![image](https://user-images.githubusercontent.com/68031450/247845797-7cfab00a-1ba0-4151-9617-5b1e42f9061e.png)

# PostMan으로 OAS 문서 만들기

## 1. OAS 문서 확인

![image](https://user-images.githubusercontent.com/68031450/247845930-7ef4fb14-a2b0-48f1-97c0-cb7bad3ed54f.png)

&nbsp; 기존에 생성한 Collection 우측의 미트볼 버튼을 클릭하고 `View documentation` 버튼을 클릭한다. 그러면 아래와 같이 해당 Collection에 작성해놓은 Request와 Mock API에 해당하는 API 문서를 조회할 수 있다.<br><br>
&nbsp; 하지만 이 경우에는 필자가 작성한 Postman Team에 속해있어야지만 API 문서를 조회할 수 있다는 단점이 있다. 그렇기에 우리는 웹사이트에 게시하도록 하려고 한다.

## 2. OAS 문서 게시

![image](https://user-images.githubusercontent.com/68031450/247848750-97caa12b-a20e-443d-9616-b1f1ea6db366.png)

&nbsp; `View documentation` 버튼을 클릭 한 후, 우측 상단의 `Publish` 버튼을 클릭하면 웹 사이트가 열린다.

![image](https://user-images.githubusercontent.com/68031450/247849087-06fe21e3-4495-4e6f-827a-3000c3c73c00.png)

&nbsp; 여러가지 설정을 할 수 있지만 지금 당장은 그냥 넘어가서 가장 아래의 `Pusblish` 버튼을 클릭하자.

![image](https://user-images.githubusercontent.com/68031450/247850184-f3ba81ca-b3c3-4638-aaf1-57308613d99a.png)

&nbsp; 위와 같은 페이지가 나오는데, `URL for published documentation` 항목의 URL을 복사하여 크롬에 붙여 넣어보자.

![image](https://user-images.githubusercontent.com/68031450/247850346-93d50399-7acb-4efa-9c78-2ed1639a87ad.png)

&nbsp; 우리가 만든 Collection에 대한 API 문서가 생성되었다!

---

## Reference

- [https://kbs4674.tistory.com/181](https://kbs4674.tistory.com/181)
- [https://velog.io/@bky373/Postman-Postman-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0-Mock-Server%EC%99%80-API-%EB%AC%B8%EC%84%9C-%EB%A7%8C%EB%93%A4%EA%B8%B0#4-api-%EB%AC%B8%EC%84%9C-%EB%A7%8C%EB%93%A4%EA%B8%B0](https://velog.io/@bky373/Postman-Postman-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0-Mock-Server%EC%99%80-API-%EB%AC%B8%EC%84%9C-%EB%A7%8C%EB%93%A4%EA%B8%B0#4-api-%EB%AC%B8%EC%84%9C-%EB%A7%8C%EB%93%A4%EA%B8%B0)
