// ============================================================
// 纯函数单元测试：覆盖“正常值 / 边界值 / 异常值”三类输入
// 这是单测的黄金结构：一个函数至少测 happy path + edge case
// ============================================================
const { formatThousands, kebabCase, unique, shouldTrigger } = require('./utils');

describe('formatThousands 千分位', () => {
  it('普通整数', () => {
    expect(formatThousands(1234567)).toBe('1,234,567');
  });
  it('不足四位不加逗号', () => {
    expect(formatThousands(100)).toBe('100');
  });
  it('带小数', () => {
    expect(formatThousands(1234.56)).toBe('1,234.56');
  });
  it('负数', () => {
    expect(formatThousands(-98765)).toBe('-98,765');
  });
  it('非数字抛 TypeError', () => {
    expect(() => formatThousands('abc')).toThrow(TypeError);
    expect(() => formatThousands(NaN)).toThrow('需要一个数字');
  });
});

describe('kebabCase 驼峰转短横线', () => {
  it.each([
    ['backgroundColor', 'background-color'],
    ['fontSize', 'font-size'],
    ['already-kebab', 'already-kebab'],
    ['ABTest', 'a-b-test'],
  ])('%s -> %s', (input, expected) => {
    expect(kebabCase(input)).toBe(expected);
  });
});

describe('unique 去重', () => {
  it('去掉重复并保序', () => {
    expect(unique([1, 2, 2, 3, 1])).toEqual([1, 2, 3]);
  });
  it('空数组返回空数组', () => {
    expect(unique([])).toEqual([]);
  });
  it('字符串数组', () => {
    expect(unique(['a', 'a', 'b'])).toEqual(['a', 'b']);
  });
});

describe('shouldTrigger 防抖判定（纯函数版）', () => {
  it('间隔够长应触发', () => {
    expect(shouldTrigger(0, 300, 300)).toBe(true);
  });
  it('间隔不够不触发', () => {
    expect(shouldTrigger(0, 200, 300)).toBe(false);
  });
});
