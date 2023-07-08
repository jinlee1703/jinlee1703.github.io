---
layout: post
title: Spring Security
description: >
  소프트웨어 마에스트로 14기 팀 프로젝트에서 나는 백엔드 파트를 담당하여 Spring Boot를 통한 API 서버 개발을 하게 되었다. 이번 프로젝트에서 회원가입 기능이 포함되게 되면서 Spring Security에 대해 학습의 필요성을 느끼고 이 게시글을 작성하게 되었다.
sitemap: false
hide_last_modified: true
---

---

## 정의

&nbsp; Java/Spring 기반의 어플리케이션에 대한 보안(인증 및 권한 부여) 기능을 제공하는 프레임워크이다. 서버사이드 Java EE 소스에 적용된다. Spring Security는 사용법이 복잡하고 설정이 다양하므로, 잘못 구성하면 예상치 못한 보안 취약점이 발생할 수 있다. 따라서 Spring Security를 사용할 때는 신중하게 구성하고 관리해야 한다.

## 제공하는 기능

### 인증(Authentication)

&nbsp; 사용자가 누구인지 확인하는 과정이다. 일반적으로 사용자 이름과 비밀번호를 사용하여 인증을 진행하며, Spring Security는 다양한 인증 방법을 지원한다.

### 권한 부여(Authoization or Access Control)

&nbsp; 특정 리소스에 대한 사용자의 접근 권한을 제어하는 과정이다. 예를 들어 특정 웹 페이지는 관리자만 접근 가능하도록 설정할 수 있다.

### 세션 관리

&nbsp; 사용자의 세션을 안전하게 관리한다. 예를 들어 세션 고정 공격(Session Fixation)을 방지하거나, 세션 타임아웃 기능을 제공한다.

### CSRF 공격 방어

&nbsp; CSRF(Cross-Site Request Forgery)는 웹사이트가 사용자의 세션을 무단으로 이용하는 공격 방식이다. Spring Security는 이를 방어하는 방법을 제공한다.

### HTTPS 및 SSL 지원

&nbsp; 통신 과정에서 데이터를 암호화하여 안전하게 전송하는 방법을 제공한다.
