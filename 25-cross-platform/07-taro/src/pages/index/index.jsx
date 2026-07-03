// src/pages/index/index.jsx —— Taro 用【React 语法】写页面
// 关键点：不用 HTML 标签，用 Taro 内置组件（View/Text/Button），
// 由编译器把同一份代码转成小程序 / H5 / RN 各端的代码。
import { useState } from 'react';
// Taro 的跨端组件：会被编译成 <view>（小程序）/ <div>（H5）/ 原生 View（RN）
import { View, Text, Button, Input } from '@tarojs/components';
// Taro 运行时 API：跨端统一封装（相当于小程序 wx.* 的多端版）
import Taro from '@tarojs/taro';
import './index.css';

export default function Index() {
  // React Hooks 状态：写法和普通 React 完全一样
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  const [todos, setTodos] = useState(['理解一码多端', '掌握条件编译']);

  // 调用跨端 API：一行代码，各端自动映射到对应原生能力
  const showInfo = () => {
    Taro.showModal({ title: '当前计数', content: `点了 ${count} 次`, showCancel: false });
  };

  const addTodo = () => {
    if (!text.trim()) {
      Taro.showToast({ title: '请输入内容', icon: 'none' });
      return;
    }
    setTodos([...todos, text.trim()]);
    setText('');
  };

  return (
    <View className="page">
      <Text className="h1">Taro + React 一码多端</Text>

      <View className="card">
        <Text className="count">点击了 {count} 次</Text>
        <View className="row">
          <Button size="mini" type="primary" onClick={() => setCount(count + 1)}>加一</Button>
          <Button size="mini" onClick={() => setCount(0)}>重置</Button>
          <Button size="mini" onClick={showInfo}>查看</Button>
        </View>
      </View>

      <View className="card">
        {/* 列表：直接用 React 的 map，而非小程序 wx:for */}
        {todos.map((item, i) => (
          <Text key={i} className="todo">• {item}</Text>
        ))}
        <View className="row">
          <Input
            className="input"
            placeholder="新增待办"
            value={text}
            onInput={(e) => setText(e.detail.value)}
          />
          <Button size="mini" type="primary" onClick={addTodo}>添加</Button>
        </View>
      </View>

      {/* 条件编译：process.env.TARO_ENV 在编译时替换，实现平台差异化 */}
      {process.env.TARO_ENV === 'h5' && <Text className="tip">当前运行在 H5 端</Text>}
      {process.env.TARO_ENV === 'weapp' && <Text className="tip">当前运行在微信小程序端</Text>}
    </View>
  );
}
