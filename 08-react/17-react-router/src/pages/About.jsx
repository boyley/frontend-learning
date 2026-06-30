// About：关于页
// 对应路由 path="/about"
export default function About() {
  return (
    <section>
      <h1>ℹ️ 关于</h1>
      <p>本页演示一个静态路由。地址栏是 /about，由 BrowserRouter 走 History API 实现。</p>
    </section>
  )
}
