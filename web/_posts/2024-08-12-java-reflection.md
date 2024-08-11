---
layout: post
title: Java - Reflection
description: >
  .
sitemap: false
hide_last_modified: false
---

---

## Background

&nbsp; 필자는 최근 디버깅 및 테스트 도구에 대한 내용을 학습하던 중, 자바의 리플렉션이라는 기능을 이용한 디버깅 및 테스트 도구가 존재한다는 것을 알게 되었다. 이를 위해 자바의 리플렉션에 대한 내용을 이해하고자 한다.

---

## Reflection?

&nbsp; 자바 리플렉션(Reflection)은 실행 중인 자바 프로그램이 자기 자신을 검사하거나 내부의 속성을 조작할 수 있게 해주는 기능이다. 이는 프로그램의 동작을 동적으로 검사, 수정할 수 있게 해주어 유연성과 확장성을 크게 높여준다.<br>

&nbsp; 리플렉션은 주로 다음과 같은 상황에서 사용된다.

1. 프레임워크 개발
2. 디버깅 및 테스트 도구 구현
3. 자바 IDE의 자동완성 기능 구현
4. DI(Dependency Injection) 컨테이너 구현

## Concepts

&nbsp; 리플렉션의 핵심은 Class 객체이다. 모든 자바 클래스는 로드될 때 JVM에 의해 해당 Class 객체가 생성되는데, 이 Class 객체를 통해 우리는 클래스의 모든 정보에 접근할 수 있다.

```java
Class<?> clazz = MyClass.class;
// 또는
Class<?> clazz = Class.forName("com.example.MyClass");

// 메서드 정보 얻기
Method[] methods = clazz.getDeclaredMethods();

// 필드 정보 얻기
Field[] fields = clazz.getDeclaredFields();

// 생성자 정보 얻기
Constructor<?>[] constructors = clazz.getDeclaredConstructors();
```

&nbsp; 이렇게 얻은 정보를 통해 메서드 호출, 필드값 변경, 객체 생성 등의 작업을 수행할 수 있다.

## Usecase

### 런타임 시 클래스 정보 조회

```java
public class RuntimeClassInfo {
    public static void main(String[] args) {
        Class<?> clazz = String.class;

        // 메서드 정보 출력
        Method[] methods = clazz.getDeclaredMethods();
        for (Method method : methods) {
            System.out.println("Method: " + method.getName());
        }

        // 필드 정보 출력
        Field[] fields = clazz.getDeclaredFields();
        for (Field field : fields) {
            System.out.println("Field: " + field.getName());
        }

        // 인터페이스 정보 출력
        Class<?>[] interfaces = clazz.getInterfaces();
        for (Class<?> intf : interfaces) {
            System.out.println("Interface: " + intf.getName());
        }
    }
}
```

&nbsp; 클래스의 메서드, 필드, 인터페이스 등의 정보를 동적으로 확인할 수 있다.

### 동적 객체 생성

```java
public class DynamicObjectCreation {
    public static void main(String[] args) throws Exception {
        String className = "java.util.ArrayList";
        Class<?> clazz = Class.forName(className);
        Object obj = clazz.getDeclaredConstructor().newInstance();
        System.out.println("Created object: " + obj);
    }
}
```

&nbsp; 클래스 이름을 문자열로 받아 해당 클래스의 인스턴스를 생성할 수 있다.

### private 멤버에 접근

```java
public class PrivateAccessExample {
    public static void main(String[] args) throws Exception {
        Class<?> clazz = PrivateClass.class;
        PrivateClass obj = (PrivateClass) clazz.getDeclaredConstructor().newInstance();

        Field privateField = clazz.getDeclaredField("secretValue");
        privateField.setAccessible(true);
        System.out.println("Before: " + privateField.get(obj));
        privateField.set(obj, "New Secret Value");
        System.out.println("After: " + privateField.get(obj));
    }
}

class PrivateClass {
    private String secretValue = "Original Secret";
}
```

&nbsp; 일반적으로 접근할 수 없는 private 멤버에도 접근이 가능하다.

#### 어노테이션 처리

```java
import java.lang.annotation.*;
import java.lang.reflect.*;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@interface MyAnnotation {
    String value();
}

public class AnnotationProcessingExample {
    @MyAnnotation("Hello, Reflection!")
    public void annotatedMethod() {}

    public static void main(String[] args) throws Exception {
        Class<?> clazz = AnnotationProcessingExample.class;
        for (Method method : clazz.getDeclaredMethods()) {
            if (method.isAnnotationPresent(MyAnnotation.class)) {
                MyAnnotation annotation = method.getAnnotation(MyAnnotation.class);
                System.out.println("Annotated method: " + method.getName());
                System.out.println("Annotation value: " + annotation.value());
            }
        }
    }
}
```

