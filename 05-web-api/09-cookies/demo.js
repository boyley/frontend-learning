// ============================================================
// 09 · Cookie 操作
// 演示：document.cookie 读写、max-age 过期、SameSite/path 属性、
//       封装 getCookie/setCookie/deleteCookie
// ============================================================
//
// 关键认知：
//  - 读取：document.cookie 返回「整串」，形如 "a=1; b=2; c=3"，
//          没有内置按名取值的 API，需要自己解析。
//  - 写入：给 document.cookie 赋值一次「只设/改一个」cookie，
//          不会覆盖整串其它 cookie（这点和普通变量赋值完全不同！）。
//  - HttpOnly cookie 由服务器设置，JS 在 document.cookie 里读不到（防 XSS 窃取）。

const allOut = document.getElementById('allOut');
const getOut = document.getElementById('getOut');

// ------------------------------------------------------------
// 封装：setCookie —— 写入/修改一个 cookie
// options 支持 maxAge(秒)、path、sameSite、secure
// ------------------------------------------------------------
function setCookie(name, value, options = {}) {
  // 名和值要做 URL 编码，避免分号、空格、中文破坏 cookie 格式
  let str = encodeURIComponent(name) + '=' + encodeURIComponent(value);

  // max-age：存活秒数；比 expires 更直观。负数/0 表示立即过期=删除
  if (options.maxAge != null && options.maxAge !== '') {
    str += '; max-age=' + options.maxAge;
  }
  // path：默认当前路径；通常设 '/' 让整站可用
  str += '; path=' + (options.path || '/');

  // SameSite：控制跨站请求是否带上 cookie，默认 Lax
  if (options.sameSite) {
    str += '; samesite=' + options.sameSite;
    // SameSite=None 必须配合 Secure，否则浏览器拒绝（且需 HTTPS）
    if (options.sameSite === 'None') options.secure = true;
  }
  if (options.secure) str += '; secure';

  // 赋值即写入这一个 cookie
  document.cookie = str;
}

// ------------------------------------------------------------
// 封装：getCookie —— 按名读取（解析整串）
// ------------------------------------------------------------
function getCookie(name) {
  const target = encodeURIComponent(name);
  // document.cookie 形如 "a=1; b=2"，按 "; " 切开
  const pairs = document.cookie ? document.cookie.split('; ') : [];
  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    const k = pair.slice(0, idx);
    if (k === target) {
      return decodeURIComponent(pair.slice(idx + 1)); // 解码还原值
    }
  }
  return null; // 没找到
}

// ------------------------------------------------------------
// 封装：deleteCookie —— 删除靠「设一个已过期时间」
// 把 max-age 设为 0（或 expires 设过去），浏览器即删除它。
// 注意：path 要和当初设置时一致，否则删不掉！
// ------------------------------------------------------------
function deleteCookie(name, path = '/') {
  setCookie(name, '', { maxAge: 0, path });
}

// ------------------------------------------------------------
// 渲染：当前所有 cookie
// ------------------------------------------------------------
function refreshAll() {
  const raw = document.cookie;
  if (!raw) { allOut.textContent = '（当前没有可被 JS 读取的 cookie）'; return; }
  const lines = raw.split('; ').map((p, i) => `${i + 1}. ${p}`);
  allOut.textContent =
    'document.cookie 整串：\n' + raw + '\n\n逐条：\n' + lines.join('\n');
}

// ------------------------------------------------------------
// 绑定按钮
// ------------------------------------------------------------
document.getElementById('btnSet').addEventListener('click', () => {
  const name = document.getElementById('ckName').value.trim();
  const value = document.getElementById('ckValue').value;
  const maxAge = document.getElementById('ckMaxAge').value;
  const sameSite = document.getElementById('ckSameSite').value;
  if (!name) { alert('请输入 cookie 名'); return; }
  setCookie(name, value, { maxAge, sameSite });
  refreshAll();
  getOut.textContent = `已写入：${name}=${value}（max-age=${maxAge || '会话'}, SameSite=${sameSite}）`;
});

document.getElementById('btnGet').addEventListener('click', () => {
  const name = document.getElementById('ckQuery').value.trim();
  const v = getCookie(name);
  getOut.textContent = v === null
    ? `getCookie('${name}') → null（不存在，或它是 HttpOnly 被服务器保护）`
    : `getCookie('${name}') → "${v}"`;
});

document.getElementById('btnDel').addEventListener('click', () => {
  const name = document.getElementById('ckQuery').value.trim();
  deleteCookie(name);
  refreshAll();
  getOut.textContent = `已删除 '${name}'（通过设置 max-age=0 让它立即过期）`;
});

document.getElementById('btnRefresh').addEventListener('click', refreshAll);

// 演示 max-age 过期：写一个 10 秒后过期的 cookie
document.getElementById('btnSet10s').addEventListener('click', () => {
  setCookie('temp_token', 'will_expire_' + Date.now(), { maxAge: 10 });
  refreshAll();
  getOut.textContent = '已写入 temp_token，10 秒后再点「刷新查看」它会自动消失。';
  // 自动在 11 秒后刷新一次，直观看到它没了
  setTimeout(() => {
    refreshAll();
    console.log('[10s 过期演示] temp_token 现在 =', getCookie('temp_token'));
  }, 11000);
});

// 初始渲染
refreshAll();
