---
layout: post
title: 클래스 다이어그램(Class Diagram)
description: >
  소프트웨어 마에스트로 14기로 활동하면서 전담 멘토님께서 주관하시는 디자인 패턴에 대한 스터디에 참여하게 되었고, 도서 및 스터디를 통해 얻은 지식들을 공유하고자 게시글을 작성하게 되었다.
sitemap: false
hide_last_modified: true
---

---

## 정의

&nbsp; 클래스 다이어그램(Class Diagram)은 UML의 다이어그램 중 한 종류로 클래스나 인스턴스, 인터페이스 등의 정적인 관계를 나타낸 것이다. 클래스, 인터페이스, 관계 속성, 메서드 등의 요소를 시각적으로 표현하여 시스템의 구조와 클래스 간의 관계를 이해할 수 있게 도와준다.

## 요소

### 클래스(Class)

&nbsp; 이름, 멤버, 메서드로 구성된 사각형으로 표시된다.

### 관계(Relationship)

&nbsp; 클래스들 사이의 연결을 나타내며, 연관성(association), 일반화(generallzation), 의존성(dependency), 집합(aggregation), 합성(composition) 등 여러 형태가 있다.

### 인터페이스(interface)

&nbsp; 클래스가 구현해야 하는 메서드의 집합을 나태며, 일반적으로 삼각형으로 표현된다.

## 예시

### 클래스 계층 관계 표현

```java
abstract class ParentClass {
  int field1;
  static char field2;
  abstract void methodA();
  double methodB() {
    // ...
  }
}

class ChildClass extends ParentClass {
  void methodA() {
    // ...
  }
  static void methodC() {
    // ...
  }
}
```

<pre><code class="language-mermaid">classDiagram

ParentClass <|-- ChildClass

class ParentClass {
  <<abstract>>
  field1
  field2$
  methodA()*
  methodB()
}

class ChildClass {
  methodA()
  methodC()$
}
</code></pre>
