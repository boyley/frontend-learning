// 首页：这是一个 Client Component。
// 顶部的 'use client' 指令告诉 Next：这个组件要在浏览器里运行，
// 因此可以用 useState / useEffect、绑定事件、发起浏览器端 fetch 调用后端接口。
"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [todos, setTodos] = useState([]); // 列表数据
  const [title, setTitle] = useState(""); // 输入框
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 首次挂载时拉取列表（GET /api/todos）。
  useEffect(() => {
    loadTodos();
  }, []);

  async function loadTodos() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/todos");
      if (!res.ok) throw new Error("加载失败");
      setTodos(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // 新增：POST /api/todos
  async function addTodo(e) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("新增失败");
      const created = await res.json();
      setTodos((prev) => [...prev, created]); // 本地追加，避免整表重拉
      setTitle("");
    } catch (e) {
      setError(e.message);
    }
  }

  // 删除：DELETE /api/todos/:id
  async function removeTodo(id) {
    try {
      const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("删除失败");
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <main>
      <h1>07 · Route Handlers（API 路由）</h1>
      <p>
        前端是 Client Component（<code>'use client'</code>），用 <code>fetch</code>{" "}
        调用 <code>/api/todos</code> 系列接口，演示增删。
      </p>

      <form onSubmit={addTodo} style={{ display: "flex", gap: 8, margin: "16px 0" }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="输入待办事项，回车或点新增"
          style={{ flex: 1, padding: "8px 10px", fontSize: 15 }}
        />
        <button type="submit" style={{ padding: "8px 16px", fontSize: 15 }}>
          新增
        </button>
      </form>

      {error && <p style={{ color: "crimson" }}>出错：{error}</p>}
      {loading ? (
        <p>加载中…</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {todos.map((t) => (
            <li
              key={t.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 12px",
                border: "1px solid #eee",
                borderRadius: 6,
                marginBottom: 8,
              }}
            >
              <span>
                <span style={{ color: "#999", marginRight: 8 }}>#{t.id}</span>
                {t.title}
              </span>
              <button
                onClick={() => removeTodo(t.id)}
                style={{ padding: "4px 10px", cursor: "pointer" }}
              >
                删除
              </button>
            </li>
          ))}
          {todos.length === 0 && <li style={{ color: "#999" }}>暂无数据</li>}
        </ul>
      )}

      <p style={{ color: "#999", fontSize: 13, marginTop: 24 }}>
        提示：直接用浏览器/curl 访问 <code>/api/todos</code> 也能看到 JSON。
        数据存在服务器内存里，重启后重置。
      </p>
    </main>
  );
}
