---
layout: post
title: Spring + Docker + GitHub Actions를 통한 CI/CD 파이프라인 구축
description: >
  소프트웨어 마에스트로 14기 팀 프로젝트에서 나는 백엔드 파트를 담당하여 Spring Boot를 통한 WAS 개발을 하게 되었다. AWS EC2에 IAM Role을 부여하려던 도중 오류가 발생하여 이를 해결하기 위한 방법을 기록해두기 위해 게시글을 작성하게 되었다.
sitemap: false
hide_last_modified: true
---

---

### 에러 발생 배경

![image](https://user-images.githubusercontent.com/68031450/258637409-c2af4176-e863-4222-b58d-81beda84a5d9.png)

&nbsp; GitHub Actions를 통해 AWS SSM 기능을 활용하기 위해 EC2의 IAM Role(`AmazonSSMFullAccess`)을 부여해주어야 했다.

![image](https://user-images.githubusercontent.com/68031450/258637982-69e9c51c-1b21-46df-bb85-91a344f03d97.png)

&nbsp; 기존에 존재하는 IAM Role을 수정하기 위해 위의 메뉴 중 `Modify IAM Role` 메뉴를 클릭하여 Role을 수정하려 했는데 아래와 같은 오류가 발생하였다.

![image](https://user-images.githubusercontent.com/68031450/258638051-ef5bdc19-e704-4335-a7e8-c250054e2d1e.png)

(실제 오류 이미지가 아닌 대체 이미지)<br><br>

&nbsp; 이로 인해 **Stack Overflow**를 찾아본 결과 나와 비슷한 오류를 겪은 사람을 찾아볼 수 있었다.

### 해결 방법

#### 1. IAM Association 조회

```shell
aws ec2 describe-iam-instance-profile-associations
```

&nbsp; 위 커맨드를 통해 현재 연결된 IAM을 조회할 수 있다.

```json
{
    "IamInstanceProfileAssociations": [
        {
            "AssociationId": "",
            "InstanceId": "",
            "IamInstanceProfile": {
                "Arn": "",
                "Id": ""
            },
            "State": "associated"
        }, 
        {
            "AssociationId": "",
            "InstanceId": "",
            "IamInstanceProfile": {
                "Arn": "",
                "Id": ""
            },
            "State": "associated"
        }, 
        {
            "AssociationId": "",
            "InstanceId": "",
            "IamInstanceProfile": {
                "Arn": "",
                "Id": ""
            },
            "State": "associated"
        }, 
    ]
}
```

#### 2. 모든 IAM Association 삭제

```
aws ec2 disassociate-iam-instance-profile --association-id iip-assoc-xxxxxxxxxxxxx
```

&nbsp; 조회된 Association의 아이디를 각각 입력하여 위 커맨드를 반복해서 입력해준다.

#### 3. AWS Console에서 새로운 IAM Role 설정

![image](https://user-images.githubusercontent.com/68031450/258638715-44dccc33-c9c4-4861-9832-062567356950.png)

---

### Reference

- [https://stackoverflow.com/questions/47034797/invalidinstanceid-an-error-occurred-invalidinstanceid-when-calling-the-sendco](https://stackoverflow.com/questions/47034797/invalidinstanceid-an-error-occurred-invalidinstanceid-when-calling-the-sendco)
