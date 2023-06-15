---
layout: post
title: React-Native - Google ML Kit Text Recognition v2 API
description: >
  소프트웨어 마에스트로 과정을 진행하면서 본격적인 팀 프로젝트를 진행하기 전, 간단하게 미니 프로젝트를 진행하기로 하였다. 나는 백엔드 파트를 담당하여 Spring Boot를 통한 API 서버 개발을 하게 되었고, 프로젝트의 핵심 기능인 OCR을 구현하기 위해 Google ML Kit의 Text Recognition v2 라이브러리를 사용하여 성능 테스트를 해보기로 하였다.
sitemap: false
hide_last_modified: true
---

---

## Google ML Kit Text Recognition v2 API

### Link

[https://developers.google.com/ml-kit/vision/text-recognition/v2?hl=ko](https://developers.google.com/ml-kit/vision/text-recognition/v2?hl=ko)

### 정의

&nbsp; Google ML Kit Text Recognition v2 API는 Google의 ML Kit SDK에서 제공하는 텍스트 인식 기능의 버전 2이다. 이 API는 모바일 애플리케이션에서 이미지나 비디오에서 텍스트를 감지하고 인식하는 기능을 제공하고, 이를 통해 모바일 애플리케이션 개발자가 텍스트 인식 기능을 손쉽게 구현할 수 있도록 도와준다.

### 특징

- 이미지에서 텍스트 감지: 이미지를 입력으로 사용하여 이미지에서 텍스트를 감지함
- 텍스트 인식: 감지된 텍스트를 인식하여 문자열로 변환함
- 텍스트 정보 추출: 인식된 텍스트의 위치, 바운딩 박스, 언어 등의 정보를 추출함
- 다국어 지원: 다양한 언어의 텍스트를 인식하고 처리할 수 있음
- 실시간 텍스트 인식: 비디오 스트림에서 실시간으로 텍스트를 감지하고 인식할 수 있음

## 개발

### GitHub Repository

[https://github.com/jinu0137/react-native-test/tree/master/text_recognition](https://github.com/jinu0137/react-native-test/tree/master/text_recognition)

### 서론

&nbsp; React-Native으로 text-recognition을 사용하여 개발하기 위해 사용하는 npm 패키지는 아래 세 가지 중 하나를 사용하는 것 이였다.

- `@react-native-ml-kit/text-recognition`
- `@react-native-firebase/ml-vision`
- `@react-native-firebase/ml`

&nbsp; 나는 React-Native로 처음 개발하는 것이기도 하였고, TypeScript도 오랜만에 다뤄본 것이였기 때문에 ChatGPT의 힘을 빌려 `@react-native-ml-kit/text-recognition` 패키지로 개발을 진행하였다.

### @react-native-ml-kit/text-recognition

그런데 다 진행하고 보니 한글을 읽지 못하였다. 나는 해당 패키지의 `TextRecognizer` 모듈을 통해 텍스트 인식을 수행하였는데, 이 경우에는 언어 설정을 직접 지정할 수 있는 기능을 제공하지 않는다고(즉 영어로 된 텍스트만 인식한다는 뜻이다...) 한다. 패키지명을 보니 아마 Google의 text congnition도 아닌 것 같다. 그래서 두 번째 라이브러리로 구현해보기로 하였다. 그러나...

### @react-native-firebase/ml-vision

&nbsp; 해당 패키지는 Deprecated된 상태(Last publish는 3년 전)였고, 현재는 지원을 하지 않고 있었다. 고로 Google ML Kit Text Recognition v2 API 사용을 포기하려 했었으나...

### @react-native-firebase/ml

&nbsp; `@react-native-firebase/ml-vision`의 npm 문서에서 `@react-native-firebase/ml` 패키지에서 Google ML Kit을 지원한다는 내용이 작성되어 있었다. 그래서 해당 npm 패키지의 문서로 들어가 [Documentation](https://rnfirebase.io/ml/usage)을 확인해보았다. 하지만 해당 문서에서는 아직 text recognition 기능을 제공하지 않는다고 한다.

### 결론

&nbsp; 결국 나는 React-Native에서 Google ML Kit Text Recognition v2 API를 통해 OCR 기능을 개발하는 것이 불가능하다고 결정을 내렸다. 그래서 Naver Cloud Platform의 Clova OCR을 사용해보려 한다. Clova OCR을 사용한 결과는 다음 문서에서 기술하겠다.

## Reference

### React-Native 개발 시 발생한 Trouble Shooting

- [React-Native 버전 오류](https://yun5o.tistory.com/entry/cliinit-is-not-a-function-%EC%98%A4%EB%A5%98)
- [React-Native ImagePicker](https://velog.io/@thwjd9393/RN-ImagePicker)
- [React-Native Emulator 실행](https://ssjeong.tistory.com/entry/React-Native-%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8-%EC%83%9D%EC%84%B1-%EB%B0%8F-%EC%97%90%EB%AE%AC%EB%A0%88%EC%9D%B4%ED%84%B0-%EC%8B%A4%ED%96%89)

### npm packages

- [@react-native-ml-kit/text-recognition](https://www.npmjs.com/package/@react-native-ml-kit/text-recognition)
- [@react-native-firebase/ml-vision](https://www.npmjs.com/package/@react-native-firebase/ml-vision)
- [@react-native-firebase/ml](https://www.npmjs.com/package/@react-native-firebase/ml)
