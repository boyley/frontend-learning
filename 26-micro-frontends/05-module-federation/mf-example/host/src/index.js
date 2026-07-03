// host 入口。同样用异步 import 加载 bootstrap，
// 目的：让 Webpack 先完成联邦运行时（含 shared 依赖协商）的初始化，
// 再执行会去 import('remote/Button') 的业务代码。
import('./bootstrap.js');
