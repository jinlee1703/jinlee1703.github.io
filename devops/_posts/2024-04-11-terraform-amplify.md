---
layout: post
title: Terraform으로 AWS Amplify 구축
description: >
  졸업 작품팀에서 나는 백엔드 파트 및 인프라 구축을 담당하게 되었다. Front-End 파트에서 GitHub에 Pull-Request 시 AWS Amplify를 통한 페이지 미리보기가 필요하다는 요청이 있었고, 이를 위해 Terraform을 통해 리소스를 관리하기로 하였다.
sitemap: false
hide_last_modified: true
---

---

## AWS Amplify란

![image](https://gist.github.com/assets/68031450/ba975884-9ace-4118-af64-eb096269725f)

&nbsp; AWS에서 제공하는 서비스의 일종으로 **모바일 및 웹 애플리케이션 개발을 간소화**하기 위해 사용되는 **완전 관리형 서비스**이다. 애플리케이션의 코드 Repository(GitHub, GitLab, BitBucket 등을 지원함)를 연결하여 코드를 커밋할 때마다 변경 사항이 단일 워크플로를 통해 배포된다.

## Front-End의 요구사항

![image](https://gist.github.com/assets/68031450/ff40be65-c0ac-49fe-91a6-b2b12c59f2b6)

&nbsp; 우리 프로젝트의 Front-End 팀의 요구사항은 다음과 같았다. GitHub를 통해 Pull-Request를 작성하고 이를 병합하기 전 미리보기 페이지가 있었으면 좋겠다는 내용이었다. 이미 Front-End에서 자체적으로(Terraform)을 사용하지 않고 시도해본 기능이였고 성공적으로 동작하는 것을 확인하였기 때문에, 필자는 이를 Terraform 코드로만 옮기면 되는 작업이었다. 자세한 내용은 아래 `References`를 참고하길 바란다.

---

## 작업 내용

### variables.tf

```go
# GitHub Repository에 접근하기 위한 GitHub 계정의 Access Token
variable "github_access_token" {
  type = string
}
```

&nbsp; AWS Amplify를 구축하기 위해 필요한 변수이다. GitHub의 Pull-Request에 접근해야 하므로, 이를 위해 Admin 권한이 있는 GitHub 계정의 Access Token을 사용하였다.

### main.tf - "aws_amplify_app" 리소스

```go
resource "aws_amplify_app" "app" {
  name        = "pennyway-web-test"
  repository  = "https://github.com/${organization명}/${Repository명}"
  oauth_token = var.github_access_token

  build_spec = <<-EOT
    version: 1
    frontend:
      phases:
          preBuild:
            commands:
                - yarn install
          build:
            commands:
                - yarn run build
      artifacts:
          baseDirectory: dist
          files:
            - '**/*'
      cache:
          paths:
            - node_modules/**/*
  EOT

  environment_variables = {
    # 추후 환경 변수 추가
  }
}
```

- `name`: AWS Amplify의 Resource명
- `repository`: 소스코드 저장소(필자의 경우 GitHub Repository) 주소
- `oauth_token`: GitHub Repository에 접근할 권한이 있는 계정의 Access Token
- `build_spec`: AWS Amplify를 사용하여 페이지를 배포하기 위해 필요한 워크플로우
- `enviroment_variables`: Front-End에서 사용하는 환경 변수들

### main.tf - "aws_amplify_branch" 리소스

&nbsp; 이 리소스의 경우에는 Pull-Request가 작성되었을 때, `head_branch`를 설정하는 리소스이다. 필자의 경우에는 Front-End의 브랜치 전략이 `GitHub Flow`였기 때문에 `main` 브랜치만 설정해두었다.

- `app_id`: `aws_amplify_app` 리소스의 id
- `branch_name`: Pull-Request가 작성되었을 때, `head_branch`명
- `enable_pull_request_preview`: 필자의 경우에는 Pull-Request가 작성되었을 때 미리보기 용도로 사용하는 것이기 때문에 `true`로 설정함
- `pull_request_environment_name`: 이 부분이 가장 헷갈리던 부분이다. 아래 이미지와 같이 기본적으로 해당 속성의 값은 리소스가 생성되었을 때 `pr`로 설정되는데, 이는 `terraform apply`를 했을 때, 리소스가 생성될 때의 속성값(null)과 달라져 아무 변경사항이 없는데도 `changed`가 발생했었다. (자세한 사항은 아래 **Pull-Request**에서 확인)

## 관련 Pull-Request

&nbsp; [https://github.com/CollaBu/pennyway-iac/pull/5](https://github.com/CollaBu/pennyway-iac/pull/5)

## 현재 AWS Architecture

![image](https://gist.github.com/assets/68031450/341bf073-7076-439c-b304-d4f4c3762b45)

&nbsp; 현재 Architecture를 그리면서 고민되는 부분은 Amplify가 AWS Cloud가 제공하는 서비스에 속하는 것은 맞지만, 일반 Client가 접근할 수 있는 것은 아니라는 점(사실 GitHub Repository를 통해 접근할 수 있긴 함)이다. Client 외의 역할(Developer?)를 추가하는 것을 고려하고 있다.

---

## References

- [https://velog.io/@bangdori/Pennyway-CICD-%ED%8C%8C%EC%9D%B4%ED%94%84%EB%9D%BC%EC%9D%B8-%EC%84%A4%EA%B3%84-1](https://velog.io/@bangdori/Pennyway-CICD-%ED%8C%8C%EC%9D%B4%ED%94%84%EB%9D%BC%EC%9D%B8-%EC%84%A4%EA%B3%84-1)
