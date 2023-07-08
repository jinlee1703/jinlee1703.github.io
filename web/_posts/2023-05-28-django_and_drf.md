---
layout: post
title: Django & DRF(Django REST Framework)
description: >
  본 글은 영남대학교 멋쟁이사자처럼을 위해 별도 학습 후 작성한 노션 문서를 이전한 글입니다.
sitemap: false
hide_last_modified: true
---

---

## 정의

파이썬으로 작성된 웹 어플리케이션 개발 프레임워크

### 웹 프레임워크란

웹 프로그램을 위해 쿠키 및 세션 처리, 로그인/로그아웃 처리, 권한 처리, 데이터베이스 처리 등 만들어야 할 기능이 매우 많다. 하지만 웹 프레임워크를 사용하여 이러한 기능들을 개발자가 일일이 만들 필요 없이 프레임워크에 구현된 기능을 익혀 사용할 수 있다. 쉽게 말해 `‘웹 프로그램을 만들기 위한 스터티 키트’`라고 생각해도 좋을 것이다. 그리고 파이썬으로 만들어진 웹 프레임워크 중 하나가 **장고**이다.

## 특징

- MVC(Model-View-Controller) 아키텍처 패턴을 기반으로 함
- 데이터베읏 모델링, URL 라우팅, 뷰 로직 작성, 사용자 인증 및 권한 관리 등을 지원함
- 템플릿 시스템을 사용하여 웹 페이지를 동적으로 렌더링 할 수 있음
- 폼 처리, 세션 관리, 캐싱 등 다양한 기능 제공
- 강력한 보안 기능과 함께 개발자 친화적인 문법과 API를 제공하여 생산성을 높이고 개발 시간을 단축시킬 수 있음
- 많은 대규모 웹 사이트와 애플리케이션에서 사용되고 있으며, 커뮤니티와 문서화도 잘 되어 있어 학습과 지원이 용이

# 파이썬 설치하기

### 파이썬 다운로드

[Download Python](https://www.python.org/downloads/)

# 가상환경

### 가상환경이란

파이썬 프로젝트 진행 시 독립된 환경을 만들어주는 도구

- ex) 파이썬 개발자 A가 2개의 장고 프로젝트(P1, P2)를 개발하고 관리할 때
  - P1과 P2에서 필요한 장고의 버전이 다를 수 있음
    - P1에서는 장고 3.1, P2에서는 4.0 버전이 필요
  - 이 때 가상환경을 통해 하나의 PC에 서로 다른 버전의 파이썬과 라이브러리를 쉽게 설치해 사용할 수 있음

### 가상환경 만들기

```bash
# 가상환경 생성 : 파이썬 모듈 중 venv라는 모듈을 사용한다는 의미
python -m venv 가상환경_이름

# 가상환경 실행
cd 가상환경_이름
activate

# 가상환경 종료
deactivate
```

# Django 시작하기

## Django 설치

```python
pip install Django
```

## 프로젝트

### 프로젝트란

- 장고에서 `프로젝트는 하나의 웹 사이트`라고 생각하면 됨
  - 장고 **프로젝트 생성 시 한 개의 웹 사이트를 생성하는 것**과 같음
  - **프로젝트 안에는 여러개의 앱이 존재**
    - 앱들이 모여 웹 사이트를 구성
    - 앱이란 관리자 앱, 인증 앱 등과 같이 장고가 기본으로 제공하는 앱과 개발자가 직접 만든 앱으로 구분
- 장고에서 말하는 앱은 일반적으로 우리가 아는 안드로이드 혹은 iOS 앱과 다른 의미
  - 안드로이드 앱이 하나의 프로그램이라면, 장고의 앱은 프로젝트를 구성하는 작은 단위의 기능

### 프로젝트 만들기

- Django project를 구성하는 코드를 자동 생성
  - 데이터베이스 설정
  - Django를 위한 옵션들
  - 어플리케이션을 위한 설정
  ```python
  django-admin startproject mysite
  ```

## URL과 뷰

### 앱(App)

- 프로젝트 단독으로는 아무런 일도 할 수 없음
- 프로젝트에 기능을 추가하기 위해서 앱을 생성해야 함

### 앱 만들기

```bash
django-admin startapp 앱_이름
```

### 장고 로컬서버 실행

```bash
manage.py runserver
```

### URL 매핑

```python
# urls.py
from django.contrib import admin
from django.urls import path

from 앱_이름 import views

urlpatterns = [
  path('admin/', admin.site.urls),
  path('앱_이름/', views.index),    # 추가(views.index는 views.py 파일의 index 함수를 의미)
]
```

