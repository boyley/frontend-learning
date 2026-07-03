<script setup lang="ts">
// 根组件：放全站布局 + 路由出口 <NuxtPage />。
</script>

<template>
  <div>
    <header class="nav">
      <strong>09 · Nuxt 数据获取</strong>
      <nav>
        <NuxtLink to="/">列表 · useFetch</NuxtLink>
        <NuxtLink to="/detail">详情 · useAsyncData</NuxtLink>
      </nav>
    </header>
    <main class="content">
      <NuxtPage />
    </main>
  </div>
</template>

<style>
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
  background: #00dc82;
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
  max-width: 760px;
  margin: 0 auto;
  padding: 24px;
}
</style>
