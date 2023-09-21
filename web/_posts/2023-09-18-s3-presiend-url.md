---
layout: post
title: AWS S3 - Presiend URL 적용기
description: >
  소프트웨어 마에스트로 14기 팀 프로젝트에서 나는 백엔드 파트를 담당하여 Spring Boot를 통한 WAS 개발을 하게 되었다. AWS S3를 통해 정적 파일을 관리하고 있는데, Presigned URL을 통해 보안을 강화하고자 게시글을 작성하게 되었다.
sitemap: false
hide_last_modified: true
---

---

## S3

### 정의

&nbsp; `AWS S3(이하 S3)`란 Simple Storage Service의 약자로, 클라우드 환경에서 일반적으로 사용되는 계층 없는 데이터 저장 방법이다. 다른 데이터 스토리지 방법과 달리 디렉터리 트리를 사용하지 않고 **key-value 형태로 저장되는 것이 특징이다.**<br>
&nbsp; `**온라인** 스토리지 서비스`라고도 하는데, 그 이유는 데이터 조작에 HTTP/HTTPS를 통한 API가 사용되기 때문이다. `99.9999999999% (11 9’s) of durability)`의 내구성을 가지고 있고, 용도에 따라 세부적인 접속 관리가 가능하기 때문에 높은 가용성, 신뢰성, 안정성을 자랑한다. 더 자세한 내용은 게시글의 [Reference](#refrence)를 참고하길 바란다.

### 구조

&nbsp; 예를 들어 `/web/hello.html`이라는 파일 안에 아래와 같은 내용이 작성되어 있다고 가정해보자.

```html
<!-- /web/naver.html -->
<html>
    <body>
        <h1>Hello, world!</h1>
    </body>
<html>
```

&nbsp; 이 경우에 `/web/naver.html`이라는 **파일명이 key**이고, 위의 **내용이 value**로 관리되는 것이다. 이렇게 계층 구조가 아니기 때문에 개별 단위(오브젝트)가 스토리지 풀의 동일한 레벨에 있다는 것이 특징이다.

### 용도

&nbsp; 가장 대중적으로는 이미지와 같은 정적 파일을 저장 및 조회할 때 사용되는 경우이다. S3에는 정적 파일 자체를 저장하고, 나머지 메타 데이터(파일 접근을 위한 주소, 파일 크기, 저장 일자 등)는 연관성있는 정보와 함께 관계형 데이터베이스에 저장하는 형식으로 많이 사용된다.<br>
&nbsp; 그 외에도, 정적 웹 사이트 호스팅 목적, 로그 저장소, AWS EBS 스냅샷 등 다양한 영역에 폭넓게 활용할 수 있다.

### 데이터베이스(RDBMS)에 이미지를 저장하지 않는 이유

&nbsp; 만약 RDBMS로 MySQL을 사용한다고 했을 때 아마 이미지를 저장하기 위한 Column 타입은 BLOB(Binary Large Object)이 될 것이다. BLOB 타입은 기본적으로 binary string으로 취급되는데 이는 Column에 url만 저장하는 것보다 차지하는 용량이 커지게 될 것이고, 이는 백업 용량도 커지게 될 것이다. AWS RDS와 S3의 용량을 비교했을 때 S3가 GB 당 비용이 저렴하므로 비용적인 측면에서 유리하다.<br>
&nbsp; 또한, RDB에 저장할 경우 상대적으로 이미지 로딩 속도가 느리기 때문에 병목 현상이 발생할 수 있다는 점 등의 단점이 존재하기 때문에 일반적으로 S3에서 관리하는 케이스가 많다.

## S3 - Presigned URL

### 정의

&nbsp; `Presigned URL`이란 AWS 인스턴스에 대한 접근 권한을 제공하기 위해서 사용되는, 이름 그대로 사전에 적절한 권한을 가진 자격증명에 의하여 Signed 된 URL을 의미한다.<br>
&nbsp; S3 뿐만 아니라 AWS에서 제공하는 다양한 서비스에서 Presigned URL을 활용할 수 있지만, 우리는 S3의 케이스에 대해서만 다뤄보도록 하겠다.

### 이점

&nbsp; S3의 Presigned URL은 S3 버킷의 오브젝트에 대한 일시적인 액세스를 제공하는 URL이다. Presigned URL을 사용하게 됨으로써 얻게되는 이점들이 있는데 이 중 크게 `보안`과 `서버 부하 감소`가 있다. 이에 대해 살펴보자.

#### 보안

&nbsp; 기본적으로 S3 버킷과 그 안의 오브젝트 들은 Private으로 설정하는 것이 원칙이다. Presigned URL은 특정 시간 동안만 오브젝트에 접근할 수 있도록 허용하므로, 영구적인 권한을 부여하지 않고도 일시적으로 객체에 접근하게 할 수 있다. 이를 통해 보안상의 이점을 제공할 수 있고, 민감한 데이터에 대한 일시적인 접근을 허용하는 경우에 유용하다.

#### 서버 부하 감소

&nbsp; 클라이언트에서 오브젝트를 직접 업로드하거나 다운로드 할 수 있도록 Presigned URL을 제공하게 되면, 중간에 서버를 거치지 않고도 S3에 접근할 수 있기 때문에, 대역폭과 시간을 절약할 수 있다.<br>
&nbsp; 또한 서버 입장에서는 단순히 Presigned URL을 생성하고 제공하는 역할만 하게 되므로, 대규모의 데이터 전송 작업에 있어서 서버의 부하를 줄일 수 있다. 반대로 **API 서버가 파일 업로드를 직접 대응하는 것은 확장성 측면에서 좋지 못하다**고 할 수 있다.<br>
&nbsp; 추가적으로 큰 용량의 파일 업로드 요청이 있었을 때 스트림을 활용하여 중간에 차단할 수 있지만, 이 역시도 서버의 부하가 아예 없다고 할 수는 없으므로 Presigned URL을 사용하는 것이 더 좋은 방법이다.

### 이미지 업로드 전략

&nbsp; 위에서 서술한 장점 덕분에 SW마에스트로에서 진행하고 잇는 우리 프로젝트에서도 Presinged URL을 통해 이미지를 업로드하기로 결정하였다.

#### 기존 이미지 업로드 전략

![image](https://user-images.githubusercontent.com/68031450/269122129-ca564d0e-b0a1-443b-bdde-5206141f0613.png)

&nbsp; 이전 업로드 전략은 위 그림과 같다. `Client`가 `Server(EC2)`에 이미지를 전송하고, 이를 거쳐 `S3`에 저장되는 방식이다.

#### Presigned URL을 사용한 이미지 업로드 전략

![image](https://user-images.githubusercontent.com/68031450/269122975-280f9f9a-9c97-475f-827d-9a0286ba9474.png)

&nbsp; 우리는 위 방식으로 수정하기로 하였다.

## Spring Boot - S3 Presigned-url 발급 받기

### S3 버킷 정책 수정

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "2",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity E3IJ8VKLEQEQV7"
            },
            "Action": [
                "s3:Get*",
                "s3:Put*"
            ],
            "Resource": [
                "arn:aws:s3:::dev.storage.gifthub.kr",
                "arn:aws:s3:::dev.storage.gifthub.kr/privacy",
                "arn:aws:s3:::dev.storage.gifthub.kr/brand/*",
                "arn:aws:s3:::dev.storage.gifthub.kr/product/*",
                "arn:aws:s3:::dev.storage.gifthub.kr/voucher/*.jpg",
                "arn:aws:s3:::dev.storage.gifthub.kr/voucher/*.jpeg",
                "arn:aws:s3:::dev.storage.gifthub.kr/voucher/*.gif",
                "arn:aws:s3:::dev.storage.gifthub.kr/voucher/*.png"
            ]
        }
    ]
}
```

&nbsp; 우선 우리 팀은 이미 S3 버킷을 만들어 놓은 상태이므로 몇 가지 설정만 수정하였다.<br>
&nbsp; 우선 `Action` 설정을 통해 `GET`과 `PUT` 요청만 할 수 있도록 수정하였다. 이 게시글의 경우 이미지 등록을 위한 Presigned-url 발급이 목적이기 때문에 `PUT` 요청만 허용하여도 문제가 없다.<br>
&nbsp; 그리고 `Resource` 옵션을 통해 특정 디렉토리(사실은 key지만)에 한해서 확장자를 제한해두었다. 우리 서비스의 경우 Presigned-url로 PUT 요청을 할 때는 이미지만 받고 싶었기 때문에 `.jpg`, `jpeg`, `gif`, `png`만으로 제한해두었다.

### Spring Boot 소스 코드

#### build.gradle

```json
...
implementation group: 'org.springframework.cloud', name: 'spring-cloud-starter-aws', version: '2.2.6.RELEASE'
    testImplementation group: 'io.findify', name: 's3mock_2.12', version: '0.2.6'
