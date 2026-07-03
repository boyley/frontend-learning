'use strict';

/**
 * 令牌桶限流器（Token Bucket）。
 *
 * 原理：
 *   - 桶最多装 capacity 个令牌。
 *   - 以 refillRate 个/秒 的速度往桶里放令牌，桶满则溢出（丢弃多余令牌）。
 *   - 每个请求要从桶里取走 1 个令牌才能放行；没令牌就被限流拒绝。
 *   - 平时攒下的令牌允许「突发」：一口气来一批请求时，只要桶里有存货就都能过。
 *
 * 采用「惰性补充」：不用后台定时器，而是每次取令牌前，
 * 根据「距上次补充的时间差 × 速率」算出这段时间该补多少，再封顶到 capacity。
 */
class TokenBucket {
  /**
   * @param {object} opts
   * @param {number} opts.capacity   桶容量（最多攒多少令牌，决定最大突发量）
   * @param {number} opts.refillRate 每秒补充多少令牌（决定平均放行速率）
   */
  constructor({ capacity, refillRate }) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.tokens = capacity;        // 初始装满
    this.lastRefill = Date.now();  // 上次补充时间
  }

  /** 根据流逝的时间惰性补充令牌。 */
  _refill() {
    const now = Date.now();
    const elapsedSec = (now - this.lastRefill) / 1000;
    const added = elapsedSec * this.refillRate;
    if (added > 0) {
      // 补充但不超过桶容量（溢出的令牌丢弃）
      this.tokens = Math.min(this.capacity, this.tokens + added);
      this.lastRefill = now;
    }
  }

  /**
   * 尝试取走 1 个令牌。
   * @returns {boolean} true = 放行；false = 令牌不足，被限流拒绝
   */
  tryRemove() {
    this._refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }

  /** 当前桶里剩余令牌（保留一位小数，方便打印观察）。 */
  remaining() {
    this._refill();
    return Math.floor(this.tokens * 10) / 10;
  }
}

module.exports = { TokenBucket };
