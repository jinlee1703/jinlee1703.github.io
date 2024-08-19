---
layout: post
title: MacOS에서 MySQL 완전 삭제 및 재설치 방법
description: >
  필자는 영남대학교 멋쟁이사자처럼 12기 대표로 활동하며 아기사자들의 트러블 슈팅을 도와주던 중, MacOS 환경에서 MySQL 재설치 과정에 어려움을 겪는 아기사자를 도왔다. 이 글에서는 그 해결 과정을 상세히 기술하고자 한다.
sitemap: false
hide_last_modified: true
---

---

## 주의 사항

&nbsp; 필자는 이 글에서 MySQL을 삭제하고 재설치하는 다양한 방법을 제시하고 있다. 이는 초심자들이 MySQL 문제 해결 과정에서 여러 방법을 시도했을 가능성을 고려한 것으로, 아래에 서술된 모든 단계가 모든 사용자에게 필요하지 않을 수 있다. 각자의 상황에 맞는 방법을 선택하여 적용하기 바란다.

## MySQL 프로세스 종료하기

&nbsp; homebrew를 통해 MySQL을 설치한 경우, 다음 명령어로 MySQL 서비스를 중지한다.

```sh
brew services stop mysql
```

## MySQL 관련 파일 삭제하기

&nbsp; MySQL을 완전히 제거하기 위해 다음 단계들을 순서대로 수행한다.

### 1. Homebrew를 통한 MySQL 패키지 제거

&nbsp; 다음 명령어 중 하나를 선택하여 실행한다.

```sh
brew uninstall --force mysql
```

```sh
brew uninstall mysql --ignore-dependencies
brew remove mysql
brew cleanup
```

### 2. MySQL 관련 파일 수동 삭제

&nbsp; 먼저 MySQL 설치 경로를 확인한다.

```sh
which mysql
```

&nbsp; 그 다음, 아래 명령어들을 순서대로 실행하여 관련 파일들을 삭제한다:

```sh
sudo rm -rf /usr/local/mysql
sudo rm -rf /usr/local/bin/mysql
sudo rm -rf /usr/local/var/mysql
sudo rm -rf /usr/local/Cellar/mysql
sudo rm -rf /usr/local/mysql*
sudo rm -rf /tmp/mysql.sock.lock
sudo rm -rf /tmp/mysqlx.sock.lock
sudo rm -rf /tmp/mysql.sock
sudo rm -rf /tmp/mysqlx.sock
sudo rm ~/Library/LaunchAgents/homebrew.mxcl.mysql.plist
sudo rm -rf /Library/StartupItems/MySQLCOM
sudo rm -rf /Library/PreferencePanes/My*
```

&nbsp; 모든 파일을 삭제한 후에는 컴퓨터를 재부팅하는 것이 좋다.

## MySQL 재설치하기

&nbsp; 이제 MySQL을 새로 설치할 준비가 되었다. 다음 단계를 따라 진행한다.

### 1. Homebrew로 MySQL 설치

```sh
brew install mysql 2. MySQL 서비스 시작
```

### 2. MySQL 서비스 시작

```sh
brew services start mysql 3. root 사용자로 로그인 (초기 비밀번호 없음)
```

### 3. root 사용자로 로그인 (초기 비밀번호 없음)

```sh
mysql -uroot 4. root 비밀번호 설정
```

### 4. root 비밀번호 설정

```sh
mysql_secure_installation
```

&nbsp; 이 과정에서 VALIDATE PASSWORD PLUGIN 설치 여부를 물어볼 때는 'N'(아니오)를 선택하는 것이 좋다.

---

## 참고 자료

- [GitHub - rangyu/TIL: MySQL 완전 삭제하고 재설치하기](<https://github.com/rangyu/TIL/blob/master/mysql/MySQL-%EC%99%84%EC%A0%84-%EC%82%AD%EC%A0%9C%ED%95%98%EA%B3%A0-%EC%9E%AC%EC%84%A4%EC%B9%98%ED%95%98%EA%B8%B0-(MacOS).md>)
