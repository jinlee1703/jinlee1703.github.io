---
layout: post
title: Rust SQLx의 오프라인 모드를 활용한 데이터베이스 없이 빌드하기
description: >
  k8s 실습을 위해 Rust로 api server를 구축하였고, 이를 Docker로 빌드 하는 과정에서 오류가 발생하였다. 필자와 같은 Rust 초보가 겪을 수 있는 상황에 대해 정리해둠으로써 도움을 주고자 게시글을 작성하게 되었다.
sitemap: false
hide_last_modified: false
---

---

## 작성 배경

최근 Rust 프로젝트에서 SQLx를 사용하던 중 흥미로운 문제에 직면했다. CI/CD 환경에서 빌드를 시도했는데, 다음과 같은 오류가 발생했다.

```bash
error: Failed to prepare query: error sending request for url (https://api.github.com/repos/launchbadge/sqlx/releases/latest): error trying to connect: dns error: failed to lookup address information: Temporary failure in name resolution
--> src/main.rs:10:39
  |
10 | let users = sqlx::query!("SELECT * FROM users").fetch_all(&pool).await?;
  |                                       ^^^^^^^

error: `sqlx` requires the `offline` feature to work without a database connection
```

이 오류는 SQLx가 컴파일 시점에 SQL 쿼리의 유효성을 검사하려고 시도하지만, 데이터베이스에 연결할 수 없어서 발생한 것이다. 이 문제를 해결하기 위해 SQLx의 오프라인 모드를 사용하게 되었고, 그 과정에서 배운 내용을 공유하고자 한다.

## SQLx 오프라인 모드란?

&nbsp; 오프라인 모드를 사용하면 실제 데이터베이스 연결 없이도 SQLx 프로젝트를 빌드할 수 있다. 이는 `sqlx-data.json`이라는 특별한 파일을 사용하여 가능해진다.

## sqlx-data.json 파일

&nbsp; `sqlx-data.json` 파일은 프로젝트의 모든 SQL 쿼리에 대한 메타데이터를 포함하고 있다. 이 파일은 수동으로 작성하는 것이 아니라 SQLx CLI를 통해 자동으로 생성해야 한다.

### sqlx-data.json 생성 방법

&nbsp; 다음 단계를 따라 `sqlx-data.json` 파일을 생성한다:

#### 1. SQLx CLI 설치

```bash
cargo install sqlx-cli
```

#### 2. 데이터베이스 연결 설정

&nbsp; `.env` 파일에 다음과 같이 `DATABASE_URL`을 설정한다.

```
DATABASE_URL=mysql://username:password@localhost/dbname
```

#### 3. sqlx-data.json 파일 생성

```bash
cargo sqlx prepare
```

&nbsp; 이 명령을 실행하면 프로젝트의 모든 SQL 쿼리가 분석되어 `sqlx-data.json` 파일이 생성된다.

#### 3. Cargo.toml 설정

&nbsp; 오프라인 모드를 사용하기 위해 `Cargo.toml` 파일의 SQLx 의존성에 "offline" 기능을 추가한다.

```toml
[dependencies]
sqlx = { version = "0.6", features = ["runtime-actix-native-tls", "mysql", "offline"] }
```

## 오프라인 모드의 장점

&nbsp; 이 방식을 적용한 후 다음과 같은 이점을 가질 수 있다.

1. CI/CD 환경에서 데이터베이스 연결 없이 빌드가 가능해진다.
2. Docker 이미지 빌드 시 별도의 데이터베이스 설정이 필요 없어진다.
3. 컴파일 시간 SQL 검증 기능을 그대로 유지할 수 있다.

## 주의사항

&nbsp; 오프라인 모드를 사용하면서 몇 가지 주의해야 할 점을 숙지하자.

- SQL 쿼리를 변경할 때마다 `cargo sqlx prepare` 명령을 실행하여 `sqlx-data.json` 파일을 업데이트해야 한다.
- `sqlx-data.json` 파일은 반드시 버전 관리 시스템(예: Git)에 포함시켜야 한다.
- 실제 실행 시에는 여전히 올바른 데이터베이스 연결 정보가 필요하다.

