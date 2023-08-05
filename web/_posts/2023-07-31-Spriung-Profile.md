---
layout: post
title: Spring 환경 분리
description: >
  소프트웨어 마에스트로 14기 팀 프로젝트에서 나는 백엔드 파트를 담당하여 Spring Boot를 통한 WAS 개발을 하게 되었다. Docker를 통해 배포 환경을 구축하기 전에 Spring 환경 분리를 위한 application.yml 파일을 분리하고자 게시글을 작성하게 되었다.
sitemap: false
hide_last_modified: true
---

---

### Spring Profile?

&nbsp; `Spring Profile`이란 Spring Framework와 Spring Boot에서 여러 개의 환경 설정을 관리하고, 런타임에 활성화할 프로파일(환경)을 지정하는 기능이다. 애플리케이션을 다양한 환경에서 실행해야하는 경우, 예를 들어, 개발 환경, 테스트 환경, 스테이징 환경, 운영 환경 등에서 각기 다른 설정을 사용해야 할 때 유용하다.<br>
&nbsp; `Spring Profile`을 통해 애플리케이션의 설정을 분리하여 관리함으로써, 애플리케이션을 더 쉽게 배 및 실행하며, 각 환경에 맞는 설정을 적용하여 문제를 예방하거나 디버깅하는 데 도움이 된다.<br><br>
&nbsp; Spring Boot는 어플리케이션이 실행될 때 자동으로 application.properties 또는 application.yml 파일을 찾는다. 단, 두 파일을 동시에 사용하지 않도록 주의하자. 두 파일 모두 존재할 경우 properties가 항상 나중에 로드되어 yaml에 정의한 profile 설정을 덮어 쓸 수 있기 때문이다.

#### Spring Boot 2.4 이전 Profile 설정 방법

&nbsp; Spring Boot 2.4 버전이 릴리즈 되면서 application.properties, application.yml 파일의 로드 방식에 변화가 있었다고 한다.<br>
&nbsp; `.yaml` 파일은 하나의 profiledp `---` 구분자를 통해 논리적으로 구분을 하여 파일을 나누어 사용하는 것과 동일한 효과를 볼 수 있다.

```yaml
# default
spring:
    profiles:
        active: local
---
# local
spring:
    profiles: local
---
# dev
spring:
    profiles: dev
---
# prod
spring:
    profiles: prod
```

&nbsp; 또한 `include`를 통해 여러 profile을 포함시킬 수 있다.

```yaml
# default
spring:
    profiles:
        active: local
---
# local
spring:
    profiles: local
        include:
        - common
```

#### Spring Boot 2.4 이후 Profile 설정 방법

&nbsp; Spring boot 2.4부터는 spring.profiles은 deprecated 되었다.

![image](https://user-images.githubusercontent.com/68031450/258580376-f6b63363-0c9f-4102-accc-2ea0756eb408.png)

&nbsp; 이전에 `spring.profiles`로 사용하는 것이 아닌 `spring.config.active.on-profile`로 더 직관적으로 알아 볼 수 있도록 변경되었다.

```yaml
spring:
  profiles:
    active: local # 기본적으로 활성화할 profile을 local로 설정 
---
# local
spring:
  config:
    activate:
      on-profile: local
---
# prod
spring:
  config:
    activate:
      on-profile: prod
```

&nbsp; Intellij에서 profile 값을 주기 위해서는 사진과 같이 주입할 수 있다. CLI로 실행할 때 VM arguments로 `java -jar -Dspring.profiles.active=local app.jar`로 주입할 수도 있다.<br>
&nbsp; 실제로 application을 실행할 때 spring.profiles.active 설정을 주어 어떠한 profile를 활성화할 것인지 정해주어야 한다. 해당 설정이 없을 시에는 위에서 정해준 default 값으로 profile이 실행된다.

---

### Reference

- [https://wonyong-jang.github.io/spring/2022/08/11/Spring-Profile.html](https://wonyong-jang.github.io/spring/2022/08/11/Spring-Profile.html)
- [http://honeymon.io/tech/2021/01/16/spring-boot-config-data-migration.html](http://honeymon.io/tech/2021/01/16/spring-boot-config-data-migration.html)
