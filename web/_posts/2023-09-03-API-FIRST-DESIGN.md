---
layout: post
title: API First Design
description: >
  INFCON 2023에서 우아한형제들의 김정규님의 발표 세션을 듣고, 해당 내용에 대해 복기하여 보다 나은 API 명세서를 작성하는 방법에 대해 고민해보고자 게시글을 작성하게 되었다.
sitemap: false
hide_last_modified: true
---

---

### 작성 배경

&nbsp; SW마에스트로 과정을 통해 꽤 장기간 동안 프로젝트를 진행하고 있다. 프로젝트에 쏟은 시간만 어느덧 3개월이 지나가 버렸는데, 지난 8월 15일에 인프콘에 다녀오면서 우아한형제들의 김정규님의 `오늘도 여러분의 API는 '안녕'하신가요 : API First Design과 Codegen 활용하기`라는 발표를 듣고, 해당 내용을 정리하여 '우리 프로젝트에 도입해볼 수 있을까'라는 고민을 하게 되어 발표 복기 겸 도입 여부를 검토해보고자 한다.

---

## 발표 내용 요약

### Part 1. API에 대한 과거 개발 경험과 문제점

#### 1.1. API로부터 고통받는 순간들

&nbsp; 개발자라면 누구나 한 번 쯤은 **API 문서**에 대해서 곤란함을 겪었던 적이 있었을 것이다. Frontend 개발자 입장에서는 Backend 개발자에게 전달받은 API 명세가 적혀 있는 대로 동작하지 않아 당황스러웠다거나, 개발 일정에 쫒겨 API 문서를 언제쯤 받을 수 있을 지 물어본 적이 있었을 것이다. 반대로 Backend 개발자 입장에서는 어떻게 API 설계를 해야할 지, 어떤 형식으로 만들어야 할 지, 참고할만한 템플릿이 없을지, 그리고 API 코드 수정 이후 API 문서에 정확히 반영하지 않아 문제가 있었던 적이 있을 것이다.

#### 1.2. 실제 경험했던 API 문제점

&nbsp; 김정규님께서 이전에 API 개발을 했을 때 프로세스는 아래와 같았다.

