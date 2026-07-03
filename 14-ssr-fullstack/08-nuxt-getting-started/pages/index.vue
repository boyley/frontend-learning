<script setup lang="ts">
// pages/index.vue 对应路由 "/"（首页）。
// Nuxt 的「文件路由」：pages 目录里的文件结构自动生成路由表，
//   pages/index.vue      -> /
//   pages/about.vue      -> /about
//   pages/users/[id].vue -> /users/:id
// 无需手写路由配置。

// —— 演示 SSR（服务端渲染）——
// 下面这个时间戳在「服务器」上生成 HTML 时就已经算好，
// 然后随首屏 HTML 一起发给浏览器。所以你「查看网页源代码」时
// 就能直接看到这串时间文字（而不是空壳 + JS 再填充）——这就是 SSR。
const renderedAt = new Date().toISOString()

// useRequestURL() 是 Nuxt 自动导入的 composable，
// 在服务端和客户端都能拿到当前请求的 URL，常用于生成绝对链接。
const url = useRequestURL()
</script>

<template>
  <section>
    <h1>你好，Nuxt 👋</h1>
    <p>这是你的第一个 Nuxt 应用的首页（pages/index.vue → 路由 "/"）。</p>

    <div class="card">
      <p>
        <b>页面渲染时间：</b>
        <code>{{ renderedAt }}</code>
      </p>
      <p class="hint">
        这个时间是在<strong>服务器</strong>生成 HTML 时算好的。
        试试在浏览器里「查看网页源代码」，你会直接看到这串文字——
        这正是<strong>默认开启的 SSR</strong>。刷新页面时间会变，
        但客户端路由跳转（点上方导航再回来）不会重新执行服务端渲染。
      </p>
      <p><b>当前请求 host：</b> <code>{{ url.host }}</code></p>
    </div>

    <p>
      去看看
      <NuxtLink to="/about">关于页</NuxtLink>
      ，体验不刷新整页的客户端路由跳转。
    </p>
  </section>
</template>

<style scoped>
/* scoped 样式：只作用于当前组件 */
.card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px 20px;
  background: #fff;
  margin: 16px 0;
}
code {
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 6px;
}
.hint {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.7;
}
</style>
