import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// defineStore(唯一id, setup函数)：Setup Store 写法，和组合式 API 一模一样
// - ref()        => state（状态）
// - computed()   => getters（派生状态）
// - 普通函数      => actions（修改状态的方法）
export const useCounterStore = defineStore('counter', () => {
  // state
  const count = ref(0)

  // getter：基于 state 派生
  const double = computed(() => count.value * 2)

  // actions
  function increment() {
    count.value++
  }
  function reset() {
    count.value = 0
  }

  // 必须返回，组件才能访问
  return { count, double, increment, reset }
})