...
```

### XXXService.java

```java
public String getPresignedUrlForSaveVoucher(String dirName, String extension) {
    String key = dirName + "/" + UUID.randomUUID().toString() + "." + extension;
    GeneratePresignedUrlRequest generatePresignedUrlRequest =
      new GeneratePresignedUrlRequest(bucketName, key, HttpMethod.PUT)
          .withExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 5));
    return amazonS3Client.generatePresignedUrl(generatePresignedUrlRequest).toString();
 }
```

&nbsp; 위와 같이 AWS S3를 위한 의존성을 추가하였고, `GeneratePresignedUrlRequest` 클래스를 통해 Presgined-url을 발급받을 수 있다.

## Refrence

- [AWS S3 (NCP Object Storage)](https://jinlee.kr/devops/2023-04-26-aws_s3/)
- [AWS 특강 - S3 & CDN 정리](https://jinlee.kr/devops/2023-08-30-aws-seminar2/)
- [Pre-Signed URL 을 이용하여 S3 파일 공유](https://cloudguardians.medium.com/pre-signed-url-%EC%9D%84-%EC%9D%B4%EC%9A%A9%ED%95%98%EC%97%AC-s3-%ED%8C%8C%EC%9D%BC-%EA%B3%B5%EC%9C%A0-fbf9261f64d6)
