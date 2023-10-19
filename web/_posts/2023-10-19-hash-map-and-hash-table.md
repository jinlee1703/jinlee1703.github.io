---
layout: post
title: HashMap vs Hashtable
description: >
  소프트웨어 마에스트로 14기로 활동하면서 전담 멘토님께서 주관하시는 디자인 패턴에 대한 스터디에 참여하게 되었다. 디자인 패턴을 공부하던 중 Java의 Hashtable의 존재를 알게 되었고 이에 대해 정리하고자 게시글을 남기게 되었다.
sitemap: false
hide_last_modified: false
---

---

## Background knowledge

### 해시 함수

&nbsp; `해시 함수(Hash Function)`는 입력 데이터를 고정된 길이의 숫자나 문자열로 반환하는 함수이다. 이 변환된 값을 `해시 코드(Hash Code)`라고 한다. 해시 함수 및 해시 코드를 사용함으로써 얻을 수 있는 이점은 다음과 같다.

- **데이터를 고르게 분산**: 입력 데이터를 고르게 분산하여 출력값을 생성함으로써, 입력 데이터가 서로 다른 값으로 매핑되어 충돌되는 것을 최소화한다.
- **고정된 크기의 출력값 제공**: 해시 함수는 항상 고정된 크기의 출력값을 생성한다.
- **효율적인 검색**: 해시 함수를 사용하면 검색 속도를 향상시킬 수 있다. 해시 코드는 실제 데이터의 내용과는 무관하게 고유한 값으로 생성되어 사용되므로 빠른 데이터 검색이 가능하다.
- **보안**: 해시 함수는 데이터를 무결성을 검증하는 데 사용될 수 있다. 데이터의 해시 코드를 계산하여 저장한 후, 추후 데이터를 다시 읽어올 때 해시 코드를 다시 계산하여 데이터의 변경 여부를 판별할 수 있다.

&nbsp; 일반적으로 MD5, SHA-1, SHA-256 등 여러 해시 함수가 있으며, 각각의 다양한 용도로 사용되고 있다.<br><br>
&nbsp; 해시 함수를 설계할 때에 고려할 점은 다음과 같다.

- **고유성**: 가능한 모든 입력 값에 대해 고유한 해시 코드를 생성해야 한다. 다른 입력 데이터가 동일한 해시 코드를 가지게 되면 충돌이 발생하며, 이는 해시 함수의 성능을 저해시킬 수 있다.
- **균일한 분포**: 입력 데이터의 작은 변경은 해시 코드에 큰 영향을 미쳐야 하며, 이렇게 하면 해시 코드의 분포를 동일하게 할 수 있다.
- **계산 효율성**: 해시 함수는 빠르게 계산할 수 있어야 한다.
- **안전성**: 악의적인 공격으로부터 안전해야 하며, 두 개의 다른 입력 값이 동일한 해시 코드를 생성하기 어려워야 한다.

&nbsp; 몇몇 고급 암호학적 해시 함수는 이러한 요구 사항을 충족하기 위해 복잡한 알고리즘과 솔트(salt)와 같은 추가적인 기법을 사용한다.

---

## HashMap

![hashmap](/assets/img/docs/hashmap.png)

&nbsp; Java에서 가장 많이 사용되는 데이터 구조 중 하나로, `key-value` 형태로 데이터를 저장하고 검색하기 위한 **해시 테이블 기반의 자료 구조**이다.<br><br>

### 1. 특징

#### 1.1. key-value 형식

 &nbsp; 데이터를 key-value 형태로 저장한다. 각 key는 고유한 값이여야 하며, 이를 통해 값을 검색할 수 있다.

#### 1.2. 해시 함수

&nbsp; 내부적으로 해시 함수를 사용하여 각 key를 해시 코드로 매핑한다. 이 해시 코드는 배열의 인덱스로 사용된다.

#### 1.3. 검색 및 삽입 연산의 시간 복잡도

&nbsp; 해시 테이블 기반의 자료구조이므로, 검색과 삽입 연산의 평균 복잡도는 O(1)이다. 하지만 해시 충돌이 발생할 수 있으며, 이 경우 성능이 감소할 수 있다.

#### 1.4. 순서 보장을 하지 않음

&nbsp; key-value 쌍의 순서 보장을 하지 않는다. 만약 순서를 보장해야하는 경우에는 `LinkedHashMap`을 사용할 수 있다.

#### 1.5. 동기화를 지원하지 않음

&nbsp; HashMap은 동기화를 지원하지 않기 때문에, 여러 개의 스레드에서 하나의 HashMap에 동시에 접근하게 되면 예기치 않은 결과가 발생할 수 있다.

#### 1.6. 용량 관리

