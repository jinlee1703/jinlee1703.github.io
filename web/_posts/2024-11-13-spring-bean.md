---
layout: post
title: Spring Bean
description: >
  Spring Framework를 사용하면서 가장 기본이 되는 개념이 바로 'Spring Bean'이다. 필자는 프로젝트를 진행하면서 Spring Bean에 대한 개념을 정확하게 이해하지 못하여 겪는 어려움을 자주 목격하였다. 특히 의존성 주입 과정에서 발생하는 Bean 충돌 문제들을 해결하는데 많은 시간을 소비하는 것을 보며, Spring Bean에 대한 체계적인 정리의 필요성을 느꼈다.
sitemap: false
hide_last_modified: false
---

---

## 1. Spring Bean 개요

### 1.1. Spring Bean이란?

&nbsp; Spring Bean은 스프링 컨테이너가 관리하는 자바 객체를 의미한다. 일반적인 자바 객체(POJO)와 동일한 객체이지만, 스프링 컨테이너에 의해 생성되고 관리되는 차이점이 있다.

```java
// 일반 자바 객체
UserService userService = new UserService();

// 스프링 빈으로 등록
@Component
public class UserService {
    // ...
}
```

### 1.2. Spring Container와 Bean의 관계

&nbsp; Spring Container는 Bean의 생성, 관리, 제거를 담당하는 주체이다. Container는 Bean 설정 정보를 읽어 Bean 객체를 생성하고, 의존 관계를 주입한다.

```java
// 스프링 컨테이너 생성
ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);

// 빈 가져오기
UserService userService = context.getBean(UserService.class);
```

## 2. Spring Bean LifeCycle

### 2.1. LifeCycle 개요

&nbsp; Spring Bean은 다음과 같은 LifeCycle(한글로 생명주기)을 가진다.

1. 객체 생성
2. 의존관계 주입
3. 초기화 콜백
4. 사용
5. 소멸 전 콜백
6. 소멸

```java
@Component
public class ExampleBean implements InitializingBean, DisposableBean {
    @Override
    public void afterPropertiesSet() throws Exception {
        // 초기화 콜백
    }

    @Override
    public void destroy() throws Exception {
        // 소멸 전 콜백
    }
}
```

### 2.2. Custom LifeCycle 관리

&nbsp; `@PostContruct`와 `@PreDestroy` 어노테이션을 사용하여 빈의 생명주기를 관리할 수 있다.

```java
@Component
public class CustomLifecycleBean {
    @PostConstruct
    public void init() {
        // 초기화 로직
    }

    @PreDestroy
    public void cleanup() {
        // 정리 로직
    }
}
```

## 3. Spring Bean Scope

### 3.1. Singleton Pattern & Spring Singleton

&nbsp; 전통적인 Singleton Pattern은 객체의 인스턴스가 오직 1개만 생성되는 것을 보장하는 디자인 패턴이다. 어플리케이션 개발 시에는 주로 데이터베이스 연결, 설정 객체 등 애플리케이션 전반에서 공유되어야 하는 리소스를 관리할 때 사용된다.

#### 3.1.1. 전통적인 Singleton Pattern

```java
public class ClassicSingleton {
    private static ClassicSingleton instance;

    private ClassicSingleton() {
        // private 생성자
    }

    public static synchronized ClassicSingleton getInstance() {
        if (instance == null) {
            instance = new ClassicSingleton();
        }
        return instance;
    }
}
```

#### 3.1.2. Singleton Pattern의 문제점

- private 생성자로 인해 상속이 불가능하여 객체지향의 장점을 활용할 수 없다.
- 전역 상태를 갖기 때문에 테스트가 어렵고 코드 결합도가 높아진다.
- 멀티스레드 환경에서 동시성 이슈가 발생할 수 있다.

### 3.2. Spring Container's Singleton

&nbsp; Spring Container는 Singleton Pattern의 문제점을 해결하면서도 Singleton의 장점은 유지하고자 한다. Spring Bean은 기본적으로 Singleton으로 관리되며, Container가 Bean의 Lifecycle을 책임진다. 주요 특징으로는 다음과 같다.

- 싱글톤 객체를 생성하고 관리하는 기능을 Spring Conatiner가 담당한다.
- Spring Container는 Singleton 객체를 적절히 생성하고 관리하는 Singleton Registry 역할을 수행한다.
- DI를 통해 결합도를 낮추고 테스트가 용이한 코드 작성을 가능하게 한다.

#### 3.2.1. 기본 동작 방식

