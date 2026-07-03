// 根布局：App Router 里每个应用必须有一个 app/layout.js。
// 它必须返回完整的 <html> 与 <body> 标签，children 是当前路由渲染出的页面。
export const metadata = {
  title: "06 · Next 数据获取 / 缓存 / SSG / ISR",
  description: "演示 Next.js App Router 三种 fetch 缓存策略与静态生成",
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
        {children}
      </body>
    </html>
  );
}
