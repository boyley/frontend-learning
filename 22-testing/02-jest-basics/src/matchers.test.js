// ============================================================
// Jest 基础：describe / it(test) / expect + 常用 matcher 全家桶
// 官方 matcher 参考：https://jestjs.io/docs/expect
// 本文件不测业务代码，专门演示“断言器怎么用”
// ============================================================

describe('1) 相等性 matcher', () => {
  test('toBe：基本类型的严格相等（===，Object.is）', () => {
    expect(2 + 2).toBe(4);
    expect('a' + 'b').toBe('ab');
  });

  test('toEqual：递归比较对象/数组的“值”是否相等', () => {
    const a = { name: 'jest', tags: ['fast', 'zero-config'] };
    expect(a).toEqual({ name: 'jest', tags: ['fast', 'zero-config'] });
    // 注意：toBe 会失败，因为是两个不同引用
    expect(a).not.toBe({ name: 'jest', tags: ['fast', 'zero-config'] });
  });

  test('toStrictEqual：比 toEqual 更严，连 undefined 字段、类型都比', () => {
    expect({ a: 1, b: undefined }).toEqual({ a: 1 }); // toEqual 认为相等
    expect({ a: 1, b: undefined }).not.toStrictEqual({ a: 1 }); // toStrictEqual 不相等
  });
});

describe('2) 真值 / 数字 matcher', () => {
  test('truthiness', () => {
    expect(null).toBeNull();
    expect(undefined).toBeUndefined();
    expect(1).toBeDefined();
    expect('non-empty').toBeTruthy();
    expect(0).toBeFalsy();
  });

  test('数字比较', () => {
    expect(10).toBeGreaterThan(9);
    expect(10).toBeGreaterThanOrEqual(10);
    expect(9).toBeLessThan(10);
    // 浮点数用 toBeCloseTo，避免 0.1+0.2 !== 0.3 的坑
    expect(0.1 + 0.2).toBeCloseTo(0.3);
  });
});

describe('3) 字符串 / 数组 / 对象 matcher', () => {
  test('字符串正则匹配', () => {
    expect('Jest is great').toMatch(/great/);
  });
  test('数组包含', () => {
    expect(['a', 'b', 'c']).toContain('b');
    expect([{ id: 1 }]).toContainEqual({ id: 1 }); // 深比较版
  });
  test('对象部分匹配', () => {
    expect({ id: 1, name: 'x', extra: true }).toMatchObject({ id: 1, name: 'x' });
    expect([1, 2, 3]).toHaveLength(3);
  });
});

describe('4) 异常 matcher', () => {
  function boom() {
    throw new Error('炸了');
  }
  test('toThrow：断言函数会抛错（注意传的是函数引用，不是调用结果）', () => {
    expect(() => boom()).toThrow();
    expect(() => boom()).toThrow('炸了');
    expect(() => boom()).toThrow(/炸/);
  });
});

// ------------------------------------------------------------
// 5) 生命周期钩子：控制“测试前后做什么”
//   beforeAll/afterAll：整个文件跑一次
//   beforeEach/afterEach：每个 test 前后各跑一次（常用于重置状态）
// ------------------------------------------------------------
describe('5) 生命周期钩子执行顺序', () => {
  const order = [];
  beforeAll(() => order.push('beforeAll'));
  afterAll(() => {
    order.push('afterAll');
    // afterAll 里能看到完整顺序
    expect(order[0]).toBe('beforeAll');
  });
  beforeEach(() => order.push('beforeEach'));
  afterEach(() => order.push('afterEach'));

  test('第一个用例', () => order.push('test-1'));
  test('第二个用例', () => order.push('test-2'));
});
