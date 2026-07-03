// loading.js —— App Router 的【约定文件】。
//
// 只要某个路由段目录下有 loading.js，Next 就会【自动】用它把该段的 page
// 包在一个 <Suspense fallback={<Loading/>}> 里。你不用手写 Suspense：
//   - 页面（可能是慢的 async Server Component）还在服务端取数时，
//     浏览器先收到这个 Loading 界面（整页级骨架屏）；
//   - 数据好了，真实页面 HTML 再通过同一个流「续传」过来替换掉它。
//
// 对比首页 app/page.js：那里是【手动】用 <Suspense> 只包住页面里的“慢的一块”，
// 做的是【局部】流式；这里 loading.js 做的是【整页】流式。
export default function Loading() {
  return (
    <main>
      <h1>/blog 文章列表</h1>
      <p style={{ color: "#999" }}>正在加载文章（loading.js 自动包裹的整页骨架屏）…</p>
      <ul>
        {[0, 1, 2, 3].map((i) => (
          <li
            key={i}
            style={{
              height: 14,
              width: `${80 - i * 12}%`,
              background: "#eee",
              borderRadius: 4,
              listStyle: "none",
              margin: "12px 0",
            }}
          />
        ))}
      </ul>
    </main>
  );
}
