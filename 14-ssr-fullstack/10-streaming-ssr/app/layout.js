// 根布局：必须返回 <html> 与 <body>。
import Link from "next/link";

export const metadata = {
  title: "10 · 流式渲染 / Suspense",
  description: "用 Suspense 和 loading.js 演示 Next.js 流式 SSR",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          maxWidth: 720,
          margin: "0 auto",
          padding: "24px 16px",
          lineHeight: 1.6,
          color: "#222",
        }}
      >
        <nav style={{ marginBottom: 16, fontSize: 14 }}>
          <Link href="/">首页（Suspense 局部流式）</Link>
          {" · "}
          <Link href="/blog">/blog（loading.js 整页流式）</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
