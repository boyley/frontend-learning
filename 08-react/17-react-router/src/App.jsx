import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Users from './pages/Users.jsx'
import UserDetail from './pages/UserDetail.jsx'
import NotFound from './pages/NotFound.jsx'

// App：应用的根组件
// 结构 = 顶部导航栏 NavBar + 下方路由出口 Routes
export default function App() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      {/* 导航栏始终显示，不随路由切换而卸载 */}
      <NavBar />

      <hr />

      {/*
        Routes：v6 中负责"在一组 Route 里挑出最匹配的一个"来渲染。
        - element 接收一个 JSX 元素（注意是 <Home /> 而不是 Home）。
        - path="/users/:id" 中的 :id 是动态参数，组件内用 useParams() 读取。
        - path="*" 是兜底路由，匹配所有未命中的地址，用来做 404 页面。
      */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users/:id" element={<UserDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}
