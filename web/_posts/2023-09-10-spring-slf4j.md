---
layout: post
title: SLF4J를 통한 Spring 로그 관리
description: >
  소프트웨어 마에스트로 14기 팀 프로젝트에서 나는 백엔드 파트를 담당하여 Spring Boot를 통한 WAS 개발을 하게 되었다. Spring 어플리케이션에서 로그 관리를 하기 위해 해당 게시글을 작성하게 되었다.
sitemap: false
hide_last_modified: true
---

---

## SLFJ4란

### 정의

&nbsp; `SLF4J(Simple Logging Facade for Java)`란 Java 어플리케이션에서 로깅을 위한 추상화 인터페이스를 제공하는 라이브러리이다.  로깅 관련 코드를 추상화하고, 이를 통해 다양한 로깅 시스템(Logback, Log4j, Java Util Logging 등)을 사용하거나 변경할 수 있도록 해준다. SLFJ4를 사용함으로써 어플리케이션의 로깅 시스템을 쉽게 교체하고 로그 메시지를 쉽게 다양한 출력 대상에 보낼 수 있도록 도와준다.

### 특징

1. **로깅 시스템의 추상화**: 로깅 시스템과의 결합도를 낮추고, 로깅 코드를 플랫폼 독립적으로 작성할 수 있도록 한다.
2. **다중 바인딩**: 다양한 로깅 시스템에 대한 바인딩(binding)이 존재하며, 필요에 따라 로깅 시스템을 교체할 수 있다.
3. **마커와 MDC/SLF4J**: 로그 메시지에 마커를 사용하여 메시지를 효과적으로 분류하고, MDC(Mapped Djangostic Context)를 통해 로그 메시지에 추가 정보를 쉽게 포함할 수 있다.
4. **성능**: 런타임 시 불필요한 문자열 연산을 최소화하여 로깅 시스템의 성능을 향상시킨다.
5. **Null 처리**: 로그 메시지의 null 값 처리를 자동으로 지원하므로 `NullPointerException`을 방지할 수 있다.
