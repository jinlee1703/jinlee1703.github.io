---
layout: post
title: AWS 특강 - S3 & CDN 정리
description: >
  소프트웨어 마에스트로 14기로 활동하면서 전담 멘토님께서 주관하시는 AWS 특강을 수강하게 되었고, 해당 특강을 통해 학습한 키워드를 재학습하여 내 지식으로 만들고자 게시글을 작성하게 되었다.
sitemap: false
hide_last_modified: true
---

---

## S3

- Simple Storage Service의 약자
- Core Components
  - **Bucket**
    - Management
      - Properties
        - **Bucket Versioning**
          - 웹 사이트 호스팅 목적으로는 부적합
          - Key - Value에서 Key에 대한 버전 히스토리를 관리
          - Delete가 없음
            - Delete Marker 라는 개념이 생김
              - 실제로 삭제가 되지는 않고 삭제한 것처럼 표시
        - **Encryption**
          - 2022년 말부터 S3 버킷 기본 암호화 적용
            - SSE-S3
              - Server Side Encryption
              - 내부적으로 KMS를 쓰지만 내부적으로는 접근 불가능
            - SSE-KMS
              - KMS 키를 직접 만들어서 사용
              - key에 대한 접근 제어 역시 KMS에서 할 수 있게 됨
            - CSE vs SSE
              - CSE : 클라이언트에서 암호화 및 복호화 수행
              - SSE : 서버에서 암호화 및 복호화 수행
            - AWS의 모든 저장소 암호화 기능은 KMS(Key Management Service) 서비스와 통합
            - Bucket key
              - KMS Key는 Operation마다 비용 부과
              - Enable : KMS를 한 번 호출하고 봉투화를 통해 중간키를 만들어 S3 Bucket에 저장함
                - 안 쓸 이유가 없음
                - 항상 활성화 할 것
        - Static Website hosting
          - S3 버킷으로 정적 웹 사이트 호스팅
          - S3 자체적인 버킷 단위 도메인을 제공
            - HTTPS
          - 문제점
            - 커스텀 도메인 설정이 불가능함
            - CNAME 설정 가능 / 커스텀 도메인에 대한 HTTPS 인증서 설정이 불가
              - 커스텀 도메인 설정하면 HTTP로는 사용 가능
        - Request pay
          - SaaS 서비스 시 사용
          - 고객이 call 마다 비용을 지불
        - Transfer acceleration
          - 전용 채널을 통해 더 빠른 속도 제공
          - 웹사이트 호스팅 시에는 사용하지 않음
        - Event Notifications
          - 이벤트 기반 작업 시 사용
            - ex) 이미지를 올렸을 때 event를 트리거링 해서 lambda가 이미지를 후처리(압축 등) 할 때 사용할 수 있음
        - Server access logging, AWS CloudTrail data event
          - 특정 버킷을 지정하여 해당 버킷에 대한 access log를 저장할 수 있음
          - 두 가지가 데이터 유실에 따른 차이가 있음
        - Intelligent Tiering
          - Storage Class 관련 옵션
          - 스토리지를 자동으로 관리해주는 기능
      - Lifecycle rule
        - 특정 키에 대해 관리할 수 있음
          - ex) 30일 뒤에 삭제해라
      - Replication rule
        - 버킷과 버킷간의 복제 관련 룰
    - Access Control
      - **Bucket Policy**
        - Resource-based Policy
        - IAM : 권한을 제어하는 주체
          - Identity-based Policy (IAM User, Group, Role)
          - Resource-based Policy
            - S3, SQS/ SNS / KMS / Lambda / ECR Repo
      - ACL
        - 잊어라. 무시해라.
      - Object Ownership
        - 버킷의 오브젝트를 올리는 사람 혹은 서비스에 대한 권한을 어떻게 가져갈 것인지에 대한 설정
        - `BucketOwnerEnforced`가 기본
      - Block Public Access
        - 항상 켜라
      - CORS
        - 무시해도 되요.
        - Special Case: Static Website Hosting을 할 때 쓰는 기능
      - **VPC Private Link**
        - VPC - Endpoints, Endpoint services..
          - Endpoint (서비스 소비자)
            - Interface Endpoint
              - 랜선을 통해 VPC에 연결하는 방식 (네트워크 카드가 생긴다)
              - 서비스에 우리 IP가 할당됨 - 유료
            - Gateway Endpoint
              - 라우팅 시 서비스로 보내라
              - S3 / DynamoDB 서비스만 지원
              - S3 생성 시 설정해놓음 - 무료
          - Endpoint Service (서비스 제공자)
        - AWS VPC와 서비스를 연결시켜주는 기술
  - Access Point
    - 하나의 버킷에 여러 진입 지점을 만들고, 각 진입 지점에 따른 접근 제어를 따로 할 수 있음
    - ex) 개발팀, 운영팀의 접근 제어를 따로 함
  - Object Lambda Access Point
    - 특정 object에 대해 접근 제어를 통해 lambda로 전처리를 할 수 있음
  - Multi-Region Access Point
