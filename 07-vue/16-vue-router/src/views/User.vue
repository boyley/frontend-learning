<script setup>
// 动态路由：从 useRoute().params 拿到 :id
import { useRoute } from 'vue-router'
import { watch, ref } from 'vue'

const route = useRoute()
const log = ref([`初次进入，id = ${route.params.id}`])

// 同一个组件在 /user/1 → /user/2 之间切换时不会重新创建，
// 所以要用 watch 监听 params 变化来响应 id 改变
watch(
  () => route.params.id,
  (newId, oldId) => log.value.push(`id 变化：${oldId} → ${newId}`)
)
</script>

<template>
  <h2>👤 用户详情</h2>
  <p>当前用户 id（来自路由参数 :id）：<b>{{ route.params.id }}</b></p>
  <h4>切换日志：</h4>
  <ul>
    <li v-for="(l, i) in log" :key="i">{{ l }}</li>
  </ul>
  <p style="color:#888">提示：点上方「用户1/用户2」切换，观察组件复用 + watch 响应参数变化。</p>
</template>
