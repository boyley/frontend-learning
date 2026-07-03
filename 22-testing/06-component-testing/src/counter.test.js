// ============================================================
// 组件测试：像“用户”一样测组件，而不是测内部实现
// 核心理念（Testing Library 指导原则）：
//   “测试越接近软件被使用的方式，越能给你信心”
//   → 用 role / label / 文本 查询元素（用户能看到的），
//     不查 class / id / 组件内部变量（实现细节，一改就碎）。
// 官方：https://testing-library.com/docs/queries/about
// ============================================================
const { getByRole, getByText, queryByText } = require('@testing-library/dom');
const userEvent = require('@testing-library/user-event').default;
const { createCounter } = require('./counter');

// 每个用例前清空 jsdom 的 body，避免上一个用例的 DOM 残留
beforeEach(() => {
  document.body.innerHTML = '';
});

describe('计数器组件', () => {
  it('渲染初始值 0', () => {
    const el = createCounter(0);
    document.body.appendChild(el);

    // 按“用户看到的文本”查询，而不是按 tagName / class
    expect(getByText(el, '0')).toBeInTheDocument();
    // 按可访问性角色查询按钮（name 来自可见文本）
    expect(getByRole(el, 'button', { name: '加一' })).toBeInTheDocument();
  });

  it('点击“加一”后计数变为 1', async () => {
    // user-event 模拟真实用户操作（会触发 hover/焦点等完整事件序列）
    const user = userEvent.setup();
    const el = createCounter(0);
    document.body.appendChild(el);

    await user.click(getByRole(el, 'button', { name: '加一' }));

    expect(getByText(el, '1')).toBeInTheDocument();
    expect(queryByText(el, '0')).toBeNull(); // 旧值应消失
  });

  it('连点三次再重置回到初始值', async () => {
    const user = userEvent.setup();
    const el = createCounter(5); // 初始值 5
    document.body.appendChild(el);

    const inc = getByRole(el, 'button', { name: '加一' });
    await user.click(inc);
    await user.click(inc);
    await user.click(inc);
    expect(getByText(el, '8')).toBeInTheDocument();

    await user.click(getByRole(el, 'button', { name: '重置' }));
    expect(getByText(el, '5')).toBeInTheDocument(); // 回到初始值，而非 0
  });
});
