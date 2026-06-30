// logger.js —— 被导入的子模块：演示「默认导出」（default export）
// 一个模块最多只能有一个 default export，导入时可以任意取名

// 默认导出一个函数；导入方写 import createLogger from './logger.js'
export default function createLogger(prefix) {
  return function (message) {
    return `[${prefix}] ${message}`;
  };
}

// 默认导出可以和命名导出共存
export const version = '1.0.0';
