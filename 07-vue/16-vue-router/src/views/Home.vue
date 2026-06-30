<script setup>
// 首页：演示用 JS 编程式导航
import { useRouter } from 'vue-router'

const router = useRouter()
const goAbout = () => router.push('/about') // push 跳转到新路由
</script>

<template>
  <h2>🏠 首页</h2>
  <p>这是首页内容。Vue Router 让单页应用(SPA)在不刷新页面的情况下切换视图。</p>
  <button @click="goAbout">编程式导航：跳到「关于」</button>
</template>