&nbsp; 클래스, 메서드, 필드 등에 붙은 애노테이션 정보를 읽고 처리할 수 있다.

## Advantage & Disadvantage

### Advantage

1. 유연성 : 리플렉션이 프로그램에 높은 유연성을 제공한다고 생각한다. 런타임에 동적으로 클래스를 조작할 수 있어, 변화하는 요구사항에 쉽게 대응할 수 있다.
2. 확장성 : 리플렉션을 통해 프레임워크나 라이브러리를 더욱 쉽게 확장할 수 있다고 생각한다. 사용자 정의 클래스를 동적으로 로드하고 사용할 수 있기 때문이다.

### Disadvantage

1. 성능 : 리플렉션은 일반적인 메서드 호출보다 느리다. 동적 해석이 필요하기 때문에 JVM 최적화가 어렵다.
2. 보안: 리플렉션이 private 멤버에 접근할 수 있어 캡슐화를 깨뜨릴 수 있다. 이는 보안 위험을 초래할 수 있다.
3. 복잡성: 필자는 리플렉션 API가 복잡하여 코드의 가독성과 유지보수성을 떨어뜨릴 수 있다고 생각한다.
4. 타입 안정성 저하 : 리플렉션이 컴파일 시점의 타입 체크를 우회하므로, 런타임 오류 가능성이 높아짐을 경고한다.

## Best Practices

&nbsp; 리플렉션은 강력하지만 잘못 사용하면 성능 저하와 복잡성 증가를 초래할 수 있다. 따라서 다음과 같은 방법들을 통해 리플렉션을 더욱 효율적으로 사용할 수 있다.

### 캐싱

&nbsp; 리플렉션 연산은 비용이 많이 들기 때문에, 가능한 한 결과를 캐시하는 것이 중요하다. 특히 Class, Method, Field 객체는 불변이므로 안전하게 재사용할 수 있다.

```java
public class ReflectionCache {
    private static final Map<String, Method> methodCache = new ConcurrentHashMap<>();

    public static Method getMethod(Class<?> clazz, String methodName, Class<?>... parameterTypes) throws NoSuchMethodException {
        String key = clazz.getName() + "#" + methodName + Arrays.toString(parameterTypes);
        return methodCache.computeIfAbsent(key, k -> {
            try {
                Method method = clazz.getDeclaredMethod(methodName, parameterTypes);
                method.setAccessible(true);
                return method;
            } catch (NoSuchMethodException e) {
                throw new RuntimeException(e);
            }
        });
    }
}
```

### 접근성 최적화

&nbsp; private 멤버에 접근할 때 setAccessible(true)를 사용하면 성능을 크게 향상시킬 수 있다. 하지만 이는 보안 검사를 우회하므로 신중히 사용해야 한다.

```java
Method method = clazz.getDeclaredMethod("privateMethod");
method.setAccessible(true);  // 성능 향상을 위해 접근성 설정
method.invoke(obj);
```

### 인터페이스 사용 권장

&nbsp; 위와 같은 이유로 가급적이면 리플렉션 대신 인터페이스를 사용하여 동적 행위를 구현하는 것이 좋다. 이는 타입 안전성을 제공하고 성능도 더 좋다.

```java
public interface Executable {
    void execute();
}

public class DynamicExecutor {
    public void executeMethod(Executable executable) {
        executable.execute();
    }
}
```

### 제네릭 사용

&nbsp; 리플렉션 사용 시 제네릭을 활용하면 타입 안정성을 높일 수 있다.

```java
public class GenericReflection {
    public static <T> T createInstance(Class<T> clazz) throws Exception {
        return clazz.getDeclaredConstructor().newInstance();
    }
}
```

---

## 테스팅 도구에서의 활용

&nbsp; 필자는 자바 기반의 런타임 디버깅 도구가 리플렉션의 여러 강력한 기능을 활용한다고 본다. 이러한 도구들이 리플렉션의 어떤 측면을 활용하는지 알아보았다.

### StackTrace 정보 획득

&nbsp; 리플렉션은 StackTraceElement 클래스를 통해 현재 실행 중인 스레드의 스택 프레임 정보를 제공한다. 이를 통해 예외가 발생한 정확한 클래스, 메서드, 라인 번호를 알 수 있다.

