// ============================================================
// TDD 视角的测试：这些用例是“先于实现”写出来的规格（spec）。
// 覆盖率目标：statements/branches/functions/lines 全部 ≥ 90%（见 jest.config.js）。
// 每个 it 都在钉死 password.js 里的一个分支。
// ============================================================
const { passwordStrength } = require('./password');

describe('passwordStrength —— TDD 规格', () => {
  describe('weak：无效输入或太短', () => {
    it.each([
      [null],
      [undefined],
      [12345678], // 非字符串
      ['ab1'], // 长度 < 6
    ])('%p → weak', (input) => {
      expect(passwordStrength(input)).toBe('weak');
    });

    it('够长但满足项 <2 也是 weak', () => {
      expect(passwordStrength('aaaaaa')).toBe('weak'); // 只有小写这 1 项
    });
  });

  describe('medium：满足 2~3 项', () => {
    it('小写 + 数字 = 2 项', () => {
      expect(passwordStrength('abc123')).toBe('medium');
    });
    it('小写 + 大写 + 数字 = 3 项', () => {
      expect(passwordStrength('Abc123')).toBe('medium');
    });
  });

  describe('strong：满足 ≥4 项', () => {
    it('小写+大写+数字+特殊 = 4 项', () => {
      expect(passwordStrength('Abc123!@')).toBe('strong');
    });
    it('小写+大写+数字+长度≥12 = 4 项', () => {
      expect(passwordStrength('Abcdefgh1234')).toBe('strong');
    });
  });
});
