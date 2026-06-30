// 23 · JSON demo
// 本文件聚焦：JSON 语法、JSON.stringify(replacer/缩进)、JSON.parse(reviver)、深拷贝技巧及局限
// 既能在浏览器运行（index.html 引入），也能 `node demo.js` 直接运行

'use strict';

const lines = [];
function log(...args) {
  const text = args
    .map((a) => (typeof a === 'object' && a !== null ? JSON.stringify(a) : String(a)))
    .join(' ');
  lines.push(text);
  console.log(text);
}

// ============================================================
// 一、JSON 语法回顾
// ============================================================
log('===== 一、JSON 语法 =====');
// JSON 只支持 6 种值：对象 / 数组 / 字符串 / 数字 / 布尔 / null
// 规则：键必须用双引号；字符串必须用双引号；末尾不能有逗号；不能有注释
const jsonText = '{"name":"小明","age":18,"hobbies":["足球","阅读"],"vip":true,"nick":null}';
log('合法 JSON 字符串:', jsonText);

// ============================================================
// 二、JSON.stringify —— 对象 → JSON 字符串（序列化）
// ============================================================
log('\n===== 二、stringify 序列化 =====');
const user = {
  name: '小明',
  age: 18,
  password: 'secret',
  createdAt: new Date('2026-06-30T00:00:00Z'),
};

// 1) 基本用法
log('基本:', JSON.stringify(user));

// 2) 第三参数：缩进（数字=空格数，或字符串）
log('缩进 2 空格:\n' + JSON.stringify(user, null, 2));

// 3) 第二参数 replacer 为数组：白名单，只保留指定键
log('只要 name/age:', JSON.stringify(user, ['name', 'age']));

// 4) 第二参数 replacer 为函数：可改写或过滤值（返回 undefined 表示删除该键）
const safe = JSON.stringify(user, (key, value) => {
  if (key === 'password') return undefined; // 删除敏感字段
  return value;
});
log('过滤 password:', safe);

// 5) toJSON：对象若有 toJSON 方法，序列化时会调用它
//    Date 自带 toJSON，所以会变成 ISO 字符串
log('Date 被序列化为:', JSON.stringify(new Date('2026-06-30T00:00:00Z')));

// ============================================================
// 三、JSON.parse —— JSON 字符串 → 对象（反序列化）
// ============================================================
log('\n===== 三、parse 反序列化 =====');
const obj = JSON.parse(jsonText);
log('解析后取值:', obj.name, obj.hobbies[1]); // 小明 阅读

// reviver 函数：解析时还原值，常用于把日期字符串转回 Date
const withDate = '{"event":"会议","time":"2026-06-30T09:00:00.000Z"}';
const parsed = JSON.parse(withDate, (key, value) => {
  // 把符合 ISO 日期格式的字符串转回 Date 对象
  if (key === 'time' && typeof value === 'string') return new Date(value);
  return value;
});
log('reviver 还原 Date:', parsed.time instanceof Date, parsed.time.getUTCHours()); // true 9

// ============================================================
// 四、深拷贝技巧及局限
// ============================================================
log('\n===== 四、深拷贝 =====');
const source = { a: 1, nested: { b: 2 }, list: [1, 2] };

// 技巧 1：JSON 大法（简单、常用，但有局限）
const clone1 = JSON.parse(JSON.stringify(source));
clone1.nested.b = 99;
log('JSON 深拷贝后原对象不变:', source.nested.b, '副本:', clone1.nested.b); // 2 99

// JSON 深拷贝的局限：以下类型会丢失或出错
const tricky = {
  fn: function () {}, // 函数 → 丢失
  un: undefined, // undefined → 丢失
  sym: Symbol('s'), // Symbol → 丢失
  date: new Date(), // Date → 变成字符串（类型丢失）
  map: new Map([['k', 'v']]), // Map → 变成空对象 {}
  inf: Infinity, // Infinity / NaN → 变成 null
};
log('JSON 拷贝丢失情况:', JSON.stringify(JSON.parse(JSON.stringify(tricky))));

// 技巧 2：structuredClone（现代浏览器 / Node 17+ 内置，能拷贝 Date/Map/Set 等）
if (typeof structuredClone === 'function') {
  const clone2 = structuredClone(source);
  clone2.list.push(3);
  log('structuredClone 副本:', clone2.list, '原对象:', source.list); // [1,2,3] [1,2]
} else {
  log('当前环境不支持 structuredClone');
}

// ============================================================
// 五、常见报错
// ============================================================
log('\n===== 五、常见报错 =====');
// 1) 解析非法 JSON 会抛 SyntaxError，要用 try...catch 兜底
try {
  JSON.parse("{name:'小明'}"); // 键没引号、用了单引号 → 报错
} catch (e) {
  log('parse 非法 JSON:', e.name); // SyntaxError
}

// 2) 循环引用无法 stringify，会抛 TypeError
try {
  const a = {};
  a.self = a; // 自己引用自己
  JSON.stringify(a);
} catch (e) {
  log('循环引用 stringify:', e.name); // TypeError
}

// ============================================================
// 输出到页面（仅浏览器执行）
// ============================================================
if (typeof document !== 'undefined') {
  const pre = document.getElementById('output');
  if (pre) pre.textContent = lines.join('\n');
}
