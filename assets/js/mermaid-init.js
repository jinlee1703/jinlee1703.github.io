document.addEventListener('DOMContentLoaded', function() {
  // 페이지가 완전히 로드된 후 Mermaid 초기화
  mermaid.initialize({ 
    startOnLoad: true,
    theme: 'default'
  });
  
  // 클래스 선택자를 사용하여 모든 Mermaid 다이어그램 렌더링
  var elements = document.querySelectorAll('.language-mermaid');
  elements.forEach(function(element) {
    // 이미 렌더링된 요소는 건너뛰기
    if (!element.classList.contains('mermaid')) {
      element.classList.add('mermaid');
      // Mermaid가 이 요소를 다시 처리하도록 설정
      window.mermaid.init(undefined, element);
    }
  });
});

// SPA나 동적 콘텐츠 로드에 대응하기 위한 MutationObserver 설정
document.addEventListener('DOMContentLoaded', function() {
  // 새 콘텐츠가 추가될 때 mermaid 다이어그램 초기화
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes && mutation.addedNodes.length > 0) {
        // 새 노드에서 mermaid 다이어그램 찾기
        var newElements = document.querySelectorAll('.language-mermaid:not(.mermaid)');
        if (newElements.length > 0) {
          newElements.forEach(function(element) {
            element.classList.add('mermaid');
            window.mermaid.init(undefined, element);
          });
        }
      }
    });
  });
  
  // 문서 전체를 관찰
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});
