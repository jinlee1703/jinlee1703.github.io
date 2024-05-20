---
layout: post
title: CloudFront 도메인 설정 시 인증서 오류
description: >
  졸업 작품팀에서 나는 백엔드 파트 및 인프라 구축을 담당하게 되었다. Terraform을 사용하여 CloudFront에 자체 도메인을 연결하기 위한 작업을 하던 중 이슈가 발생하여 이를 해결한 과정을 소개하고자 한다.
sitemap: false
hide_last_modified: true
---

---

## 이슈

```plain
│ Error: updating CloudFront Distribution (EF4DR7W8R0EVY): InvalidViewerCertificate: The specified SSL certificate doesn't exist, isn't in us-east-1 region, isn't valid, or doesn't include a valid certificate chain.
│       status code: 400, request id: 137f0dac-9470-4869-9930-67fac4c11410
│
│   with module.storage.aws_cloudfront_distribution.s3_cdn,
│   on modules/storage/main.tf line 70, in resource "aws_cloudfront_distribution" "s3_cdn":
│   70: resource "aws_cloudfront_distribution" "s3_cdn" {
│
╵
```

&nbsp; Terraform을 통해 CDN에 자체 도메인을 설정하려 하면 다음과 같은 오류가 발생한다. 이에 대한 원인은 `us-east-1 리전에 존재하지 않거나, 올바른 인증서 체인을 포함하지 않는다는 것을 나타낸다`고 한다. 즉 CDN에 설정할 자체 도메인의 인증서(ACM)은 `us-east-1` 리전에 존재하여야 한다는 뜻이다.<br>
&nbsp; 그러하여 ACM의 리전을 `us-east-1` 리전으로 변경하여 다시 적용하였으나 또 다른 이슈가 발생하였다.

```plain
│ Error: modifying ELBv2 Listener (arn:aws:elasticloadbalancing:ap-northeast-2:058264369714:listener/app/pennyway-alb/68bed6699eb62003/0300dc2ceedd1c1c): operation error Elastic Load Balancing v2: ModifyListener, https response error StatusCode: 400, RequestID: 20e7276d-6690-405a-8396-2095d897f4b2, api error ValidationError: Certificate ARN 'arn:aws:acm:us-east-1:058264369714:certificate/756769b1-dcad-48a7-aa6b-6d67ad65bdc4' is not valid
│
│   with module.network.aws_lb_listener.https,
│   on modules/network/main.tf line 271, in resource "aws_lb_listener" "https":
│  271: resource "aws_lb_listener" "https" {
│
╵
╷
│ Error: reading ACM Certificate (arn:aws:acm:us-east-1:058264369714:certificate/756769b1-dcad-48a7-aa6b-6d67ad65bdc4): couldn't find resource
│
│   with module.network.aws_acm_certificate_validation.validation_dev,
│   on modules/network/main.tf line 369, in resource "aws_acm_certificate_validation" "validation_dev":
│  369: resource "aws_acm_certificate_validation" "validation_dev" {
```

&nbsp; 이 오류의 원인은 다음과 같다.`ELBv2 Listener에서 ACM 인증서를 사용할 수 없음`. 우리 서비스의 경우 HTTPS 요청을 처리하기 위해 ELB에서 ACM 인증서를 통해 검증을 하는데, 이 인증서는 또 `us-east-1`이 아닌, `ap-northeast-2`(우리 서비스의 기존 리전)이어야 한다는 것이다.<br>
&nbsp; 해당 이슈를 해결하는 방법은 크게 어렵지 않다.

## 해결 방법

```go
# 기존 인증서
resource "aws_acm_certificate" "cert_dev" {
  domain_name       = "*.dev.${var.domain}"
  validation_method = "DNS"

  subject_alternative_names = [
    "*.dev.${var.domain}", # 와일드카드 서브도메인
  ]

  lifecycle {
    create_before_destroy = true
  }
}

# CDN용 인증서
resource "aws_acm_certificate" "cert_dev_cdn" {
  provider          = aws.us_east_1
  domain_name       = "*.dev.${var.domain}"
  validation_method = "DNS"

  subject_alternative_names = [
    "*.dev.${var.domain}", # 와일드카드 서브도메인
  ]

  lifecycle {
    create_before_destroy = true
  }
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

# S3 버킷에 대한 CDN 리소스
resource "aws_cloudfront_distribution" "s3_cdn" {
  ...

  viewer_certificate {
    acm_certificate_arn      = var.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2018"
  }
}
```

&nbsp; 기존 인증서(`ap-northeast-1`)를 그대로 유지한 상태로 새로운 인증서(`us-east-1`)를 발급받고, 이를 cdn 리소스에 적용해주면 된다.<br>
&nbsp; 필자의 경우에는 해당 방법 이외에 다른 방법이 있는지는 찾지 못하였다. 혹시 다른 방법을 찾게 된다면 댓글로 꼭 작성바란다.

---

## 관련 Pull-Request

- [https://github.com/CollaBu/pennyway-iac/pull/13](https://github.com/CollaBu/pennyway-iac/pull/13)
