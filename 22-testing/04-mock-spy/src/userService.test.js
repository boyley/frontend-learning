// ============================================================
// mock / spy / stub 三兄弟 + jest.fn 全演示
//   - jest.fn()      造一个“假函数”，可断言被怎么调用（spy 能力）
//   - jest.mock()    整体替换一个模块（把真实 api 换成假的）
//   - mockReturnValue/mockResolvedValue  预设返回值（stub 能力）
//   - jest.spyOn()   监视真实对象的方法（可选择放行或替换）
// 官方：https://jestjs.io/docs/mock-functions
// ============================================================

// ① 把整个 ./api 模块 mock 掉：fetchUser 变成 jest.fn()，绝不发真请求
jest.mock('./api');
const { fetchUser } = require('./api');
const { getUserDisplayName } = require('./userService');

describe('jest.fn() —— 假函数 + 调用断言（Spy 能力）', () => {
  it('记录调用次数与入参', () => {
    const fn = jest.fn();
    fn('a', 1);
    fn('b', 2);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenCalledWith('a', 1);       // 某次调用的参数
    expect(fn).toHaveBeenLastCalledWith('b', 2);    // 最后一次
  });

  it('mockReturnValue —— 预设返回值（Stub 能力）', () => {
    const fn = jest.fn().mockReturnValue(42);
    expect(fn()).toBe(42);
  });

  it('mockImplementation —— 自定义假实现', () => {
    const fn = jest.fn((x) => x * 10);
    expect(fn(5)).toBe(50);
  });
});

describe('jest.mock() —— 替换模块依赖', () => {
  // 每个用例前清掉调用记录与预设实现，保证互不干扰
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('成功路径：mock fetchUser 返回带 nickname 的用户', async () => {
    // Stub：让假的 fetchUser 返回我们想要的数据
    fetchUser.mockResolvedValue({ id: 1, name: 'user-1', nickname: '小明' });
    const logger = { warn: jest.fn() };

    const name = await getUserDisplayName(1, logger);

    expect(name).toBe('小明');
    expect(fetchUser).toHaveBeenCalledWith(1); // 断言依赖被正确调用
    expect(logger.warn).not.toHaveBeenCalled(); // 成功时不该记警告
  });

  it('失败路径：fetchUser 抛错 → 返回“匿名用户”并记日志', async () => {
    fetchUser.mockRejectedValue(new Error('network down'));
    const logger = { warn: jest.fn() }; // logger.warn 是个 spy

    const name = await getUserDisplayName(2, logger);

    expect(name).toBe('匿名用户');
    // spy 断言：日志被调用且内容包含错误信息
    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('network down'));
  });
});

describe('jest.spyOn() —— 监视真实对象方法', () => {
  it('spy 一个真实对象的方法，可断言调用又保留原行为', () => {
    const calculator = { add: (a, b) => a + b };
    const spy = jest.spyOn(calculator, 'add');

    const result = calculator.add(2, 3);

    expect(result).toBe(5);                 // 原实现仍然生效
    expect(spy).toHaveBeenCalledWith(2, 3); // 同时记录了调用
    spy.mockRestore();                      // 用完还原，避免污染其他用例
  });

  it('spyOn 也能临时改写实现', () => {
    const obj = { now: () => Date.now() };
    jest.spyOn(obj, 'now').mockReturnValue(1000);
    expect(obj.now()).toBe(1000);
  });
});
