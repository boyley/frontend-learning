/**
 * 09 · Sentry 接入示例 —— demo.js
 *
 * 因为教学环境没有真实的 Sentry DSN，这里实现一个「mock Sentry」stub：
 * 它把 SDK 的关键 API（init / captureException / captureMessage /
 * addBreadcrumb / setUser / setTag）都实现一遍，
 * 但不真正发网络请求，而是把「本应上报到 Sentry 的事件」渲染到页面面板上，
 * 让你直观看到：init → 采集面包屑 → 捕获异常 → 带上下文上报 的完整数据流。
 *
 * 真实项目里，你只要把本文件换成官方 SDK（CDN 或 npm），
 * 业务侧的调用方式完全一致（README 有真实接入代码）。
 */

// ============================================================
// 一、面板渲染工具
// ============================================================
var panel = document.getElementById('panel');

/** 取当前时间的 HH:MM:SS 字符串，用于事件时间戳展示 */
function now() {
  return new Date().toLocaleTimeString('zh-CN', { hour12: false });
}

/**
 * 把一条「上报事件」渲染到捕获面板
 * @param {string} kind  - exception | message | breadcrumb（决定左侧颜色条）
 * @param {string} title - 事件标题
 * @param {string} body  - 详情（堆栈/内容），可为空
 * @param {Array}  crumbs- 附带的面包屑数组，可为空
 */
function renderEvent(kind, title, body, crumbs) {
  var el = document.createElement('div');
  el.className = 'event ' + kind;

  var html = '<span class="time">' + now() + '</span>' +
             '<span class="type">' + title + '</span>';
  if (body) {
    html += '<pre>' + body + '</pre>';
  }
  // 面包屑：把错误发生前的用户操作轨迹一并展示（Sentry 会把它挂在事件上）
  if (crumbs && crumbs.length) {
    html += '<div class="crumbs">';
    crumbs.forEach(function (c) {
      html += '<span class="crumb-tag">' + c.category + ': ' + c.message + '</span>';
    });
    html += '</div>';
  }
  el.innerHTML = html;
  panel.appendChild(el);
  panel.scrollTop = panel.scrollHeight;
}

// ============================================================
// 二、mock Sentry：拦截调用，模拟上报
// ============================================================

// 面包屑缓冲区：真实 Sentry 会保留最近 N 条用户操作，
// 在异常上报时自动附加，帮你还原「用户是怎么走到出错这一步的」。
var breadcrumbs = [];
var sentryConfig = null;

window.Sentry = {
  /**
   * 初始化 SDK。真实场景在这里配置 dsn / release / integrations / 采样率。
   * mock 版只记录配置，并在面板打印一条「初始化成功」。
   */
  init: function (config) {
    sentryConfig = config;
    console.log('[mock Sentry] init', config);
    renderEvent(
      'message',
      'Sentry.init() 初始化完成',
      'dsn: ' + (config.dsn || '(demo 无真实 dsn)') +
      '\nrelease: ' + (config.release || '未设置') +
      '\ntracesSampleRate: ' + config.tracesSampleRate
    );
  },

  /**
   * 上报一个异常（Error 对象）。
   * 真实 SDK 会解析堆栈、附加面包屑/用户/tag，POST 到 ingest endpoint。
   */
  captureException: function (err) {
    console.log('[mock Sentry] captureException', err);
    renderEvent(
      'exception',
      '⚠ captureException: ' + err.name,
      err.message + '\n' + (err.stack || '(无堆栈)'),
      breadcrumbs.slice()   // 附带当前所有面包屑
    );
    breadcrumbs = [];        // 上报后清空，模拟一次事件生命周期
  },

  /**
   * 上报一条自定义消息（非异常，比如「用户点了危险操作」）。
   * @param {string} msg
   * @param {string} [level] - info / warning / error
   */
  captureMessage: function (msg, level) {
    console.log('[mock Sentry] captureMessage', msg, level);
    renderEvent(
      'message',
      '✉ captureMessage [' + (level || 'info') + ']',
      msg,
      breadcrumbs.slice()
    );
  },

  /**
   * 记录一条面包屑（用户操作轨迹），不立即上报，
   * 等下一次异常/消息上报时作为上下文一起带走。
   */
  addBreadcrumb: function (crumb) {
    console.log('[mock Sentry] addBreadcrumb', crumb);
    breadcrumbs.push(crumb);
    // 只做轻量提示，不占用主事件流
    renderEvent('breadcrumb', '· 面包屑已记录', null, [crumb]);
  },

  /** 设置用户信息，之后所有事件都会带上（便于按用户排查） */
  setUser: function (user) {
    console.log('[mock Sentry] setUser', user);
  },

  /** 设置标签，用于在 Sentry 后台按维度筛选事件 */
  setTag: function (key, value) {
    console.log('[mock Sentry] setTag', key, value);
  }
};

// ============================================================
// 三、模拟真实业务：init + 全局错误兜底
// ============================================================

// 应用启动时初始化（真实配置见 README，此处用 demo 占位）
Sentry.init({
  dsn: 'https://<key>@o<orgId>.ingest.sentry.io/<projectId>',
  release: 'frontend-learning@1.0.0',
  tracesSampleRate: 1.0
});

Sentry.setUser({ id: 'demo-user-001' });
Sentry.setTag('module', '09-sentry-integration');

// 全局未捕获异常兜底：真实 SDK 会自动挂这个监听，
// 这里手动演示——凡是没被 try/catch 的错误也能被上报。
window.addEventListener('error', function (e) {
  if (e.error) {
    Sentry.captureException(e.error);
  }
});

// ============================================================
// 四、按钮交互
// ============================================================

// 1) 触发异常：先埋一条面包屑，再抛出真实错误，
//    走全局 error 监听 → captureException，面板能看到「面包屑 + 堆栈」。
document.getElementById('btn-error').addEventListener('click', function () {
  Sentry.addBreadcrumb({ category: 'ui.click', message: '点击了「触发一个异常」按钮' });
  // 故意制造一个运行时错误
  var obj = null;
  obj.doSomething();   // TypeError: Cannot read properties of null
});

// 2) 手动上报一条消息
document.getElementById('btn-message').addEventListener('click', function () {
  Sentry.captureMessage('用户执行了一次手动上报', 'warning');
});

// 3) 记录一条面包屑（不立即上报，等下次异常时附带）
var crumbSeq = 0;
document.getElementById('btn-crumb').addEventListener('click', function () {
  crumbSeq++;
  Sentry.addBreadcrumb({
    category: 'navigation',
    message: '页面操作 #' + crumbSeq
  });
});
