---
layout: post
title: 자바 제네릭(Generic)
description: >
  본 글은 생활코딩님의 자바 강의 내용 일부를 정리한 게시글입니다.
sitemap: false
hide_last_modified: true
---

---

## 제네릭이란

### 정의

- 클래스 내부에서 사용할 데이터 타입을 외부에서 지정하는 기법이다.
- 클래스 혹은 메서드를 정의할 때 데이터 타입을 확정하지 않고 인스턴스를 생성할 대 데이터 타입을 지정할 수 있다.

### 예제

```java
class Person<T> {
  public T info;
}
Person<String> p1 = new Person<String>();
Person<StringBuilder> p2 = new Person<StringBuildr>();
```

- 각각의 인스턴스를 생성할 대 사용한 <> 사이에 어떤 데이터 타입을 사용했느냐에 따라 info의 데이터 타입은 다음과 같다.
  - p1.info : String
  - p2.info : StringBuilder
- 데이터 타입 T는 `class Person<T>`에서 정해진다.
-

## 제네릭의 사용 이유

### 타입 안정성

```java
class StudentInfo{
    public int grade;
    StudentInfo(int grade){ this.grade = grade; }
}
class StudentPerson{
    public StudentInfo info;
    StudentPerson(StudentInfo info){ this.info = info; }
}
class EmployeeInfo{
    public int rank;
    EmployeeInfo(int rank){ this.rank = rank; }
}
class EmployeePerson{
    public EmployeeInfo info;
    EmployeePerson(EmployeeInfo info){ this.info = info; }
}
public class GenericDemo {
    public static void main(String[] args) {
        StudentInfo si = new StudentInfo(2);
        StudentPerson sp = new StudentPerson(si);
        System.out.println(sp.info.grade); // 2
        EmployeeInfo ei = new EmployeeInfo(1);
        EmployeePerson ep = new EmployeePerson(ei);
        System.out.println(ep.info.rank); // 1
    }
}
```

&nbsp; 위의 코드는 StudentPerson과 EmployeePerson이 사실상 동일한 구조를 가지고 있어서 중복이 발생하고 있기 때문에, 아래와 같이 중복을 제거할 수 있다.

```java
class StudentInfo{
    public int grade;
    StudentInfo(int grade){ this.grade = grade; }
}
class EmployeeInfo{
    public int rank;
    EmployeeInfo(int rank){ this.rank = rank; }
}
class Person{
    public Object info;
    Person(Object info){ this.info = info; }
}
public class GenericDemo {
    public static void main(String[] args) {
        Person p1 = new Person("부장");
        EmployeeInfo ei = (EmployeeInfo)p1.info;
        System.out.println(ei.rank);
    }
}
```

&nbsp; 하지만 위의 코드는 오류(`ClassCaseException`)가 발생하게 되는데, Person 클래스의 생성자의 매개변수 info의 데이터 타입이 Object이기 때문에 EmployeeInfo 객체가 아닌 String이 와도 컴파일 에러가 발생하지 않기 때문이다. 대신 런타임 에러가 발생한다.
<br>
&nbsp; 컴파일 언어의기본은 모든 에러는 컴파일 단에서 발생할 수 있도록 유도해야 한다는 것이다. 런타임은 실제로 애플리케이션이 동작하고 있는 상황이기 때문에 런타임에 발생하는 에러는 항상 심각한 문제를 초래할 수 있기 때문이다.
<br>
&nbsp; 위와 같은 에러를 **타입에 대해서 안전하지 않다**라고 한다. 즉 모든 타입이 올 수 있기 때문에 타입을 엄격하게 제한할 수 없다는 의미이다.

### 제네릭화

&nbsp; 제네릭을 사용하여 코드를 바꿔보면 다음과 같다.

```java
class StudentInfo{
    public int grade;
    StudentInfo(int grade){ this.grade = grade; }
}
class EmployeeInfo{
    public int rank;
    EmployeeInfo(int rank){ this.rank = rank; }
}
class Person<T>{
    public T info;
    Person(T info){ this.info = info; }
}
public class GenericDemo {
    public static void main(String[] args) {
        Person<EmployeeInfo> p1 = new Person<EmployeeInfo>(new EmployeeInfo(1));
        EmployeeInfo ei1 = p1.info;
        System.out.println(ei1.rank); // 성공

        Person<String> p2 = new Person<String>("부장");
        String ei2 = p2.info;
        System.out.println(ei2.rank); // 컴파일 실패
    }
}
```

&nbsp; p1은 잘 동작할 것이다. 중요한 것은 p2다. p2는 컴파일 오류가 발생하는데 p2.info가 String이고 String은 rank 필드가 없는데 이것을 호출하고 있기 때문이다. 여기서 중요한 것은 아래와 같이 정리할 수 있다.

- 컴파일 단계에서 오류가 검출된다.
- 중복의 제거와 타입 안전성을 동시에 추구할 수 있게 되었다.

## 제네릭의 특성

### 복수의 제네릭

```java
class Person<T, S>{
    public T info;
    public S id;
    Person(T info, S id){
        this.info = info;
        this.id = id;
    }
}
public class GenericDemo {

    public static void main(String[] args) {
        Person<EmployeeInfo, int> p1 = new Person<EmployeeInfo, int>(new EmployeeInfo(1), 1);
    }
}
```

&nbsp; 복수의 제네릭을 사용할 때는 `<T, S>`와 같은 형식을 사용한다. 여기서 T와 S 대신 어떠한 문자를 사용해도 된지만, 별도의 컨벤션이 있다고 한다.

### 기본 데이터 타입과 제네릭

&nbsp; 제네릭은 기본 데이터 타입에서는 사용할 수 없고, 참조 데이터 타입에서만 사용할 수 있다.

```java
package org.opentutorials.javatutorials.generic;
class EmployeeInfo{
    public int rank;
    EmployeeInfo(int rank){ this.rank = rank; }
}
class Person<T, S>{
    public T info;
    public S id;
    Person(T info, S id){
        this.info = info;
        this.id = id;
    }
}
public class GenericDemo {
    public static void main(String[] args) {
        EmployeeInfo e = new EmployeeInfo(1);
        Integer i = new Integer(10);
        Person<EmployeeInfo, Integer> p1 = new Person<EmployeeInfo, Integer>(e, i);
        System.out.println(p1.id.intValue());
    }
}
```

&nbsp; new Integer는 기본 데이터 타입은 int를 참조 데이터 타입으로 변환해주는 역할을 수행한다. 이러한 클래스를 래퍼(wrapper) 클래스라고 하고, 덕분에 기본 데이터 타입을 사용할 수 없는 제네릭에서 int를 사용할 수 있다.

## 제네릭의 생략
