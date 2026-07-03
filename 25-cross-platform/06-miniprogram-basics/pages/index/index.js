// pages/index/index.js —— 页面逻辑，跑在【逻辑层】
// Page() 注册一个页面；data 是与视图层双向绑定的数据源
Page({
  // data：初始数据。渲染层用 {{}} 绑定这里的字段
  data: {
    count: 0,
    title: '小程序数据驱动',
    todos: ['学习双线程模型', '理解 setData', '掌握 rpx 适配'],
    inputValue: '',
  },

  // 生命周期：页面加载时触发一次
  onLoad() {
    // 逻辑层没有 document，只能通过 setData 更新界面
    const app = getApp();
    console.log('当前 App 名称：', app.globalData.appName);
  },

  // 事件处理：WXML 里 bindtap="onAdd" 绑定到这里
  // 事件由渲染层捕获，经微信 Native 中转回到逻辑层
  onAdd() {
    // ❌ 不能 document.querySelector；✅ 只能改数据，再 setData 通知渲染层
    // setData 会把数据【序列化】后跨线程发给渲染层——这是性能命门
    this.setData({ count: this.data.count + 1 });
  },

  onReset() {
    this.setData({ count: 0 });
  },

  // 输入框受控：value={{inputValue}} + bindinput 回传
  onInput(e) {
    this.setData({ inputValue: e.detail.value });
  },

  // 新增待办：演示对数组做局部更新（只传变化字段更省性能）
  onAddTodo() {
    const text = this.data.inputValue.trim();
    if (!text) {
      wx.showToast({ title: '请输入内容', icon: 'none' });
      return;
    }
    this.setData({
      todos: [...this.data.todos, text],
      inputValue: '',
    });
  },

  // 调用原生能力：弹窗（这类系统 API 由 Native 层提供）
  onShowInfo() {
    wx.showModal({
      title: '当前计数',
      content: `你点了 ${this.data.count} 次`,
      showCancel: false,
    });
  },
});
