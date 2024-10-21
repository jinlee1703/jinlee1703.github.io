---
layout: post
title: Conventional Commits와 Husky로 일관된 커밋 메시지 관리하기
description: >
  프로젝트를 진행하면서 보다 일관된 커밋 메시지 설정을 통해 팀원 간 문맥 이해력 향상을 통한 커뮤니케이션 비용 감소를 위해 고민하던 중, 지난 프로젝트에서 설정한 Conventioanl Commit을 설정하는 것이 떠올랐고 이를 게시글로 작성하기로 하였다.
sitemap: false
hide_last_modified: false
---

---

## 서론

&nbsp;프로젝트를 진행하다 보면 일관된 커밋 메시지의 중요성을 느낄 때가 있다. 오늘은 Conventional Commits 규칙을 적용하고, Husky를 사용하여 이를 자동으로 강제하는 방법에 대해 알아보자.

## Conventional Commits란?

&nbsp;Conventional Commits는 커밋 메시지에 사용자와 기계 모두가 이해할 수 있는 의미를 부여하기 위한 규격이다. 이를 통해 커밋 히스토리를 쉽게 탐색하고, 자동화된 도구를 사용할 수 있게 된다.

## Husky란?

&nbsp;Husky는 Git hooks를 쉽게 관리할 수 있게 해주는 도구이다. 이를 통해 커밋이나 푸시 전에 특정 스크립트를 실행하도록 설정할 수 있다.

## 설정 방법

### 1. 패키지 설치

&nbsp;먼저 필요한 패키지들을 설치한다.

```bash
# commitlint 관련 패키지 설치
npm install --save-dev commitlint-plugin-function-rules @commitlint/cli @commitlint/config-conventional

# husky 설치
npx husky-init && npm install
```

### 2. commitlint 설정

&nbsp;프로젝트 루트에 `commitlint.config.js` 파일을 생성하고 다음과 같이 작성한다:

```javascript
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-empty": [2, "always"],
    "header-max-length": [2, "always", 100],
    "body-max-line-length": [2, "always", 100],
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "docs", "rename", "style", "refactor", "test", "chore"],
    ],
  },
};
```

&nbsp;이 설정은 다음과 같은 규칙을 적용한다:

- 스코프는 사용하지 않는다.
- 헤더와 본문의 각 줄은 최대 100자로 제한한다.
- 커밋 타입은 지정된 값만 사용할 수 있다.

### 3. Husky 설정

&nbsp;Husky를 사용하여 커밋 메시지를 검사하도록 설정한다.

```bash
npx husky add .husky/commit-msg 'npx --no-install commitlint --edit $1'
```

&nbsp;이 명령은 커밋 메시지가 작성될 때마다 commitlint를 실행하여 메시지를 검사한다.

## 마치며

&nbsp;이제 Conventional Commits 규칙을 따르지 않는 커밋은 자동으로 거부될 것이다. 이를 통해 프로젝트의 커밋 히스토리를 일관되게 유지할 수 있으며, 변경사항을 더 쉽게 추적하고 이해할 수 있게 된다.

&nbsp;Conventional Commits와 Husky를 활용하여 프로젝트 관리를 한 단계 업그레이드 해보자!

---

이렇게 각 문단 앞에 '&nbsp;'를 추가하였습니다. 이 방법은 HTML에서 각 문단의 첫 줄에 들여쓰기 효과를 주는데 사용됩니다. 웹 페이지에서 이 글을 표시할 때 각 문단의 시작 부분에 약간의 공백이 생기게 될 것입니다. 필요에 따라 추가적인 수정이나 형식 변경을 할 수 있습니다.
