// ============================================================
// 02 · DOM 节点操作 demo —— 待办列表
// 演示：createElement / createTextNode / append / prepend /
//       before / remove / replaceChild / cloneNode /
//       textContent vs innerHTML / setAttribute / classList / dataset
// ============================================================

var todoInput = document.getElementById('todoInput');
var todoList = document.getElementById('todoList');
var opOut = document.getElementById('opOut');

// ---------- 工厂函数：创建一个待办 <li> 节点 ----------
function createTodo(text) {
  // 1) createElement：凭空创建一个元素节点（此时还没插入文档）
  var li = document.createElement('li');

  // 2) dataset：通过 data-* 自定义属性记录创建时间
  li.dataset.createdAt = Date.now();

  // 3) 文字部分：用 textContent 写入用户输入（天然防 XSS，标签不会被解析）
  var span = document.createElement('span');
  span.className = 'text';
  span.textContent = text;        // 安全！用户输入只当文本
  // 点击文字 -> classList.toggle 切换完成态
  span.addEventListener('click', function () {
    li.classList.toggle('done');  // toggle：有就删、没有就加
  });

  // 4) 删除按钮
  var del = document.createElement('button');
  del.className = 'del';
  del.textContent = '删除';
  del.addEventListener('click', function () {
    // element.remove()：把自己从 DOM 移除（现代写法，等价于父.removeChild(自己)）
    li.remove();
  });

  // 5) append：可一次性追加多个子节点（比 appendChild 灵活，可传字符串）
  li.append(span, del);
  return li;
}

// 新增到末尾：appendChild / append
function addTodo(position) {
  var text = todoInput.value.trim();
  if (!text) { opOut.textContent = '请输入待办内容'; return; }
  var li = createTodo(text);
  if (position === 'prepend') {
    // prepend：插到列表最前面
    todoList.prepend(li);
  } else {
    // append：插到列表末尾
    todoList.append(li);
  }
  todoInput.value = '';
  todoInput.focus();
}

document.getElementById('addBtn').addEventListener('click', function () { addTodo('append'); });
document.getElementById('prependBtn').addEventListener('click', function () { addTodo('prepend'); });
// 回车也能新增
todoInput.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') addTodo('append');
});

// 预置两条，方便演示
todoInput.value = '学习 DOM 操作';
addTodo('append');
todoInput.value = '写一个待办列表';
addTodo('append');

// ============================================================
// ② textContent vs innerHTML —— XSS 安全演示
// ============================================================
var xssInput = document.getElementById('xssInput');

document.getElementById('safeBtn').addEventListener('click', function () {
  // textContent：把字符串当「纯文本」，任何 <tag> 都会原样显示，不会执行
  document.getElementById('safeOut').textContent = xssInput.value;
});

document.getElementById('unsafeBtn').addEventListener('click', function () {
  // innerHTML：把字符串当「HTML」解析，<img onerror> 这类会真的执行 -> XSS 风险！
  // 这里仅作教学演示；生产中绝不要把用户输入直接塞进 innerHTML。
  document.getElementById('unsafeOut').innerHTML = xssInput.value;
});

// ============================================================
// ③ 其它节点 API 演示
// ============================================================
document.querySelectorAll('button[data-op]').forEach(function (btn) {
  btn.addEventListener('click', function () {
    runOp(btn.getAttribute('data-op'));
  });
});

function runOp(op) {
  var first = todoList.firstElementChild;
  switch (op) {
    case 'clone': {
      if (!first) { opOut.textContent = '列表为空，先加一条'; return; }
      // cloneNode(true) 深克隆（含子节点）；注意：克隆不会带上 addEventListener 绑定的事件！
      var copy = first.cloneNode(true);
      copy.querySelector('.text').textContent += '（副本）';
      // 给副本重新绑事件（因为 cloneNode 不复制 JS 监听器）
      rebind(copy);
      todoList.append(copy);
      opOut.textContent = 'cloneNode(true) 深克隆了首项。注意：事件监听不会被克隆，需手动重绑。';
      break;
    }
    case 'before': {
      if (!first) { opOut.textContent = '列表为空'; return; }
      var n = createTodo('我被插在首项之前 (before)');
      // before：把新节点插到 first 的前面（作为兄弟节点）
      first.before(n);
      opOut.textContent = 'first.before(node)：在首项前面插入了一个兄弟节点。';
      break;
    }
    case 'replace': {
      if (!first) { opOut.textContent = '列表为空'; return; }
      var rep = createTodo('我替换了原来的首项 (replaceChild)');
      // replaceChild(新, 旧)：用新节点替换旧节点
      todoList.replaceChild(rep, first);
      opOut.textContent = 'replaceChild(new, old)：首项已被替换。';
      break;
    }
    case 'attr': {
      if (!first) { opOut.textContent = '列表为空'; return; }
      // setAttribute / getAttribute / dataset 综合
      first.setAttribute('title', '我是通过 setAttribute 设置的提示');
      first.dataset.flag = 'marked';   // => data-flag="marked"
      var created = first.dataset.createdAt; // 读 data-created-at
      opOut.textContent =
        'setAttribute("title", ...) 已设置（鼠标悬停首项可见）；\n' +
        'dataset.flag = "marked" => data-flag 属性；\n' +
        '读 dataset.createdAt = ' + created;
      break;
    }
    case 'clear': {
      // 用 removeChild 循环清空（演示经典写法）
      var count = 0;
      while (todoList.firstChild) {
        todoList.removeChild(todoList.firstChild);
        count++;
      }
      opOut.textContent = '用 while + removeChild 清空了列表，共移除 ' + count + ' 个节点。';
      break;
    }
  }
}

// cloneNode 后重新绑定事件（克隆不带事件监听）
function rebind(li) {
  var span = li.querySelector('.text');
  span.addEventListener('click', function () { li.classList.toggle('done'); });
  li.querySelector('.del').addEventListener('click', function () { li.remove(); });
}
