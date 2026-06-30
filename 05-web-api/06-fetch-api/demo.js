/**
 * Fetch 网络请求演示
 * ---------------------------------------------------------
 * fetch(url, options) 返回一个 Promise，resolve 出 Response 对象。
 * 关键认知：
 *   1. fetch 只在「网络层面失败」（断网、DNS、CORS 等）才 reject；
 *      对 404 / 500 这类 HTTP 错误状态码【不会 reject】，必须手动判断 response.ok。
 *   2. Response 的 body 需要二次解析：await response.json() / response.text()。
 *   3. POST 要设置 method、headers 和 JSON.stringify 后的 body。
 *   4. AbortController 可以取消进行中的请求。
 *
 * 使用公共测试 API：https://jsonplaceholder.typicode.com
 */

const API = 'https://jsonplaceholder.typicode.com';

// 工具：往指定区域写结果（带 loading / error 样式）
function setResult(el, html, type) {
  el.className = 'result ' + (type || '');
  el.innerHTML = html;
}

// ============ ① GET 单篇文章（.then 链式写法）============
document.getElementById('btn-get-one').addEventListener('click', function () {
  const out = document.getElementById('get-one-result');
  setResult(out, '⏳ 加载中（Promise: pending）...', 'loading');

  fetch(`${API}/posts/1`) // 返回 Promise<Response>
    .then((response) => {
      // ⚠️ 易错点：fetch 对 404/500 不会 reject，必须自己检查 response.ok
      if (!response.ok) {
        throw new Error(`HTTP 错误，状态码 ${response.status}`);
      }
      // body 是流，需要二次解析；response.json() 同样返回 Promise
      return response.json();
    })
    .then((post) => {
      // 这里 Promise 已 fulfilled，拿到解析后的 JS 对象
      setResult(
        out,
        `<b>状态：成功（fulfilled）</b><br>` +
        `<b>ID：</b>${post.id}<br>` +
        `<b>标题：</b>${escapeHtml(post.title)}<br>` +
        `<b>正文：</b>${escapeHtml(post.body)}`,
        'success'
      );
    })
    .catch((err) => {
      // 网络错误或上面 throw 的 HTTP 错误都会进这里
      setResult(out, `❌ 请求失败：${err.message}`, 'error');
    });
});

// ============ ② GET 列表（async/await 写法）============
document.getElementById('btn-get-list').addEventListener('click', async function () {
  const out = document.getElementById('get-list-result');
  setResult(out, '⏳ 加载列表中...', 'loading');

  try {
    // async/await 让异步代码像同步一样书写
    const response = await fetch(`${API}/posts?_limit=5`); // 只取 5 条
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const posts = await response.json(); // 二次解析

    // 渲染成列表
    const items = posts
      .map((p) => `<li><b>#${p.id}</b> ${escapeHtml(p.title)}</li>`)
      .join('');
    setResult(out, `<ol>${items}</ol>`, 'success');
  } catch (err) {
    setResult(out, `❌ 请求失败：${err.message}`, 'error');
  }
});

// ============ ③ POST 新建文章 ============
document.getElementById('btn-post').addEventListener('click', async function () {
  const out = document.getElementById('post-result');
  const title = document.getElementById('post-title').value || '默认标题';
  const body = document.getElementById('post-body').value || '默认正文';
  setResult(out, '⏳ 提交中...', 'loading');

  try {
    const response = await fetch(`${API}/posts`, {
      method: 'POST',                                  // 请求方法
      headers: { 'Content-Type': 'application/json' }, // 告诉服务器 body 是 JSON
      body: JSON.stringify({ title, body, userId: 1 }), // 对象必须序列化为字符串
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const created = await response.json();

    // jsonplaceholder 会模拟返回新建对象（含分配的 id，一般是 101）
    setResult(
      out,
      `<b>创建成功！服务器返回：</b><br>` +
      `<b>新 ID：</b>${created.id}<br>` +
      `<b>标题：</b>${escapeHtml(created.title)}<br>` +
      `<b>正文：</b>${escapeHtml(created.body)}`,
      'success'
    );
  } catch (err) {
    setResult(out, `❌ 提交失败：${err.message}`, 'error');
  }
});

// ============ ④ AbortController 取消请求 ============
let controller = null;
document.getElementById('btn-abort-start').addEventListener('click', async function () {
  const out = document.getElementById('abort-result');
  controller = new AbortController(); // 每次请求新建一个控制器
  setResult(out, '⏳ 请求已发出（可点「取消请求」中断）...', 'loading');

  try {
    // 把 controller.signal 传给 fetch，之后可用 controller.abort() 取消
    // 这里故意请求一个较大的资源（评论列表）以便有时间点取消
    const response = await fetch(`${API}/comments`, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    setResult(out, `✅ 请求完成，共 ${data.length} 条评论。`, 'success');
  } catch (err) {
    // 被 abort 时会抛出 name 为 'AbortError' 的错误
    if (err.name === 'AbortError') {
      setResult(out, '🛑 请求已被取消（AbortError）。', 'error');
    } else {
      setResult(out, `❌ 请求失败：${err.message}`, 'error');
    }
  }
});
document.getElementById('btn-abort-cancel').addEventListener('click', function () {
  if (controller) controller.abort(); // 触发上面的 AbortError
});

// 工具：转义 HTML，防止接口返回内容里的标签被当成 HTML 渲染
function escapeHtml(str) {
  return String(str).replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])
  );
}