![image](https://user-images.githubusercontent.com/68031450/265303885-7a1c0b5f-6f35-4780-9546-edba7ad54341.png)

1. **API 설계 문서 작성**: Notion, Excel, Word와 같은 프로그램을 이용해 작성한다.
  <img width="783" alt="image" src="https://user-images.githubusercontent.com/68031450/265303384-db9ca174-1058-44b3-8362-2a0bce09167c.png">
2. **API 문서에 따라 코드 구현**: 1번의 단계에서 작성된 문서에 따라 코드를 구현한다.
  <img width="633" alt="image" src="https://user-images.githubusercontent.com/68031450/265303483-0a5b8e9d-ddd5-4380-b5ad-0475ff813ef4.png">
3. **문서화 도구 이용**: 2번의 단계에서 작성된 코드에 Swagger나 Spring Rest Docs 같은 도구를 이용해 API 문서를 구현한다.
  <img width="964" alt="image" src="https://user-images.githubusercontent.com/68031450/265303539-eacf1c4d-00bb-4844-84a4-88a4ba5704b7.png">
4. **API 문서 전달**: 3번의 단계에서 구현된 API 문서를 Frontend 개발자에게 전달한다.
  <img width="1477" alt="image" src="https://user-images.githubusercontent.com/68031450/265303616-406166a4-eb02-46a3-9802-0ecd444c4d5a.png">

&nbsp; 이 과정은 얼핏보면 문제가 없겠지만, 비즈니스 요구사항 변경으로 기존 API를 변경해야 할 때 문제가 발생한다.<br>
&nbsp; 우선 첫 번째로는 위의 1번 단계에서 생성되는 API 문서에 일관성을 부여할 수 없다. 정해진 템플릿을 사용하는 것이 아니기 때문에 만드는 사람에 따라 API 설계 문서를 작성하는 기준이 다르고, 이는 일관성이 없는 API 설계 문서를 초래하여, 하나의 API 설계 문서를 일관성 있게 관리하기 위한 관리 비용이 증가하게 된다.<br>
&nbsp; 두 번째로는 두 개의 API 문서가 생긴다는 것이다. 위의 프로세스에서 1번 단계(밑그림을 그리는 API 설계 문서)와 3번 단계에서 각각의 API 문서(Frontend에 전달되는 최종 API 문서)가 생기게 되고, 이는 '무엇이 정확한 API 문서인가?'라는 의문을 발생시킬 수 있다.<br>
&nbsp; 세 번째로는 코드 변경 사항이 최종 API 문서에 반영되지 않을 수 잇다는 것이다. API 문서에 따른 코드 구현 이후 API 문서화 도구를 통해 수정이 되지만, 문서화 도구를 제대로 수정하지 않는다면 최종 변경사항이 API 문서에 반영되지 않음으로써 추후에 Frontend 개발자가 에러를 발견할 것이고, 이에 따른 불필요한 의사소통이 필요하게 된다.<br>
&nbsp; 이 외에도 API와 API 문서를 개발 및 구현하면서 다양한 크고 작은 문제가 발생할 수 있을 것이다. 이에 따라 김정규님께서는 API를 대하는 자세를 `API는 부수적인 것, 덜 중요한 것`으로 생각하고, 단순히 `데이터를 전달하기 위한 수단`으로 생각하라고 말씀하셨다.

### Part 2. API FIRST DESIGN 이야기하기

#### 2.1. API First Design 정의

&nbsp; API First Design이란 `Open API 명세 기반의 API 계약서를 우선순위 1순위로 고려하여 협업하여 설계하는 것`을 의미한다.<br>
&nbsp; API First Design 정의를 위해 OPEN API Specification(이하 OAS) 문서에 대해 언급하셨다. [OAS](https://jinlee.kr/web/2023-06-19-OAS/)에 대한 설명은 필자가 이전에 작성한 문서가 있으므로 궁금하다면 읽어보면 좋을 것 같다. 간단하게 설명하자면 OAS는 사람과 컴퓨터가 소스 코드, 문서에 액세스하거나 네트워크 트래픽 검사를 통하지 않고도 서비스의 기능을 발견하고 이해할 수 있도록 하는 `언어에 구애받지 않는 HTTP API 표준 인터페이스`이다. OAS 문서는 `.yaml` 파일을 통해 정의하는데 이에 대한 구조 역시 필자가 작성한 [OAS - yaml](https://jinlee.kr/web/2023-06-21-OAS-YAML/) 문서를 참고하면 좋을 것 같다.

#### 2.2. API First Design으로 문제 해결하기

&nbsp; API First Design의 프로세스는 아래와 같다.

![image](https://user-images.githubusercontent.com/68031450/265304259-a4b186c6-b03c-4229-ba05-7ef5fc948910.png)

1. **Open API 명세서 설계**: OAS 문서 설계를 의미한다.
2. **반복적 설계(토론 + 공유)**: Frontend 개발자와 Backend 개발자, 이해관계자가 토론 및 공유를 통해 명세서를 반복적으로 수정한다.
3. **Open API 도구 활용&구현**: Open API 도구를 활용하여 코드를 구현한다. API 문서, Code Generators, Mock Server, API Gateway가 있다.
4. **API 문서 전달**: 3번의 단계에서 구현된 API 문서를 Frontend 개발자에게 전달한다.

&nbsp; 기존의 Code First 방식에서 API First 방식으로 변경한 것이다. API First Design 방식으로 변경함으로써 기존의 방식의 문제점을 해결할 수 있다.<br>
&nbsp; 우선 위의 첫 번째 문제였던 **API 문서의 일관성** 측면에서 OAS 문서의 형식인 `.yaml`을 통해 API 문서에 정해진 양식 및 규칙을 부여함으로써 일관된 품질의 API 문서를 유지할 수 있다. 두 번째로 **두 개의 API 문서**로 관리하던 기존 방식에서 OAS 문서 하나를 통해 설계 및 개발하므로 하나의 API 문서만을 유지한다. 세 번째로 **코드의 변경사항이 최종 API 문서에 반영되지 않는 문제**는 API 명세서 자체 변경으로 문서 업데이트가 불필요하다고 말씀하셨는데 `개인적으로는 이 부분은 OAS 문서로도 100% 해결할 수 없는 부분이 아닌가 싶다`. 결국 코드를 수정하는 것만으로 OAS 파일이 업데이트되는 것은 아니기 때문이다. 결국 이 부분은 Backend 개발자가 보다 주의 깊게 명세서에 대해 신경써야 하는 부분이라고 생각한다.

#### 2.3. API First Design 더욱 잘 활용하기

&nbsp; API First Design을 통해 OAS 문서를 작성하여 관리함으로써 얻을 수 있는 이점은 다음과 같다.

1. **API 변경에 대한 버전 히스토리 관리를 할 수 있음**: 기존 API 설계 방식에서 변경 사항이 발생하면, 나의 경우에는 이에 대한 히스토리를 수기로 작성하곤 했다. 하지만 OAS 문서를 작성할 때는 해당 `Version` 필드 값을 변경 후 버전 관리 시스템을 통해 관리함으로써, 이에 대한 기존의 문제점을 해결할 수 있다.
2. **공통의 API 문서를 통해 함께 협업할 수 있음**: 위에서 꾸준히 언급했던 대로 기존에는 두 개의 API 문서로 인해 코드와 동기화된 API 문서를 보장할 수 없었지만, 하나의 API 명세 문서를 사용함으로써 API 명세 확립화를 통한 원활한 공유가 가능하다. 이와 관련된 개념으로 `SSOT(Single Source of Truth)`를 말씀하셨는데, 이는 단일 진실 공금원이라는 의미로 데이터베이스, 애플리케이션, 프로레스 등과 같은 `데이터에 대해 하나의 출처를 사용하는 개념`이다. 서로 다른 팀, 다른 시스템이지만 하나의 진실(이 경우 OAS 문서)을 통해 소통함으로써 데이터의 정확성, 일관성, 신뢰성을 보장할 수 있고, 일관성 있는 의사 결정 및 작업 효율성을 높이는 데 도움을 준다.
3. **이해관계자들과 함께 풍성한 내용이 담긴 API를 만들 수 있음**: **소스 코드가 작성되기 전인 개발 단계 이전에** OAS 어떤 용어를 사용해서 표현할 것인지, URL이 내포하고 있는 의미가 적절한지, 적절한 요청/응답의 데이터를 가지고 있는지 등을 3자(Frontend, Backend, 이해관계자)가 토론할 수 있으므로써, `빠른 API 설계 피드백과 '함께 서비스를 만들어간다'라는 공감대를 형성`할 수 있다.

#### 2.4. 아하! 이런 오해가 있었구나

&nbsp; 개발자들이 많이 오해하는 부분으로 아래 3가지를 언급해주셨다.

1. **Swagger는 API 문서화 도구이다**: Swagger에서 의도한 API 문서화는 `Open API 명세서 기반의 API 문서`를 의미한다.
2. **API First Design은 API를 한번에 결정하는 것이다**: 위에서 언급했던 대로 초기에 OAS 문서를 만들고 끝이 아니라, 3자간의 충분한 토론을 통해 지속적으로 의견을 교류하고 수정한다는 의미이다.
3. **Open API Tools 중 Codegen은 만들어진 템플릿만 사용할 수 있다**: 사실 codegen이라는 프로그램에 대해서는 존재에 대해서만 알고 있었는데, 이번에 확실히 쓰임새를 알 수 있게 되었다. **codegen**을 통해 OAS 문서를 작성한 후 이를 코드로 변환할 수 있게 된다. 이에 대한 단적인 예시는 아래와 같다.

- **oas.yaml**

  ```yaml
  swagger: '2.0' #version of Swagger
  info: # High Level information of API
    description: Sample Swagger Demo #Give the description of API 
    version: 1.0.0 #API version
    title: Swagger Employee Demo # API title
    license: #Swagger license info
      name: Apache 2.0
      url: 'http://www.apache.org/licenses/LICENSE-2.0.html'
  host: localhost # Host Name
  basePath: /v1 #Basepath when there are multiple versions of API running
  tags: # Tag information for each API operation. Multiple tags for multiple API operation
    - name: employee #Tag name
      description: Everything about your Employee #Tag description of API operation
  schemes:
    - http #security schemes
  paths:
    '/findEmployeeDetails/{employeeId}': #Request Mapping path of REST API
      get: #Request method type, GET,POST etc.
        tags: # Refer to created tag above
          - employee
        summary: Find employee by ID #Summary 
        description: Returns a single Employee #Description of API operation
        operationId: getEmployeeDetails #Method name
        produces:
          - application/json #Response content type
        parameters:
          - name: employeeId #Input parameter
            in: path #path variable
            description: ID of Employee to return #description of parameter
            required: true #Is mandatory
            type: integer #data type
            format: int64 #data type format, signed 64 bits
        responses: # API response
          '200': #Successful status code
            description: successful operation #Successful status description
            schema:
              $ref: '#/definitions/Employee' #Response object details
          '400': #Unsuccessful response code
            description: Invalid Employee ID supplied #Unsuccessful response description
          '404': #Unsuccessful response code
            description: Employee not found #Unsuccessful response description
  definitions: # Object definition
    Employee: #Employee Object
      type: object
      properties: #Object properties
        id: #Id attribute
          type: integer
          format: int64
        firstName: #Firstname attribute
          type: string
          description: Employee First Name #data type description
        lastName: #Lastname attribute
          type: string #Data type
          description: Employee Last Name #Data type description
      xml:
        name: employee #xml root element when returning xml
  ```

- **FindEmployeeDetail.java**

  ```java
  @javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2018-03-14T07:52:19.544+05:30")
  
  @Api(value = "findEmployeeDetails", description = "the findEmployeeDetails API")
  public interface FindEmployeeDetailsApi {
  
      @ApiOperation(value = "Find employee by ID", nickname = "getEmployeeDetails", notes = "Returns a single Employee", response = Employee.class, tags={ "employee", })
      @ApiResponses(value = { 
          @ApiResponse(code = 200, message = "successful operation", response = Employee.class),
          @ApiResponse(code = 400, message = "Invalid Employee ID supplied"),
          @ApiResponse(code = 404, message = "Employee not found") })
      @RequestMapping(value = "/findEmployeeDetails/{employeeId}",
          produces = { "application/json" }, 
          method = RequestMethod.GET)
      ResponseEntity<Employee> getEmployeeDetails(@ApiParam(value = "ID of Employee to return",required=true) @PathVariable("employeeId") Long employeeId);
  
  }
  ```

#### 2.5. 결론

&nbsp; 이 발표의 결론은 다음과 같다. 앞서 언급했던 API 문제에 대해 공감하고 있다면 새롭게 시작하는 서비스에는 `API Fist Design을 통해 API 문제를 해결할 수 있다`는 것이다.

---

## 발표를 듣고 난 후

### 소감

&nbsp; 발표를 듣고 가장 크게 공감되었던 부분은 역시 기존의 Code First Design에 대한 문제점이였다. 현재 활동하고 있는 SW마에스트로에서도 Code First Design으로 API 명세 작성 및 개발을 진행하고 있었는데 김정규님이 발표에서 말씀하셨던 겪은 문제를 나 역시 그대로 겪었기 때문이다. 그 중에서도 2개의 문서가 각기 따로 놀고 있다는 점은 상당히 큰 문제로 느껴졌다. 해서 `API First Design` 방식을 뒤늦게라도 이번 프로젝트에 도입할 지 여부를 검토하는 계기가 되었다.

### 의문점

&nbsp; 하지만 아래와 같은 의문점 역시 생기게 되었다.

1. 현업에서 위와 같은 API First Design 방식 및 Codegen을 사용하여 API 구현을 하는지?
2. API 문서 버전 및 히스토리 관리는 어떻게 하는지? 소스 코드와 같이 Git으로 관리하는 것인지?
3. API First Design 방식을 통해 2개의 문서 작성에서 1개의 문서 작성으로 변경함으로써, 문서 작성 횟수 및 일관성 향상 외에 또다른 장점이 있는지?
    - Code와 친화적이지 않다는 느낌을 받음(결국 OAS로 문서를 설계한 후, 코드 수정 후 문서를 다시 수정하는 것은 똑같지 않은가?)
  
&nbsp; 해당 의문점을 SW마에스트로 전담 멘토님께 여쭤보았고, 어느정도 의문점을 해소할 수 있었다.

1. 현업에서 위와 같은 API First Design 방식 및 Codegen을 사용하여 API 구현을 하는지?
    - 개발 조직마다 문화가 다르기 때문에 API First Design 방식을 채택하는 곳도 있고 기존의 Code First Design 방식을 채택하는 곳도 있다. 이러한 방식은 개발 문화이기 때문에 완벽한 방법은 없으며, 각 조직의 상황에 따라 선호하는 방식이 달라질 수 있다.
2. API 문서 버전 및 히스토리 관리는 어떻게 하는지?
    - 기본적으로는 위에서 언급했던 대로 `Version` 필드를 통해 관리한다. 변경 내용은 Git과 같은 VCS를 통해 관리할 수 있다.
3. API First Design 방식을 통해 2개의 문서 작성에서 1개의 문서 작성으로 변경함으로써, 문서 작성 횟수 및 일관성 향상 외에 또다른 장점이 있는지?
    - 그렇기 때문에 비교적 간단한 Code First Design으로 Code 친화적으로 Swagger를 사용하게 함으로써 간단하게 API 명세서를 작성하는 방법 또한 장점이 있는 것이고, 1번에서 언급한대로 각 조직에 따라 상황에 맞는 방식을 채택해야 한다.

### 결론

&nbsp; 결과적으로 나와 우리 팀은 지금 당장은 API First Design 방식을 도입하지 않기로 하였다. 기존 시스템이 이미 자리를 잡은 상태이기도 하고, 하루 빨리 서비스를 출시해야하는 상황에서 API 문서를 수정하고 있는 것은 우선순위가 아니라는 판단을 하였다.<br>
&nbsp; 하지만 나의 경우에는 아직 학업이 남아있고, 이에 따라 여러 번의 프로젝트를 해볼 수 있기 때문에 만약 다음 프로젝트에 기회가 된다면 한번 시도해볼만한 가치가 있는 방식이라고 생각한다. 특히 `Codegen`이라는 프로그램을 통해 OAS 문서를 바로 interface(java의 경우)로 만들어주는 것은 정말 매력적이라는 생각이 들었다. 만약 프로젝트에서 기회가 되지 않더라도 이런 다양한 도구를 사용해보는 것은 개발 문화 자체에도 관심이 있는 나에게 좋은 경험이 될 것이라는 생각을 하게 되었다.

---

## Reference

- [오늘도 여러분의 API는 안녕하신가요?](https://present.do/documents/64dd4b8f10ab9a5ae56909f4?page=99)
- [SSOT](https://chancethecoder.tistory.com/45)
- [Codegen - Spring](https://escapefromcoding.tistory.com/359)
