import { Link } from 'react-router-dom'

// NotFound：兜底 404 页
// 对应路由 path="*"，匹配所有未命中的地址
export default function NotFound() {
  return (
    <section>
      <h1>🚧 404 - 页面不存在</h1>
      <p>你访问的地址没有匹配到任何路由。</p>
      <Link to="/">← 回首页</Link>
    </section>
  )
}
