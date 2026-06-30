<template>
  <h2>🐢 懒加载页</h2>
  <p>这个组件通过 <code>() =&gt; import('./Lazy.vue')</code> 懒加载：
     只有第一次访问 /lazy 时才会下载它的代码（打开浏览器 Network 面板可观察）。</p>
</template>
