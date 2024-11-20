---
layout: post
title: Spring Component Scan
description: >
  이전 포스트에서 Spring Bean의 기본 개념에 대해 다루었다. 필자는 프로젝트를 경험하면서 Component Scan과 관련된 문제를 디버깅하며, Component Scan의 내부 동작 방식을 제대로 이해하지 못할 경우 많은 시간을 디버깅에 할애한 경험이 있다. 특히 프로젝트의 규모가 커질 수록 Spring Bean의 등록 순서 및 순환 참조 문제를 해결하기 위해서는 Component Scan의 동작 방식을 명확히 이해하는 것이 중요하다.
sitemap: false
hide_last_modified: false
---

---

## 이전 포스트

- [Spring Bean](https://jinlee.kr/web/2024-11-13-spring-bean/)

---

## 1. Component Scan 개요

### 1.1. Component Scan이란

&nbsp; Component Scan은 Spring이 어플리케이션의 클래스패스에서 특정 어노테이션이 붙은 클래스들을 스캔하여 Bean으로 등록하는 기능이다.

```java
@SpringBootApplication  // @ComponentScan을 포함
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

### 1.2. Component Scan의 목적

&nbsp; 수동으로 Bean을 등록하는 방식의 경우에는 애플리케이션의 규모가 커질수록 자연스럽게 관리가 어려워진다. 이를 해결하기 위해 Component Scan을 사용한다. 이를 통해 얻을 수 있는 이점은 다음과 같다.

- 설정 코드 감소
- 편리한 의존성 관리
- 자동화된 빈 등록

## 2. Component Scan 대상

### 2.1. 기본 스캔 대상

```java
@Component  // 일반적인 컴포넌트
@Controller // MVC 컨트롤러
@Service    // 비즈니스 로직
@Repository // 데이터 접근 계층
@Configuration // 설정 정보
```

### 2.2. 커스텀 어노테이션

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Component
public @interface CustomComponent {
    String value() default "";
}
```

## 3. Component Scan 동작 원리

### 3.1. 스캔 프로세스

```java
public class ComponentScanExample {
    public static void main(String[] args) {
        // 스캔 시작
        AnnotationConfigApplicationContext context =
            new AnnotationConfigApplicationContext();
        context.scan("com.example");
        context.refresh();
    }
}
```

1. **설정 정보 로딩**: `@ComponentScan` 어노테이션의 설정을 읽는다.
2. **classpath 스캐닝**: 지정된 패키지부터 재귀적으로 모든 클래스를 스캔한다.
3. **후보 클래스 필터링**: `@Component` 및 관련 애노테이션이 있는 클래스를 식별한다.
4. **BeanDefinition 생성**: 발견된 클래스들의 메타데이터를 생성한다.
5. **Bean 등록**: ApplicationContext에 빈으로 등록한다.

### 3.2. ClassPath 스캐닝 매커니즘

&nbsp; 스프링은 ASM 라이브러리를 사용하여 클래스파일을 스캔한다. ASM 라이브러리(일명 모듈)는 클래스 바이트코드 조작 및 분석 프레임워크인 ASM을 재 패키징한 모듈이다. 이는 클래스 파일을 로딩하지 않고도 메타데이터를 읽을 수 있어 성능상 이점이 있다.

```java
@ComponentScan(
    basePackages = "com.example",
    includeFilters = @ComponentScan.Filter(type = FilterType.ANNOTATION),
    excludeFilters = @ComponentScan.Filter(type = FilterType.PATTERN)
)
```

## 4. 컴포넌트 스캔 설정과 옵션

### 4.1. 기본 스캔 설정

&nbsp; 스캔 대상 패키지를 지정하는 방법에는 문자열로 지정하는 방법과 마커 클래스를 이용하는 방법이 있다.

```java
@ComponentScan(
    basePackages = "com.example",        // 문자열 지정
    basePackageClasses = MarkerInterface.class  // 타입 세이프한 방법
)
public class AppConfig {
}
```

### 4.2. 필터링 옵션

&nbsp; includeFilters와 excludeFilters를 사용하여 스캔 대상을 세밀하게 제어할 수 있다.

```java
@ComponentScan(
    includeFilters = {
        @Filter(type = FilterType.ANNOTATION, classes = MyCustomAnnotation.class),
        @Filter(type = FilterType.REGEX, pattern = ".*Repository")
    },
    excludeFilters = {
        @Filter(type = FilterType.PATTERN, pattern = ".*Internal.*")
    }
)
```

## 5. 성능과 최적화

### 5.1. 스캐닝 성능

&nbsp; Component Scan은 무작정 보았을 때는 장점만 있는 기능으로 보여질 수 있겠지만, 이 역시 단점이 존재한다. 당연하게도 클래스패스 크기가 클수록 메모리 사용량이 커지고, 스캔 시간이 증가하게 될 것이다. 다행히도 스프링 부트는 이에 대한 자동 최적화를 수행한다.

### 5.2. 최적화 전략

- 스캔 범위를 필요한 패키지로 한정
- 제외 필터를 적절히 사용
- 스프링 부트의 자동 최적화 활용

```java
@Configuration
public class OptimizedConfig {
    @Bean
    public static BeanFactoryPostProcessor optimizedScanner() {
        return beanFactory -> {
            // 스캔 범위 최적화 로직
        };
    }
}
```

## 6. 구현

### 6.1. ClassPathBeanDefinitionScanner

&nbsp; 스프링의 컴포넌트 스캐너를 커스터마이징할 수 있다. 특별한 스캐닝 로직이 필요할 때 사용한다.

```java
public class CustomScanner extends ClassPathBeanDefinitionScanner {
    public CustomScanner(BeanDefinitionRegistry registry) {
        super(registry);
    }

    @Override
    protected Set<BeanDefinitionHolder> doScan(String... basePackages) {
        return super.doScan(basePackages);
    }
}
```

## 7. 자주 발생하는 문제와 해결 방법

### 7.1. 순환 참조

&nbsp; 순환 참조는 두 개 이상의 빈이 서로를 참조할 때 발생한다. 필자 역시도 이전 프로젝트에서 경험([참고](https://jinlee.kr/web/2023-10-15-spring-circular-reference/))한 적이 있다. 생성자 주입을 사용하면 컴파일 타임에 이를 감지할 수 있다.

```java
@Component
public class ServiceA {
    @Autowired
    private ServiceB serviceB;  // 순환 참조 발생 가능
}

@Component
public class ServiceB {
    @Autowired
    private ServiceA serviceA;
}

// 해결 방법
@Component
public class ServiceA {
    private final ServiceB serviceB;

    public ServiceA(ServiceB serviceB) {  // 생성자 주입으로 변경
        this.serviceB = serviceB;
    }
}
```

### 7.2. 중복 등록과 충돌

&nbsp; 같은 이름의 빈이 여러 번 등록될 때 발생한다. 빈은 기본적으로 클래스명을 카멜 케이스로 등록하므로 참고하도록 하자. 이를 해결하기 위해 명시적인 이름 지정이나 우선순위 설정으로 해결할 수 있다.

```java
@Component("userService")
public class UserServiceImpl implements UserService {
}

@Configuration
public class AppConfig {
    @Bean("userService")  // 충돌 발생
    public UserService userService() {
        return new UserServiceImpl();
    }
}
```

## 8. 모범 사례 및 권장 사항

### 8.1. 패키지 구조

&nbsp;   명확한 패키지 구조는 컴포넌트 스캔의 효율성과 유지보수성을 높인다. 계층형 구조를 통해 각 컴포넌트의 책임과 역할을 명확히 분리할 수 있다.

```plaintext
com.example
├── api           // 외부 요청을 처리하는 컨트롤러
├── service       // 비즈니스 로직을 담당하는 서비스
├── repository    // 데이터 접근을 담당하는 레포지토리
└── config        // 애플리케이션 설정 클래스
```

&nbsp; 패키지 구조 명확하게 함으로써 얻을 수 있는 이점은 다음과 같다.

1. 책임 분리

   - 각 패키지는 명확한 역할과 책임을 가짐
   - 단일 책임 원칙(SRP)을 패키지 수준에서 적용

2. 컴포넌트 스캔 최적화 (!)

   - 필요한 패키지만 선택적으로 스캔 가능
   - 불필요한 클래스 스캔을 방지하여 시작 시간 단축

   ```java
   @ComponentScan(basePackages = "com.example.service") // 서비스 계층만 스캔
   ```

3. 유지보수성

   - 새로운 개발자도 코드 구조를 쉽게 이해
   - 관련 코드를 빠르게 찾을 수 있음
   - 패키지별 독립적인 변경과 확장 용이

4. 의존성 관리

   - 계층 간 의존성을 명확하게 파악 가능
   - 순환 참조 등의 문제를 사전에 방지
   - 이러한 구조는 특히 대규모 프로젝트에서 코드의 가독성과 유지보수성을 크게 향상시킨다.

### 8.2. 명명 규칙

&nbsp; 일관된 빈 이름 지정은 애플리케이션 구성을 이해하기 쉽게 만든다.

```java
@Component
public class OrderServiceImpl implements OrderService {
    // 클래스명으로 자동 빈 이름 생성: orderServiceImpl
}

@Component("orderService")
public class OrderServiceImpl implements OrderService {
    // 명시적 빈 이름 지정
}
```

## 9. Spring Boot에서 활용

### 9.1. 자동 구성

&nbsp; 스프링 부트는 컴포넌트 스캔을 더욱 강력하게 만든다. `@SpringBootApplication` 하나로 여러 설정을 통합한다.

```java
@SpringBootApplication
public class Application {
    // @ComponentScan + @EnableAutoConfiguration + @Configuration
}
```

### 9.2. 조건부 Bean 등록

&nbsp; 특정 조건에 따라 빈을 등록할 수 있다. 이는 개발자가 빈을 등록함에 있어 유연한 설정을 가능하게 한다.

```java
@Configuration
@ConditionalOnProperty(name = "feature.enabled", havingValue = "true")
public class FeatureConfig {
    @Bean
    public FeatureService featureService() {
        return new FeatureService();
    }
}
```

## 10. 기타

### 10.1. 메타 어노테이션

&nbsp; 커스텀 애노테이션을 만들어 더 명확한 의도를 표현할 수 있습니다.

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Component
public @interface BusinessService {
    String value() default "";
}
```

&nbsp; 메타 어노테이션을 사용하면 다음과 같은 이점이 있다.

- 보다 의도가 명확한 애노테이션 생성
- 공통 설정의 재사용
- 도메인 특화된 어노테이션 정의 가능

---

## 마치며

&nbsp; 컴포넌트 스캔은 스프링의 핵심 기능 중 하나이며, 그 동작 방식을 이해하는 것은 스프링 애플리케이션 개발에 큰 도움이 된다. 특히 프로젝트의 규모가 커지면서 발생할 수 있는 다양한 문제들을 해결하기 위해서는 이러한 이해가 필수적이다.

## 참고 자료

- [멋쟁이사자처럼 대학12기 영남대학교 BE Spring & Spring Boot](https://drive.google.com/file/d/1Ok43HeSdPffji8NEtqVTPPmxBwDIR9B-/view?usp=sharing)
- [Core Technologies](https://docs.spring.io/spring-framework/reference/core.html)
- [Dependency Injection](https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html)
- [Bean Overview](https://docs.spring.io/spring-framework/reference/core/beans/definition.html)
