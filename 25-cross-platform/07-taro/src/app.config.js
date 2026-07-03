// src/app.config.js —— Taro 全局配置（编译时会转成各端配置，如小程序的 app.json）
// 这里声明页面路径、窗口样式；一份配置，多端通用
export default defineAppConfig({
  pages: [
    'pages/index/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#0e8fdf',
    navigationBarTitleText: 'Taro 跨端 Demo',
    navigationBarTextStyle: 'white',
  },
});
