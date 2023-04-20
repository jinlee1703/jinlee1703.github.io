---
layout: post
title: Scale-up & Scale-out
description: >
  본 글은 인프라를 업그레이드 하기 위한 방법인 Scale-up과 Scale-out에 대해 학습하기 위해 정리한 게시글입니다.
sitemap: false
hide_last_modified: true
---

---

## 배경

&nbsp; 기존에 사용하던 서비스의 사용자가 많아지고, 동시접속자가 많아져서 서버가 한계에 도달했을 때, 우리는 인프라를 확장해야할 필요성을 느낄 것이다. 이 글에서는 인프라를 확장하기 위한 방법인 `Scale-up`과 `Scale-out`에 대해 알아볼 것이다.

## Scale-up

![image](https://user-images.githubusercontent.com/68031450/233234142-d1d37bd3-5df1-47d3-a6ce-fe04de1d58db.png)

&nbsp; 기존에 존잰하던 서버를 보다 높은 사양으로 업그레이드하는 것을 의미한다. 하드웨어적으로 예를 들면, 성능이나 용량 증강을 목적으로 하나의 서버에 디스크를 추가하거나 CPU나 메모리를 업그레이드 시키는 것을 말한다.
<br>
&nbsp; 이렇게 Scale-up은 하나의 서버의 능력을 향상시키기 때문에 `수직 스케일링(vertical scaling)`이라고도 불린다.
<br>
&nbsp; AWS의 EC2를 사용할 경우에는 인스턴스 사양을 micro에서 small, small에서 edium 등으로 높이는 것이 수직 스케일링이다.

## Scale-out

![image](https://user-images.githubusercontent.com/68031450/233235130-822d113c-3848-4d2f-8797-7c5b3456b9a3.png)

&nbsp; 장비를 추가해서 확장하는 방식을 의미한다. 기존 서버만으로는 용량이나 성능의 한게에 도달했을 때 비슷한 사양의 서버를 추가로 연결함으로써, 처리할 수 있는 데이터 용량이 증가할 뿐만 아니라 기존 서버의 부하를 분담하여 성능 향사의 효과를 기대할 수 있다.
<br>
&nbsp; 서버를 추가로 확장하기 때문에 수평 스케일링(horizontal scaling)이라고도 불린다.
<br>
&nbsp; AWS와 같은 클라우드 서비스에서는 자원 사용량을 모니터링하여 자동으로 서버를 증설(Scale-out)하는 Auto Scaling 기능도 있다.

## Scale-up vs Scale-out

![image](https://user-images.githubusercontent.com/68031450/233238220-dfcad2cc-7d1a-4d08-be65-d5155bce22e6.png)

### Scalue-up

&nbsp; Scale-up 아키텍처에서는 ㅊ가적인 네트워크 연결 없이 용량을 증강할 수 있다. 스케일 아웃보다 관리 비요이나 운영 이슈가 적고, 사양만 올리면 되는 것이기 때문에 비교적 쉽지만, 성능 향상에 한계가 있으며 성능 향상에 따른 비용 부담이 크고, 서버 한대가 부담하는 데이터의 양이 많아서 자연재해 등의 다양한 이유로 서버에 문제가 생기면 큰 타격을 입게 된다.
<br>
&nbsp; 또한 기존의 서버를 교체함으로써 성능을 올릴 때에는 서비스를 이용할 수 없는 다운타임이 발생하게 된다.

### Scale-out

&nbsp; Scale-out 아키텍처의 가장 큰 장점은 확장의 유연성이라고 할 수 있다. Scale-up 시스템을 구축한 상황에서는 향후 확장 가능성에 대비하여 서버를 현재 필요한 만큼보다 더 많은 용량이나 성능을 확보해놓는 경우가 일반적이다. 하지만 이런 경우 에상했던 정도와 실제 요구되는 정도가 다르거나, 확장이 필요없어질 경우 추가로 확보해놓은 만큼의 손해가 발생하게 된다.
<br>
&nbsp; Sacle-out 방식으로 시스템을 구축한 상황에서는 서버를 필요한 만큼만 도입해놓고, 장기적인 용량 증가 추이를 예측할 필요 없이 그때그때 필요한 만큼 서버를 추가해 용량과 성능을 확장(pay-as-you-grow)할 수 있게 된다. 하지만 Scale-out의 경우에도 단점은 존재하는데, 여러 노드를 연결해 병렬 컴퓨팅 환경을 유지하려면 아키텍처에 대한 높은 이해도가 요구된다. 서버의 수가 늘어날수록 관리가 힘들어지는 부분이 있고, 아키텍처의 설게 단계에서부터 고려되어야 할 필요가 있기 때문이다.
<br>
&nbsp; 여러 노드(서버)에 부하를 균등하게 분산시키기 위해 로드 밸런싱(load balancing)이 필요하고, 노드를 확장할수록 문제 발생의 잠재 원인 또한 추가한 만큼 늘어나게 된다.

## 느낀 점

&nbsp; Scale-out의 마지막 부분에도 서술하였듯이 Scale-out이 무조건 Scale-up보다 뛰어나다고 할 수는 없다. 서비스를 제공하는 어플리케이션의 종류와 스토리지의 용도 등에 따라서 알맞은 방식을 선택해야한다.
<br>
&nbsp; 빅데이터의 데이터 마이닝이나 검색엔진 데이터 분석 처리 등을 대표하는 OLAP(Online Analytical Processing) 어플리케이션 환경에서는 대량의 데이터 처리와 복잡한 쿼리가 이루어지기 때문에 Scale-out이 더 효과적이지만, 온라인 금융거래와 가팅 워크플로우 기반의 빠르고 정확하면서 단순한 처리가 필요한 OLTP(Online Transaction Processing) 환경에서는 고성능의 Scale-up 방식이 적합하다고 한다.

---

## Reference

- (https://tecoble.techcourse.co.kr/post/2021-10-12-scale-up-scale-out/)[https://tecoble.techcourse.co.kr/post/2021-10-12-scale-up-scale-out/]
- (https://ko.wikipedia.org/wiki/%EB%8B%A4%EC%9A%B4%ED%83%80%EC%9E%84)[https://ko.wikipedia.org/wiki/%EB%8B%A4%EC%9A%B4%ED%83%80%EC%9E%84]
