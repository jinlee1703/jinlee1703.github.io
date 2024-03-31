---
layout: post
title: NGINX proxy 설정
description: >
  졸업 작품팀에서 나는 백엔드 파트 및 인프라 구축을 담당하게 되었다. Terraform을 통해 VPC 환경을 구축하였고, nginx를 통해 proxy를 구축한 내용을 서술하려 한다.
sitemap: false
hide_last_modified: true
---

---

## Architecture

![image](https://gist.github.com/assets/68031450/ebcd684f-b38b-43dc-bb0a-740fdeb937e0)

&nbsp; public subnet에 있는 `bastion(위 그림의 nat instance는 nat gateway + bastion)` 호스트(public ip)의 8080 포트에 접근할 경우 private subnet에 있는 was 호스트의 8080 포트(우리 서버의 경우 spring application)로 접근할 수 있도록 제공하려 한다.

## 과정

### 1. bastion 호스트의 8080 포트 개방

```
# public ip를 통해 8080 포트 접근 허용
resource "aws_security_group_rule" "api" {
  type              = "ingress"
  from_port         = 8080
  to_port           = 8080
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.bastion_sg.id
}
```

### 2. bastion 호스트에서 nginx 관리

```yaml
version: "3"
services:
  nginx:
    container_name: nginx
    image: nginx:latest
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    ports:
      - "8080:8080"
    restart: always
```

&nbsp; docker-compose를 통해 nginx의 최신 이미지를 사용하도록 하였다. 외부에서 8080 포트로 접근할 때, 내부적으로 nginx 컨테이너의 8080 포트로 트래픽이 전달된다.

### 3. nginx.conf 설정

```
events {}

http {
    server {
        listen 8080;

        location / {
            proxy_pass http://${private_ip}:8080;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
    }
}
```

&nbsp; 8080 포트를 통해 들어오는 HTTP 요청을 ${private_ip}로 전달하도록 처리하였다.
