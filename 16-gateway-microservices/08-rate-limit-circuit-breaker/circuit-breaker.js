'use strict';

/**
 * 熔断器（Circuit Breaker），经典三态实现（Martin Fowler）。
 *
 *   Closed（闭合/正常）：放行请求，统计连续失败次数；失败达阈值 → Open。
 *   Open（断开/跳闸）  ：直接快速失败走 fallback，不打下游；等 resetTimeout → Half-Open。
 *   Half-Open（半开）  ：放少量试探请求；成功 → Closed；失败 → Open。
 */
class CircuitBreaker {
  /**
   * @param {object} opts
   * @param {number} opts.failureThreshold 连续失败多少次后跳闸（Closed → Open）
   * @param {number} opts.resetTimeout     Open 状态持续多久后转 Half-Open（毫秒）
   * @param {function} [opts.onState]       状态变化回调 (from, to)
   */
  constructor({ failureThreshold = 3, resetTimeout = 3000, onState } = {}) {
    this.failureThreshold = failureThreshold;
    this.resetTimeout = resetTimeout;
    this.onState = onState;

    this.state = 'CLOSED';
    this.failures = 0;        // 连续失败计数
    this.nextAttemptAt = 0;   // Open 期间，什么时候可以进入 Half-Open 试探
  }

  _setState(next) {
    if (this.state !== next) {
      const from = this.state;
      this.state = next;
      if (this.onState) this.onState(from, next);
    }
  }

  /**
   * 用熔断器包裹一次调用。
   * @param {function} fn        真正的下游调用，返回 Promise
   * @param {function} fallback  降级函数，熔断/失败时返回兜底
   * @returns {Promise<any>}
   */
  async call(fn, fallback) {
    // 1) Open 状态：看是否到了可以试探的时间
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttemptAt) {
        // 还在断开期，直接快速失败走降级，根本不打下游
        return fallback('熔断打开，快速失败');
      }
      // 到点了，进入半开试探
      this._setState('HALF_OPEN');
    }

    // 2) Closed 或 Half-Open：真正尝试调用下游
    try {
      const result = await fn();
      this._onSuccess();
      return result;
    } catch (err) {
      this._onFailure();
      // 失败也走降级返回兜底
      return fallback(err.message || String(err));
    }
  }

  _onSuccess() {
    if (this.state === 'HALF_OPEN') {
      // 半开试探成功 → 认为下游恢复了，回到闭合
      this._setState('CLOSED');
    }
    this.failures = 0; // 成功就清零连续失败计数
  }

  _onFailure() {
    if (this.state === 'HALF_OPEN') {
      // 半开时试探又失败 → 立刻退回 Open，重新计时
      this._trip();
      return;
    }
    // Closed 状态：累加失败，达阈值就跳闸
    this.failures += 1;
    if (this.failures >= this.failureThreshold) {
      this._trip();
    }
  }

  /** 跳闸：进入 Open，并设定下次可试探的时间。 */
  _trip() {
    this._setState('OPEN');
    this.nextAttemptAt = Date.now() + this.resetTimeout;
  }
}

module.exports = { CircuitBreaker };
