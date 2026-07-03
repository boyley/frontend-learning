<script setup lang="ts">
// pages/about.vue 对应路由 "/about"。
// useHead 是 Nuxt 自动导入的 composable，用于设置页面 <head>（标题、meta 等），
// 对 SEO 很重要（在 11-seo-meta 模块会深入讲）。
useHead({
  title: '关于 · 08 第一个 Nuxt 应用',
})
</script>

<template>
  <section>
    <h1>关于本模块</h1>
    <p>本模块演示 Nuxt 的核心约定：</p>
    <ul>
      <li><code>app.vue</code>：应用根组件，放全站布局与 <code>&lt;NuxtPage /&gt;</code> 路由出口。</li>
      <li><code>pages/</code>：文件即路由，自动生成路由表。</li>
      <li><code>server/</code>：服务端 API（本模块未用，见 09 模块）。</li>
      <li><b>默认 SSR</b>：首屏在服务器渲染成完整 HTML，再到浏览器「水合」变可交互。</li>
      <li><b>自动导入</b>：<code>NuxtLink</code>、<code>useHead</code>、<code>useRequestURL</code> 等无需手写 import。</li>
    </ul>

    <p>
      <NuxtLink to="/">← 返回首页</NuxtLink>
    </p>
  </section>
</template>

<style scoped>
ul {
  line-height: 2;
}
code {
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 6px;
}
</style>
