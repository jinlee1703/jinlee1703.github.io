# jinlee.kr

개발자 이진우의 기술 블로그. Next.js(App Router) 정적 사이트로 GitHub Pages에 배포됩니다.

## 스택

- **Next.js 15** (App Router, 정적 export)
- **TypeScript** + **Tailwind CSS**
- 마크다운 렌더: remark / rehype (GFM, 콜아웃, Shiki 코드 하이라이트, 목차)
- 배포: GitHub Actions → GitHub Pages (커스텀 도메인 `jinlee.kr`)

## 개발

```bash
npm install
npm run dev      # 개발 서버 (http://localhost:3000)
npm test         # 단위 테스트 (vitest)
npm run build    # 정적 빌드 → out/
```

## 글 작성

`content/posts/{category}/{YYYY-MM-DD-slug}.md` 에 마크다운으로 추가합니다.

```markdown
---
title: 글 제목
date: 2026-01-01
category: web
description: 한 줄 요약
---

본문...
```

- `published: false` 를 넣으면 목록/배포에서 제외됩니다.
- 이미지는 `public/assets/img/...` 에 두고 `/assets/img/...` 로 참조합니다.

## 배포

`main` 브랜치에 push하면 GitHub Actions가 테스트 → 빌드 → 배포를 수행합니다.
