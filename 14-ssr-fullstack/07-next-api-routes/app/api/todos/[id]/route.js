// 动态段 Route Handler：app/api/todos/[id]/route.js  →  /api/todos/:id
//
// [id] 是动态段。处理函数的第二个参数 ctx 里带 params，
// Next 16 里 params 是异步的，需要 await：const { id } = await ctx.params。

import { NextResponse } from "next/server";
import { todos } from "../store";

// GET /api/todos/:id —— 按 id 返回单条。
export async function GET(request, ctx) {
  const { id } = await ctx.params; // 注意 await
  const todo = todos.find((t) => String(t.id) === id);

  if (!todo) {
    return NextResponse.json({ error: "未找到该 todo" }, { status: 404 });
  }
  return NextResponse.json(todo);
}

// DELETE /api/todos/:id —— 按 id 删除。
export async function DELETE(request, ctx) {
  const { id } = await ctx.params;
  const index = todos.findIndex((t) => String(t.id) === id);

  if (index === -1) {
    return NextResponse.json({ error: "未找到该 todo" }, { status: 404 });
  }

  const [removed] = todos.splice(index, 1); // 从内存数组里删掉
  return NextResponse.json({ deleted: removed });
}
