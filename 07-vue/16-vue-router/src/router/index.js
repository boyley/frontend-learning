import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'
import User from '../views/User.vue'

// 路由表：path 路径 ↔ component 组件 的映射
const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/about', name: 'about', component: About },
  // 动态路由：:id 是路径参数，匹配 /user/1、/user/2 ...
  { path: '/user/:id', name: 'user', component: User },
  // 懒加载：用到该路由时才下载对应组件代码（提升首屏性能）
  {
    path: '/lazy',
    name: 'lazy',
    component: () => import('../views/Lazy.vue'),
  },
]

const router = createRouter({
  // createWebHashHistory：URL 带 # （如 /#/about），无需服务器额外配置，最适合本地直接预览
  // 生产环境常用 createWebHistory（更干净的 URL，但需服务器配合）
  history: createWebHashHistory(),
  routes,
})

export default router
