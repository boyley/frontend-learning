/**
 * 07 · BaaS（Backend as a Service，后端即服务）本地演示
 * ---------------------------------------------------------------
 * BaaS 的理念：连函数都不写，直接用厂商提供的「现成后端能力」——
 *   - 数据库即服务（Firestore / Supabase Postgres）
 *   - 鉴权即服务（Firebase Auth / Supabase Auth）
 *   - 存储即服务（对象存储）
 *   - 实时/推送即服务
 * 前端直接调 SDK 读写数据库、登录注册，鉴权与权限由 BaaS 用「安全规则」
 * 在服务端强制执行。开发者几乎不写服务端代码。
 *
 * 真实中你会用 Firebase / Supabase 的 SDK；这里用几十行内存实现，
 * 「演」出 BaaS 客户端的调用手感（signUp / signIn / from().insert / select）。
 *
 * 运行：  node baas-demo.js
 */

// ============ 下面这段「MockBaaS」= 模拟厂商在云端提供的后端 ============
class MockBaaS {
  constructor() {
    this.users = new Map();     // 鉴权服务的用户表
    this.tables = { todos: [] }; // 数据库
    this.rules = {              // 安全规则：只有本人能读写自己的 todo
      todos: (row, user) => row.owner === user.email,
    };
  }
  // —— Auth as a Service ——
  auth = {
    signUp: ({ email, password }) => {
      if (this.users.has(email)) throw new Error('用户已存在');
      this.users.set(email, { email, password });
      return { user: { email }, token: 'token-' + email };
    },
    signIn: ({ email, password }) => {
      const u = this.users.get(email);
      if (!u || u.password !== password) throw new Error('账号或密码错误');
      return { user: { email }, token: 'token-' + email };
    },
  };
  // —— Database as a Service（带安全规则）——
  from(table) {
    return {
      insert: (row, user) => {
        this.tables[table].push(row);
        return row;
      },
      // 读取时由 BaaS 在服务端按安全规则过滤，前端拿不到别人的数据
      select: (user) =>
        this.tables[table].filter((r) => this.rules[table](r, user)),
    };
  }
}

// ============ 下面这段 = 前端代码，只调 SDK，不写服务端 ============
async function main() {
  const db = new MockBaaS(); // 相当于 createClient(url, key)

  // 1) 鉴权即服务：注册 + 登录，拿到 user
  db.auth.signUp({ email: 'a@x.com', password: '123' });
  const { user } = db.auth.signIn({ email: 'a@x.com', password: '123' });
  console.log('登录成功：', user.email);

  // 2) 数据库即服务：直接从前端写库（BaaS 服务端校验权限）
  db.from('todos').insert({ owner: 'a@x.com', text: '学习 Serverless' }, user);
  db.from('todos').insert({ owner: 'b@x.com', text: '别人的任务' }, user);

  // 3) 读取：安全规则保证只返回「本人」的数据
  const myTodos = db.from('todos').select(user);
  console.log('我能看到的 todos：', myTodos);
  // 输出只含 a@x.com 的那条——b@x.com 的数据被安全规则挡掉了
}

main();