### View 작성

```python
# views.py
from django.http import HttpResponse

def index(request):
    return HttpResponse("안녕하세요 pybo에 오신것을 환영합니다.")
```

- **HttpResponse는 요청에 대한 응답을 할때 사용**
  - 여기서는 "안녕하세요 pybo에 오신것을 환영합니다." 라는 문자열을 브라우저에 출력하기 위해 사용됨
- index 함수의 매개변수 **request는 HTTP 요청 객체**

### URL 분리

```python
# config/urls.py
from django.contrib import admin
from django.urls import path, include
~~from 앱_이름 import views~~  # 더 이상 필요하지 않으므로 삭제

urlpatterns = [
    path('admin/', admin.site.urls),
    path('앱_이름/', **include('앱_이름.urls')**),
]

# 앱_이름/urls.py
from django.urls import path

from . import views

urlpatterns = [
    path('', views.index),
]
```

# 모델

## 마이그레이션

### 장고 앱 migrate

```bash
python manage.py migrate
```

- **데이터베이스가 필요한 앱의 경우에만 migrate가 필요함**
- 해당 명령어를 통해 앱들이 필요로 하는 데이터베이스 테이블들을 생성할 수 있음

### makemigrations

```bash
python manage.py makemigrations
```

- 모델이 신규로 생성되거나 변경되면 makemigrations 명령 먼저 수행 후 migrate 명령을 수행해야함

## ORM

### 정의

- 전통적으로 데이터베이스를 사용하는 프로그램들은 데이터베이스의 데이터를 조회하거나 저장하기 위해 쿼리문을 사용해야 했음
  - 개발자마다 다양한 쿼리문이 만들어지고, 잘못 작성된 쿼리는 시스템의 성능을 저하시킬 수 있음
  - 데이터베이스 변경(ex: MySQL → Oracle) 시 프로그램에서 사용한 쿼리문을 모두 해당 데이터베이스의 규칙에 맞게 수정해야 함
- **ORM을 사용하여 데이터베이스의 테이블을 모델화하여 사용할 수 있음**
  - SQL 방식의 단점이 사라짐
  - 개발자별로 독특한 쿼리문이 만들어지지 않음
  - 쿼리를 잘못 작성할 가능성도 낮아짐
  - 데이터베이스 종류 변경 시 프로그램을 수정할 필요 없음(쿼리문이 아닌 모델을 사용하기 때문)

# DRF (Django REST Framework)

## 정의

- Django 기반의 강력한 웹 API 개발 프레임워크
- Django에서 RESTful한 웹 서비스를 쉽게 구축하고 관리할 수 있도록 도와줌
- Django의 기능을 확장하여 API 개발에 필요한 다양한 기능 제공
- 몇 줄의 코드로 모델 시리얼라이저, URL 라우팅, 뷰 로직, 인증, 권한 부여, 요청 및 응답 처리 등을 구현할 수 있음
- 개발자는 복잡한 API 개발 작업을 간소화하고 생산성을 높일 수 있음

## 주요 기능 및 특징

### 시리얼라이저(Serializer)

- Django 모델을 JSON, XML 등의 형식으로 직렬화 및 역직렬화하는 기능 제공
- 데이터의 직렬화, 유효성 검사, 데이터 업데이트 등을 간편하게 처리할 수 있음

### 뷰(View)

- API 요청을 처리하고 응답을 생성하는 뷰 제공
- 함수 기반 뷰와 클래스 기반 뷰를 모두 지원
- 다양한 뷰 데코레이터와 믹스인을 활용하여 코드를 재사용하고 기능을 확장할 수 있음

### URL 라우팅

- URL 패턴을 정의하여 요청을 적절한 뷰로 매핑하는 URL 라우팅 기능 제공
- API 엔드포인트를 쉽게 구성하고 관리할 수 있음

### 인증과 권한 부여

- 다양한 인증 및 권한 부여 방식 지원
- 토큰 기반 인증, 세션 인증, OAuth 인증 등을 사용하여 API 엑세스를 제어할 수 있음

### 다양한 기능과 유틸리티

- 페이징, 필터링, 정렬, 검색, 캐싱 등 다양한 기능과 유틸리티를 제공
- API의 성능과 확장성을 개선할 수 있음

---

# Reference

## Django

- [Django wikidocs](https://wikidocs.net/78328)

## DRF

- [Django REST Framework](https://www.django-rest-framework.org)
