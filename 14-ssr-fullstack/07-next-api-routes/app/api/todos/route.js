// Route Handler：app/api/todos/route.js  →  对应 URL /api/todos
//
// 约定：在 app 目录下放 route.js（而不是 page.js），并导出与 HTTP 方法同名的函数
// （GET / POST / PUT / PATCH / DELETE / HEAD / OPTIONS）。
// 这些函数接收 Web 标准的 Request，返回 Web 标准的 Response。
// Next 还扩展了 NextRequest / NextResponse（从 next/server 导入），提供更多便利。
//
// 重要：同一个路由段里，route.js 和 page.js 不能共存（一个段要么是页面、要么是接口）。

import { NextResponse } from "next/server";
import { todos, nextId } from "./store";

// GET /api/todos —— 返回内存里的全部 todo。
//
// Route Handler 默认【不缓存】。如果这是个纯静态、想被缓存的 GET，
// 可以加  export const dynamic = 'force-static'  来 opt-in 缓存。
// 这里我们要读实时内存数据，所以保持默认（动态、不缓存）。
export async function GET() {
  // Response.json(...) 是 Web 标准的便捷方法，等价于设置 JSON 头并序列化。
  // 也可以用 NextResponse.json(todos)。
  return NextResponse.json(todos);
}

// POST /api/todos —— 从请求体读取 { title }，追加一条并返回新建的 todo。
export async function POST(request) {
  // 读取 JSON 请求体：request 是 Web Request，用 await request.json()。
  const body = await request.json();

  if (!body || !body.title || !body.title.trim()) {
    // 返回 400，并带上错误信息与状态码。
    return NextResponse.json(
      { error: "title 不能为空" },
      { status: 400 }
    );
  }

  const todo = { id: nextId(), title: body.title.trim(), done: false };
  todos.push(todo);

  // 201 Created：约定新建成功返回 201，并把新资源放进响应体。
  return NextResponse.json(todo, { status: 201 });
}
