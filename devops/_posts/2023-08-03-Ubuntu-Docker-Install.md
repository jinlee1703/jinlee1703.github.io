---
layout: post
title: Ubuntu에 Docker 설치하기
description: >
  소프트웨어 마에스트로 14기 팀 프로젝트에서 나는 백엔드 파트를 담당하여 Spring Boot를 통한 WAS 개발을 하게 되었다. Docker를 우리 프로젝트에 도입하기 위해 AWS EC2에 Docker를 설치하는 명령어를 기억해두고자 게시글을 작성하게 되었다.
sitemap: false
hide_last_modified: true
---

---

### 실행환경

&nbsp; 해당 문서의 명령어에 따른 결과는 실행 환경따라 차이가 수 있으므로 유의하길 바란다.

#### 서버 인스턴스

- AWS EC2

#### 버전

- Ubuntu 22.04

---

### Docker 설치 명령어

#### 1. 우분투 시스템 패키지 업데이트

```shell
sudo apt-get update
```

#### 2. 필요한 패키지 설치

```shell
sudo apt-get install apt-transport-https ca-certificates curl gnupg-agent software-properties-common
```

#### 3. Docker 공식 GPG키 추가

```shell
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
```

#### 4. Docker 공식 apt 저장소 추가

```shell
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
```

#### 5. 우분투 시스템 패키지 재업데이트

```shell
sudo apt-get update
```

#### 6. Docker 설치

```shell
sudo apt-get install docker-ce docker-ce-cli containerd.io
```

#### 7. Docker 설치 및 실행 상태 확인

```shell
sudo systemctl status docker
```

&nbsp; 다른 블로그의 글들을 보면 최근에는 docker 설치만 하면 `docker-compose`가 같이 설치된다고 하였는데, 나의 경우는 그렇지 않아서 snap으로 다시 설치해주었다.

![image](https://user-images.githubusercontent.com/68031450/257958155-3d0a6a2c-6054-4357-be0b-ed32ae605f1a.png)

&nbsp; 정상적으로 설치되었다면 결과는 위 사진과 같이 초록불이 표시될 것이다.

---

### docker-compose 설치를 위한 추가 명령어

#### 8. docker-compose 설치

```shell
sudo snap install docker
```

---

### Reference

- [https://haengsin.tistory.com/128](https://haengsin.tistory.com/128)
- [https://velog.io/@dailylifecoding/ubuntu-20.04-docker-and-dockercompose-install](https://velog.io/@dailylifecoding/ubuntu-20.04-docker-and-dockercompose-install)
