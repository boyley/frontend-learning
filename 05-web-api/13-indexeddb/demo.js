// ============================================================
// IndexedDB 入门 Demo —— 本地通讯录 CRUD
// ------------------------------------------------------------
// IndexedDB 是浏览器内置的「异步事件驱动」数据库。
// 它的原生 API 非常啰嗦（全靠 onsuccess/onerror 回调），
// 所以下面先把它封装成 Promise，再用来做增删查改。
// ============================================================

// 数据库名 & 版本号 & 对象仓库（表）名 —— 常量集中管理
const DB_NAME = 'contacts-db';   // 数据库名（同源唯一）
const DB_VERSION = 1;            // 版本号：整数，升级结构必须 +1
const STORE_NAME = 'contacts';   // 对象仓库（Object Store）≈ 关系库里的「表」

// 保存已打开的数据库连接（IDBDatabase 实例），避免反复 open
let dbPromise = null;

/**
 * 打开（或首次创建）数据库，返回 Promise<IDBDatabase>
 * 核心 API：indexedDB.open(name, version) 返回 IDBOpenDBRequest
 */
function openDB() {
  // 用闭包缓存，整个页面只 open 一次
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    // open 立即返回一个「请求对象」，结果通过事件回调拿到（异步）
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    // —— 只有「首次创建」或「版本号升高」时才会触发 —— //
    // 这是唯一能修改数据库结构（建表 / 建索引）的地方
    request.onupgradeneeded = (event) => {
      const db = event.target.result; // IDBDatabase
      console.log('[onupgradeneeded] 正在初始化/升级数据库结构');

      // 如果对象仓库还不存在，则创建
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        // keyPath: 'id' 指定主键字段；autoIncrement 让 id 自动递增
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        // 给 name 字段建索引，方便将来按姓名查询（unique:false 允许重名）
        store.createIndex('by_name', 'name', { unique: false });
        // 给 phone 字段建唯一索引（同号码不可重复）
        store.createIndex('by_phone', 'phone', { unique: true });
      }
    };

    // 打开成功：拿到 IDBDatabase 连接
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    // 打开失败
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });

  return dbPromise;
}

/**
 * 通用：在一个事务里跑一段对 objectStore 的操作，并把
 * 「请求结果」包成 Promise 返回。
 * @param {'readonly'|'readwrite'} mode 事务模式
 * @param {(store: IDBObjectStore) => IDBRequest} fn 拿到 store 后返回某个请求
 */
async function withStore(mode, fn) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    // 开事务：指定参与的对象仓库 + 模式
    // 注意：事务会在「当前微任务队列空了」之后自动提交，
    // 不能 await 一个无关的异步操作后再用同一个事务！
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    const request = fn(store); // 执行具体操作（add/get/...），得到 IDBRequest

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ---------------- 对外的 CRUD 封装 ---------------- //

/** 新增一条记录（add：主键冲突会报错） */
function addContact(contact) {
  return withStore('readwrite', (store) => store.add(contact));
}

/** 取出全部记录（getAll：一次性返回数组） */
function getAllContacts() {
  return withStore('readonly', (store) => store.getAll());
}

/** 按主键删除一条 */
function deleteContact(id) {
  return withStore('readwrite', (store) => store.delete(id));
}

/** 清空整张表 */
function clearContacts() {
  return withStore('readwrite', (store) => store.clear());
}

/**
 * 用「游标」逐条遍历（演示 openCursor）。
 * 游标适合大数据量逐条处理（不必一次性全读进内存）。
 */
function listByCursor() {
  return new Promise(async (resolve, reject) => {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const result = [];
    const cursorReq = store.openCursor(); // 打开游标

    cursorReq.onsuccess = (event) => {
      const cursor = event.target.result; // IDBCursorWithValue 或 null
      if (cursor) {
        result.push(cursor.value); // 当前记录
        cursor.continue();         // 移动到下一条（不调用就停住）
      } else {
        resolve(result); // cursor 为 null 表示遍历结束
      }
    };
    cursorReq.onerror = () => reject(cursorReq.error);
  });
}

// ============================================================
//                    页面交互逻辑
// ============================================================
const $ = (sel) => document.querySelector(sel);

const nameInput = $('#name');
const phoneInput = $('#phone');
const addBtn = $('#addBtn');
const clearBtn = $('#clearBtn');
const cursorBtn = $('#cursorBtn');
const listEl = $('#list');
const tipEl = $('#tip');

/** 显示一条顶部提示（成功绿 / 失败红） */
function showTip(msg, ok = true) {
  tipEl.textContent = msg;
  tipEl.className = 'tip ' + (ok ? 'ok' : 'err');
  tipEl.style.display = 'block';
  clearTimeout(showTip._t);
  showTip._t = setTimeout(() => (tipEl.style.display = 'none'), 2500);
}

/** 重新渲染列表 */
async function render() {
  try {
    const contacts = await getAllContacts();
    if (contacts.length === 0) {
      listEl.innerHTML = '<li class="empty">暂无联系人，先添加一个吧～（刷新页面数据仍在）</li>';
      return;
    }
    listEl.innerHTML = contacts
      .map(
        (c) => `
        <li>
          <div class="info">
            <span class="cname">${escapeHtml(c.name)}</span>
            <span class="cphone">${escapeHtml(c.phone)}</span>
          </div>
          <button class="del" data-id="${c.id}">删除</button>
        </li>`
      )
      .join('');
  } catch (err) {
    showTip('读取失败：' + err.message, false);
  }
}

/** 简单转义，防止把输入当 HTML 注入 */
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[m]));
}

// 新增按钮
addBtn.addEventListener('click', async () => {
  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  if (!name || !phone) {
    showTip('姓名和电话都要填', false);
    return;
  }
  try {
    await addContact({ name, phone }); // id 由 autoIncrement 自动生成
    nameInput.value = '';
    phoneInput.value = '';
    showTip('已保存到 IndexedDB ✅');
    render();
  } catch (err) {
    // 唯一索引冲突（同号码）会进这里
    showTip('保存失败：' + (err.name === 'ConstraintError' ? '该电话已存在' : err.message), false);
  }
});

// 清空按钮
clearBtn.addEventListener('click', async () => {
  if (!confirm('确定清空所有联系人？')) return;
  await clearContacts();
  showTip('已清空');
  render();
});

// 用游标重新列出（演示）
cursorBtn.addEventListener('click', async () => {
  const rows = await listByCursor();
  showTip(`游标遍历到 ${rows.length} 条记录（见控制台）`);
  console.table(rows);
});

// 事件委托：点击「删除」
listEl.addEventListener('click', async (e) => {
  if (!e.target.classList.contains('del')) return;
  const id = Number(e.target.dataset.id);
  await deleteContact(id);
  showTip('已删除一条');
  render();
});

// 页面加载即渲染（验证刷新后数据仍在）
render();
