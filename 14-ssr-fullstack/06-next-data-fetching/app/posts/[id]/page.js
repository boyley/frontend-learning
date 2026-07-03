// 动态路由页面：app/posts/[id]/page.js
// URL 形如 /posts/1、/posts/2 ... 其中 [id] 是动态段。
//
// 配合下面的 generateStaticParams()，Next 会在 next build 阶段
// 把这些 id 对应的页面【预渲染成静态 HTML】(SSG)，访问时直接返回静态文件，极快。

// generateStaticParams：在构建时告诉 Next 要为哪些参数生成静态页面。
// 返回一个数组，每个元素对应一个 [id] 的取值。
// 这里我们把 1~5 全部预生成；构建日志里能看到这些路由被标记为静态(●)。
export async function generateStaticParams() {
  return [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }, { id: "5" }];
}

// 注意：动态段参数 params 在 Next 16 里是异步的，需要 await。
export default async function PostPage({ params }) {
  const { id } = await params;

  // 用 force-cache（构建时缓存）取单条数据，让页面能在构建时静态生成。
  const res = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${id}`,
    { cache: "force-cache" }
  );
  const post = await res.json();

  return (
    <main>
      <p>
        <a href="/">← 返回首页</a>
      </p>
      <h1>Post #{post.id}</h1>
      <h2 style={{ color: "#444" }}>{post.title}</h2>
      <p>{post.body}</p>
      <p style={{ color: "#999", fontSize: 13 }}>
        本页由 generateStaticParams() 在构建时预渲染为静态 HTML（SSG）。
      </p>
    </main>
  );
}
