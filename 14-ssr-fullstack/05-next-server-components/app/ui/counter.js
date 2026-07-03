"use client";

/**
 * 计数器 —— 这是一个客户端组件（Client Component）。
 *
 * 文件顶部的 'use client' 是关键：它声明"从这个模块开始，往下的代码
 * 要打包发到浏览器并在客户端运行"。这就是 Server 与 Client 的边界。
 *
 * 为什么它必须是客户端组件？因为它用了 useState（React 状态）和 onClick
 * （浏览器交互）—— 这些只能在浏览器里跑，服务端组件里用会直接报错。
 *
 * 注意 initial 这个 prop：它是由"服务端组件"（page.js）计算好后
 * 通过 props 传进来的。这演示了服务端把数据传给客户端组件的典型模式。
 */
import { useState } from "react";

export default function Counter({ initial = 0 }) {
  const [count, setCount] = useState(initial);

  return (
    <div
      style={{
        marginTop: 16,
        padding: 16,
        border: "1px solid #d0d7de",
        borderRadius: 8,
      }}
    >
      <p style={{ margin: "0 0 8px" }}>
        我是<strong>客户端组件</strong>（Counter，带 'use client'）。
        初始值 <code>{initial}</code> 是服务端通过 props 传给我的。
      </p>
      <button
        onClick={() => setCount((c) => c + 1)}
        style={{
          padding: "8px 16px",
          fontSize: 16,
          cursor: "pointer",
          borderRadius: 6,
          border: "1px solid #0969da",
          background: "#0969da",
          color: "#fff",
        }}
      >
        点我 +1，当前计数：{count}
      </button>
    </div>
  );
}