```java
StackTraceElement[] stackTrace = Thread.currentThread().getStackTrace();
for (StackTraceElement element : stackTrace) {
    System.out.println(element.getClassName() + "." + element.getMethodName()
                       + " (Line: " + element.getLineNumber() + ")");
}
```

### 동적 클래스 로딩 및 검사

&nbsp; Class.forName() 메서드를 사용하여 런타임에 클래스를 동적으로 로드하고 검사할 수 있다. 이를 통해 디버거는 실행 중인 프로그램의 클래스 구조를 분석할 수 있다.

### 메서드 및 필드 정보 획득

&nbsp; 리플렉션 API를 사용하여 클래스의 모든 메서드와 필드 정보를 획득할 수 있다. 이는 디버거가 변수 값을 검사하거나 메서드 호출 정보를 표시할 때 유용하다.

```java
Class<?> clazz = obj.getClass();
Field[] fields = clazz.getDeclaredFields();
for (Field field : fields) {
    field.setAccessible(true);
    System.out.println(field.getName() + ": " + field.get(obj));
}
```

### 런타임 값 변경

&nbsp; 디버거가 실행 중인 프로그램의 변수 값을 변경할 수 있는 것은 리플렉션의 필드 접근 및 수정 기능을 활용한 것이다.

```java
Field field = clazz.getDeclaredField("someField");
field.setAccessible(true);
field.set(obj, newValue);
```

### 메서드 호출

&nbsp; 디버거가 임의의 메서드를 호출할 수 있는 것은 리플렉션의 Method.invoke() 기능을 활용한 것이다.

```java
Method method = clazz.getDeclaredMethod("someMethod", parameterTypes);
method.setAccessible(true);
Object result = method.invoke(obj, args);
```

### 애노테이션 정보 획득

&nbsp; 리플렉션을 통해 런타임에 애노테이션 정보를 읽을 수 있다. 이는 특정 디버깅 애노테이션을 사용하여 추가적인 디버그 정보를 제공할 때 유용하다.

```java
Method method = clazz.getDeclaredMethod("someMethod");
if (method.isAnnotationPresent(DebugInfo.class)) {
    DebugInfo debugInfo = method.getAnnotation(DebugInfo.class);
    System.out.println("Debug info: " + debugInfo.value());
}
```

### 프록시 생성

&nbsp; 일부 고급 디버깅 도구는 동적 프록시를 사용하여 메서드 호출을 가로채고 추가 정보를 수집한다. 이는 `java.lang.reflect.Proxy` 클래스를 사용하여 구현된다.

```java
Method method = clazz.getDeclaredMethod("someMethod");
if (method.isAnnotationPresent(DebugInfo.class)) {
    DebugInfo debugInfo = method.getAnnotation(DebugInfo.class);
    System.out.println("Debug info: " + debugInfo.value());
}
```

---

## Summary

- 리플렉션은 런타임에 클래스, 인터페이스, 필드, 메서드의 정보를 동적으로 검사하고 조작할 수 있는 강력한 기능이다.
- 주요 사용 사례로는 프레임워크 개발, 디버깅 도구, 테스트 도구 구현 등이 있다.
- 효율적인 리플렉션 사용을 위해 메타데이터 캐싱, 접근성 최적화, 인터페이스 활용, 제네릭 사용 등의 방법을 활용할 수 있다.
- 리플렉션은 성능 저하, 보안 위험, 타입 안전성 감소 등의 단점이 있어 신중하게 사용해야 한다.
- 디버깅 도구는 리플렉션을 활용하여 스택 트레이스 정보 획득, 동적 클래스 로딩 및 검사, 메서드 및 필드 정보 획득, 런타임 값 변경 등의 기능을 구현한다.
- 리플렉션은 강력하지만, 꼭 필요한 경우에만 사용하고 가능한 일반적인 코딩 방식(인터페이스 활용 등)을 선호해야 한다.

&nbsp; 추가적으로 덧붙이자면 코틀린에서도 리플렉션을 사용할 수 있다. 코틀린은 자바와의 상호 운용성이 뛰어나기 때문에, 자바의 리플렉션 API를 그대로 사용할 수 있다. 또한, 코틀린은 자체적으로 kotlin-reflect 라이브러리를 제공하여 코틀린 특화된 리플렉션 기능을 지원하고 있다고 한다.
