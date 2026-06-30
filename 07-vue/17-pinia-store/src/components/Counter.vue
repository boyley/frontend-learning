<script setup>
import { useCounterStore } from '../stores/counter'

// 使用 store：调用 useXxxStore() 拿到响应式的全局状态
const counter = useCounterStore()
</script>

<template>
  <div>
    <h4>组件 A（可操作）</h4>
    <!-- 直接访问 store 的 state 和 getter -->
    <p>count = {{ counter.count }}，double = {{ counter.double }}</p>
    <!-- 调用 action 修改状态 -->
    <button @click="counter.increment()">+1</button>
    <button @click="counter.reset()">重置</button>
  </div>
</template>
