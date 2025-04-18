---
layout: post
title: Java로 구현한 Virtual Host 기능과 Host 헤더 이슈 해결기
description: >
  필자는 Java 및 웹 개발 학습의 일환으로 간단한 HTTP 서버를 직접 구현해보며 웹 서버의 기본 구조와 요청 처리 방식을 익히고자 했다. 특히 가상 호스트(Virtual Host) 기능을 통해 하나의 서버에서 여러 도메인 요청을 분기하는 로직을 직접 구현하면서, 실무에서 자주 접하게 될 네트워크 및 서블릿 처리 흐름을 체득하고자 하였다.
  
  해당 기능을 구현하던 중 Java의 `HttpURLConnection`이 `Host` 헤더를 덮어써서 발생한 테스트 이슈를 경험하였다. 이를 해결하는 과정에서 교훈을 얻어 Virtual Host 개념 및 구현 내용을 정리하고, 그 과정에서 마주한 문제와 해결 방법을 함께 공유하고자 작성하였다.
sitemap: false
hide_last_modified: false
published: false
---

---

* this unordered seed list will be replaced by the toc
{:toc}

## 1. Virtual Host란?

Virtual Host(가상 호스트)란 하나의 서버에서 여러 웹사이트를 운영할 수 있도록 하는 기술이다. 웹 서버는 요청에 포함된 정보를 바탕으로 어떤 웹사이트에 대한 요청인지를 판단하며, 이를 통해 도메인별로 서로 다른 콘텐츠를 서비스할 수 있다. Virtual Host란 크게 아래 세 가지로 분류할 수 있다.

### 1.1. Name-based Virtual Host

```plaintext
요청 URL: http://site1.com → 서버는 Host: site1.com 을 기준으로 /var/www/site1 디렉토리를 매핑
요청 URL: http://site2.com → 서버는 Host: site2.com 을 기준으로 /var/www/site2 디렉토리를 매핑
```

- 요청의 `Host` 헤더 값을 기준으로 웹 사이트를 구분한다.
- 하나의 IP 주소로 여러 도메인을 처리할 수 있어 효율적이다.
- 가장 널리 사용되는 방식이다.

### 1.2. IP-based Virtual Host

```apache
# 192.168.0.10 → siteA
<VirtualHost 192.168.0.10:80>
    DocumentRoot "/var/www/siteA"
</VirtualHost>

# 192.168.0.11 → siteB
<VirtualHost 192.168.0.11:80>
    DocumentRoot "/var/www/siteB"
</VirtualHost>
```

- 각기 다른 IP 주소에 서로 다른 사이트를 매핑한다.
- 도메인이 아닌 IP 주소 기준으로 처리되며, IP가 여러 개 필요한 단점이 있다.

### 1.3. Port-based Virtual Host

```plaintext
http://example.com:8080 → 포트 8080용 서비스
http://example.com:9090 → 포트 9090용 서비스
```

- 동일한 IP라도 포트 번호를 달리하여 서비스를 분리할 수 있다.

### 1.4. Virtual Host 방식의 차이 (도식화)

![Virtual Host 분류도](./assets/virtual-host-types.png)  
*출처: 직접 제작한 구조도 (IP, Port, Host 기반 분기 방식 비교)*

## 2. Virtual Host 기능 직접 구현해보기

### 2.1. 설정 예시 (`server.json`)

```json
{
  "hosts": {
    "localhost": "/www/localhost",
    "test.local": "/www/test"
  }
}
```

### 2.2. 루트 디렉토리 매핑 로직

```java
String hostHeader = request.getHeader("Host");
String rootDir = config.getHosts().getOrDefault(hostHeader, defaultRootDir);
Path resolvedPath = Paths.get(rootDir).resolve(request.getPath());
```

이렇게 구현하면, 예를 들어 `test.local/index.html` 요청 시 서버는 실제로 `/www/test/index.html` 경로에서 리소스를 찾도록 동작한다.

## 3. 테스트 중 발생한 문제: HttpURLConnection의 Host 헤더 덮어쓰기

Virtual Host 기능을 구현한 후, 필자는 테스트를 위해 Java의 `HttpURLConnection`을 사용하여 `Host` 헤더를 명시적으로 설정하고자 했다. 그러나 테스트 결과, 헤더 설정 코드가 무시되고 실제 서버에는 `Host: localhost:8081`과 같은 기본 값이 전달되었다.

이는 `HttpURLConnection`이 내부적으로 URL을 기반으로 `Host` 헤더를 자동으로 설정하며, 사용자가 이를 덮어쓸 수 없도록 되어 있기 때문이다. 즉, 아래와 같은 코드로 `Host: a.com`을 명시해도 반영되지 않는다.

```java
HttpURLConnection conn = (HttpURLConnection) new URL("http://localhost:8081/Hello").openConnection();
conn.setRequestProperty("Host", "a.com"); // 무시됨
```

이로 인해 필자가 구현한 Name-based Virtual Host 라우팅의 동작을 정확히 검증할 수 없는 문제가 발생했다.

이 문제는 구현의 오류가 아닌, 테스트 방식의 제약으로 인한 것이었다. 따라서 필자는 테스트 방식을 바꾸어 문제를 해결하기로 했다.

## 4. 문제 해결: Socket을 사용한 직접 테스트

필자는 Java의 `HttpURLConnection`을 사용하여 `Host` 헤더를 테스트하려 했으나, 내부적으로 URL 기반으로 헤더가 강제로 덮어써져 원하는 동작을 검증할 수 없었다.

이 문제를 해결하기 위해 필자는 `Socket` 객체를 사용하여 직접 HTTP 요청을 조립하였다. 이렇게 하면 `Host` 헤더를 자유롭게 설정할 수 있고, 구현한 Name-based Virtual Host 라우팅의 정확성을 테스트할 수 있다.

예를 들어, 아래와 같은 방식으로 요청을 전송했다.

```java
Socket socket = new Socket("localhost", 8081);
BufferedWriter out = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream()));

out.write("GET /Hello HTTP/1.1\r\n");
out.write("Host: a.com\r\n");
out.write("Connection: close\r\n");
out.write("\r\n");
out.flush();
```

이 요청에 대해 서버가 올바른 응답을 보내는지를 검사함으로써, Host 기반 라우팅이 정상적으로 동작함을 확인할 수 있었다.

## 5. 결론

### 5.1. 회고

이번 작업을 통해 단순한 Virtual Host 기능 구현을 넘어서, 웹 서버와 HTTP 요청에 대한 근본적인 이해를 다질 수 있었다.

특히 테스트 과정에서 발생한 문제는 단순한 코드 오류가 아닌, **Java의 표준 라이브러리(HttpURLConnection)의 제약으로 인해 발생한 비직관적인 현상**이었다. 이 문제를 단순히 회피하지 않고, `Socket`을 직접 다루어 요청을 조립하고 분석하면서, 네트워크 계층의 흐름을 보다 명확히 체감할 수 있었다.

### 5.2. 정리

- `HttpURLConnection`은 테스트 용도로는 한계가 있음
- 테스트의 정확성을 위해 `Socket`을 활용한 직접적인 HTTP 요청 조립이 효과적
- 구현을 보완한 것이 아니라, 테스트 방식을 바꿔 문제를 해결함
