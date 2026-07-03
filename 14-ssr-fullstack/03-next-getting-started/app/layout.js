/**
 * 根布局（Root Layout）。
 *
 * App Router 约定：app/layout.js 是整个应用的"根布局"，必须存在，
 * 并且必须返回包含 <html> 和 <body> 的结构 —— 这两个标签由你来渲染，
 * Next 不会替你补。所有页面（page.js）都会作为 children 塞进这里。
 *
 * layout 默认是 Server Component（服务端组件）：在服务器上执行、
 * 生成 HTML，不会把自身的 JS 打包发到浏览器。
 *
 * metadata 是 App Router 内置的 SEO 元数据 API，Next 会据此生成
 * <title> 和 <meta> 标签。
 */
export const metadata = {
  title: "03 · 第一个 Next.js 应用",
  description: "最小可运行的 Next.js App Router 示例",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          maxWidth: 720,
          margin: "40px auto",
          padding: "0 16px",
          lineHeight: 1.7,
        }}
      >
        {children}
      </body>
    </html>
  );
}