- Object 저장소 / Key-Value Storage
  - ‘폴더명/’의 key에 value를 넣어주는 식으로 디렉토리 구조를 표현함
  - ex) key - ‘폴더명/파일명.확장자’
- 내구성 / 내결함성 (Amazon S3 is designed for 99.9999999999% (11 9’s) of durability)
  - 안전하게 믿고 데이터를 맡길 수 있음
- Storage Class - 버킷에서도 걸 수 있고, Object 별로도 걸 수 있음
  - IA (Intelligent A…)
  - Glacier
  - ex) Glacier Deep Archive의 경우에는 100배 가까이 보관 비용이 차이가 나지만, 꺼내볼 때 비용을 지불함
- Regional 서비스
  - VPC 서비스는 아님
  - AZ를 사용함
- Global에서 Bucket명이 유니크해야 함
- Permissions
  - `Block Public Access settings for this account`는 항상 켜두는 것이 좋음
    - `block all public access`
- Bucket

### S3 - Presigned URL

- API 서버가 파일 업로드를 직접 대응 하는 것은 확장성에서 좋지 못함
- 업로드
    1. Clinet → API Server로 이미지 업로드 요청을 전송(이미지는 보내지 않음)
    2. Server → S3에게 Presigned URL을 발급받음
        1. 파일 경로
        2. 파일 MIME 타입
        3. 파일 크기 제한
        4. 유효 기간
        5. 등등
    3. Server → Client에게 Presigned URL을 전송함
    4. Client → S3로 Presigned URL을 통해 이미지 업로드
  - 추가적으로 Event Noti 설정을 통해 Lambda로 후처리 작업 가능
  - 결과적으로 모든 프로세스가 비동기로 돌아가게 됨
- 다운로드도 설정 가능

## CloudFront

- CDN (Content Devlivery Network)
  - 정적 데이터를 전달하는데 특화된 네트워크 서비스
  - 동적 데이터도 서빙 가능
  - CloudFlare라는 서비스도 있음
  - 캐싱 레이어
    - 레이턴시 개선
  - Core Compoent
    - Edge Server
      - 캐싱 역할을 하는 서버 (데이터 센터와는 다른 개념)
      - Edge Location에 존재함
    - Origin server
      - 원본 컨텐츠를 보유한 서버
- Gloval Service
  - AWS에서 모든 글로벌 서비스의 리전은 us-east-1 (버지니아)
- Core Components
  - **Distribution**
    - 도메인 단위 (목적 단위)
    - distribution의 가장 가까운 edge 서버 호출
    - Settings
      - Price class
      - edge location에 대해 선택할 수 있음
      - CNAME으로 별개 도메인 달 수 있음
      - SSL 무조건 달아야 하는데, us-east-1에서 하나 생성해야 함
      - Default root object
        - root로 요청했을 때, s3의 어떤걸 가져오겠다.
      - Standard Logging
        - 로깅을 s3에 저장할 수 있음
  - Origins
    - 여러 개 설정 가능
  - Behavior
    - 도메인으로 들어왔을 때 어떤 origin으로 가라라고 명시해주는 정책
    - default behavior
    - ordered behavior
      - path pattern을 정의해야함
      - 위에서 아래로 순차적으로 체크
  - restiriction
    - 특정 국가에 대한 block 혹은 allow 가능
  - invalidations
    - 강제로 캐시를 날림
    - 날리고 싶은 key를 입력 가능
        - *
      - /icndmages/profiles/*
  - Policy
    - behavior에서 사용됨
    - Cache Policy
      - Http Method + Host + URL Path를 Cache키로 사용
    - origin request
      - cdn이 origin으로 보내는 요청에 대한 정책
    - response headers
      - CF가 주는 https 응답을 설정할 수 있음
  - Function
    - CloudFront Function (viewer, origin 다 가능)
      - behavior에서 function을 연동할 수 있음
      - 데이터를 조작할 수 있음
      - 캐싱 레이어에서 후처리 할 수 있음
        - 사용 예
          - 썸네일(image resizing 서비스)
    - Lambd@Edge (Lambda Function)
      - origin만 가능
        - origin request, origin response
    - Use Cases
      - Thumbnail
        - 8x8
        - 16x16
        - 32x32
        - 64x64
      - /images/asjdkfkajdfsl.jpg/{width}/{height}
  - Origin
    - S3 Origin
      - S3 버킷에 대한 Origin
    - Custom Origin
      - 가장 범용적인 Origin
    - Origin Group
      - primary, secondary를 정의하여 primary에서 fail over 대응을 할 수 있음
  - Origin Access
    - Public (비추천)
    - Origin Access Control (최신)
    - Origin Access Identity (작년에 레거시됨)
      - create origin access identity
        - 클라우드에 사용자를 만드는 개념
        - 일반적으로 distribution 당 하나
- API에도 CDN을 붙여서 특정 경로에 대해 캐싱을 수행할 수 있음