```java
@Configuration
public class AppConfig {
    @Bean
    public UserService userService() {
        return new UserService(userRepository());
    }

    @Bean
    public UserRepository userRepository() {
        return new MemoryUserRepository();
    }
}

// 사용 예시
ApplicationContext ac = new AnnotationConfigApplicationContext(AppConfig.class);
UserService userService1 = ac.getBean("userService", UserService.class);
UserService userService2 = ac.getBean("userService", UserService.class);
System.out.println(userService1 == userService2); // true
```

#### 3.2.2. Singleton Container 장점

```java
@Service
public class UserService {
    private final UserRepository userRepository;

    // 생성자 주입을 통해 항상 동일한 인스턴스 주입
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public void doSomething() {
        // 메서드가 호출될 때마다 새로운 인스턴스를 생성하지 않음
        userRepository.save(new User());
    }
}
```

### 3.3. Springtone 방식의 주의점

&nbsp; Spring의 Singleton 방식을 사용할 때는 상태 관리에 대해 주의하여야 한다. 이를 위해 고려해야할 사항은 다음과 같다.

- 가급적 stateless 설계를 지향한다.
- 필드 대신 지역변수, 파라미터, ThreadLocal 등을 고려한다.
- 특히 값을 사용하는 필드가 있다면 반드시 동시성을 고려한다.

&nbsp; 이에 대한 상세 케이스를 코드를 통해 아래에서 살펴보자.

#### 3.3.1. 상태 공유 문제

```java
@Service
public class StatefulService {
    private int price; // 상태를 가지는 필드

    public void order(String name, int price) {
        this.price = price; // 문제가 되는 부분
    }

    public int getPrice() {
        return price;
    }
}

// 개선된 버전
@Service
public class StatelessService {
    public int order(String name, int price) {
        return price; // 상태를 가지지 않음
    }
}
```

#### 3.3.2. 멀티스레드 환경에서의 동시성 문제

```java
@Service
public class ThreadSafeService {
    // ThreadLocal을 사용한 안전한 상태 관리
    private ThreadLocal<Integer> price = new ThreadLocal<>();

    public void setPrice(int price) {
        this.price.set(price);
    }

    public int getPrice() {
        return price.get();
    }

    // 사용이 끝나면 반드시 제거
    public void removePrice() {
        price.remove();
    }
}
```

### 3.4. `@Configuration` & Singleton

&nbsp; `@Configuration`은 스프링의 싱글톤을 보장하는 핵심 어노테이션이다.

#### 3.4.1. `@Configuration` 동작 원리

- `CGLIB`을 사용하여 `@Configuration`이 붙은 클래스를 상속한다.
- Spring Container가 Singleton을 보장하도록 바이트코드를 조작한다.
- `@Bean`이 붙은 메서드를 호출할 때 이미 pring Container에 존재하는 Bean이면 해당 Bean을 반환한다.

```java
@Component
public class AppConfig {
    @Bean
    public ServiceA serviceA() {
        return new ServiceA(serviceB()); // 매번 새로운 ServiceB 인스턴스 생성
    }

    @Bean
    public ServiceB serviceB() {
        return new ServiceB();
    }
}
```

### 3.5. Singleton Bean 초기화

&nbsp; Spring에서 Singleton의 안전한 초기화를 위한 기본적인 방법을 제공한다.

```java
@Component
public class SingletonBean implements InitializingBean {
    private static final Object lock = new Object();
    private volatile boolean initialized = false;

    @Override
    public void afterPropertiesSet() throws Exception {
        synchronized (lock) {
            if (!initialized) {
                // 초기화 로직
                initialized = true;
            }
        }
    }
}
```

&nbsp; 주요 특징으로는 다음과 같다.

- `InitializingBean` 인터페이스를 구현하여 초기화 로직 수행
- `synchronized` 블록으로 스레드 안전성 보장
- `volatile` 키워드로 멀티스레드 환경에서 변수 가시성 보장
- 한 번만 초기화되도록 보장

&nbsp; 이 외에도 `@PostConstruct` 어노테이션과 `@Bean`의 `initMethod` 속성을 사용할 수 있다.

## 4. Bean 등록 방법

&nbsp; Spring에서 Bean을 등록하는 방법은 크게 세 가지가 있다. 각각의 방식은 상황과 필요에 따라 선택할 수 있다.

### 4.1. Java 설정

&nbsp; 자바 코드를 통해 직접 빈을 등록하는 방식이다. `@Configuration`과 `@Bean` 어노테이션을 사용한다.

```java
@Configuration
public class AppConfig {
    @Bean
    public UserService userService() {
        return new UserService();
    }
}
```

- 가장 Type-Safety한 방식
- 명시적인 설정이 가능함
- IDE의 지원을 받기 수월함

### 4.2. Component Scan

&nbsp; Spring이 특정 패키지 이하의 클래스들을 스캔하여 자동으로 빈으로 등록하는 방식이다.

