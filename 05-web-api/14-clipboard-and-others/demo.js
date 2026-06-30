// ============================================================
// 剪贴板与其他常用 Web API Demo
//   1) Clipboard API（复制，带 execCommand 兜底）
//   2) Notification API（系统通知）
//   3) matchMedia（监听系统暗色模式）
//   4) Web Share / Geolocation（简介按钮）
// ============================================================

const $ = (sel) => document.querySelector(sel);

/** 在某个区域显示一条状态提示 */
function setStatus(el, msg, ok = true) {
  el.textContent = msg;
  el.className = 'status ' + (ok ? 'ok' : 'err');
  el.style.display = 'block';
}

// ------------------------------------------------------------
// 1) 复制到剪贴板
//    现代：navigator.clipboard.writeText() —— 异步、返回 Promise
//      · 需要「安全上下文」（https 或 localhost）
//      · 需要由「用户手势」（如点击）触发
//    兜底：document.execCommand('copy') —— 已废弃但兼容性好，
//          file:// 或非安全上下文下可作为后备
// ------------------------------------------------------------
const copyInput = $('#copyText');
const copyBtn = $('#copyBtn');
const copyStatus = $('#copyStatus');

copyBtn.addEventListener('click', async () => {
  const text = copyInput.value;
  if (!text) {
    setStatus(copyStatus, '没有可复制的内容', false);
    return;
  }

  // 优先用现代 Clipboard API（需安全上下文）
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      setStatus(copyStatus, '✅ 已用 Clipboard API 复制：' + text);
      return;
    } catch (err) {
      // 失败（无权限等）继续走兜底
      console.warn('Clipboard API 失败，尝试 execCommand', err);
    }
  }

  // 兜底方案：创建临时 textarea，选中后 execCommand('copy')
  if (fallbackCopy(text)) {
    setStatus(copyStatus, '✅ 已用 execCommand 兜底复制（当前非安全上下文）');
  } else {
    setStatus(copyStatus, '❌ 复制失败：请改用 https 或 localhost 打开', false);
  }
});

/** execCommand 兜底复制，返回是否成功 */
function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';   // 避免页面滚动跳动
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand('copy'); // 已废弃但仍可用
  } catch (e) {
    ok = false;
  }
  document.body.removeChild(ta);
  return ok;
}

// 读取剪贴板（readText 同样需安全上下文 + 权限，可能弹授权）
const pasteBtn = $('#pasteBtn');
pasteBtn.addEventListener('click', async () => {
  if (!navigator.clipboard || !navigator.clipboard.readText) {
    setStatus(copyStatus, '当前环境不支持读取剪贴板（需 https/localhost）', false);
    return;
  }
  try {
    const text = await navigator.clipboard.readText();
    copyInput.value = text;
    setStatus(copyStatus, '📋 已读取剪贴板内容到输入框');
  } catch (err) {
    setStatus(copyStatus, '读取被拒绝或失败：' + err.message, false);
  }
});

// ------------------------------------------------------------
// 2) Notification API（系统通知）
//    Notification.requestPermission() 申请权限（'granted'/'denied'/'default'）
//    new Notification(title, options) 弹出通知
// ------------------------------------------------------------
const notifyBtn = $('#notifyBtn');
const notifyStatus = $('#notifyStatus');

notifyBtn.addEventListener('click', async () => {
  if (!('Notification' in window)) {
    setStatus(notifyStatus, '当前浏览器不支持 Notification', false);
    return;
  }

  // 已拒绝则无法再弹（需用户去浏览器设置里改）
  if (Notification.permission === 'denied') {
    setStatus(notifyStatus, '通知权限已被拒绝，请到浏览器站点设置里开启', false);
    return;
  }

  // 申请权限（已授权会直接返回 'granted'）
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    new Notification('Hello 👋', {
      body: '这是一条来自网页的系统通知！',
      icon: 'https://developer.mozilla.org/favicon-48x48.png',
    });
    setStatus(notifyStatus, '✅ 已弹出系统通知（看屏幕角落）');
  } else {
    setStatus(notifyStatus, '未授予通知权限（' + permission + '）', false);
  }
});

// ------------------------------------------------------------
// 3) matchMedia —— 用 JS 监听媒体查询（如系统暗色模式）
//    window.matchMedia('(prefers-color-scheme: dark)')
//    返回 MediaQueryList：.matches 当前是否匹配；监听 'change' 实时响应
// ------------------------------------------------------------
const darkBox = $('#darkBox');
const darkMq = window.matchMedia('(prefers-color-scheme: dark)');

function renderDark(mq) {
  if (mq.matches) {
    darkBox.textContent = '🌙 当前系统：暗色模式（prefers-color-scheme: dark）';
    darkBox.classList.add('dark');
  } else {
    darkBox.textContent = '☀️ 当前系统：亮色模式（prefers-color-scheme: light）';
    darkBox.classList.remove('dark');
  }
}
renderDark(darkMq);                       // 初始渲染
darkMq.addEventListener('change', renderDark); // 系统切换主题时自动更新

// 顺便演示一个视口宽度的媒体查询监听
const wideMq = window.matchMedia('(min-width: 600px)');
const wideBox = $('#wideBox');
function renderWide(mq) {
  wideBox.textContent = mq.matches
    ? '🖥 视口 ≥ 600px（宽屏）'
    : '📱 视口 < 600px（窄屏，试着缩小窗口）';
}
renderWide(wideMq);
wideMq.addEventListener('change', renderWide);

// ------------------------------------------------------------
// 4) Web Share API（移动端分享）+ Geolocation（定位）简介按钮
// ------------------------------------------------------------
const shareBtn = $('#shareBtn');
const otherStatus = $('#otherStatus');

shareBtn.addEventListener('click', async () => {
  // navigator.share 需安全上下文 + 用户手势，多见于移动端
  if (navigator.share) {
    try {
      await navigator.share({
        title: '前端学习合集',
        text: '一起学 Web API！',
        url: location.href,
      });
      setStatus(otherStatus, '✅ 已调起系统分享面板');
    } catch (err) {
      setStatus(otherStatus, '分享取消或失败：' + err.message, false);
    }
  } else {
    setStatus(otherStatus, '当前环境不支持 navigator.share（多用于移动端 https）', false);
  }
});

const geoBtn = $('#geoBtn');
geoBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    setStatus(otherStatus, '不支持地理定位', false);
    return;
  }
  setStatus(otherStatus, '正在请求定位权限…');
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      setStatus(otherStatus, `📍 纬度 ${latitude.toFixed(4)}，经度 ${longitude.toFixed(4)}`);
    },
    (err) => setStatus(otherStatus, '定位失败/被拒绝：' + err.message, false),
    { enableHighAccuracy: true, timeout: 8000 }
  );
});
