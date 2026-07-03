// ============================================================
// Vitest：API 与 Jest 高度兼容（describe/it/expect），
// 差别主要是：用 vi 代替 jest（vi.fn / vi.mock / vi.spyOn）、ESM 原生、更快。
// 官方：https://vitest.dev/api/
// ============================================================
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { subtotal, checkout } from './cart.js';
import { getTaxRate } from './taxApi.js';

// ⭐ 把整个 ./taxApi.js 模块替换成 mock：getTaxRate 变成一个可控的 vi.fn()
// （vi.mock 会被提升到文件顶部，等价于 Jest 的 jest.mock）
vi.mock('./taxApi.js');

const items = [
  { name: '键盘', price: 100, qty: 1 },
  { name: '鼠标', price: 50, qty: 2 }, // 100 + 100 = 200
];

describe('subtotal —— 纯函数，用 test.each 批量参数化', () => {
  it.each([
    [[], 0],
    [[{ price: 10, qty: 3 }], 30],
    [items, 200],
  ])('subtotal(%j) === %i', (input, expected) => {
    expect(subtotal(input)).toBe(expected);
  });
});

describe('checkout —— 演示 vi.mock 控制依赖 + spy 回调', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // 清掉上一个用例的调用记录
  });

  it('用 mockResolvedValue 喂税率，验证总价与回调', async () => {
    // 让被 mock 的 getTaxRate 返回固定 0.1（不发真请求）
    getTaxRate.mockResolvedValue(0.1);
    const notify = vi.fn(); // 造一个假回调，天生带调用记录

    const total = await checkout(items, 'CN', notify);

    expect(total).toBe(220); // 200 * 1.1
    expect(getTaxRate).toHaveBeenCalledWith('CN'); // 断言依赖被正确调用
    expect(notify).toHaveBeenCalledWith('应付 ¥220'); // 断言回调交互
  });

  it('依赖抛错时 checkout 也应拒绝（mockRejectedValue）', async () => {
    getTaxRate.mockRejectedValue(new Error('未知地区: XX'));
    await expect(checkout(items, 'XX')).rejects.toThrow('未知地区');
  });
});

describe('vi.spyOn —— 监视/临时改写真实对象方法', () => {
  it('冻结 Math.random 让随机变可测', () => {
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0.42);
    expect(Math.random()).toBe(0.42);
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore(); // 用完还原真实实现
  });
});

describe('假定时器 —— 与 Jest 一致的 API', () => {
  it('用 vi.useFakeTimers 快进时间', () => {
    vi.useFakeTimers();
    const cb = vi.fn();
    setTimeout(cb, 3000);
    expect(cb).not.toHaveBeenCalled();
    vi.advanceTimersByTime(3000); // 瞬间快进 3 秒
    expect(cb).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });
});
