---
layout: post
title: Spring Bean
description: >
  이전 포스트에서 Spring Bean의 기본 개념에 대해 다루었다. 필자는 프로젝트를 경험하면서 Component Scan과 관련된 문제를 디버깅하며, Component Scan의 내부 동작 방식을 제대로 이해하지 못할 경우 많은 시간을 디버깅에 할애한 경험이 있다. 특히 프로젝트의 규모가 커질 수록 Spring Bean의 등록 순서 및 순환 참조 문제를 해결하기 위해서는 Component Scan의 동작 방식을 명확히 이해하는 것이 중요하다.
sitemap: false
hide_last_modified: false
---

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

1. 설정 정보 로딩
2. classpath 스캐닝
3. 후보 클래스 필터링
4. BeanDefinition 생성
5. Bean 등록

### 3.2. ClassPath 스캐닝 매커니즘

&nbsp; 스프링은 ASM 라이브러리를 사용하여 클래스파일을 스캔한다. ASM 라이브러리(일명 모듈)는 클래스 바이트코드 조작 및 분석 프레임워크인 ASM을 재 패키징한 모듈이다.

```java
@ComponentScan(
    basePackages = "com.example",
    includeFilters = @ComponentScan.Filter(type = FilterType.ANNOTATION),
    excludeFilters = @ComponentScan.Filter(type = FilterType.PATTERN)
)
```

## 4. 컴포넌트 스캔 설정과 옵션

### 4.1. 기본 스캔 설정

```java
@ComponentScan(
    basePackages = "com.example",
    basePackageClasses = MarkerInterface.class
)
public class AppConfig {
}
```

### 4.2. 필터링 옵션

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

&nbsp; Component Scan은 무작정 보았을 때는 장점만 있는 기능으로 보여질 수 있겠지만, 이 역시 단점이 존재한다. 당연하게도 클래스패스 크기가 클수록 스캔 시간이 증가하게 될 것이다. 다행히도 스프링 부트는 이에 대한 자동 최적화를 수행한다.

### 5.2. 최적화 전략

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

## 7. 자주 발생하는 문제와 해결 방법

### 7.1. 순환 참조

### 7.2. 중복 등록과 충돌

## 8. 모범 사례 및 권장 사항

### 8.1. 패키지 구조

### 8.2. 명명 규칙

## 9. Spring Boot에서 활용

### 9.1. 자동 구성

### 9.2. 조건부 Bean 등록

## 10. 기타

### 10.1. 메타 어노테이션

---

## 마치며

## 참고 자료
