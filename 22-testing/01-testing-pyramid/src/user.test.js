// ============================================================
// 用同一份 user.js，演示金字塔“底两层”的测试写法
//   - 单元测试（Unit）：只测一个纯函数 discountRate
//   - 集成测试（Integration）：测多个函数组合后的行为 finalPrice
// （E2E 层放在 08-e2e-playwright 模块用真实浏览器演示）
// ============================================================
const { discountRate, finalPrice } = require('./user');

// ---------- 底层：单元测试，数量最多、跑得最快 ----------
describe('单元测试 · discountRate（纯函数，无依赖）', () => {
  it('普通用户不打折', () => {
    expect(discountRate('normal')).toBe(1);
  });
  it('VIP 打 85 折', () => {
    expect(discountRate('vip')).toBe(0.85);
  });
  it('SVIP 打 7 折', () => {
    expect(discountRate('svip')).toBe(0.7);
  });
  it('未知等级按原价', () => {
    expect(discountRate('unknown')).toBe(1);
  });
});

// ---------- 中层：集成测试，验证多个单元“拼装”后的正确性 ----------
describe('集成测试 · finalPrice（组合校验 + 折扣计算）', () => {
  it('VIP 买 100 元应付 85 元', () => {
    expect(finalPrice(100, 'vip')).toBe(85);
  });
  it('SVIP 买 200 元应付 140 元', () => {
    expect(finalPrice(200, 'svip')).toBe(140);
  });
  it('非法价格抛错', () => {
    expect(() => finalPrice(-1, 'vip')).toThrow('price 必须是非负数字');
  });
});
