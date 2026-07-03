// 真实的网络请求模块（测试时会被 jest.mock 整体替换）
// 这里用 setTimeout 模拟一个真实异步请求
function fetchUser(id) {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ id, name: `user-${id}`, nickname: '' }), 50);
  });
}
module.exports = { fetchUser };
