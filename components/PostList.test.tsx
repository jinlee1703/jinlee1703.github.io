import { renderToStaticMarkup } from "react-dom/server";
import PostList, { type PostListItem } from "./PostList";

function makePosts(n: number): PostListItem[] {
  return Array.from({ length: n }, (_, i) => ({
    slug: `2026-01-01-post-${i}`,
    title: `글 ${i}`,
    date: "2026-01-01",
    category: i % 2 === 0 ? "web" : "devops",
    description: "",
  }));
}

const categories = [
  { name: "web", count: 13 },
  { name: "devops", count: 12 },
];

describe("PostList", () => {
  it("첫 화면 HTML에 모든 글 링크를 담아 크롤러가 찾을 수 있게 한다", () => {
    const html = renderToStaticMarkup(
      <PostList posts={makePosts(25)} categories={categories} />,
    );

    for (let i = 0; i < 25; i++) {
      const category = i % 2 === 0 ? "web" : "devops";
      expect(html).toMatch(new RegExp(`href="/${category}/2026-01-01-post-${i}/?"`));
    }
  });

  it("21번째 글부터는 숨겨 두고 스크롤할 때 보여준다", () => {
    const html = renderToStaticMarkup(
      <PostList posts={makePosts(25)} categories={categories} />,
    );

    expect(html.match(/<li hidden="">/g)).toHaveLength(5);
  });

  it("카테고리 필터를 카테고리 페이지 링크로 렌더링한다", () => {
    const html = renderToStaticMarkup(
      <PostList posts={makePosts(25)} categories={categories} />,
    );

    expect(html).toMatch(/href="\/web\/?"/);
    expect(html).toMatch(/href="\/devops\/?"/);
  });
});
