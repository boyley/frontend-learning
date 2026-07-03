import Link from "next/link";

/**
 * 根布局。除了必备的 <html><body>，这里还放了一个全站共享的顶部导航。
 *
 * 关键点：根 layout 会"包裹所有页面"，所以放在这里的导航条在每个页面都可见，
 * 且在页面之间切换时"不会重新渲染"—— 这就是 layout 的意义：
 * 共享 UI + 跨页面保留状态。
 *
 * <Link> 来自 next/link，用于"客户端导航"：点击时不整页刷新，
 * 而是由 Next 在前端拉取目标页面并局部更新，体验接近单页应用（SPA）。
 */
export const metadata = {
  title: "04 · App Router 路由",
  description: "文件系统路由 / 嵌套 layout / 动态路由演示",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          maxWidth: 760,
          margin: "40px auto",
          padding: "0 16px",
          lineHeight: 1.7,
        }}
      >
        <nav
          style={{
            display: "flex",
            gap: 16,
            paddingBottom: 12,
            borderBottom: "1px solid #eee",
            marginBottom: 24,
          }}
        >
          <Link href="/">首页</Link>
          <Link href="/about">关于</Link>
          <Link href="/blog/hello-world">博客: hello-world</Link>
          <Link href="/blog/nextjs-routing">博客: nextjs-routing</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
