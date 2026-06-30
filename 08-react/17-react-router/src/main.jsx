import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'

// 入口文件：把整个应用渲染到 #root 节点
// 关键点：用 <BrowserRouter> 包裹 <App />，
// 这样 App 内部的 Routes / Route / Link / useParams 等才能正常工作。
// BrowserRouter 使用 HTML5 History API（pushState），地址栏是干净的 /about 而不是 /#/about。
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
