import { NavLink } from 'react-router-dom'

// NavBar：顶部导航栏
// 用 <NavLink> 而不是 <Link>：NavLink 能感知"当前路由是否匹配自己的 to"，
// 从而方便地给"当前激活项"加高亮样式。
//
// NavLink 的 className / style 都支持传一个回调函数，
// 回调参数里有 { isActive, isPending }，据此返回不同的样式。
export default function NavBar() {
  // 用 className 回调实现高亮（也可以改用 style 回调，见下方 About 那一项的写法）
  const linkClass = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')

  // 这里用内联 style 回调演示另一种写法
  const linkStyle = ({ isActive }) => ({
    marginRight: 12,
    textDecoration: 'none',
    fontWeight: isActive ? 'bold' : 'normal',
    color: isActive ? '#646cff' : '#333',
  })

  return (
    <nav style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      {/* end 属性：仅当路径"完全等于"/ 时才算激活，否则 / 会对所有路径都高亮 */}
      <NavLink to="/" end style={linkStyle}>
        首页
      </NavLink>
      <NavLink to="/about" style={linkStyle}>
        关于
      </NavLink>
      <NavLink to="/users" style={linkStyle}>
        用户列表
      </NavLink>

      {/* 仅作对照：className 回调写法（需配合 CSS 类，这里仅示意） */}
      <NavLink to="/users" className={linkClass} style={{ display: 'none' }}>
        className 写法示意
      </NavLink>
    </nav>
  )
}
