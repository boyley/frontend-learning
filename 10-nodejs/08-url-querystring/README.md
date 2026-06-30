# 08 · URL 解析与查询字符串
> 用标准的 `URL` 类和 `URLSearchParams` 解析网址、读写查询参数。这套 API 和浏览器完全一致，旧的 `url.parse()` / `querystring` 已是 Legacy。

## 📖 知识讲解

**`URL` 类**（全局可用，WHATWG 标准）把一个网址拆成结构化的属性：

```
https://user:pass@www.example.com:8080/path/page?id=42&tag=node#sec
└─protocol─┘       └────hostname────┘ └port┘└─pathname─┘└──search──┘└hash┘
```

| 属性 | 含义 |
| --- | --- |
| `protocol` | 协议 `https:` |
| `hostname` / `port` / `host` | 主机 / 端口 / 主机+端口 |
| `pathname` | 路径 `/path/page` |
| `search` | 查询串 `?id=42&...` |
| `searchParams` | 查询参数对象（URLSearchParams） |
| `hash` | 锚点 `#sec` |
| `origin` | 源 `https://www.example.com:8080` |

**`URLSearchParams`** 专门处理查询参数：

| 方法 | 作用 |
| --- | --- |
| `get(k)` / `getAll(k)` | 取第一个值 / 取同名所有值 |
| `set(k,v)` / `append(k,v)` | 设置（覆盖）/ 追加 |
| `has(k)` / `delete(k)` | 判断 / 删除 |
| `toString()` | 序列化为查询串（**自动 URL 编码**） |

**相对路径拼接**：`new URL('/v2/users', 'https://api.example.com')` 用第二个参数作 base，把相对路径补成绝对地址。

## 🔄 流程图 / 原理图

```mermaid
graph LR
    U["new URL(完整网址)"] --> P1["protocol"]
    U --> P2["host / hostname / port"]
    U --> P3["pathname"]
    U --> P4["searchParams"]
    U --> P5["hash"]
    P4 --> Q1["get/getAll 读"]
    P4 --> Q2["set/append/delete 改"]
    P4 --> Q3["toString 自动编码"]
```

## 💻 代码说明

`url-demo.js`：用 `new URL(...)` 解析一个含用户名/端口/查询/锚点的完整网址并打印各部分；用 `searchParams.get/getAll/has` 读参数（含同名参数）；`set/append/delete` 改参数后回看 `href`；独立用 `URLSearchParams` 拼查询串（演示中文自动编码）；最后演示 `pathToFileURL` / `fileURLToPath` 在文件路径与 `file://` URL 间互转。

## ▶️ 运行方式

```bash
node url-demo.js
```

## ⚠️ 常见坑 / 最佳实践

- ❌ 新代码再用 `url.parse()` 和 `querystring` 模块（已标记 Legacy）；统一用 `URL` / `URLSearchParams`。
- ⚠️ `new URL('相对路径')` 不带 base 会**抛错**；解析相对路径必须给第二个参数。
- ⚠️ `getAll` 才能拿到同名参数的全部值，`get` 只返回第一个。
- ✅ 拼接带中文/特殊字符的参数用 `URLSearchParams`，它会自动做 URL 编码，别手写字符串拼。

## 🔗 官方文档

- [URL 模块](https://nodejs.org/docs/latest/api/url.html)
- [URLSearchParams](https://nodejs.org/docs/latest/api/url.html#class-urlsearchparams)
