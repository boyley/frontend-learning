<!-- App.vue —— uni-app 应用入口（相当于根组件），放全局生命周期与全局样式 -->
<script setup>
import { onLaunch, onShow } from '@dcloudio/uni-app';

// 应用级生命周期（uni-app 提供，跨端统一）
onLaunch(() => {
  console.log('App Launch');
});
onShow(() => {
  console.log('App Show');
});
</script>

<style>
/* 全局样式，各页面共享 */
page { font-family: -apple-system, "PingFang SC", sans-serif; }
</style>
