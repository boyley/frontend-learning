<script setup lang="ts">
// ============ useAsyncData：更细粒度控制的取数 ============
//
// useAsyncData(key, handler, options)
//   - 第一个参数是【唯一的缓存 key】，Nuxt 用它去重、缓存、传 payload；
//     （useFetch 会用 URL 自动生成 key，所以不用手写。）
//   - handler 里你可以放【任意异步逻辑】，通常配 $fetch 调接口。
//     适合包装「非标准查询」：CMS SDK、GraphQL、第三方库、组合多个请求等。
//
// 和 useFetch 一样，它在服务端取数并把结果放进 payload，客户端水合复用，
// 避免双取。区别只是 useFetch 是 useAsyncData 针对「直接 fetch 一个 URL」的语法糖。

// 让详情页展示 id=1 的珠峰。可以改成从路由参数拿 id（此处从简写死）。
const id = 1

const { data, status, error, refresh } = await useAsyncData(
  // 缓存 key：不同 id 应该用不同 key（这里写死拼上 id）
  `mountain-${id}`,
  // handler：用 $fetch 直接请求接口。
  // $fetch 是全局自动导入的 HTTP 客户端（ofetch 封装），会自动解析 JSON。
  // 注意：$fetch 单独在 setup 里裸用会双取；这里把它「包在 useAsyncData 里」
  //       就享受了 SSR payload 复用，是正确姿势。
  () => $fetch('/api/mountains', { query: { id } }),
  {
    // pick：只保留需要的字段，减小 payload 体积（传给客户端的数据更小）。
    // 这里丢弃 country 字段，客户端 data 里将不含 country。
    pick: ['id', 'name', 'height'],
    // 也可用 transform 二次加工（pick 与 transform 可同时用，transform 先执行）。
  },
)
</script>

<template>
  <section>
    <h1>山峰详情（useAsyncData + $fetch）</h1>
    <p class="desc">
      本页用 <code>useAsyncData('mountain-1', () =&gt; $fetch('/api/mountains?id=1'))</code>
      取单条，并用 <code>pick</code> 只保留 <code>id / name / height</code>
      三个字段来缩小 payload（<code>country</code> 已被丢弃）。
    </p>

    <p class="status">状态 status：<b>{{ status }}</b>
      <button :disabled="status === 'pending'" @click="() => refresh()">🔄 refresh</button>
    </p>

    <p v-if="error" class="error">出错了：{{ error.statusMessage || error.message }}</p>

    <div v-else-if="data" class="card">
      <h2>{{ data.name }}</h2>
      <p>海拔：<b>{{ data.height }}</b> 米</p>
      <p class="hint">
        注意：接口本来还返回了 <code>country</code>，但因为 <code>pick</code> 只选了
        3 个字段，这里的 <code>data</code> 里没有 country —— 这就是用 pick 缩减 payload。
      </p>
    </div>

    <p><NuxtLink to="/">← 回列表页</NuxtLink></p>
  </section>
</template>

<style scoped>
.desc {
  color: #4b5563;
  line-height: 1.7;
}
code {
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 6px;
}
.card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px 20px;
  background: #fff;
  margin: 16px 0;
}
.hint {
  color: #6b7280;
  font-size: 14px;
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
}
.error {
  color: #dc2626;
}
</style>
