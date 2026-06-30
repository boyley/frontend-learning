<script setup>
import { useCartStore } from '../stores/cart'

// 另一个组件读同一个 cart store —— 跨组件共享，无需父子传值
const cart = useCartStore()
</script>

<template>
  <div>
    <h4>🛒 购物车（{{ cart.totalCount }} 件）</h4>
    <ul v-if="cart.items.length">
      <li v-for="i in cart.items" :key="i.id">
        {{ i.name }} × {{ i.qty }} = ￥{{ i.price * i.qty }}
        <button @click="cart.removeFromCart(i.id)">移除</button>
      </li>
    </ul>
    <p v-else style="color:#888">购物车是空的</p>
    <p><b>总价：￥{{ cart.totalPrice }}</b></p>
  </div>
</template>
