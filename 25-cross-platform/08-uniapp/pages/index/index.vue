<!-- pages/index/index.vue —— uni-app 用【Vue 单文件组件(SFC)】写页面
     关键点：不用 HTML 标签，用 uni-app 内置组件（view/text/button，全小写），
     由编译器转成小程序 / H5 / App(原生) 各端代码。这里用 Vue3 <script setup>。 -->
<template>
  <view class="page">
    <text class="h1">uni-app + Vue3 一码多端</text>

    <view class="card">
      <text class="count">点击了 {{ count }} 次</text>
      <view class="row">
        <!-- 事件用 @click（Vue 语法），而非小程序 bindtap -->
        <button size="mini" type="primary" @click="count++">加一</button>
        <button size="mini" @click="count = 0">重置</button>
        <button size="mini" @click="showInfo">查看</button>
      </view>
    </view>

    <view class="card">
      <!-- 列表：Vue 的 v-for -->
      <text v-for="(item, i) in todos" :key="i" class="todo">• {{ item }}</text>
      <view class="row">
        <!-- 双向绑定：v-model（Vue 语法，比小程序受控输入更简洁） -->
        <input class="input" placeholder="新增待办" v-model="text" />
        <button size="mini" type="primary" @click="addTodo">添加</button>
      </view>
    </view>

    <!-- 条件渲染：v-if -->
    <view class="card" v-if="count >= 5">
      <text class="tip">🎉 已点击超过 5 次（v-if 条件渲染）</text>
    </view>
  </view>
</template>

<script setup>
// Vue3 组合式 API：写法和普通 Vue3 项目完全一样
import { ref } from 'vue';

const count = ref(0);
const text = ref('');
const todos = ref(['理解一码多端', 'Vue 语法开发', '条件编译']);

// uni.* 是 uni-app 的跨端 API（各端自动映射，微信端映射到 wx.*）
function showInfo() {
  uni.showModal({ title: '当前计数', content: `点了 ${count.value} 次`, showCancel: false });
}

function addTodo() {
  if (!text.value.trim()) {
    uni.showToast({ title: '请输入内容', icon: 'none' });
    return;
  }
  todos.value.push(text.value.trim());
  text.value = '';
}
</script>

<style>
/* uni-app 样式：尺寸用 rpx（同小程序，屏宽恒等分 750rpx，自动适配） */
.page { padding: 24rpx; background: #f5f5f5; min-height: 100vh; }
.h1 { font-size: 40rpx; font-weight: bold; color: #333; display: block; margin-bottom: 24rpx; }
.card { background: #fff; padding: 32rpx; border-radius: 16rpx; margin-bottom: 24rpx; }
.count { font-size: 36rpx; color: #2979ff; display: block; margin-bottom: 20rpx; }
.row { display: flex; align-items: center; gap: 16rpx; margin-top: 16rpx; }
.todo { font-size: 30rpx; display: block; padding: 8rpx 0; }
.input { flex: 1; border: 1rpx solid #ddd; border-radius: 8rpx; padding: 12rpx 20rpx; }
.tip { color: #e6a23c; font-size: 30rpx; }
</style>
