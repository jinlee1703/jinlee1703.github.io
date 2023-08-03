---
layout: post
title: Ubuntu에 Docker sudo 권한 해제하기
description: >
  소프트웨어 마에스트로 14기 팀 프로젝트에서 나는 백엔드 파트를 담당하여 Spring Boot를 통한 WAS 개발을 하게 되었다. Docker를 우리 프로젝트에 도입하기 위해 AWS EC2에 Docker를 보다 편리하게 사용하기 위해 sudo 권한을 해제하는 명령어를 암기하고자 게시글을 작성하게 되었다.
sitemap: false
hide_last_modified: true
---

---

#### Docker Group 생성

```bash
sudo groupadd docker
```

&nbsp; 나는 도커를 설치할 때 그룹이 만들어져 있었는지, 이미 그룹이 있다는 문구가 출력되었다.

#### Docker Group에 현재 로그인된 사용자 추가

```bash
sudo usermod -aG docker ${USER}
```

#### Docker 재시작

```bash
sudo service docker restart
```

#### 현재 사용자 로그아웃 후 재로그인

```bash
# 현재 사용자 -> 루트 사용자로 변경
sudo su -

# 루트 사용자 -> 현재 사용자로 변경
su - ubuntu
```

#### 적용 여부 테스트

```bash
docker run hello-world
```
