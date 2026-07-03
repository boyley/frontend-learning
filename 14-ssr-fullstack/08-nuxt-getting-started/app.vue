<script setup lang="ts">
// app.vue 是整个 Nuxt 应用的「根组件」，永远最先渲染。
// 因为本项目使用了 pages/ 目录，所以这里必须放 <NuxtPage />，
// 它是路由的出口（相当于 Vue Router 里的 <RouterView />），
// 会根据当前 URL 渲染 pages/ 下对应的页面组件。
//
// 如果没有 pages/ 目录，也可以直接在 app.vue 里写页面内容，
// 甚至直接放一个 <NuxtWelcome /> 官方欢迎页。
</script>

<template>
  <div class="app">
    <!-- 全站公共布局：顶部导航条在每个页面都显示 -->
    <header class="nav">
      <strong>08 · 第一个 Nuxt 应用</strong>
      <nav>
        <!-- NuxtLink 是 Nuxt 内置组件，自动导入、无需 import。
             它做客户端路由跳转（不刷新整页），并自动预取目标页面资源。 -->
        <NuxtLink to="/">首页</NuxtLink>
        <NuxtLink to="/about">关于</NuxtLink>
      </nav>
    </header>

    <main class="content">
      <!-- 路由出口：当前 URL 匹配到的 pages/*.vue 会渲染在这里 -->
      <NuxtPage />
    </main>
  </div>
</template>

<style>
/* 全局样式：写在 app.vue 的 <style>（不加 scoped）即为全站生效 */
body {
  margin: 0;
  font-family: system-ui, -apple-system, "PingFang SC", sans-serif;
  color: #1f2937;
  background: #f9fafb;
}
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: #00dc82; /* Nuxt 品牌绿 */
  color: #003c1e;
}
.nav nav a {
  margin-left: 16px;
  color: #003c1e;
  text-decoration: none;
  font-weight: 600;
}
.nav nav a.router-link-active {
  text-decoration: underline;
}
.content {
  max-width: 720px;
  margin: 0 auto;
  padding: 24px;
}
</style>
