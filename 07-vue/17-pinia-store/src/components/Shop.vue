<script setup>
import { useCartStore } from '../stores/cart'

const cart = useCartStore()
const products = [
  { id: 1, name: '机械键盘', price: 399 },
  { id: 2, name: '无线鼠标', price: 129 },
  { id: 3, name: '显示器', price: 999 },
]
</script>

<template>
  <div>
    <h4>商品列表</h4>
    <ul>
      <li v-for="p in products" :key="p.id">
        {{ p.name }} ￥{{ p.price }}
        <button @click="cart.addToCart(p)">加入购物车</button>
      </li>
    </ul>
  </div>
</template>
