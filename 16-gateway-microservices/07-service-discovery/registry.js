'use strict';

/**
 * 内存版「服务注册表」Service Registry。
 *
 * 数据结构：
 *   services: Map<服务名, Map<实例ID, { address, expireAt }>>
 *   - 外层 key 是服务名（如 "user-service"）
 *   - 内层 key 是实例ID（同一服务的每个实例唯一）
 *   - expireAt 是这条记录的「过期时间戳」，收到心跳就往后刷新
 *
 * 剔除机制：
 *   后台有一个定时器，每隔 sweepInterval 扫一遍，把 expireAt < now 的实例删掉。
 *   这模拟了真实注册中心（Eureka/Consul/Nacos）的「心跳续约 + 超时剔除」。
 */
class ServiceRegistry {
  /**
   * @param {object} opts
   * @param {number} opts.ttl           实例存活时间（毫秒）。超过这个时间没心跳就被剔除。
   * @param {number} opts.sweepInterval 后台扫描剔除的周期（毫秒）。
   * @param {function} [opts.onEvict]   实例被剔除时的回调（serviceName, instanceId）。
   */
  constructor({ ttl = 10000, sweepInterval = 1000, onEvict } = {}) {
    this.ttl = ttl;
    this.sweepInterval = sweepInterval;
    this.onEvict = onEvict;
    /** @type {Map<string, Map<string, {address: string, expireAt: number}>>} */
    this.services = new Map();

    // 启动后台扫描定时器；unref() 让它不要阻止 Node 进程退出。
    this._timer = setInterval(() => this._sweep(), this.sweepInterval);
    if (this._timer.unref) this._timer.unref();
  }

  /**
   * 注册一个实例（自注册的第一步）。
   * @param {string} serviceName 服务名
   * @param {string} instanceId  实例ID
   * @param {string} address     实例地址 IP:port
   */
  register(serviceName, instanceId, address) {
    if (!this.services.has(serviceName)) {
      this.services.set(serviceName, new Map());
    }
    const instances = this.services.get(serviceName);
    instances.set(instanceId, {
      address,
      expireAt: Date.now() + this.ttl, // 初始过期时间 = 现在 + TTL
    });
  }

  /**
   * 心跳续约：收到心跳就把过期时间往后推 TTL。
   * @returns {boolean} 该实例是否还在表里（true 续约成功，false 说明已被剔除）
   */
  heartbeat(serviceName, instanceId) {
    const instances = this.services.get(serviceName);
    const inst = instances && instances.get(instanceId);
    if (!inst) return false; // 已经被剔除了，续约失败
    inst.expireAt = Date.now() + this.ttl; // 刷新 TTL
    return true;
  }

  /**
   * 主动注销（优雅下线时调用），别干等 TTL 超时。
   */
  deregister(serviceName, instanceId) {
    const instances = this.services.get(serviceName);
    if (instances) instances.delete(instanceId);
  }

  /**
   * 查询某服务当前「活着」的实例地址列表。消费者调用前先查这个。
   * @returns {string[]} 地址数组
   */
  getInstances(serviceName) {
    const instances = this.services.get(serviceName);
    if (!instances) return [];
    return [...instances.values()].map((i) => i.address);
  }

  /** 后台扫描：把过期实例剔除。 */
  _sweep() {
    const now = Date.now();
    for (const [serviceName, instances] of this.services) {
      for (const [instanceId, inst] of instances) {
        if (inst.expireAt < now) {
          instances.delete(instanceId);
          if (this.onEvict) this.onEvict(serviceName, instanceId);
        }
      }
    }
  }

  /** 停止后台定时器（demo 结束时清理用）。 */
  stop() {
    clearInterval(this._timer);
  }
}

module.exports = { ServiceRegistry };
