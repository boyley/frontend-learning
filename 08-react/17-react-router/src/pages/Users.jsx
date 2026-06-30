import { Link } from 'react-router-dom'

// 模拟一份用户数据（真实项目里通常来自接口）
const users = [
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' },
]

// Users：用户列表页
// 对应路由 path="/users"
// 把每个用户渲染成一个 <Link>，点击后跳转到对应的详情页 /users/:id
export default function Users() {
  return (
    <section>
      <h1>👥 用户列表</h1>
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            {/*
              用 <Link to> 做客户端跳转：不会触发整页刷新，只更新 URL 并切换组件。
              千万不要写成 <a href>，那会让浏览器重新请求整页、丢掉 SPA 状态。
            */}
            <Link to={`/users/${u.id}`}>
              {u.name}（ID: {u.id}）
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
