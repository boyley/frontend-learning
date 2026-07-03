import Link from "next/link";

/**
 * 关于页（URL：/about）。
 *
 * 它的存在只因为有一个文件：app/about/page.js。
 * 文件夹名 about 决定了 URL 段，page.js 决定了这个段"可被访问"。
 */
export default function AboutPage() {
  return (
    <main>
      <h1>📄 关于本示例</h1>
      <p>
        这个页面对应文件 <code>app/about/page.js</code>，URL 是{" "}
        <code>/about</code>。
      </p>
      <p>
        规律：<strong>文件夹名 = URL 段</strong>，<strong>page.js = 该段可访问</strong>。
        只有名为 <code>page.js</code> 的文件才会成为"可访问的页面"，
        其它辅助文件（如 <code>layout.js</code>、<code>loading.js</code>）不会单独成为一个 URL。
      </p>
      <p>
        <Link href="/">← 回首页</Link>
      </p>
    </main>
  );
}
