---
layout: post
title: ALB Dualstack 이슈
description: >
  졸업 작품팀에서 나는 백엔드 파트 및 인프라 구축을 담당하게 되었다. Terraform을 통해 VPC 환경을 구축하였고, Application Load Balancer 리소스를 사용하던 중 dualstack이라는 것을 알게 되어 게시글을 작성하게 되었다.
sitemap: false
hide_last_modified: true
---

---

## 사전 지식

### Dualstack?

&nbsp; 네트워킹에서 사용되는 용어로, IPv4와 IPv6의 두 가지 인터넷 프로토콜을 동시에 지원하는 네트워크 구성을 말하낟. 인터넷의 주소 체계가 IPv4에서 IPv6로 전환되는 과정에서, 두 프로토콜을 모두 사용할 수 있도록 함으로써 호환성과 전환의 유연성을 제공한다.<br><br>
&nbsp; **Dualstack 모드**에서는 서버나 네트워크 장비가 IPv4와 IPv6 양쪽 주소를 동시에 가질 수 있어, 두 가지 유형의 트래픽을 모두 처리할 수 있다. 이 방시긍ㄹ 통해 기존의 IPv4 기반 시스템과 새로운 IPv6 시스템 간의 원활한 통신과 전환을 지원한다.

### Application Layer

&nbsp; 사용자가 UI를 통해 접하는 **응용 프로그램과 관련된 계층**으로, TCP/IP 5계층(혹은 OSI 7계층)에서 최상단 계층에 해당하는 Layer이다. HTTP, FTP, DHCP, SMTP, DNS 등의 프로토콜이 이에 속하고, 이들은 어떠한 방법으로든 사용자와 직접 접하게 된다.

### Load Balancer

&nbsp; 네트워크 트래픽이나 애플리케이션 요청을 여러 서버(혹은 리소스)에 분산시켜 처리하는 네트워크 장치 혹은 소프트웨어이다. 이를 통해 개별 서버에 가해지는 부하를 줄이고, 전체 시스템의 가용성과 내구성을 향상시킬 수 있다. 로드 밸런싱은 웹 서비스, 데이터베이스 서버, 네트워크 트래픽 등 다양한 환경에서 활용될 수 있다.

### Application Load Balancer

&nbsp; Application Load Balancer(이하 ALB)는 Application Layer에서 동작하는 로드 밸런서이다. 위에서 나열한 Application Layer에서 동작하는 프로토콜을 다룰 수 있다.<br><br>
&nbsp; AWS에서는 총 4가지 로드밸런서(ALB, NLB, CLB, ELB)를 제공하는데, 그 중 ALB는 `HTTP`, `HTTPS`, `WebSocket`을 활용하는 로드밸런서라는 것이 가장 큰 특징이다.<br>
&nbsp; ALB는 HTTP의 `Header`, `요청 Method` 등을 이용해 사용자의 요청을 적절한 대상 그룹으로 라우팅(부하 분산)할 수 있으며 규칙에 우선 순위를 두고 차례대로 적용할 수 있다.

## 발생한 이슈

### Terraform을 활용한 ALB 리소스 생성 및 Route53 record 설정

```
# 개발 환경에서 HTTP 및 HTTPS 트래픽을 컨트롤하기 위한 ALB 생성
resource "aws_lb" "alb" {
  name               = "${var.terraform_name}-alb"
  load_balancer_type = "application"
  internal           = false
  security_groups = [
    aws_vpc.vpc.default_security_group_id,
    aws_security_group.bastion_sg.id
  ]
  subnets = [
    aws_subnet.net.id,
    aws_subnet.net2.id
  ]
}

# 개발 환경 - bastion 호스트 연결
resource "aws_route53_record" "dev_to_bastion" {
  zone_id = aws_route53_zone.zone_dev.zone_id
  name    = "*.dev.${var.domain}"
  type    = "A"

  alias {
    name                   = aws_lb.alb.dns_name
    zone_id                = aws_lb.alb.zone_id
    evaluate_target_health = true
  }
}
```

### Dualstack이 적용되지 않음

<img width="349" alt="image" src="https://gist.github.com/assets/68031450/89e97a11-fdbf-4bf6-972a-4837ed215207">

&nbsp; `사용`으로 표시된 내용이 현재 Terraform을 통해 필자가 적용한 레코드 값이고, 아래가 AWS Console에서 추천하는 'Dualstack' 레코드 값이다. 현재 사용중인 값에서 'dualstack.'이라는 문자열만 삽입하면 정상적으로 동작시킬 수 있다. 하지만 [참고자료](https://github.com/hashicorp/terraform-provider-aws/issues/6480)에 따르면 다음과 같은 사실을 알 수 있었다.

- AWS는 2021년 VPC ALBs에 대한 IPv6 지원을 추가했다.
- ELB(Classic Load Balancer)를 사용할 때는 별칭(Alias) 레코드를 구성하기 위해 'dualstack' 접두사가 필요했다.
- **AWS 콘솔을 통해** 별칭 레코드를 생성할 때, 'dualstack' 접두사는 2022년 8월 기준으로 자동으로 추가된다.
  - 그러나 AWS 콘솔의 ALB 페이지에서는 ALB DNS 이름 필드에 'dualstack' 접두사가 표시되지 않는다.
  - 'dualstack.ALB_NAME.elb.amazonaws.com'과 'ALB_NAME.elb.amazonaws.com' 둘 다 AAAA 쿼리에 응답하며 IPv6을 사용하여 접근할 수 있다.

&nbsp; 사실 AWS Console에서는 dualstack이 적용되지 않지만, 우리 서비스에서는 IPv4 주소 체계만을 사용하기 때문에 전혀 문제될 부분이 없다. 추후 dualstack 적용이 필요하다면 'dualstack.' 문자열을 명시적으로 추가해주는 식으로 해결할 것이다.

## References

- [AWS - LoadBalancer](https://y-oni.tistory.com/313#toc45)
- [ALB - 1](https://aws-hyoh.tistory.com/134)
