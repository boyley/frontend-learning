// 首页：演示【局部流式渲染】。
//
// 思路：页面里有“快内容”（能立即渲染的 header）和“慢内容”（要等 2 秒的组件）。
// 我们用 <Suspense fallback={<Skeleton/>}> 只把慢组件包起来。
// 这样服务端会：
//   1. 先把快内容 + 骨架屏 (Skeleton) 立刻推给浏览器（用户马上看到页面框架）；
//   2. 等慢组件数据好了，再把它那一块 HTML 通过同一个流“续传”过去，替换掉骨架屏。
// 好处：TTFB / FCP 更快，用户不必干等整页最慢的部分。

import { Suspense } from "react";

// 模拟一个慢的 async Server Component：内部 await 2 秒后才返回内容。
async function SlowPosts() {
  // 真实场景里这里可能是一个慢的数据库查询或第三方 API。
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const posts = [
    "为什么流式渲染能改善 TTFB / FCP",
    "Suspense 边界如何切分“快 / 慢”内容",
    "选择性水合：先到先水合",
  ];

  return (
    <ul>
      {posts.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  );
}

// 骨架屏：慢组件还没好时先占位（作为 Suspense 的 fallback）。
function Skeleton() {
  return (
    <ul>
      {[0, 1, 2].map((i) => (
        <li
          key={i}
          style={{
            height: 14,
            width: `${70 - i * 10}%`,
            background: "#eee",
            borderRadius: 4,
            listStyle: "none",
            margin: "10px 0",
          }}
        />
      ))}
      <li style={{ listStyle: "none", color: "#999", fontSize: 13 }}>
        加载中（模拟 2 秒慢取数）…
      </li>
    </ul>
  );
}

export default function Home() {
  return (
    <main>
      {/* 快内容：立即渲染、立即可见 */}
      <h1>10 · 流式渲染 / Suspense</h1>
      <p>
        这段 header 是“快内容”，会<strong>立刻</strong>显示。下面的列表是“慢内容”，
        用 <code>&lt;Suspense&gt;</code> 包裹，先显示骨架屏，2 秒后被真实内容替换。
      </p>

      <h2>慢组件（局部流式）</h2>
      {/* 慢内容：用 Suspense 包裹，fallback 先顶上，数据好了再流式替换 */}
      <Suspense fallback={<Skeleton />}>
        <SlowPosts />
      </Suspense>

      <p style={{ color: "#999", fontSize: 13, marginTop: 24 }}>
        对比：打开 <code>/blog</code> 看 <code>loading.js</code> 如何自动为整页包一层
        Suspense。
      </p>
    </main>
  );
}
