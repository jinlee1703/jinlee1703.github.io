---
layout: post
title: Auto Scaling
description: >
  본 글은 SW마에스트로 과정에서 프로젝트를 진행하기 위해 자기 주도 학습을 한 내용의 게시글입니다.
sitemap: false
hide_last_modified: true
---

---

## 장의

&nbsp; 클라우드 컴퓨팅의 가장 대표적인 장점은 **필요에 따라 서비스를 빠르게 확장하거나 축소할 수 있는 유연성**을 가지고 있다는 점이다. 그 중에서 **Auto Scaling**은 클라우드 컴퓨팅의 유연성을 돋보이게 하는 핵심 기술로 CPU, 메모리, 디스크, 네트워크 트래픽과 같은 시스템 자원들의 메트릭(Metric) 값을 모니터링하여 **서버의 사이즈를 스스로 조절**하는 서비스를 말한다. <br>
&nbsp; Auto Scaling을 통해 서비스 부하를 효과적으로 대응하고, 최대한 저렴한 비용으로 안정적이고 예측 가능한 성능을 유지할 수 있다.

## 목표

### 1. 정확한 수의 EC2 인스턴스를 보유하도록 보장

- 그룹의 최소 인스턴스 숫자와 최대 인스턴스 숫자를 관리
- 서비스를 실행하기 위한 인스턴스가 최소 3대가 필요하다면, 3대 이상의 인스턴스를 유지할 수 있도록 보장
- 최소 숫자 이하로 내려가지 않도록 인스턴스 숫자를 유지 (인스턴스 추가)
- 최대 숫자 이상 늘어나지 않도록 인스턴스 숫자 유지 (인스턴스 삭제)

### 2. 다양한 스케일링 정책 적용 가능

- CPU의 부하에 따라 인스턴스 크기 늘리기/줄이기 (ex: 오후 2시에 접속 트래픽이 높기 때문에 인스턴스 개수 증가, 새벽 2시에 접속 트래픽이 낮기 때문에 인스턴스 개수 감소)

### 3. 가용 영역에 인스턴스가 골고루 분산될 수 있도록 인스턴스 분배

- 서비스 장애가 발생하더라도 문제없이 서비스 이용 및 제공

## 구성 요소

### Auto Scaling Grous

![image](https://user-images.githubusercontent.com/68031450/234775598-daae4e59-faa1-4fd2-8db1-90b83f94b4c0.png)

- EC2 인스턴스를 조정 및 관리 목적의 논리단위로 취급될 수 있도록 그룹으로 구성
- 그룹 생성 시 EC2 인스턴스의 최소(minimum size) 및 최대(maximum size) 인스턴스 수와 원하는(desired capacity) 인스턴스 수를 지정하고 이 범위 안에서 Scale in///out이 일어남
- 인스턴스 증감은 그룹 안에서 이루어지며, 사용자가 지정한 조건을 통해 실행됨
  - 증설 시 어떤 인스턴스 템플릿을 이용하는가
  - 얼마나 많은 서버를 필요로 하는가
  - 어떤 값을 기반으로 모니터링하여, 인스턴스를 증설 혹은 감축할 것인가
- 증설된 인스턴스가 로드밸런스의 멤버로 연결되어야 한다면, 로드밸런서를 지정할 수도 있으

### 시작(구성) 템플릿

![image](https://user-images.githubusercontent.com/68031450/234776195-32500697-54d9-48fe-a3a7-50332552800c.png)

- Auto Scaling 그룹에서 인스턴스를 시작하는데 사용하는 템플릿
  - AMI(이미지)와 동일한 개념
- 똑같은 OS 환경의 인스턴스를 간편하게 복제하기 위해서 구성
- 템플릿을 Auto Scaling 그룹에 지정함으로써, Auto Sccaling을 통해 인스턴스를 늘리면 그 인스턴스의 환경 구성이 템플리셍 설정된 호나경에 따라 복제됨
- 인스턴스 AMI ID, 인스턴스 유형, 키 페어, 보안 그룹 블록 디바이스 매핑 등의 정보를 세팅할 수 있음
  - 수정이 불가능
  - 옵션을 바꿔야할 경우, 새로 생성을 하고 버전을 새로 생성한 버전으로 바꿔야 함

## 동작 과정

1. 특정 주기마다 로드밸런서의 네트워크 정보와 서버의 시스템 리소스 메트릭 정보들을 모니터링 서비스로 수집
2. 모니터링 서비스(AWS CloudWatch)에서 지정한 임계치를 벗어나는 것을 감지하면 Auto Scaling Group으로 알람을 발송 (ex: CPU 평균사용률이 70% 이상으로 5분 동안 지속되면 Auto Scaling 정책이 Trigger됨)
3. Auto scaling 정책을 통해 서버 수를 늘리거나 줄임(프로비저닝 작업 수행), AWS의 겨우 현재 서비스 중인 인스턴스 이미지와 동일한 형상(서버 사양, 응용 서비스, 미들웨어 등)으로 사전에 컷텀 이미지를 AMI로 만들어 놓아 빠른 프로비저닝이 가능
4. AWS의 ELB(Elastic Load Balancing)에서 생성한 신규 서버의 서비스 상태 확인을 위해 단순 URL(/ping)에 HTTP 요청과 200 OK 응답 결과로 섭시ㅡ 시작 여부 확인
5. 서버 상태 확인이 완료되면 서버를 서비스 로드밸런서에 추가하여 다른 서버와 동일하게 클라이언트의 요구 트래픽 처리

---

## Reference

- [https://docs.aws.amazon.com/ko_kr/autoscaling/ec2/userguide/what-is-amazon-ec2-auto-scaling.html](https://docs.aws.amazon.com/ko_kr/autoscaling/ec2/userguide/what-is-amazon-ec2-auto-scaling.html)
- [https://inpa.tistory.com/entry/AWS-%F0%9F%93%9A-EC2-%EC%98%A4%ED%86%A0-%EC%8A%A4%EC%BC%80%EC%9D%BC%EB%A7%81-ELB-%EB%A1%9C%EB%93%9C-%EB%B0%B8%EB%9F%B0%EC%84%9C-%EA%B0%9C%EB%85%90-%EA%B5%AC%EC%B6%95-%EC%84%B8%ED%8C%85-%F0%9F%92%AF-%EC%A0%95%EB%A6%AC](https://inpa.tistory.com/entry/AWS-%F0%9F%93%9A-EC2-%EC%98%A4%ED%86%A0-%EC%8A%A4%EC%BC%80%EC%9D%BC%EB%A7%81-ELB-%EB%A1%9C%EB%93%9C-%EB%B0%B8%EB%9F%B0%EC%84%9C-%EA%B0%9C%EB%85%90-%EA%B5%AC%EC%B6%95-%EC%84%B8%ED%8C%85-%F0%9F%92%AF-%EC%A0%95%EB%A6%AC)
- [https://m.post.naver.com/viewer/postView.naver?volumeNo=29960975&memberNo=36733075](https://m.post.naver.com/viewer/postView.naver?volumeNo=29960975&memberNo=36733075)
