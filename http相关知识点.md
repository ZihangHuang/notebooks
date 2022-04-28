#### cxrf 防范

- 同源检测-检查 referer、origin 等请求头，但是有已被篡改的可能。
- cookie 设置 samesite 属性，存在兼容性问题。有三个选项
  - Strict：最严格模式，完全禁止第三方 Cookie，跨站点访问时，任何情况下都不会发送 Cookie。换言之，只有当前网页的 URL 与请求目标一致，才会带上 Cookie。
  - Lax：对于第三方 cookie 只有 a 链接、link 标签、Form 的 get 请求才会带上 cookie，其他如 Form 的 post 请求、Ajax 的 post 请求、img 的 src 都不带上 cookie。
  - none：原始方式，任何情况都提交目标系统的 Cookie。
- cxrf token：在源页面存一个服务器生成的 token，Form 提交时，这个 token 也一并提交上去以供校验。
- 双重 token：`cxrf token`方式需要服务端保存 token，增加了复杂度。可以在 cookie 保存这个 token，在源页面也保存这个 token，提交表单时这两个 token 同时提交，服务器端只需要对请求中的两个参数进行校验即可，省去了在服务器端维护 Token 的步骤。

由于 Cookie 的安全限制，只能在本域名或子域名下访问到 Cookie 值，兄弟子域名无法访问到，如 a.bank.com 域名下的 Cookie，只能被 a.bank.com，sub.a.bank.com 访问，无法被 b.bank.com 访问。对于分布式应用，可能需要在多个子域名中提交请求，所以一般需要把 Cookie 保存在根域名 bank.com 中。不过此方式存在安全风险，如果任何一个子域下的页面存在 XSS 攻击，可导致根域名下的 Cookie 被篡改，Token 可被攻击者任意修改，导致安全措施失效。
