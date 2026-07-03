// src/app.js —— Taro 应用入口（相当于 React 的根组件容器）
import { PropsWithChildren } from 'react';
import './app.css';

function App({ children }) {
  // children 就是当前页面。可在这里放全局 Provider（如 Redux/Context）
  return children;
}

export default App;
