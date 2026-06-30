// ============================================================
// 01 · DOM 元素选择 demo
// 目标：演示各种选择 API 的用法、返回类型，以及动态/静态集合的区别
// ============================================================

// 输出区域：所有结果显示在页面上，不只 console.log
var output = document.getElementById('output');

// 把信息写到页面输出区
function show(msg) {
  output.textContent = msg;
}

// 清除之前的高亮：先把所有带 .hl 的元素的 class 去掉
function clearHighlight() {
  // querySelectorAll 返回静态 NodeList，可以安全地 forEach
  document.querySelectorAll('.hl').forEach(function (el) {
    el.classList.remove('hl');
  });
}

// 给一组元素加高亮 class
function highlight(elements) {
  // elements 可能是 HTMLCollection / NodeList / 数组，统一转数组再遍历
  Array.prototype.forEach.call(elements, function (el) {
    el.classList.add('hl');
  });
}

// ---------- ① 自定义选择器：querySelectorAll ----------
document.getElementById('btnQuery').addEventListener('click', function () {
  clearHighlight();
  var selector = document.getElementById('selectorInput').value.trim();
  if (!selector) { show('请输入一个 CSS 选择器'); return; }
  try {
    // querySelectorAll 接受任意 CSS 选择器，返回「静态」NodeList（一次性快照）
    var nodes = document.querySelectorAll(selector);
    highlight(nodes);
    show('querySelectorAll("' + selector + '")\n命中 ' + nodes.length +
         ' 个元素，返回类型：' + nodes.constructor.name + '（静态 NodeList）');
  } catch (e) {
    // 非法选择器会抛 SyntaxError
    show('选择器语法错误：' + e.message);
  }
});

// ---------- ① 自定义选择器：querySelector（只取首个） ----------
document.getElementById('btnQueryOne').addEventListener('click', function () {
  clearHighlight();
  var selector = document.getElementById('selectorInput').value.trim();
  if (!selector) { show('请输入一个 CSS 选择器'); return; }
  try {
    // querySelector 返回「第一个」匹配的元素，没有则返回 null
    var node = document.querySelector(selector);
    if (node) {
      node.classList.add('hl');
      show('querySelector("' + selector + '")\n返回首个匹配元素：<' +
           node.tagName.toLowerCase() + '>，文本：' + node.textContent.trim().slice(0, 20));
    } else {
      show('querySelector("' + selector + '") 没有匹配，返回 null');
    }
  } catch (e) {
    show('选择器语法错误：' + e.message);
  }
});

// ---------- ② 各种 API 一键演示 ----------
// 用事件委托：监听所有带 data-demo 的按钮
document.querySelectorAll('button[data-demo]').forEach(function (btn) {
  btn.addEventListener('click', function () {
    clearHighlight();
    var type = btn.getAttribute('data-demo');
    runDemo(type);
  });
});

function runDemo(type) {
  switch (type) {
    case 'byId': {
      // getElementById：按 id 选，最快，返回单个元素或 null
      var el = document.getElementById('title');
      el.classList.add('hl');
      show('getElementById("title")\n返回单个元素，类型：' + el.constructor.name);
      break;
    }
    case 'byClass': {
      // getElementsByClassName：返回「动态」HTMLCollection
      var coll = document.getElementsByClassName('card');
      highlight(coll);
      show('getElementsByClassName("card")\n命中 ' + coll.length +
           ' 个，返回类型：HTMLCollection（动态，会随 DOM 变化）');
      break;
    }
    case 'byTag': {
      // getElementsByTagName：同样返回动态 HTMLCollection
      var coll = document.getElementsByTagName('li');
      highlight(coll);
      show('getElementsByTagName("li")\n命中 ' + coll.length +
           ' 个，返回类型：HTMLCollection（动态）');
      break;
    }
    case 'qsa': {
      var nodes = document.querySelectorAll('.tag');
      highlight(nodes);
      show('querySelectorAll(".tag")\n命中 ' + nodes.length +
           ' 个，返回类型：NodeList（静态快照）');
      break;
    }
    case 'closest': {
      // closest：从自身往上找最近的、匹配选择器的祖先（含自身）
      var firstTag = document.querySelector('.tag');
      var card = firstTag.closest('.card');
      card.classList.add('hl');
      show('第一个 .tag 元素 .closest(".card")\n向上找到最近的祖先卡片：data-fruit="' +
           card.getAttribute('data-fruit') + '"');
      break;
    }
    case 'matches': {
      // matches：判断元素自身是否匹配某个选择器，返回布尔
      var title = document.getElementById('title');
      var ok = title.matches('h3.head');
      title.classList.add('hl');
      show('#title.matches("h3.head") = ' + ok +
           '\nmatches 用来判断元素是否符合选择器（常配合事件委托）');
      break;
    }
    case 'liveVsStatic': {
      demoLiveVsStatic();
      break;
    }
  }
}

// ---------- 动态 HTMLCollection vs 静态 NodeList 的经典坑 ----------
function demoLiveVsStatic() {
  var list = document.getElementById('list');

  // 动态集合：实时反映 DOM，新增 li 后 length 会自动变大
  var liveColl = list.getElementsByTagName('li');
  // 静态集合：拍快照，之后 DOM 变了它也不变
  var staticNodes = list.querySelectorAll('li');

  var beforeLive = liveColl.length;
  var beforeStatic = staticNodes.length;

  // 往列表里加一个新 li
  var newLi = document.createElement('li');
  newLi.textContent = '新增项（动态演示）';
  newLi.classList.add('hl');
  list.appendChild(newLi);

  // 再读一次长度
  var afterLive = liveColl.length;     // 变大了（动态）
  var afterStatic = staticNodes.length; // 没变（静态）

  show(
    '【动态 HTMLCollection vs 静态 NodeList】\n' +
    '新增一个 <li> 之前：\n' +
    '  getElementsByTagName("li").length = ' + beforeLive + '\n' +
    '  querySelectorAll("li").length      = ' + beforeStatic + '\n' +
    '新增一个 <li> 之后：\n' +
    '  getElementsByTagName("li").length = ' + afterLive + '  ← 动态，自动变了！\n' +
    '  querySelectorAll("li").length      = ' + afterStatic + '  ← 静态快照，不变\n' +
    '坑：用 for 循环遍历动态集合并同时增删元素，会导致索引错乱/死循环。'
  );
}

// ---------- 清除高亮按钮 ----------
document.getElementById('btnClear').addEventListener('click', function () {
  clearHighlight();
  show('已清除所有高亮。');
});
