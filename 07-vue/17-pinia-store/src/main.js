import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// createPinia() 创建状态管理实例，use 安装为插件
const app = createApp(App)
app.use(createPinia())
app.mount('#app')
