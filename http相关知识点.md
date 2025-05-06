## XSS

即 Cross Site Script，中译是跨站脚本攻击；其原本缩写是 CSS，但为了和层叠样式表(Cascading Style Sheet)有所区分，因而在安全领域叫做 XSS。

XSS 攻击是指攻击者在网站上注入恶意的客户端代码，通过恶意脚本对客户端网页进行篡改，从而在用户浏览网页时，对用户浏览器进行控制或者获取用户隐私数据的一种攻击方式。

攻击者对客户端网页注入的恶意脚本一般包括 JavaScript，有时也会包含 HTML 和 Flash。有很多种方式进行 XSS 攻击，但它们的共同点为：将一些隐私数据像 cookie、session 发送给攻击者，将受害者重定向到一个由攻击者控制的网站，在受害者的机器上进行一些恶意操作。

#### 防范

##### HttpOnly 防止劫取 Cookie

HttpOnly 最早由微软提出，至今已经成为一个标准。浏览器将禁止页面的 Javascript 访问带有 HttpOnly 属性的 Cookie。

上文有说到，攻击者可以通过注入恶意脚本获取用户的 Cookie 信息。通常 Cookie 中都包含了用户的登录凭证信息，攻击者在获取到 Cookie 之后，则可以发起 Cookie 劫持攻击。所以，严格来说，HttpOnly 并非阻止 XSS 攻击，而是能阻止 XSS 攻击后的 Cookie 劫持攻击。

##### 输入检查

对于用户的任何输入要进行检查、过滤和转义。建立可信任的字符和 HTML 标签白名单，对于不在白名单之列的字符或者标签进行过滤或编码。

在 XSS 防御中，输入检查一般是检查用户输入的数据中是否包含 <，> 等特殊字符，如果存在，则对特殊字符进行过滤或编码，这种方式也称为 XSS Filter。

而在一些前端框架中，都会有一份 decodingMap， 用于对用户输入所包含的特殊字符或标签进行编码或过滤，如 <，>，script，防止 XSS 攻击。

##### 输出检查

用户的输入会存在问题，服务端的输出也会存在问题。一般来说，除富文本的输出外，在变量输出到 HTML 页面时，可以使用编码或转义的方式来防御 XSS 攻击。例如利用 sanitize-html 对输出内容进行有规则的过滤之后再输出到页面中。

## cxrf

CSRF（Cross-site request forgery）跨站请求伪造

#### 原理：

- 受害者登录 a.com，并保留了登录凭证（Cookie）。
- 攻击者引诱受害者访问了 b.com。
- b.com 向 a.com 发送了一个请求：a.com/act=xx。浏览器会默认携带 a.com 的 Cookie。
- a.com 接收到请求后，对请求进行验证，并确认是受害者的凭证，误以为是受害者自己发送的请求。
- a.com 以受害者的名义执行了 act=xx。
- 攻击完成，攻击者在受害者不知情的情况下，冒充受害者，让 a.com 执行了自己定义的操作。

攻击一般发起在第三方网站，而不是被攻击的网站。被攻击的网站无法防止攻击发生。 cookie 保证了用户可以处于登录状态，但网站 B 其实拿不到 cookie。

#### 防范：

- 同源检测——检查 referer、origin 等请求头，但是有已被篡改的可能。
- cxrf token：在源页面存一个服务器生成的 token，Form 提交时，这个 token 也一并提交上去以供校验。
- 双重 token：`cxrf token`方式需要服务端保存 token，增加了复杂度。可以在 cookie 保存这个 token，在源页面也保存这个 token，提交表单时这两个 token 同时提交，服务器端只需要对请求中的两个参数进行校验即可，省去了在服务器端维护 Token 的步骤。
- cookie 设置 samesite 属性，存在兼容性问题。有三个选项
  - Strict：最严格模式，完全禁止第三方 Cookie，跨站点访问时，任何情况下都不会发送 Cookie。换言之，只有当前网页的 URL 与请求目标一致，才会带上 Cookie。
  - Lax：对于第三方 cookie 只有 a 链接、link 标签、Form 的 get 请求才会带上 cookie，其他如 Form 的 post 请求、Ajax 的 post 请求、img 的 src 都不带上 cookie。
  - none：原始方式，任何情况都提交目标系统的 Cookie。

由于 Cookie 的安全限制，只能在本域名或子域名下访问到 Cookie 值，兄弟子域名无法访问到，如 a.bank.com 域名下的 Cookie，只能被 a.bank.com，sub.a.bank.com 访问，无法被 b.bank.com 访问。对于分布式应用，可能需要在多个子域名中提交请求，所以一般需要把 Cookie 保存在根域名 bank.com 中。不过此方式存在安全风险，如果任何一个子域下的页面存在 XSS 攻击，可导致根域名下的 Cookie 被篡改，Token 可被攻击者任意修改，导致安全措施失效。

#### 跨域请求、简单请求和复杂请求

满足以下条件是简单请求：

- get、post、head
- 请求头除了以下请求头，没有自定义请求头
  - Content-Type
  - Content-Language
  - Accept
  - Accept-Language
- Content-Type 只能是以下的三种
  - text/plain
  - multipart/form-data
  - application/x-www-form-urlencoded

对于简单请求，只需要设置`Access-Control-Allow-Origin`

对于复杂请求，需要设置不同的响应头，因为预检请求会发送相应的请求头信息，例如：

```
Access-Control-Request-Method: Post
Access-Control-Request-Headers: Content-Type、自定义头部
```

服务端需要设置响应头：

```
Access-Control-Allow-Origin: http://xxx.com
Access-Control-Allow-Methods: Post
Access-Control-Allow-Headers: Content-Type、自定义头部
Access-Control-Max-Age: 86400 // 设置max age，浏览器端会进行缓存。没有过期之前真对同一个请求只会发送一次预检请求
```

如果需要发送 cookie，也需要返回对应响应头：

```
Access-Control-Allow-Credentials: true
```

同时`Access-Control-Allow-Origin`不能设置为`*`
