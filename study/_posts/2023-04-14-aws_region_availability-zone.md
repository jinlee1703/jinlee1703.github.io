---
layout: post
title: AWS > Region(지역)과 Availability Zone(가용구역)
description: >
  본 글은 생활코딩님의 AWS 강의를 듣고 별도 학습을 통해 작성한 포스트입니다.
sitemap: false
hide_last_modified: true
---

---

## 1. AWS Region

- 아마존 웹서비스가 가지고 있는 서버(컴퓨터들)가 어디에 위치해 있는 지를 의미
- 사용자와 컴퓨터의 위치가 멀수록 느려지기 때문에 비즈니스적으로 상당히 중요함
- 따라서 한국에서 AWS를 사용한다면 한국 센터를 사용하는 것이 네트워크 속도가 가장 빠를 것
  - 해외 지역의 Region을 사용하게 된다면 경유지가 많아지면서 속도가 떨어지는 원리
- 핵심은 소비자를 기준으로 Region을 설정하는 것
  - 소비자에게 빠른 속도를 제공함으로써 쾌적한 환경으로 웹 서비스를 제공할 수 있기 때문
- 같은 상품이라도 Region에 따라 가격이 다름
  - 환율, 서버 투자 비용 등에 따라 가변적으로 변함
- [cloudPing.info](https://cloudping.info/)에서 한국에서 각 Region 간의 응답 시간을 확인할 수 있음
  - 사용자의 지역과 다른 지역의 속도만 제공

## 2. Availity Zone

- 2개의 완전히 서로 독립된 인프라가 있을 때, 하나의 Region에는 여러 건물이 위치하고 있음
  - 자연재해나 사고가 발생 할 경우, 해당 센터가 완파 되더라도 다른 센터에서 백업의 역할을 해줄 수 있음
- 하나의 Region에는 여러개의 건물들로 흩어져 있고 각각의 건물들 사이는 인터넷 보다 훨씬 빠른 전용선으로 직접 연결되어 있음
  - 마치 같은 건물에 있는 것처럼 빠르게 데이터를 전송할 수 있음
- 같은 Region에 있는 서로 다른 가용 구역 안에서는 데이터를 주고받을수 있지만, 서로 다른 지역끼리는 데이터를 주고 받을 수 없음
  - 전용선이 아닌 인터넷으로 느리게 주고 받을 수는 있음

## 3. Reference

- [https://opentutorials.org/course/2717/11271](https://opentutorials.org/course/2717/11271)
- [https://new93helloworld.tistory.com/155](https://new93helloworld.tistory.com/155)
