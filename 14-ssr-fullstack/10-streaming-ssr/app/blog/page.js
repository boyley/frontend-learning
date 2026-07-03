// /blog 页面：演示【整页流式渲染】。
//
// 这个页面组件本身是一个「慢的」async Server Component——顶部直接 await 2 秒
// （模拟一次慢的数据库 / API 取数）。因为同目录下有 loading.js，Next 会自动：
//   1. 请求一到，立刻把 loading.js 的骨架屏 HTML 流给浏览器（用户马上有反馈）；
//   2. 这里的 await 完成、页面渲染好后，再把真实 HTML 续传过去替换骨架屏。
//
// 无需在本文件里手写任何 <Suspense>——这正是 loading.js 约定的价值。
export default async function BlogPage() {
  // 模拟慢取数：整页最慢的部分就是它。
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const articles = [
    { title: "流式 SSR 是怎么把 HTML 分块推送的", date: "2026-07-01" },
    { title: "loading.js 与手写 Suspense 的区别", date: "2026-06-28" },
    { title: "选择性水合：为什么慢组件不拖慢整页交互", date: "2026-06-20" },
    { title: "TTFB / FCP / TTI 在流式渲染下如何变化", date: "2026-06-15" },
  ];

  return (
    <main>
      <h1>/blog 文章列表</h1>
      <p>
        本页组件自身就是慢的（顶部 <code>await 2s</code>）。由于同目录有{" "}
        <code>loading.js</code>，你先看到的是整页骨架屏，2 秒后被下面真实列表替换。
      </p>
      <ul>
        {articles.map((a, i) => (
          <li key={i}>
            {a.title} <span style={{ color: "#999", fontSize: 13 }}>· {a.date}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
