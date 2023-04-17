---
layout: post
title: 자바스크립트 컴포넌트
description: >
  본 글은 SW마에스트로 과정에서 학습한 내용을 정리한 게시글입니다.
sitemap: false
hide_last_modified: true
---

---

## 1. 컴포넌트 정의

### 컴포넌트 개념

- 직역하면 부품 혹은 어떤 전체의 요소라는 의미
- 덩어리일 경우 복잡하고 규모가 큰 설계 불가능 => 반복, 재사용 불가
- 컴포넌트를 활용하여 엘리먼트를 독립적으로 만들어 줄 수 있음(분리해서 설계) => 엘리먼트의 재사용성 향상

### 컴포턴트란?

- render()를 통해 HTML 요소를 반환하는 함수
- 독립적이고, 재사용이 가능한 작은 UI 조각
- JavaScript 함수와 동일한 용도로 사용
- **복잡한 웹을 작게 컴포넌트로 쪼개면, 재사용도 쉽고 효율적으로 관리할 수 있음**

## 2. 컴포넌트 사용

### 컴포넌트 사용 규칙

- 컴포넌트의 이름은 항상 대문자로 시작

  - 컴포넌트를 만들고(위) 다른 컴포넌트에서 자유롭게 활용(아래)할 수 있음

  ```jsx
  // App.js
  const name = "Elice";
  // 컴포넌트 선언
  function Hello() {
    return <h1> Hello, {name} </h1>;
  }
  export default Hello;
  ```

  ```jsx
  // index.js
  import Hello from "./App";

  ReactDOM.render(<Hello />, document.getElementById("root"));
  ```

- return() 내에 있는 건 태그 하나로 묶기

  ```jsx
  // App.js
  import Hello from "./component/Hello.js";
  import Post from "./component/Post.js";

  const name = "Elice";
  // 컴포넌트 선언
  function App() {
    return (
      <div className="App">
        <Hello />
        <Post />
      </div>
    );
  }
  export default App;
  ```

## 3. 함수형 컴포넌트 vs 클래스형 컴포넌트

### 함수형 컴포넌트

```jsx
const name = "Elice";

const App = () => {
  const name = "함수형 컴포넌트";
  return <div> {name} </div>;
};
export default App;
```

- 덜 복잡한 UI 로직
- Component 선언이 편함
- 클래스형보다 메모리 자원 소모가 적음

### 클래스형 컴포넌트

```jsx
import Component from "react";
const name = "Elice";

class App extends Component {
  render() {
    const name = "클래스형 컴포넌트";
    return <div>{name}</div>;
  }
}

export default App;
```

- Class 키워드 필요
- Component를 상속받아야 함
- Render() 메소드 반드시 필요
- 함수형보다 메모리 자원 더 사용

## 4. Template Literal

### Template Literal이란?

- 역따옴표(백틱: ` `)로 감싸는 문자열
- 문자열을 템플릿화해서, 배열이나 객체 데이터를 갈아끼울 수 있는 구조
- 데이터 기반의 HTML 페이지를 만드는데 활용
- 반복되는 HTML의 태그나 목록을 동적으로 생성 가능

  => 가볍과 간결한 데이터 기반 페이지 기능!

### 문자열을 변수와 함께 활용할 때

```jsx
var name = "앨리스";
var job = "개발자";
var age = "29";

console.log(
  "안녕하세요 제 이름은 " +
    name +
    " 입니다. \n" +
    "직업은 " +
    job +
    " 이고 \n" +
    "나이는 " +
    age +
    " 입니다. \n"
);
```

### Template Literal을 활용할 때

```jsx
var name = "앨리스";
var job = "개발자";
var age = "29";

console.log(
  `안녕하세요 제 이름은 "${name}"입니다. \n 직업은 "${job}" 이고 \n 나이는 "${age}" 입니다. \n`
);
```

- `${변수명}`의 형태로 특정 변수를 전달

### Template Literal의 선언

```jsx
let word = "Elice";

console.log(`문자열 ${word}`);
```

- 문자열에 변수 역할을 하는 템플릿 코드를 추가 -> 자바스크립트 데이터를 대입해 새로운 문자열을 생성

## 5. 컴포넌트 반환하기

### 컴포넌트 반환

```jsx
import Nav from "./component/nav/Nav.js";
import Posts from "./component/post/Posts.js";

const App = () => {

  return `${${Nav()}}
    <div class="container">
      ${Posts()}
    </div>`;
}
```
