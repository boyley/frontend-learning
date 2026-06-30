<script setup>
import { storeToRefs } from 'pinia'
import { useCounterStore } from '../stores/counter'

const counter = useCounterStore()
// storeToRefs：解构 store 时保持响应式（直接解构 state 会丢失响应性）
const { count, double } = storeToRefs(counter)
</script>

<template>
  <div>
    <h4>组件 B（只读镜像）</h4>
    <p>同一个 count = {{ count }}</p>
    <p>同一个 double = {{ double }}</p>
    <p style="color:#42b883">↑ 没有任何 props 传递，却和 A 同步</p>
  </div>
</template>