---

## 추가 해결 방법: SQLx 버전 일치 및 `sqlx-data.json` 관리

&nbsp; 프로젝트에서 `cargo sqlx prepare` 명령어 실행 시 "no queries found" 오류를 경험했다. 이 문제를 해결하는 과정에서 발견한 추가적인 해결 방법을 공유하고자 한다. 이 방법은 특히 SQLx 버전 0.6.x를 사용하는 프로젝트에 효과적이다.

### 1. SQLx 라이브러리와 CLI 버전 일치시키기:

&nbsp; 먼저, 프로젝트에서 사용 중인 SQLx 버전과 정확히 일치하는 SQLx CLI를 설치해야 한다. 필자의 경우 SQLx 0.6 버전을 사용하고 있었다.

```bash
cargo install --version 0.6 sqlx-cli
```

### 2. `cargo sqlx prepare` 실행:

&nbsp; 버전을 일치시킨 후, 다음 명령어를 실행한다.

```bash
cargo sqlx prepare -- --bin <프로젝트_이름>
```

### 3. `sqlx-data.json` 파일 확인:

이 명령이 성공적으로 실행되면, 프로젝트 루트 디렉토리에 `sqlx-data.json` 파일이 생성된다. 필자의 경우, 이 파일이 정상적으로 생성되었음을 확인할 수 있었다.

### 4. 버전 관리에 추가:

&nbsp; 생성된 `sqlx-data.json` 파일을 Git에 추가한다.

```bash
git add sqlx-data.json
git commit -m "SQLx 준비된 쿼리 데이터 추가"
```

### 5. 파일 위치 관리:

&nbsp; `sqlx-data.json` 파일은 기본적으로 프로젝트 루트에 위치한다. 처음에는 이 위치가 이상하다고 생각했지만, 이는 많은 프로젝트에서 일반적인 관행임을 알게 되었다. 별도의 `sqlx` 폴더는 필수적이지 않으나, 프로젝트 구조를 더 체계적으로 관리하고 싶다면 생성할 수 있다.

### 6. 주기적인 업데이트:

&nbsp; 데이터베이스 스키마나 쿼리가 변경될 때마다 `cargo sqlx prepare` 명령을 다시 실행하고, 변경된 `sqlx-data.json` 파일을 커밋해야 한다.

&nbsp; 이 방법을 통해 SQLx의 오프라인 모드 설정을 완료할 수 있었고, 데이터베이스 연결 없이도 프로젝트를 빌드하고 테스트할 수 있게 되었다. "no queries found" 오류도 해결되어 프로젝트를 원활하게 진행할 수 있게 되었다.

&nbsp; 추가로, 필자가 겪었던 구체적인 오류 메시지는 다음과 같았다.

```bash
Error: no sql queries found. Did you forget to run `cargo sqlx prepare`?
```

&nbsp; 이 오류는 SQLx가 준비된 쿼리 정보를 찾지 못했을 때 발생한다. 위의 해결 방법을 따라 `sqlx-data.json` 파일을 생성하고 관리함으로써 이 문제를 해결할 수 있었다.

&nbsp; 이렇게 수정된 내용은 개인적인 경험을 바탕으로 하며, 실제 겪은 오류와 그 해결 과정을 더 자세히 설명하고 있다. 이를 통해 독자들이 유사한 문제에 직면했을 때 더 쉽게 해결할 수 있을 것이다.

## 결론

&nbsp; SQLx의 오프라인 모드는 처음에 겪었던 빌드 문제를 효과적으로 해결해 준다. 데이터베이스 연결 없이 프로젝트를 빌드해야 하는 상황에서 매우 유용하며, `sqlx-data.json` 파일을 통해 컴파일 시간 SQL 검증의 이점을 유지하면서도 빌드 프로세스를 더욱 유연하게 만들 수 있다. 이 경험을 통해 SQLx의 강력한 기능을 더욱 효과적으로 활용할 수 있게 된다.
