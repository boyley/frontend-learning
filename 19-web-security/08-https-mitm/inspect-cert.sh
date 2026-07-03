#!/bin/sh
# =============================================================================
# inspect-cert.sh —— HTTPS 证书链 / TLS / HSTS 检查小工具（demo 为辅）
# -----------------------------------------------------------------------------
# 作用：用系统自带的 openssl 与 curl，"亲眼看" 一个真实网站的：
#   1) 证书链层级与签发 CA（信任链）
#   2) 证书有效期、域名（SAN）匹配
#   3) 证书校验结果（Verify return code）
#   4) 协商出的 TLS 版本与密码套件（是否前向保密）
#   5) 是否启用 HSTS 响应头（能否抵御 SSL Stripping 降级）
#
# 用法：
#   sh inspect-cert.sh                 # 不传参数，默认检测 example.com
#   sh inspect-cert.sh www.baidu.com   # 检测指定域名
#
# 说明：本脚本只做 "只读观察"，不发起任何攻击。文中涉及 MITM 的部分仅为
#       帮助理解防御原理（仅供学习）。macOS / Linux 一般自带 openssl 和 curl。
# =============================================================================

# 取第一个参数作为目标域名；没传就用 example.com 兜底
HOST="${1:-example.com}"
PORT=443

echo "=================================================================="
echo "  正在检查：$HOST:$PORT"
echo "=================================================================="

# -----------------------------------------------------------------------------
# ① 证书链概览：签发者(issuer) / 主体(subject) / 有效期 / SAN 域名
#    - openssl s_client 建立 TLS 连接并把服务器证书打出来
#    - </dev/null 让它握手完成后立即结束，不进入交互
#    - 2>/dev/null 屏蔽握手过程的杂项 stderr
#    - 再用 openssl x509 解析出关键字段
# -----------------------------------------------------------------------------
echo
echo "【1】证书关键信息（签发 CA / 主体 / 有效期 / SAN）"
echo "------------------------------------------------------------------"
echo | openssl s_client -connect "$HOST:$PORT" -servername "$HOST" 2>/dev/null \
  | openssl x509 -noout -issuer -subject -dates -ext subjectAltName 2>/dev/null
# 解读：
#   issuer  = 给本站签名的（中间）CA —— 它再往上被根 CA 背书，构成信任链
#   subject = 证书主体（站点身份）
#   notBefore/notAfter = 有效期，过期浏览器会拦截
#   Subject Alternative Name = 证书覆盖的域名列表，访问域名必须命中其一

# -----------------------------------------------------------------------------
# ② 完整证书链层级 + 校验结果 + 协商的 TLS 版本 / 密码套件
#    - -showcerts 打印链上每一张证书
#    - 关注输出里的：
#        Certificate chain      证书链层级（0=站点, 1=中间CA, ...）
#        Verify return code     0 (ok) 表示证书校验通过 ✅
#        Protocol               如 TLSv1.3（越新越安全）
#        Cipher                 如 TLS_AES_256_GCM_SHA384（ECDHE=前向保密）
# -----------------------------------------------------------------------------
echo
echo "【2】证书链层级 + 校验结果 + TLS 版本/套件"
echo "------------------------------------------------------------------"
echo | openssl s_client -connect "$HOST:$PORT" -servername "$HOST" -showcerts 2>/dev/null \
  | grep -E "Certificate chain|s:|i:|Protocol|Cipher|Verify return code" \
  | head -n 40
# 解读：
#   s: = subject（该级证书主体）  i: = issuer（签发它的上一级）
#   逐级 i: 往上，最终应指向系统信任库里的根 CA —— 信任链闭合
#   Verify return code: 0 (ok) 才算校验通过；非 0 表示链有问题

# -----------------------------------------------------------------------------
# ③ HSTS 响应头：能否抵御 SSL Stripping 降级
#    - curl -sI 只取响应头（HEAD）
#    - 出现 Strict-Transport-Security 即启用了 HSTS
#      max-age 越长越好；includeSubDomains 覆盖子域；preload 进内置列表防首访降级
# -----------------------------------------------------------------------------
echo
echo "【3】HSTS 响应头（防 SSL Stripping 降级）"
echo "------------------------------------------------------------------"
HSTS=$(curl -sI "https://$HOST" 2>/dev/null | grep -i "strict-transport-security")
if [ -n "$HSTS" ]; then
  echo "✅ 已启用 HSTS：$HSTS"
else
  echo "⚠️  未检测到 Strict-Transport-Security 头（可能存在被降级为 HTTP 的风险）"
fi

echo
echo "=================================================================="
echo "  提示："
echo "   - Verify return code 为 0 (ok) 表示证书信任链校验通过"
echo "   - Protocol 为 TLSv1.3 / Cipher 含 ECDHE 表示启用了前向保密"
echo "   - 有 HSTS 头（尤其带 preload）可抵御 SSL Stripping 中间人降级"
echo "=================================================================="
