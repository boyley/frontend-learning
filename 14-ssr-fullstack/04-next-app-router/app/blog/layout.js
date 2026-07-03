/**
 * 博客区块的"嵌套布局"（URL 前缀：/blog/...）。
 *
 * 这是嵌套 layout 的演示：它只包裹 /blog 下的所有页面，
 * 而不影响 / 和 /about。最终渲染时，布局会层层嵌套：
 *
 *   根 layout（app/layout.js，含全站导航）
 *     └─ 博客 layout（本文件，含"博客"侧边栏标题）
 *          └─ 具体文章 page（app/blog/[slug]/page.js）
 *
 * 好处：/blog 下所有文章共享这层外壳（比如统一的栏目标题、侧边栏），
 * 在文章之间切换时这层外壳不会重新渲染。
 */
export default function BlogLayout({ children }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "140px 1fr",
        gap: 24,
      }}
    >
      <aside style={{ color: "#888", fontSize: 14 }}>
        <strong>📚 博客栏目</strong>
        <p>这块侧边栏来自 app/blog/layout.js，/blog 下所有文章共享。</p>
      </aside>
      <section>{children}</section>
    </div>
  );
}
