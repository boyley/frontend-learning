'use strict';
/**
 * History API 与 SPA 前端路由演示
 * 核心思想：
 *  - 点击链接时 preventDefault() 阻止浏览器默认跳转（否则会整页刷新/请求服务器）
 *  - 用 history.pushState() 改变地址栏 URL，但【不会】触发页面加载，也【不会】触发 popstate
 *  - 手动调用渲染函数把对应视图写入 #view
 *  - 浏览器前进/后退时浏览器自动触发 popstate 事件，我们在回调里重新渲染
 */

// ---- 视图数据：每个「页面」对应一段 HTML ----
const VIEWS = {
  home: {
    title: '首页',
    html: '<h2>🏠 首页 <span class="badge">page=home</span></h2>' +
      '<p>这是单页应用（SPA）的首页。注意观察：点击上方导航切换时，<b>浏览器不会出现刷新/白屏</b>，地址栏 URL 却变了。</p>' +
      '<p>这正是 React Router / Vue Router 的底层原理——它们都基于 History API。</p>'
  },
  about: {
    title: '关于',
    html: '<h2>📄 关于 <span class="badge">page=about</span></h2>' +
      '<p>pushState(state, title, url) 三个参数：</p>' +
      '<ul><li><b>state</b>：与该历史记录绑定的任意可序列化数据，后退时可从 event.state 取回</li>' +
      '<li><b>title</b>：多数浏览器忽略，传空串即可</li>' +
      '<li><b>url</b>：新的地址栏 URL（同源限制）</li></ul>'
  },
  list: {
    title: '列表',
    html: '<h2>📋 列表 <span class="badge">page=list</span></h2>' +
      '<p>每次进入列表会随机生成一个编号，并存进 history.state，后退回来时可还原：</p>' +
      '<ul id="items"></ul>'
  },
  contact: {
    title: '联系',
    html: '<h2>✉️ 联系 <span class="badge">page=contact</span></h2>' +
      '<p>试试点下方的「history.back()」按钮，或直接用浏览器的后退键——都会触发 popstate 事件重新渲染视图。</p>'
  }
};

const viewEl = document.getElementById('view');
const navEl = document.getElementById('nav');
const monitorEl = document.getElementById('monitor');
const logEl = document.getElementById('log');

// ---- 日志工具 ----
function log(msg) {
  const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
  const div = document.createElement('div');
  div.textContent = `[${time}] ${msg}`;
  logEl.prepend(div);
}

// ---- 从当前 URL 的查询串解析出 page 名 ----
function getPageFromUrl() {
  // URLSearchParams 解析 location.search（即 ?page=xxx 部分）
  const params = new URLSearchParams(location.search);
  const page = params.get('page');
  return VIEWS[page] ? page : 'home'; // 非法或缺省一律回首页
}

// ---- 渲染指定视图 + 更新导航高亮 + 刷新监视器 ----
function render(page) {
  const view = VIEWS[page] || VIEWS.home;
  viewEl.innerHTML = view.html;

  // 列表页：用 history.state 里保存的编号还原，否则新生成
  if (page === 'list') {
    const ul = document.getElementById('items');
    const code = (history.state && history.state.code) || ('NO.' + Math.floor(Math.random() * 9000 + 1000));
    for (let i = 1; i <= 3; i++) {
      const li = document.createElement('li');
      li.textContent = `列表项 ${i}（本次会话编号 ${code}）`;
      ul.appendChild(li);
    }
  }

  // 更新导航高亮
  navEl.querySelectorAll('a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });

  updateMonitor();
}

// ---- 把当前 URL 和 history 状态显示到页面上 ----
function updateMonitor() {
  monitorEl.innerHTML =
    `<span class="k">location.href</span> = <span class="v">${location.href}</span><br>` +
    `<span class="k">location.search</span> = <span class="v">${location.search || '(空)'}</span><br>` +
    `<span class="k">history.state</span> = <span class="v">${JSON.stringify(history.state)}</span><br>` +
    `<span class="k">history.length</span> = <span class="v">${history.length}</span>`;
}

// ---- 导航到某个 page：核心路由逻辑 ----
function navigateTo(page, pushUrl) {
  // 给该历史记录附带 state 数据（列表页随机编号会被持久保存到这条历史里）
  const state = { page, code: 'NO.' + Math.floor(Math.random() * 9000 + 1000), ts: Date.now() };
  const url = '?page=' + page; // 用查询串形式，保证 file:// 下也合法

  if (pushUrl) {
    // pushState：新增一条历史记录。注意它【不触发】页面加载，也【不触发】popstate
    history.pushState(state, '', url);
    log(`pushState → ${url}（地址栏已变，页面未刷新）`);
  }
  render(page);
}

// ---- 拦截导航链接点击 ----
navEl.addEventListener('click', (e) => {
  const a = e.target.closest('a');
  if (!a) return;
  e.preventDefault(); // 关键：阻止默认跳转，避免整页刷新
  navigateTo(a.dataset.page, true);
});

// ---- 监听 popstate：浏览器前进/后退时触发 ----
// 注意：pushState/replaceState 本身【不会】触发 popstate，只有用户点前进后退、
// 或调用 history.back()/forward()/go() 时才触发。
window.addEventListener('popstate', (e) => {
  const page = getPageFromUrl();
  log(`popstate 触发 → 渲染「${VIEWS[page].title}」，event.state = ${JSON.stringify(e.state)}`);
  render(page);
});

// ---- 控制按钮 ----
document.getElementById('btnBack').addEventListener('click', () => {
  log('调用 history.back()');
  history.back();
});
document.getElementById('btnForward').addEventListener('click', () => {
  log('调用 history.forward()');
  history.forward();
});
document.getElementById('btnGo2').addEventListener('click', () => {
  log('调用 history.go(-2)');
  history.go(-2);
});
document.getElementById('btnReplace').addEventListener('click', () => {
  // replaceState：替换当前历史记录，不新增条目。常用于「修正 URL 但不想留下后退记录」
  const page = getPageFromUrl();
  history.replaceState({ page, replaced: true, ts: Date.now() }, '', '?page=' + page + '&replaced=1');
  log('replaceState → 替换了当前历史记录（后退不会回到替换前的 URL）');
  updateMonitor();
});

// ---- 首次进入：根据当前 URL 渲染对应视图，并用 replaceState 写入初始 state ----
(function init() {
  const page = getPageFromUrl();
  history.replaceState({ page, init: true }, '', '?page=' + page);
  render(page);
  log('页面初始化完成，当前视图：' + VIEWS[page].title);
})();
