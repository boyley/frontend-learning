import Counter from "./ui/counter";

/**
 * 首页 —— 这是一个服务端组件（Server Component），而且是 async 的。
 *
 * 要点 1：async 服务端组件可以直接在函数体里 await 取数。
 *   下面 getServerData() 模拟了一次"只在服务端发生"的数据获取
 *   （真实项目里可能是查数据库、调用带密钥的内部 API）。
 *
 * 要点 2：数据取好后，通过 props（initial=data.count）传给客户端组件 Counter。
 *   服务端负责"取数 + 首屏 HTML"，客户端组件负责"交互"，各司其职。
 *
 * 要点 3：这里的 console.log 只会打印在服务器终端，浏览器控制台看不到 ——
 *   这证明这段代码没有被发送到客户端，密钥/取数逻辑不会泄露。
 */

// 模拟一次服务端取数（比如查数据库）。故意 sleep 一下模拟网络延迟。
async function getServerData() {
  console.log("[仅服务端可见] 正在服务端取数……（浏览器控制台看不到这行）");
  await new Promise((resolve) => setTimeout(resolve, 300));
  return {
    count: 10, // 假装这是从数据库读出来的初始计数
    fetchedAt: new Date().toISOString(),
  };
}

export default async function HomePage() {
  // 直接 await：这是服务端组件的超能力，客户端组件做不到
  const data = await getServerData();

  return (
    <main>
      <h1>🧩 React Server Components（RSC）</h1>

      <section
        style={{
          padding: 16,
          background: "#f6f8fa",
          borderRadius: 8,
          marginBottom: 8,
        }}
      >
        <p style={{ margin: 0 }}>
          我是<strong>服务端组件</strong>（page.js）。我在服务器上取好了数据，
          取数时间：<code>{data.fetchedAt}</code>。
          取数的日志只打印在<strong>服务器终端</strong>，浏览器里看不到 ——
          所以密钥、数据库连接这类东西放在这里是安全的，不会泄露到客户端。
        </p>
      </section>

      <p>
        下面这个计数器是<strong>客户端组件</strong>，由我（服务端组件）
        把初始值 <code>{data.count}</code> 通过 props 传给它。
        它负责交互（点击 +1），我负责取数 —— 这就是 Server / Client 的组合。
      </p>

      {/* 服务端组件里可以直接渲染客户端组件，并向它传 props */}
      <Counter initial={data.count} />

      <p style={{ color: "#666", fontSize: 14, marginTop: 24 }}>
        观察点：① 页面首屏（包含计数器初始值 10）在服务端就渲染好了；
        ② 打开浏览器 DevTools 的 Network，看不到取数日志；
        ③ 回到运行 <code>npm run dev</code> 的终端，能看到 <code>[仅服务端可见]</code> 日志。
      </p>
    </main>
  );
}
