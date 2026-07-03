// 共享的内存数据存储（教学用）。
//
// 说明：真实项目里这里应该是数据库。为了演示，我们用一个模块级数组模拟。
// 把它单独抽成一个模块，是为了让 route.js 和 [id]/route.js 共享同一份数据
// （同一个 Node 进程里模块只会被加载一次，导出的对象是同一个引用）。
//
// 注意：内存数据在服务器重启后会重置；生产环境请勿这样存业务数据。

export const todos = [
  { id: 1, title: "学习 Route Handlers", done: false },
  { id: 2, title: "理解 NextRequest / NextResponse", done: false },
];

// 简单自增 id 生成器（避免 id 冲突）
let seq = todos.length;
export function nextId() {
  seq += 1;
  return seq;
}
