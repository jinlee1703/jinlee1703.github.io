---
layout: post
title: 무결성(Integrity)과 Relationship
description: >
  본 게시글은 소프트웨어 마에스트로 과정에서 김태완 멘토님의 특강을 듣고 내용을 보충하여 작성한 내용입니다.
sitemap: false
hide_last_modified: true
---

---

## 무결성(Integrity)

- 데이터의 갱신으로부터 데이터를 보호하여, 정확성, 유효성 일관성, 안정성을 유지하려는 성질
- 무결성의 유형
  - 영역 무결성 : 속성 값은 원자성을 가지며 해당 도메인에서 정의된 값이어야 함
  - 키 무결성 : 데이터의 모든 레코드는 서로 식별 가능해야 함
  - 엔티티 무결성 : 기본키는 반드시 유일한 값을 가져야 하며 Null이 될 수 없음
  - 참조 무결성 : 외래키는 Null이거나 외래키가 참조하는 테이블의 기본키에 존재해야 함
  - 사용자 정의 무결 : 특정한 업무의 규칙

### 참조 무결성 : Not Null or Nullable

- Madatory(필수) or Optional(선택)
- 관계가 필수적일 때는 Mandatory => Not Null
- 관계가 끊어질 수 있을 경우에는 Optional => Nullable

## Reference

- [http://taewan.kim](http://taewan.kim)
