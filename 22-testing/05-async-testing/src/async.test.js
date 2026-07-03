// ============================================================
// 异步测试三种写法 + 假定时器
// 官方：https://jestjs.io/docs/asynchronous
// 关键：一定要“告诉 Jest 等异步完成”，否则用例会提前结束误判 PASS
// ============================================================
const { fetchScore, loadConfig, delayGreet } = require('./async');

describe('写法一：async/await（最推荐，最像同步）', () => {
  it('resolve 的值', async () => {
    const score = await fetchScore(true);
    expect(score).toBe(90);
  });

  it('reject 用 try/catch 或 rejects', async () => {
    await expect(fetchScore(false)).rejects.toThrow('查询失败');
  });
});

describe('写法二：返回 Promise + resolves/rejects matcher', () => {
  it('必须 return，否则 Jest 不等它', () => {
    return expect(fetchScore(true)).resolves.toBe(90);
  });
});

describe('写法三：done 回调（用于回调风格 API）', () => {
  it('error-first callback', (done) => {
    loadConfig((err, config) => {
      try {
        expect(err).toBeNull();
        expect(config).toEqual({ theme: 'dark' });
        done(); // 不调用 done，用例会超时失败
      } catch (e) {
        done(e); // 把断言错误传给 done，才能正确报红
      }
    });
  });
});

describe('假定时器：不用真的等待 2 秒', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('用 advanceTimersByTime 快进时间', () => {
    const cb = jest.fn();
    delayGreet('小明', 2000, cb);
    expect(cb).not.toHaveBeenCalled(); // 此刻还没到点

    jest.advanceTimersByTime(2000);    // 快进 2 秒（瞬间完成）

    expect(cb).toHaveBeenCalledWith('你好, 小明');
  });
});
