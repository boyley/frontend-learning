// app.js —— 小程序的入口逻辑，跑在【逻辑层 AppService】（独立 JS 引擎，无 DOM/window）
// App() 注册小程序实例，globalData 可被所有页面共享
App({
  // 小程序初始化时触发一次（冷启动）
  onLaunch() {
    // 逻辑层没有 localStorage，用 wx.setStorageSync 做持久化
    const times = wx.getStorageSync('launchTimes') || 0;
    wx.setStorageSync('launchTimes', times + 1);
    console.log('小程序启动，累计启动次数：', times + 1);
  },
  // 全局数据：所有页面用 getApp().globalData 访问
  globalData: {
    appName: '小程序基础 Demo',
    userInfo: null,
  },
});
