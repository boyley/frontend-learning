import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 第二个 store：购物车，演示稍复杂的状态 + getter + action
export const useCartStore = defineStore('cart', () => {
  const items = ref([]) // [{ id, name, price, qty }]

  // getter：商品总数 与 总价
  const totalCount = computed(() =>
    items.value.reduce((sum, i) => sum + i.qty, 0)
  )
  const totalPrice = computed(() =>
    items.value.reduce((sum, i) => sum + i.price * i.qty, 0)
  )

  // action：加入购物车（已存在则数量+1）
  function addToCart(product) {
    const found = items.value.find((i) => i.id === product.id)
    if (found) {
      found.qty++
    } else {
      items.value.push({ ...product, qty: 1 })
    }
  }
  function removeFromCart(id) {
    const i = items.value.findIndex((it) => it.id === id)
    if (i > -1) items.value.splice(i, 1)
  }

  return { items, totalCount, totalPrice, addToCart, removeFromCart }
})
