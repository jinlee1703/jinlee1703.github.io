---
layout: post
title: 직렬화(Serialization)
description: >
  소프트웨어 마에스트로 14기 팀 프로젝트에서 나는 백엔드 파트를 담당하여 Spring Boot를 통한 WAS 개발을 하게 되었다. WAS 서버를 개발하던 도중 내가 직렬화와 역직렬화에 대한 개념이 부족하다는 것을 느끼게 되었고, 게시글을 작성하게 되었다.
sitemap: false
hide_last_modified: false
---

---

## 글을 쓰게 된 계기

&nbsp; 작년 네이버 부스트캠프 웹모바일 7기에서 웹 개발을 제대로 시작한 지도 어느새 1년이 다 되어간다. 부끄럽게도 1년 동안 여러 방면의 CS 지식을 채우면서 반대로 작년에 이해했던 `직렬화`와 `역직렬화`라는 키워드가 가물가물해졌다. 그래서 이번에는 완벽히 이해하고, 소프트웨어 마에스트로 프로젝트를 통해 이런 개념은 100% 이해하고 넘어가려고 한다.

## 직렬화(Serialization)

&nbsp; `직렬화(Serialization`는 데이터 구조나 오브젝트 상태를 저장하거나 전송할 수 있는 형식으로 변환하는 과정을 의미한다. 이렇게 변환된 형식은 파일에 저장하거나, 메모리에 유지하거나, 네트워크를 통해 전송할 수 있다.<br>
&nbsp; 자바에서는 `java.io.Serializable` 인터페이스를 구현한 클래스의 객체는 `java.io.ObjectOutputStream`을 통해 직렬화할 수 있다.

## 역직렬화(Deserialization)

&nbsp; 반대로 `역직렬화(Deserialization)`는 직렬화된 데이터를 원래의 데이터 구조나 오브젝트 상태로 상태로 복구하는 과정을 뜻한다.<br>
&nbsp; 자바에서 직렬화된 데이터는 `java.io.ObjectInputStream`을 통해 원래의 객체로 역직렬화할 수 있다.

## 직렬화와 역직렬화를 하는 이유

&nbsp; 예를 들어, 네트워크를 통해 데이터를 전송하기 위해서는 데이터를 일련의 바이트로 변환해야 한다. 이를 위해서 수행하는 것이 **직렬화**이다. 반대로 데이터를 받는 쪽에서는 이 일련의 바이트를 원래의 데이터 구조로 복원해야 하는데, 이를 위해 수행하는 것이 **역직렬화**이다.<br>
&nbsp; 이러한 직렬화와 역직렬화는 `HTTP 요청` 이외에도 `원격 메서드 호출(Remote Method Invocation, RMI)`, `데이터베이스 쓰기 및 읽기` 등에서 필요로 한다.<bre>
&nbsp; 다만 직렬화와 역직렬화를 수행할 때 주의해야할 점이 있는데, **직렬화된 데이터는 원본 데이터 구조의 모든 정보를 포함하므로 민감한 정보를 포함한 객체를 직렬화하면 보안에 문제가 생길 수 있다**. 반대로 역직렬화의 경우에도 신뢰할 수 없는 소스로부터 직렬화된 데이터를 역직렬화하면서 보안 문제가 발생할 수 있기 때문에 안전한 직렬화와 역직렬화 방법을 사용하는 것이 중요하다.

## Spring에서의 직렬화, 역직렬화

### User 클래스

```java
import java.io.Serializable;

public class User implements Serializable {
    private String name;
    private int age;

    // 기본 생성자
    public User() { }

    // 생성자
    public User(String name, int age) {
        this.name = name;
        this.age = age;
    }

    // getter, setter
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }
}
```

&nbsp; User라는 이름의 POJO(Plain Old Java Ojbect) 클래스이다. POJO 클래스란 '단순한 자바 객체'를 의미한다. User 클래스는 `Serializable` 인터페이스를 상속받는데, 이 인터페이스는 단순한 마커 인터페이스(메서드가 정의되어 있지 않고 단순히 어떤 종류에 속하는지를 나타내기 위한 인터페이스)이다.<br>
&nbsp; 자바에서는 Serializable 인터페이스를 구현하는 클래스의 인스턴스를 바이트 스트림으로 변환(직렬화)하여 파일에 저장하거나 네트워크를 통해 다른 곳으로 전송할 수 있고, 이 바이트 스트림을 다시 객체로 복원(역직렬화)할 수 있다.

### Serialization Logic

```java
import com.fasterxml.jackson.databind.ObjectMapper;

public class SerializationExample {
    public static void main(String[] args) {
        try {
            // Jackson ObjectMapper
            ObjectMapper objectMapper = new ObjectMapper();

            // User 객체 생성
            ObjectMapper objectMapper = new ObjectMapper();

            // 직렬화: 객체를 JSON 문자열로 변환
            String jsonString = objectMapper.writeValueAsString(user);
            System.out.println("Serialized to JSON: " + jsonString);

            // 역직렬화: JSON 문자열을 객체로 변환
            User deserializedUser = objectMapper.readValue(jsonString, User.class);
            System.out.println("Deserialized from JSON: " + deserializedUser.getName() + ", " + deserializedUser.getAge());

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

&nbsp; Spring Boot에서는 일반적으로 `Jackson` 라이브러리를 사용하여 직렬화 및 역직렬화를 수행한다. HTTP 요청 및 응답의 본문을 처리하기 위해 사용되며, 주로 JSON 형식으로 데이터를 처리한다. 아래 코드에 대한 설명을 살펴보자.<br>

- `ObjectMapper objectMapper = new ObjectMapper();` : `Jackson` 라이브러리의 `ObjectMapper` 클래스를 통해 ObjectMapper 객체 생성
- `User user = new User("Alice", 25);` : 직렬화하기 위한 User 객체 생성
- `String jsonString = objectMapper.writeValueAsString(user);` : `ObjectMapper` 인스턴스를 통해 `User` 인스턴스를 JSON으로 직렬화
- `User deserializedUser = objectMapper.readValue(jsonString, User.class);` : `ObjectMapper` 인스턴스를 통해 JSON 데이터를 `User` 인스턴스로 역직렬화

## 느낀 점

&nbsp; 역시 한 번 이해했던 내용이라 꽤 예전에 본 내용임에도 불구하고, 이번에는 매우 쉽게 이해가 되었다. 앞으로는 절대 까먹지 않으리라...