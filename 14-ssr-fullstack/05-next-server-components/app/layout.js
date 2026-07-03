export const metadata = {
  title: "05 · React Server Components",
  description: "Server / Client 组件的区别、'use client' 边界与组合",
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
        {children}
      </body>
    </html>
  );
}
