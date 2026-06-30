// ============================================================
// 08 · Web Storage（localStorage / sessionStorage）
// 演示：setItem/getItem/removeItem/clear/key/length、
//       只能存字符串需 JSON 序列化、storage 跨标签页事件
// ============================================================

// localStorage 与 sessionStorage 的 API 完全一样，区别只在「生命周期」：
//   localStorage   —— 持久化，关浏览器再开仍在（除非手动清）
//   sessionStorage —— 会话级，关闭该标签页即清空（同一标签页刷新仍在）
// 两者都：同源隔离、约 5MB、只能存字符串、同步 API。

// 约定一组 key，避免和别的代码冲突
const KEY_THEME = 'demo.theme';
const KEY_NOTE  = 'demo.note';
const KEY_DRAFT = 'demo.draft';
const KEY_OBJ   = 'demo.user';

const body = document.body;
const noteEl  = document.getElementById('note');
const draftEl = document.getElementById('draft');
const objOut  = document.getElementById('objOut');
const dumpEl  = document.getElementById('dump');

// ------------------------------------------------------------
// ① 主题：用 localStorage 持久化
// ------------------------------------------------------------
function applyTheme(theme) {
  body.setAttribute('data-theme', theme);
  // setItem(key, value)：value 必须是字符串；非字符串会被自动 toString
  localStorage.setItem(KEY_THEME, theme);
}
document.getElementById('btnLight').addEventListener('click', () => applyTheme('light'));
document.getElementById('btnDark').addEventListener('click', () => applyTheme('dark'));

// ------------------------------------------------------------
// ② 笔记：输入即存 localStorage
// ------------------------------------------------------------
noteEl.addEventListener('input', () => {
  localStorage.setItem(KEY_NOTE, noteEl.value);
});
document.getElementById('btnSaveNote').addEventListener('click', () => {
  localStorage.setItem(KEY_NOTE, noteEl.value);
  refreshDump();
});
document.getElementById('btnClearNote').addEventListener('click', () => {
  // removeItem(key)：删除单个键
  localStorage.removeItem(KEY_NOTE);
  noteEl.value = '';
  refreshDump();
});

// ------------------------------------------------------------
// ③ 草稿：用 sessionStorage（关标签页即失效）
// ------------------------------------------------------------
draftEl.addEventListener('input', () => {
  sessionStorage.setItem(KEY_DRAFT, draftEl.value);
});
document.getElementById('btnSaveDraft').addEventListener('click', () => {
  sessionStorage.setItem(KEY_DRAFT, draftEl.value);
});

// ------------------------------------------------------------
// ④ 存对象：必须 JSON.stringify；读时 JSON.parse
// ------------------------------------------------------------
document.getElementById('btnSaveObj').addEventListener('click', () => {
  const user = { name: '小明', time: new Date().toLocaleString() };
  // 直接存对象会变成字符串 "[object Object]"，所以要先序列化
  localStorage.setItem(KEY_OBJ, JSON.stringify(user));
  objOut.textContent = '已保存（内部是字符串）：\n' + localStorage.getItem(KEY_OBJ);
});
document.getElementById('btnReadObj').addEventListener('click', () => {
  const raw = localStorage.getItem(KEY_OBJ); // 拿到的是字符串
  if (!raw) { objOut.textContent = '还没存对象，先点左边按钮。'; return; }
  const user = JSON.parse(raw); // 反序列化回对象
  objOut.textContent =
    '原始字符串：' + raw +
    '\n\n解析后对象：name = ' + user.name + '，time = ' + user.time;
});

// ------------------------------------------------------------
// ⑤ 遍历全部：用 length + key(i)
// ------------------------------------------------------------
function refreshDump() {
  const lines = [];
  // localStorage.length：键的数量；localStorage.key(i)：第 i 个键名
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    lines.push(`${k} = ${localStorage.getItem(k)}`);
  }
  dumpEl.textContent = lines.length ? lines.join('\n') : '（localStorage 为空）';
}
document.getElementById('btnDump').addEventListener('click', refreshDump);
document.getElementById('btnClearAll').addEventListener('click', () => {
  // clear()：清空当前源下的全部键
  localStorage.clear();
  refreshDump();
});

// ------------------------------------------------------------
// ⑥ storage 事件：跨标签页同步
// 注意：只有「其它」标签页修改同源 localStorage 时才会触发，
//       当前标签页自己改不会触发自己。打开两个相同页面试试。
// ------------------------------------------------------------
window.addEventListener('storage', (e) => {
  console.log('[storage 事件] 另一个标签页改了存储：', {
    key: e.key,        // 被改的键
    oldValue: e.oldValue,
    newValue: e.newValue,
    url: e.url,
  });
  // 实时把本页对应内容也更新一下（演示跨页同步）
  if (e.key === KEY_NOTE) noteEl.value = e.newValue || '';
  if (e.key === KEY_THEME && e.newValue) applyTheme(e.newValue);
  refreshDump();
});

// ------------------------------------------------------------
// 页面加载：从存储恢复之前的状态
// ------------------------------------------------------------
(function init() {
  // 恢复主题（没存过默认 light）
  applyTheme(localStorage.getItem(KEY_THEME) || 'light');
  // 恢复笔记
  noteEl.value = localStorage.getItem(KEY_NOTE) || '';
  // 恢复草稿（sessionStorage：刷新还在，关标签页就没了）
  draftEl.value = sessionStorage.getItem(KEY_DRAFT) || '';
  refreshDump();
})();
