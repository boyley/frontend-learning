// remote 单独运行时的真正业务代码。
// 直接使用本地的 Button 模块，把按钮挂到页面上，证明 remote 能独立运行。
import createButton from './Button.js';

const root = document.getElementById('root');
root.appendChild(createButton('Remote 本地按钮'));
