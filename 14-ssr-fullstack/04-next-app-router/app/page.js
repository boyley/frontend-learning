import Link from "next/link";

/**
 * 首页（URL：/）。
 * 用 <Link> 提供到各页面的入口，演示"文件即路由"的映射关系。
 */
export default function HomePage() {
  return (
    <main>
      <h1>🧭 App Router / 文件系统路由</h1>
      <p>
        在 App Router 里，<strong>文件目录结构就是路由表</strong>：
        你在 <code>app/</code> 下建一个文件夹并放一个 <code>page.js</code>，
        对应的 URL 就自动出现了，无需任何手动路由配置。
      </p>

      <h2>本示例包含的路由</h2>
      <ul>
        <li>
          <Link href="/">/</Link> → <code>app/page.js</code>（当前页）
        </li>
        <li>
          <Link href="/about">/about</Link> → <code>app/about/page.js</code>
        </li>
        <li>
          <Link href="/blog/hello-world">/blog/hello-world</Link> →{" "}
          <code>app/blog/[slug]/page.js</code>（动态路由）
        </li>
        <li>
          <Link href="/blog/nextjs-routing">/blog/nextjs-routing</Link> →
          同一个 <code>[slug]</code> 文件，slug 不同
        </li>
      </ul>

      <p style={{ color: "#666", fontSize: 14 }}>
        点击顶部导航或上面的链接来回切换，注意浏览器<strong>没有整页刷新</strong>
        （这是 <code>next/link</code> 的客户端导航）。
      </p>
    </main>
  );
}
