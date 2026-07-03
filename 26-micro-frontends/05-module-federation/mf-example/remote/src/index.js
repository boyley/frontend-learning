// remote 单独运行时的入口。
// 【重要】用 Module Federation 时，入口通常要拆成 index.js + bootstrap.js 两层，
// index.js 里用「异步 import」去加载 bootstrap，这样 Webpack 才有机会先把
// 联邦所需的 shared 依赖初始化好，再执行真正的业务代码（否则会报
// "Shared module is not available for eager consumption"）。
import('./bootstrap.js');
