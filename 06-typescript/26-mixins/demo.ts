/**
 * 26 · 混入模式（Mixins）demo
 * 运行：在 06-typescript 目录下执行 `npx ts-node 26-mixins/demo.ts`
 *
 * 本模块只聚焦一个主题：用「构造函数类型 + 泛型约束」把多个可复用能力
 * 「拼装」到一个类上——这是 TS 里模拟「多重继承 / 能力组合」的官方推荐做法。
 *
 * 核心零件：
 *   type Constructor = new (...args: any[]) => {}   —— 表示「任意类构造函数」
 *   一个 mixin = 接收一个基类、返回一个「扩展了新能力的子类」的函数
 */

// ===== 1. 定义「构造函数类型」——所有 mixin 的地基 =====
// new (...args: any[]) => {} 表示：任何「可被 new、返回对象」的类
type Constructor = new (...args: any[]) => {};
// 带类型参数的版本：约束基类实例至少具备 T 的成员（用于「有约束的 mixin」）
type GConstructor<T = {}> = new (...args: any[]) => T;

// ===== 2. 一个基础类，作为被「混入」的起点 =====
class Sprite {
  constructor(public name: string) {}
}

// ===== 3. 无约束 mixin：给任意基类加「缩放」能力 =====
// TBase extends Constructor 保证 Base 是个可继承的类
function Scale<TBase extends Constructor>(Base: TBase) {
  return class Scaling extends Base {
    // 混入的新状态与方法
    private _scale = 1;
    setScale(scale: number) {
      this._scale = scale;
    }
    get scale(): number {
      return this._scale;
    }
  };
}

// ===== 4. 另一个 mixin：给任意基类加「时间戳」能力 =====
function Timestamped<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    timestamp = Date.now();
  };
}

// ===== 5. 组合：像搭积木一样把多个能力叠加到 Sprite 上 =====
const EnhancedSprite = Timestamped(Scale(Sprite));
const sprite = new EnhancedSprite("hero"); // 构造参数来自最底层的 Sprite
sprite.setScale(2); // 来自 Scale
console.log("mixin 组合能力:", {
  name: sprite.name, // 来自 Sprite
  scale: sprite.scale, // 来自 Scale
  hasTimestamp: typeof sprite.timestamp === "number", // 来自 Timestamped
});

// ===== 6. 有约束的 mixin：要求基类必须已具备某些成员 =====
// 先定义一个「可定位」的基类形状
type Positionable = GConstructor<{ setPos: (x: number, y: number) => void }>;

class Point {
  x = 0;
  y = 0;
  setPos(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

// Jumpable 要求基类必须能 setPos（否则 jump 里就没法调用）
function Jumpable<TBase extends Positionable>(Base: TBase) {
  return class extends Base {
    jump() {
      // ✅ 因为约束了 Positionable，这里能安全调用基类的 setPos
      this.setPos(0, 20);
    }
  };
}

const JumpingPoint = Jumpable(Point);
const jp = new JumpingPoint();
jp.jump();
console.log("有约束的 mixin:", { x: jp.x, y: jp.y });

// ❌ 错误示范：把 Jumpable 用在不满足约束的基类上
// class Bare {}
// const Bad = Jumpable(Bare);
//   报错：类型 'typeof Bare' 不满足约束 'Positionable'——Bare 没有 setPos，
//         这正是 GConstructor<T> 约束在保护你：能力所依赖的前提被静态检查住了。

export {};
