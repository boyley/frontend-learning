// Vitest 配置（复用 Vite 的配置体系，同一份 config 即可）
// 官方：https://vitest.dev/config/
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // 测试环境：'node'（默认）/ 'jsdom' / 'happy-dom'。测 DOM 组件时改 jsdom。
    environment: 'node',
    // globals: true 时可不 import 直接用 describe/it/expect（更像 Jest）；
    // 这里保持 false，显式 import 更清晰、利于 tree-shaking。
    globals: false,
    // 覆盖率提供者（v8 内置，无需 babel 插桩）
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});
