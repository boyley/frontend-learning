/**
 * 首页（对应 URL：/）。
 *
 * app/page.js 默认就是 Server Component（服务端组件）：
 * 这段函数体是在"服务器上、每次请求时"执行的，而不是在浏览器里。
 *
 * 下面这行 new Date().toISOString() 就是最直接的证明：
 * 它取的是"服务器当前时间"。你每刷新一次页面，服务器就重新渲染一次，
 * 时间戳就会变化 —— 这说明 HTML 是服务端实时生成的（SSR），
 * 而不是提前打包好的静态字符串。
 *
 * 你也可以在这里写 console.log，然后去看"运行 npm run dev 的那个终端"，
 * 日志会打在服务器终端里，而不是浏览器控制台 —— 再次证明这是服务端代码。
 */
export default function HomePage() {
  // 服务端时间戳：每次请求都会重新计算
  const renderedAt = new Date().toISOString();

  // 这行日志只会出现在服务器终端（跑 npm run dev 的那个窗口）
  console.log("[服务端] HomePage 正在服务器上渲染，时间：", renderedAt);

  return (
    <main>
      <h1>👋 你好，Next.js！</h1>

      <p>
        这是你的第一个 <strong>Next.js（App Router）</strong> 应用。
        这个页面是一个 <strong>服务端组件（Server Component）</strong>，
        它的 HTML 是在<strong>服务器上、每次请求时</strong>渲染好再发给浏览器的，
        这就是所谓的 <strong>SSR（服务端渲染）</strong>。
      </p>

      <p>
        下面这个时间戳来自<strong>服务器</strong>。
        每刷新一次页面，服务器就重新渲染一次，时间戳就会变化，
        证明它确实是"服务端每次请求实时渲染"，而不是提前写死的静态内容：
      </p>

      <p
        style={{
          padding: "12px 16px",
          background: "#f0f4ff",
          borderRadius: 8,
          fontFamily: "monospace",
          fontSize: 18,
        }}
      >
        服务端渲染时间：{renderedAt}
      </p>

      <p style={{ color: "#666", fontSize: 14 }}>
        小实验：刷新页面 → 时间戳变化；再看你运行 <code>npm run dev</code>{" "}
        的终端，会看到一行 <code>[服务端]</code> 日志 —— 说明这段代码跑在服务器上。
      </p>
    </main>
  );
}
