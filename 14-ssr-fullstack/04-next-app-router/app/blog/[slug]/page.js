import Link from "next/link";

/**
 * 博客文章页 —— 动态路由（URL：/blog/任意值）。
 *
 * 文件夹名用方括号 [slug]，表示这是一个"动态段"：
 *   /blog/hello-world   → slug = "hello-world"
 *   /blog/nextjs-routing → slug = "nextjs-routing"
 * 一个文件即可匹配无数篇文章的 URL，而不用为每篇文章建一个文件。
 *
 * ⚠️ Next.js 16 里 params 是一个 Promise，必须先 await 再解构。
 * 所以这个组件被写成 async 函数（服务端组件天然支持 async）。
 */
export default async function BlogPostPage({ params }) {
  // 关键：await params 之后才能拿到 slug
  const { slug } = await params;

  return (
    <main>
      <h1>📝 文章：{slug}</h1>
      <p>
        当前 URL 里的动态段 <code>slug</code> 的值是：
        <strong style={{ fontFamily: "monospace" }}> {slug}</strong>
      </p>
      <p>
        这个页面对应文件 <code>app/blog/[slug]/page.js</code>。
        方括号 <code>[slug]</code> 表示动态段，一个文件就能匹配{" "}
        <code>/blog/任意值</code>。
      </p>
      <p style={{ color: "#666", fontSize: 14 }}>
        试试把地址栏改成 <code>/blog/随便什么词</code>，页面会读取新的 slug。
      </p>
      <p>
        <Link href="/">← 回首页</Link>
      </p>
    </main>
  );
}