```java
@Component
public class UserService {
    // ...
}
```

- 개발 생산성이 높음
- 자동 설정으로 편리함
- `@Component`, `@Service`, `@Repository`, `@Controller` 등 사용

### 4.3. XML 설정

&nbsp; 전통적인 방식의 XML 파일을 통한 빈 설정 방법이다.

```xml
<bean id="userService" class="com.example.UserService">
    <!-- 프로퍼티 설정 -->
</bean>
```

- 레거시 프로젝트에서 주로 사용
- 모든 설정을 한 곳(xml 파일)에서 관리 가능

## 5. Dependency Injection 방식

&nbsp; Spring에서 의존성을 주입하는 방법에는 대표적으로 3가지가 있다.

### 5.1. Constructor 주입

&nbsp; 생성자를 통해 의존성을 주입받는 방식이다.

```java
@Component
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}
```

&nbsp; Dependency Injection 방식 중 가장 권장되는 방식이기 때문에 장점에 대한 내용을 보다 디테일하게 다루도록 하겠다.

- 불변성 보장

  - final 키워드 사용 가능
  - 객체 생성 후 의존관계 변경 불가

- 필수 의존성 명시

  - 생성자 파라미터로 명시적 표현
  - `NPE(Null Pointer Exception)` 방지

- 순환 참조 방지

  - 애플리케이션 구동 시점에 순환 참조 감지
  - **런타임이 아닌 컴파일 시점에 오류 발견**

- 테스트 용이
  - 단위 테스트 시 의존성 주입이 용이
  - 명확한 의존관계 파악 가능

&nbsp;

### 5.2. Setter 주입

&nbsp; `setter` 메서드를 통해 의존성을 주입받는 방식이다.

```java
@Component
public class UserService {
    private UserRepository userRepository;

    @Autowired
    public void setUserRepository(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}
```

- 선택적 의존성에 사용
- 런타임에 의존관계 변경 가능
- 순환 참조 발생 가능

### 5.3. Field 주입

&nbsp; 필드에 직접 의존성을 주입받는 방식이다.

```java
@Component
public class UserService {
    @Autowired
    private UserRepository userRepository;
}
```

- 코드가 간결함
- 테스트가 어려움
- 권장되지 않음

## 6. Bean 초기화 옵션

### 6.1. Lazy Loading

&nbsp; 빈이 실제로 사용될 때까지 초기화를 지연하는 방식이다.

```java
@Component
public class LazyLoadingExample {
    @Autowired
    @Lazy
    private ExpensiveService expensiveService;
}
```

- 애플리케이션 구동 시간 단축
- 메모리 사용 최적화
- 필요한 시점에 초기화

### 6.2. Bean 이름 충돌 해결

&nbsp; 동일한 타입의 빈이 여러 개 존재할 때 명시적으로 이름을 선언하여 구분하게 할 수 있다.

```java
@Component("userServiceV1")
public class UserServiceImpl implements UserService {
    // ...
}

@Component("userServiceV2")
public class UserServiceImpl2 implements UserService {
    // ...
}
```

- 명시적인 빈 이름 지정
- 동일 타입 빈 구분
- 버전 관리 용이

---

### 마치며

&nbsp; 스프링 빈은 스프링 프레임워크의 핵심 개념이다. 올해 멋쟁이사자처럼 대학 12기(이하 멋사)에서 영남대학교 대표로써 활동하면서, 백엔드 파트를 대상으로 'Spring & Spring Boot'을 주제로 세션을 진행한 경험이 있는데, 이 과정에서 가볍게 Spring Bean에 대해 다뤘던 경험이 있다. 멋사의 경우에는 대상자가 비전공자이고, 시간이 한정적이다 보니 난이도를 어느정도 조절하여 모든 케이스에 대해 하나하나 이해해보는 시간을 가질 수는 없었지만, 블로그 포스트를 작성하면서 복습 및 보다 체계적으로 내용을 되짚어볼 수 있어서 좋았다.<br>

&nbsp; 이 글에서 다룬 내용들을 잘 이해하면 스프링 애플리케이션 개발에 있어 많은 도움이 될 것이다. 다음 글에서는 이어서 컴포넌트 스캔의 동작 방식에 대해 자세히 다룰 예정이다.

### 참고 자료

- [멋쟁이사자처럼 대학12기 영남대학교 BE Spring & Spring Boot](https://drive.google.com/file/d/1Ok43HeSdPffji8NEtqVTPPmxBwDIR9B-/view?usp=sharing)
- [Core Technologies](https://docs.spring.io/spring-framework/reference/core.html)
- [Dependency Injection](https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html)
- [Bean Overview](https://docs.spring.io/spring-framework/reference/core/beans/definition.html)
