// 根布局：必须返回 <html> 与 <body>。
export const metadata = {
  title: "07 · Next Route Handlers（API 路由）",
  description: "用 route.js 实现最小 REST 接口，前端 Client Component 调用",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          maxWidth: 640,
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
