import { useParams, useNavigate } from 'react-router-dom'

// UserDetail：用户详情页
// 对应路由 path="/users/:id"
export default function UserDetail() {
  // useParams() 读取 URL 里的动态片段。
  // 路由定义为 /users/:id，所以这里取 params.id（始终是字符串）。
  const { id } = useParams()

  // useNavigate() 返回一个命令式跳转函数，用于在事件回调里编程式导航。
  const navigate = useNavigate()

  return (
    <section>
      <h1>📄 用户详情</h1>
      <p>
        当前用户 ID：<strong>{id}</strong>
      </p>

      {/* navigate(-1) 等价于浏览器后退一步；也可 navigate('/users') 跳到指定路径 */}
      <button onClick={() => navigate(-1)}>← 返回上一页</button>
      <button onClick={() => navigate('/users')} style={{ marginLeft: 8 }}>
        回到用户列表
      </button>
    </section>
  )
}
