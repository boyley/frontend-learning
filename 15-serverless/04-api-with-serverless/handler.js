/**
 * 04 · 用云函数写 HTTP API
 * ---------------------------------------------------------------
 * 云函数写 API 的核心：函数不再自己 listen 端口，而是由「API 网关」
 * 把 HTTP 请求「翻译」成一个 event 交给函数；函数返回一个约定结构，
 * 网关再把它「翻译」回 HTTP 响应。
 *
 * AWS API Gateway (proxy 集成) 约定的事件/响应结构（本项目采用同款）：
 *   event  = { httpMethod, path, headers, queryStringParameters, body }
 *   return = { statusCode, headers, body }   // body 必须是「字符串」
 *
 * 这就是为什么同一段业务代码，可以既跑在 Lambda，也能被本地服务器复用——
 * 只要输入输出都遵守这个「函数 <-> HTTP」的契约。
 */

// GET /hello?name=xxx  → 返回问候 JSON
exports.hello = async (event) => {
  const name = (event.queryStringParameters && event.queryStringParameters.name) || 'world';
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ message: `Hello, ${name}!` }),
  };
};

// POST /echo  (body: JSON)  → 原样回显 + 附加服务器时间
exports.echo = async (event) => {
  let payload = {};
  try {
    payload = event.body ? JSON.parse(event.body) : {};
  } catch (e) {
    // body 不是合法 JSON，返回 400
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ error: 'body 必须是合法 JSON' }),
    };
  }
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      youSent: payload,
      method: event.httpMethod,
      serverTime: new Date().toISOString(),
    }),
  };
};
