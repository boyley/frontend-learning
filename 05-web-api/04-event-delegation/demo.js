/**
 * 事件委托 + 事件流（捕获 / 目标 / 冒泡）演示
 * ---------------------------------------------------------
 * 核心思想：把事件监听器只加在「父元素」上，
 * 利用事件冒泡（子元素 -> 父元素）统一处理所有子元素的点击，
 * 这样即使后续动态新增子元素，也无需再单独绑定监听器。
 */

// ============ 第一部分：事件委托高亮列表 ============

// 只在 <ul> 父元素上加一个监听器（这就是「委托」）
const list = document.getElementById('todo-list');
const delegateLog = document.getElementById('delegate-log');

// 给 ul 绑定 click 事件：所有 li 的点击都会冒泡到这里
list.addEventListener('click', function (event) {
  // event.target        ：真正被点击的元素（具体哪个 li 或其内部元素）
  // event.currentTarget  ：监听器所绑定的元素（永远是 ul 本身）
  // 这是事件委托最重要、也是最容易踩坑的区别！
  const clicked = event.target;        // 实际点击目标
  const bound = event.currentTarget;   // 绑定监听器的元素（= list）

  // 用 closest 从点击目标向上找最近的 li（防止点到 li 内部子元素时拿错）
  const li = clicked.closest('li');
  if (!li || !list.contains(li)) return; // 没点在 li 上就忽略

  // 先清除其他 li 的高亮，再高亮当前点击的 li
  list.querySelectorAll('li').forEach((item) => item.classList.remove('active'));
  li.classList.add('active');

  // 把 target 与 currentTarget 的区别打印到页面上，直观感受坑点
  delegateLog.innerHTML =
    `点击成功！<br>` +
    `<b>event.target</b>（实际点击的元素）= &lt;${clicked.tagName.toLowerCase()}&gt; 文本「${li.textContent}」<br>` +
    `<b>event.currentTarget</b>（绑定监听器的元素）= &lt;${bound.tagName.toLowerCase()}&gt;（始终是 ul）`;
});

// 「动态新增 li」按钮：证明委托能处理后来才出现的元素
let counter = 4;
document.getElementById('add-item').addEventListener('click', function () {
  counter++;
  const li = document.createElement('li');
  li.textContent = `动态新增的待办项 #${counter}`;
  // 注意：这里完全没有给新 li 绑定任何点击监听器！
  // 但因为监听器在父级 ul 上，新 li 的点击照样能被处理。
  list.appendChild(li);
  delegateLog.textContent = `已新增「${li.textContent}」，直接点它试试（无需额外绑定）。`;
});

// ============ 第二部分：捕获 vs 冒泡 顺序演示 ============

// 三层嵌套盒子：outer > middle > inner
// 分别在「捕获阶段」和「冒泡阶段」绑定监听器，观察触发顺序
const flowLog = document.getElementById('flow-log');
const boxes = ['outer', 'middle', 'inner'];

// 把一条日志追加到面板
function pushFlowLog(text, phase) {
  const line = document.createElement('div');
  line.className = 'flow-line ' + phase; // capture / bubble 用不同颜色
  line.textContent = text;
  flowLog.appendChild(line);
  flowLog.scrollTop = flowLog.scrollHeight;
}

boxes.forEach((id) => {
  const box = document.getElementById(id);

  // addEventListener 第三个参数 = true -> 在【捕获阶段】触发
  // 捕获阶段方向：window -> ... -> target（自上而下）
  box.addEventListener(
    'click',
    function () {
      pushFlowLog(`⬇️ 捕获阶段：#${id}`, 'capture');
    },
    true // capture = true
  );

  // 第三个参数 = false（默认）-> 在【冒泡阶段】触发
  // 冒泡阶段方向：target -> ... -> window（自下而上）
  box.addEventListener(
    'click',
    function () {
      pushFlowLog(`⬆️ 冒泡阶段：#${id}`, 'bubble');
    },
    false // bubble = 默认
  );
});

// 点击最内层时，完整顺序应为：
// 捕获 outer -> 捕获 middle -> 捕获 inner -> 冒泡 inner -> 冒泡 middle -> 冒泡 outer
// 清空日志按钮
document.getElementById('clear-flow').addEventListener('click', function () {
  flowLog.innerHTML = '';
});

// ============ 第三部分：stopPropagation 演示 ============

const stopBox = document.getElementById('stop-inner');
const stopToggle = document.getElementById('stop-toggle');
const stopLog = document.getElementById('stop-log');

// 外层盒子始终有一个冒泡监听器
document.getElementById('stop-outer').addEventListener('click', function () {
  const line = document.createElement('div');
  line.textContent = '外层盒子收到了点击（冒泡到达）';
  stopLog.appendChild(line);
});

// 内层盒子：根据开关决定是否阻止冒泡
stopBox.addEventListener('click', function (event) {
  if (stopToggle.checked) {
    // stopPropagation 阻止事件继续向上冒泡，外层将收不到
    event.stopPropagation();
    const line = document.createElement('div');
    line.style.color = '#c0392b';
    line.textContent = '内层点击 + 已调用 stopPropagation（外层收不到）';
    stopLog.appendChild(line);
  } else {
    const line = document.createElement('div');
    line.textContent = '内层点击（未阻止，事件会继续冒泡到外层）';
    stopLog.appendChild(line);
  }
});