&nbsp; 초기 용량(capacity)와 로드 팩터(load factor, 최대 크기)를 설정할 수 있으며, 동적으로 크기를 조정하여 효율적으로 메모리 사용을 관리한다.

#### 1.7. null 허용

&nbsp; key와 value 모두 null 값을 허용한다.

### 2. 예제 코드

```java
import java.util.HashMap;
import java.util.Map;

public class HashMapExample {
    public static void main(String[] args) {
        // HashMap 생성
        Map<String, Integer> hashMap = new HashMap<>();

        // 요소 추가
        hashMap.put("Alice", 25);
        hashMap.put("Bob", 30);
        hashMap.put("Charlie", 28);

        // 요소 검색
        int age = hashMap.get("Bob");
        System.out.println("Bob의 나이: " + age);

        // 요소 제거
        hashMap.remove("Charlie");

        // 모든 요소 순회
        for (Map.Entry<String, Integer> entry : hashMap.entrySet()) {
            System.out.println(entry.getKey() + ": " + entry.getValue());
        }
    }
}
```

---

## Hashtable

![Hashtable](/assets/img/docs/hashtable.png)

&nbsp; Java에서 제공하는 해시 테이블 기반의 데이터 구조로, HashMap과 마찬가지로 key-value 형태의 데이터를 관리하기 위한 자료구조이다. 가장 큰 특징은 **동기화된 자료구조**라는 점이다. 자세한 내용은 아래에서 서술하겠다.

### 1. 특징

#### 1.1. key-value 형식

&nbsp; HashMap과 동일하다.

#### 1.2. 해시 함수

&nbsp; HashMap과 동일하다.

#### 1.3. 검색 및 삽입 연산의 시간 복잡도

&nbsp; HashMap과 동일하다.

#### 1.4. 순서 보장을 하지 않음

&nbsp; HashMap과 동일하다.

#### 1.5. null 허용

&nbsp; HashMap과 동일하다.

#### 1.6. 용량 관리

&nbsp; HashMap과 동일하다.

#### **1.7. 동기화 지원**

&nbsp; HashMap과의 가장 큰 차이점이라고 볼 수 있다. Hashtable은 기본적으로 스레드 안전(thread-safe)하며 동기화된 자료구조로, 여러 스레드에서 동시에 접근하더라도 안전하게 사용할 수 있다

### 2. 예제 코드

```java
import java.util.Hashtable;
import java.util.Map;

public class HashtableExample {
    public static void main(String[] args) {
        // Hashtable 생성
        Hashtable<String, Integer> hashtable = new Hashtable<>();

        // 요소 추가
        hashtable.put("Alice", 25);
        hashtable.put("Bob", 30);
        hashtable.put("Charlie", 28);

        // 요소 검색
        int age = hashtable.get("Bob");
        System.out.println("Bob의 나이: " + age);

        // 요소 제거
        hashtable.remove("Charlie");

        // 모든 요소 순회
        for (Map.Entry<String, Integer> entry : hashtable.entrySet()) {
            System.out.println(entry.getKey() + ": " + entry.getValue());
        }
    }
}
```

### 3. TMI

#### 3.1. 명명 규칙

&nbsp; Hashtable 클래스는 Java에서 해시 테이블을 구현한 클래스 중 가장 오래된 클래스로, Collections 프레임워크가 만들어지기 이전부터 존재하던 것이기 때문에 Collections 프레임워크의 명명 규칙을 따르지 않는다고 한다.

#### 3.2. 실사용 여부

&nbsp; Vector나 Hashtable과 같은 기존의 컬렉션 클래스들은 호환을 위해, 설계를 변경해서 남겨두었지만 가능하면 사용하지 않는 것이 좋다고 한다. 대신 ArrayList와 HashMap을 사용하는 것을 권장한다. 하지만 HashMap은 동기화를 지원하지 않기 때문에, Java 5부터는 ConcurrentHashMap과 같은 동시성을 더 효율적으로 지원하는 클래스가 도입되었으므로, 이를 사용하는 것을 권장한다.

---

## Opinion

&nbsp; 예전에 Git을 직접 구현했던 경험이 기억이 난다. .git 폴더 역시 내부에서 해시 함수를 사용하여 파일의 변경 여부를 관리하고 있었는데, 다시 보니 정리가 잘 되서 좋았다.<br>
&nbsp; Hashtable이라는 자료 구조는 굉장히 생소한 자료 구조였는데, 이에 대해 이해할 수 있어서 좋은 학슴 경험이였다!

---

## Reference

- [Hashtable in Java](https://www.scaler.com/topics/hashtable-in-java/)
- [HashMap vs Hashtable](https://devlog-wjdrbs96.tistory.com/253)
- [Git에서 commit id로 hash 값을 사용하는 이유](https://antilog.tistory.com/8)
