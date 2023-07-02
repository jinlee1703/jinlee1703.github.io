---
layout: post
title: Git Merge 종류
description: >
  소프트웨어 마에스트로 14기 팀 프로젝트의 VCS를 Git과 GitHub를 사용하기로 결정하였는데, 백엔드 팀원과 협업하기 전, Merge 유형을 정하고 시작하면 좋을 것 같다는 생각이 들어서 본 게시글을 작성하게 되었다.
sitemap: false
hide_last_modified: true
---

---

## 작성 배경

![image](https://user-images.githubusercontent.com/68031450/250336354-2dbfac2b-424f-4527-bdbc-e455b29525f1.png)

&nbsp; 얼마 전 Squash Merge라는 것을 알게 되었고, 이에 대한 장점을 간단하게 들을 수 있는 기회가 있었다. 이를 위해 '소마 팀 프로젝트 진행 시 이를 도입하는 것이 도움이 될까?'라는 생각을 하게 되어서 이왕 알아보는 김에 Merge의 종류를 비교해보고 '우리에게 적절한 것은 무엇일까?' 생각하는 시간을 가지고자 글을 작성하게 되었다.

# 종류

## Merge

```bash
$ git merge <분기된 브랜치명>
```

- 일반적으로 가장 많이 사용되는 병합 방식
- 커밋 내역을 모두 남길 때에 사용함
- `Fast-foward`, `Recursive`로 나눌 수 있음

### Fast-forward

```bash
$ git merge develop
Updating c77ebbe..dff05fa
Fast-forward
 develop.txt | 1 +
 1 file changed, 1 insertion(+)
 create mode 100644 develop.txt
```

![image](https://user-images.githubusercontent.com/68031450/250337369-fb62b85f-9ad5-48d9-8c84-892f4bd618f6.png)

&nbsp; Merge 시 `Fast-forward`라고 나오며 병합이 완료된다. `master` 브랜치에서 분기되어 `develop`이 나왔다면 `develop`은 `master`가 가지고 있는 모든 내용을 포함하고 있으므로 추가 커밋이 생성된다면 `develop`은 `master`보다 최신 버전이라고 할 수 있다. 여기서 `master`에서 추가로 커밋이 이루어지지 않고 병합이 이루어진다면 `develop`은 `master` 내용을 모두 포함하며 추가적인 내용을 담고 있으므로 그대로 `master`와 분기된 시점 이후로 추가된 내용이 그대로 붙는다.
&nbsp; 따로 Merge 시 커밋 메시지가 발생하지 않고 커밋 순서대로 기록이 된다.

### Recursive Merge

```bash
$ git merge develop
Merge made by the 'recursive' strategy.
 develop.txt | 1 +
 1 file changed, 1 insertion(+)
 create mode 100644 develop.txt
```

![image](https://user-images.githubusercontent.com/68031450/250337781-fb690042-13b3-4d24-89b6-79465f49eff0.png)

&nbsp; Merge 시 `recursive`라고 나오며 병합이 완료된다. 이 경우도 마찬가지로 `master`에서 `develop`이 분기되어 나왔고 추가적인 기능이 `develop`에서 개발되어 커밋 되었다고 가정해보자. 여기까진 같으나 만약 `master`에서 'hotfix'와 같은 새로운 문제가 발생해 내용을 고쳐서 커밋을 한다고 생각한다면 `develop` 브랜치는 `master` 브랜치보다 최신 버전이라고 하기는 어렵다. 이 때는 `master` 브랜치와 `develop` 브랜치가 서로 다른 내용을 가지고 있으므로 이 내용을 합친 새로운 커밋 메시지를 만들어서 병합하게 된다.
&nbsp; 분기된 시점부터 베이스가 되는 브랜치에 커밋이 발생했기 때문에 병합할 때 새로운 커밋 메시지가 생기며 병합되는 것을 확인할 수 있다.

## Squash and Merge

```bash
$ git merge --squash <분기된 브랜치명>
```

![image](https://user-images.githubusercontent.com/68031450/250338042-883a3ed1-779a-4f23-8adc-df4c38602d8c.png)

&nbsp;  분기된 `develop` 브랜치에서 커밋이 이루어지고 커밋된 내용을 `master` 브랜치로 가져와 새로운 커밋을 만들어 내고 브랜치들을 없애 브랜치 커밋 명세들을 지우는 Merge 방식이다. **단 분기된 브랜치를 지우는 것은 별도 설정 혹은 직접 지워줘야 한다.**


## Rebase

```bash
$ git rebase <base 브랜치명>
$ git checkout <base 브랜치명>
$ git merge <분기된 브랜치명>
```

![image](https://user-images.githubusercontent.com/68031450/250338167-cd06acae-9baa-4278-9ab8-ce715216ad29.png)

&nbsp; 분기된 `develop` 브랜치에서 커밋이 이루어지고 커밋된 내용을 `master` 브랜치에 **rebase**를 통해 커밋 내용을 재배치하고 추가 커밋 메시지 없이 병합되는 방식이다.

# 장단점

## Merge

### 장점
- 커밋 히스토리를 그대로 유지함
    - 원래의 변경 내역을 정확하게 추적하고 이해하는데 수월함
- 병합 충돌이 발생할 경우 이를 해결하는 방법이 상대적으로 직관적임

### 단점
- 크고 복잡한 프로젝트에서는 커밋 히스토리가 복잡해질 수 있음
    - 이해하거나 네비게이션하기 어려울 수 있음
- 모든 커밋이 병합됨으로써 불필요한 중간 커밋들까지 모두 히스토리에 포함됨

## Squesh and Merge

### 장점

- 여러 커밋을 하나로 압축하여 커밋 히스토리를 단순화함
    - 히스토리를 이해하고 네비게이션하는 것을 쉽게 해줌
- 병합 대상 브랜치에는 원래의 커밋 히스토리가 그대로 유지되므로 필요할 경우 원본 커밋을 참조할 수 있음
- 충돌 위험 감소?
- 현업에서 많이 사용한다고 함 => 개발 조직 규모가 큰 경우에 적합한 것으로 보임

### 단점
- 개별 커밋에 대한 정보를 잃어버림
    - 문제를 디버깅하거나 특정 변경 사항을 추적하는 데 어려움을 줄 수 있음
- 또한, 병합 충돌이 발생하는 경우, 이를 해결하는 것이 일반적인 병합보다 복잡할 수 있음


## Rebase and Merge

### 장점
- 원래 브랜치의 커밋 히스토리를 유지하면서 대상 브랜치의 최신 변경 사항을 반영할 수 있음
    - 커밋 히스토리를 선형적으로 유지하면서도 변경 사항을 최신 상태로 유지하는 데 유용함

### 단점
- 커밋 히스토리를 재작성하므로 다른 사람들이 동일한 브랜치를 사용하고 있다면 문제가 될 수 있음
- 병합 충돌이 발생하는 경우, 이를 해결하는 것이 일반적인 병합보다 복잡할 수 있음
    - 커밋당 한 번씩 충돌을 해결해야 할 수도 있음

--- 

# Reference

- [https://mangchhe.github.io/git/2021/09/04/GitMerge/](https://mangchhe.github.io/git/2021/09/04/GitMerge/)