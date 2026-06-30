<script setup>
// App 是根组件：放导航 + 路由出口
import { useRoute } from 'vue-router'

const route = useRoute() // 拿到当前路由信息（path、params、name 等）
</script>

<template>
  <h1>16 · Vue Router 路由</h1>

  <!-- RouterLink 渲染成 <a>，点击切换路由而不刷新页面（SPA） -->
  <nav>
    <RouterLink to="/">首页</RouterLink> |
    <RouterLink to="/about">关于</RouterLink> |
    <!-- 用命名路由 + params 跳转 -->
    <RouterLink :to="{ name: 'user', params: { id: 1 } }">用户1</RouterLink> |
    <RouterLink :to="{ name: 'user', params: { id: 2 } }">用户2</RouterLink> |
    <RouterLink to="/lazy">懒加载页</RouterLink>
  </nav>

  <p class="cur">当前路径：{{ route.fullPath }}</p>

  <!-- RouterView 是“路由出口”：匹配到的组件会渲染在这里 -->
  <main>
    <RouterView />
  </main>
</template>

<style>
body { font-family: system-ui, sans-serif; max-width: 680px; margin: 40px auto; padding: 0 16px; }
nav { background: #f5f5f5; padding: 10px; border-radius: 6px; }
nav a { color: #42b883; text-decoration: none; font-weight: 600; }
/* router-link-active：Vue Router 自动给当前激活的链接加的类 */
nav a.router-link-active { text-decoration: underline; }
.cur { color: #888; font-size: 14px; }
main { border: 1px solid #ddd; border-radius: 8px; padding: 16px; margin-top: 12px; }
</style>
