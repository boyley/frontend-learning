<script setup>
import Counter from './components/Counter.vue'
import CounterMirror from './components/CounterMirror.vue'
import Shop from './components/Shop.vue'
import CartSummary from './components/CartSummary.vue'
</script>

<template>
  <h1>17 · Pinia 状态管理</h1>

  <section>
    <h2>① 共享计数器（两个组件读同一个 store）</h2>
    <div class="row">
      <Counter />
      <CounterMirror />
    </div>
    <p class="hint">在左边 +1，右边同步变化 —— 它们共享同一份全局状态。</p>
  </section>

  <section>
    <h2>② 购物车（跨组件状态）</h2>
    <div class="row">
      <Shop />
      <CartSummary />
    </div>
  </section>
</template>

<style>
body { font-family: system-ui, sans-serif; max-width: 760px; margin: 40px auto; padding: 0 16px; }
section { border: 1px solid #ddd; border-radius: 8px; padding: 16px; margin: 12px 0; }
h2 { color: #42b883; margin-top: 0; font-size: 18px; }
.row { display: flex; gap: 16px; flex-wrap: wrap; }
.row > * { flex: 1; min-width: 220px; border: 1px solid #eee; border-radius: 6px; padding: 12px; }
.hint { color: #888; font-size: 14px; }
button { padding: 6px 12px; margin: 2px; cursor: pointer; }
</style>
