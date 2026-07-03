<script setup lang="ts">
// ================= useFetch：SSR 安全的初始化取数（首选） =================
//
// useFetch 是包装了 $fetch 的 composable，专为「组件初始化取数」设计。
// 它做了两件关键的事，避免「双取（double-fetch）」：
//   1) 服务端渲染时执行一次请求，把结果渲染进首屏 HTML；
//   2) 同时把这份数据序列化进 payload（页面里的 __NUXT__），
//      随 HTML 一起发给浏览器；客户端水合时【直接复用 payload】，
//      不会再发一次相同请求。
//
// 对比：如果在 setup 里裸用 $fetch / 原生 fetch，会在服务端取一次、
// 客户端水合时又取一次 —— 这就是「双取」，浪费且可能闪烁。
//
// 用 await 是安全的：Nuxt 的 asyncData 上下文能正确处理这个 await。
const { data, error, status, refresh } = await useFetch('/api/mountains', {
  // ——常用选项演示——
  // lazy: false,   // 默认 false：阻塞导航直到取到数据（首屏就有数据）
  // server: true,  // 默认 true：服务端也执行（设 false 则仅客户端取）
  // 这里用 transform 给每条数据加一个「海拔（公里）」派生字段，
  // transform 在服务端执行，结果会进 payload，客户端拿到的就是转换后的。
  transform: (list: Array<{ id: number; name: string; height: number; country: string }>) =>
    list.map((m) => ({ ...m, heightKm: (m.height / 1000).toFixed(3) })),
})
</script>

<template>
  <section>
    <h1>世界高峰列表（useFetch）</h1>
    <p class="desc">
      本页用 <code>useFetch('/api/mountains')</code> 在<strong>服务端首屏</strong>取数，
      并通过 payload 传给客户端，<strong>水合时不再重复请求</strong>。
      打开浏览器 Network 面板刷新，你不会看到对 <code>/api/mountains</code> 的第二次请求。
    </p>

    <!-- status：idle / pending / success / error，可用于骨架屏/加载态 -->
    <p class="status">
      请求状态 status：<b>{{ status }}</b>
      <button :disabled="status === 'pending'" @click="() => refresh()">
        🔄 refresh 重新请求
      </button>
    </p>

    <!-- error：请求失败时是一个错误对象（含 statusCode/statusMessage） -->
    <p v-if="error" class="error">出错了：{{ error.statusMessage || error.message }}</p>

    <ul v-else class="list">
      <li v-for="m in data" :key="m.id">
        <span class="name">{{ m.name }}</span>
        <span class="meta">{{ m.height }} m（{{ m.heightKm }} km） · {{ m.country }}</span>
      </li>
    </ul>

    <p>
      去
      <NuxtLink to="/detail">详情页</NuxtLink>
      看 <code>useAsyncData</code> + <code>$fetch</code> 的 pick / transform 用法。
    </p>
  </section>
</template>

<style scoped>
.desc,
.status {
  line-height: 1.7;
}
.desc {
  color: #4b5563;
}
code {
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 6px;
}
button {
  margin-left: 12px;
  padding: 4px 10px;
  border: 1px solid #00dc82;
  background: #eafff6;
  border-radius: 6px;
  cursor: pointer;
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.error {
  color: #dc2626;
}
.list {
  list-style: none;
  padding: 0;
}
.list li {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  margin-bottom: 8px;
}
.name {
  font-weight: 600;
}
.meta {
  color: #6b7280;
  font-size: 14px;
}
</style>
