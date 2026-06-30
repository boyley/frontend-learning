// ============================================================
// 07 · 表单数据与 FormData
// 演示：submit 事件 + preventDefault + FormData 收集字段 +
//       Object.fromEntries 转对象 + getAll 取多选 + URLSearchParams
// ============================================================

// 拿到表单元素（HTMLFormElement）
const form = document.getElementById('demoForm');
const output = document.getElementById('output');

// ------------------------------------------------------------
// 工具：把结果美观地打印到页面（不只是 console.log）
// ------------------------------------------------------------
function show(title, data) {
  // 对象用 JSON 缩进展示；字符串直接展示
  const body = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  output.textContent = `【${title}】\n\n${body}`;
}

// ------------------------------------------------------------
// 监听表单的 submit 事件
// 注意：submit 事件是表单触发的，不是按钮；type=submit 的按钮、
//      或在输入框里按回车，都会触发它。
// ------------------------------------------------------------
form.addEventListener('submit', (e) => {
  // 阻止浏览器默认行为（默认会刷新/跳转页面，导致 JS 收集不到数据）
  e.preventDefault();

  // ① 用表单元素构造 FormData 对象。
  //    new FormData(form) 会自动读取表单里所有「带 name 且未禁用」的控件。
  //    没有 name 属性的控件（比如本例的手机号）不会被收集！
  const fd = new FormData(form);

  // ② FormData 常用读取 API 演示 -----------------------------
  // get(name)：取第一个值
  const username = fd.get('username');
  // has(name)：判断字段是否存在
  const hasPhone = fd.has('phone'); // false，因为手机号没写 name
  // getAll(name)：取同名的所有值（复选框 hobby 可能有多个）
  const hobbies = fd.getAll('hobby');

  // ③ 遍历所有条目：fd.entries() 返回 [name, value] 迭代器
  const pairs = [];
  for (const [name, value] of fd.entries()) {
    pairs.push(`${name} = ${value}`);
  }

  // ④ 一键转成普通对象：Object.fromEntries(formData)
  //    注意：同名字段（如 hobby）只会保留「最后一个」值，
  //    多选场景要用 getAll，别只信 fromEntries！
  const obj = Object.fromEntries(fd);

  // ⑤ 单独把多选 hobby 修正成数组，组装最终要提交的数据结构
  obj.hobby = hobbies;

  show('FormData 收集结果', {
    'get("username")': username,
    'has("phone") 没写name所以': hasPhone,
    'getAll("hobby") 多选': hobbies,
    'entries() 遍历到的所有条目': pairs,
    '最终组装对象 (修正了多选)': obj,
  });

  console.log('准备提交的数据：', obj);

  // ⑥ 真实提交示例（这里注释掉，避免真的发请求；放开即可用）：
  // fetch('/api/register', { method: 'POST', body: fd })  // 直接传 FormData，浏览器自动设 multipart 编码
  //   .then(r => r.json()).then(console.log);
});

// ------------------------------------------------------------
// 演示：FormData 转 URLSearchParams（即 GET 请求的 query string）
// 适合「文本类」表单转成 a=1&b=2 形式拼到 URL 后面。
// ------------------------------------------------------------
document.getElementById('btnToQuery').addEventListener('click', () => {
  const fd = new FormData(form);

  // URLSearchParams 可以直接吃 FormData（文件类字段会被忽略/报错，这里全是文本）
  const params = new URLSearchParams();
  for (const [name, value] of fd.entries()) {
    params.append(name, value); // append 保留同名多值，复选会出现多次
  }

  // toString() 会自动做 URL 编码（中文、空格等都会被转义）
  const query = params.toString();

  show('转成 query string (URLSearchParams)', {
    'query 字符串': query,
    '拼到 URL 上': `https://api.example.com/search?${query}`,
    '说明': 'append 让 hobby 出现多次；toString() 自动 URL 编码',
  });
});

// ------------------------------------------------------------
// 额外：通过 form.elements 直接访问某个控件（按 name/id 取）
// 仅作演示：重置后输出提示
// ------------------------------------------------------------
form.addEventListener('reset', () => {
  // form.elements 是表单内所有控件的集合，可用 name 或 index 访问
  const usernameEl = form.elements['username'];
  setTimeout(() => {
    show('已重置', `form.elements['username'] 现在的值是："${usernameEl.value}"`);
  }, 0); // setTimeout 等 reset 真正生效后再读
});
