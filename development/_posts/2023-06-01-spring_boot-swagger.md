---
layout: post
title: Spring Boot에 Swagger 설정하기
description: >
  소프트웨어 마에스트로 과정을 진행하면서 본격적인 팀 프로젝트를 진행하기 전, 간단하게 미니 프로젝트를 진행하기로 하였다. 나는 백엔드 파트를 담당하여 Spring Boot를 통한 API 서버 개발을 하게 되었고, Swagger를 통해 API 문서 생성을 자동화하고자 한다.
sitemap: false
hide_last_modified: true
---

---

### 참고자료(API 문서 자동화와 Swagger의 장단점에 대한 게시글)

- [https://jinu0137.github.io/development/2023-06-01-api-documentation-automation/](https://jinu0137.github.io/development/2023-06-01-api-documentation-automation/)

---

## Swagger Spring에 적용하기

### 1. Swagger Gradle Dependency 찾기

&nbsp; [MVN Repository](https://mvnrepository.com/artifact/io.springfox/springfox-swagger-ui)라는 Gradle Dependency를 참고할 수 있는 사이트에 들어가 설치할 버전을 고른다. 나는 Usages가 가장 많은 2.9.2를 골랐다.
![image](https://user-images.githubusercontent.com/68031450/242531271-a7c0ba57-17fa-4315-abee-fadb42d6cd83.png)

### 2. Gradle Depency를 build.gradle에 추가

![image](https://user-images.githubusercontent.com/68031450/242533988-d5dc30a5-0ae0-4073-86c4-d51ca92a4594.png)

&nbsp; 선택한 버전의 상세페이지에서 Gradle 탭을 선택하고 내용을 복사하여 현재 프로젝트의 build.gradle에 붙여넣어 의존성을 추가해준다. 추가적으로 `swagger2`도 임포트해주도록 한다.

```
# build.gradle
dependencies {
    //https://mvnrepository.com/artifact/io.springfox/springfox-swagger-ui
    implementation group: 'io.springfox', name: 'springfox-swagger-ui', version: '2.9.2'
    implementation group: 'io.springfox', name: 'springfox-swagger2', version: '2.9.2'
}

```

### 3. Swagger Config 작성

```java
@Configuration
@EnableSwagger2
public class SwaggerConfig {

    @Bean
    public Docket restAPI() {
        return new Docket(DocumentationType.SWAGGER_2)
                .apiInfo(apiInfo())
                .select()
                .apis(RequestHandlerSelectors.basePackage("com.xxxx"))  // base Package 주소
                .paths(PathSelectors.any())
                .build();
    }

    private ApiInfo apiInfo() {
        return new ApiInfoBuilder()
                .title("title")                 // Swagger 페이지에 표시될 Title
                .version("1.0.0")               // API 문서의 버전
                .description("description")     // API 문서에 대한 description
                .build();
    }
}
```

### 4. API 적용(예시)

```java
@RestController
@RequestMapping(value = "/member/v1")
@Api(tags = {"User API"})
@RequiredArgsConstructor
public class UserController {
    ...
    @ApiOperation(value = "신규 회원 등록", notes = "신규 회원을 등록한다.", httpMethod = "POST", response = ResponseEntity.class, consumes = "application/json", tags = {})
    @ApiImplicitParams({
            @ApiImplicitParam(name = "member", value = "신규 회원 정보", dataType = "Member", paramType = "body")
    })
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "status_code = 0, message = ok / status_code = -1, message = error / status_code = -99, message = Not Exist Required Param"),
            @ApiResponse(code = 401, message = "Unauthorized"),
            @ApiResponse(code = 403, message = "Forbidden"),
            @ApiResponse(code = 404, message = "Not Found"),
            @ApiResponse(code = 500, message = "Failure")
    })
    public ResponseEntity<?> create(@RequestBody Member member) {
        ...
    }
 }

```

## Reference

- [https://velog.io/@borab/Spring-boot-Swagger-%EC%84%A4%EC%A0%95-gradle](https://velog.io/@borab/Spring-boot-Swagger-%EC%84%A4%EC%A0%95-gradle)
