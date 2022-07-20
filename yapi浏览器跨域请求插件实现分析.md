### 谷歌浏览器插件实现跨域请求

manifest.json

```json
{
  "manifest_version": 2,
  "name": "cross-request",
  "description": "跨域请求",
  "version": "1",
  "browser_action": {
    "default_icon": "icon.png",
    "default_popup": "popup.html"
  },
  "permissions": [
    "webRequest", // 使扩展程序能够访问 chrome.webRequest API
    "webRequestBlocking" // 如果扩展程序以阻塞方式使用 chrome.webRequest API 则必须指定。
  ],
  // 在后台运行的脚本，可以跨域请求
  "background": {
    "scripts": ["background.js"]
  },
  // content_scripts 使用的资源文件
  "web_accessible_resources": ["index.js"],
  // 在网页上下文中运行的文件，可以访问网页的dom，但是无法访问变量，无法跨域请求
  // response.js中插入了index.js
  "content_scripts": [
    {
      "matches": ["http://*/*", "https://*/*"],
      "js": ["response.js"],
      "all_frames": true
    }
  ]
}
```

```javascript
crossRequest({
  url: "http://127.0.0.1:3000/api",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  data: {
    a: 1,
  },
  success: function (res) {
    console.log(res);
  },
});
```

#### 发起跨域请求的流程（伪代码）

1、`response.js`插入了`index.js`，外部调用`crossRequest`方法时，是调用了`index.js`里面的定义的`run`方法。

2、`index.js`创建发起请求的信息，并一直轮询请求是否有结果：

```javascript
var INITSTATUS = 0;
var RUNSTATUS = 1;
var ENDSTATUS = 2;

// 创建一个dom作为存储信息的父元素，response.js里会使用这个dom来获取信息
var yRequestDom = createNode(
  "div",
  { id: container, style: "display:none" },
  document.getElementsByTagName("body")[0]
);
// 创建一个对象来记录请求的回调等
var yRequestMap = {};
function run(req) {
  data = {
    res: null,
    req: req,
  };
  var newId = getid();
  // 每次请求创建一个dom来记录请求信息，插入yRequestDom
  var div = createNode(
    "div",
    {
      _id: newId,
      status: INITSTATUS, // 记录状态为初始化
    },
    yRequestDom
  );
  div.innerText = data;
  // 记录请求的回调等信息
  yRequestMap[newId] = {
    id: newId,
    status: INITSTATUS,
    success: function (res, header, data) {
      if (typeof req.success === "function") {
        req.success(res, header, data);
      }
    },
    error: function (error, header, data) {
      if (typeof req.error === "function") {
        req.error(error, header, data);
      }
    },
  };
  monitor();
}

function monitor() {
  if (interval) return;

  // 轮询查看yRequestDom里的请求信息
  // 当子元素的status属性变成已完成时，表示请求结束，则执行yRequestMap里对应的回调并删除该子元素
  interval = setInterval(function () {
    var queueDom = yRequestDom.childNodes;
    // 没有请求了，停止轮询
    if (!queueDom || queueDom.length === 0) {
      interval = clearInterval(interval);
    }

    try {
      for (var i = 0; i < queueDom.length; i++) {
        try {
          var dom = queueDom[i];
          if (+dom.getAttribute("status") === ENDSTATUS) {
            var text = dom.innerText;
            if (text) {
              var data = decode(dom.innerText);
              var id = dom.getAttribute("_id");
              var res = data.res;
              if (res.status === 200) {
                yRequestMap[id].success(res.body, res.header, data);
              } else {
                yRequestMap[id].error(res.statusText, res.header, data);
              }
              dom.parentNode.removeChild(dom);
            } else {
              dom.parentNode.removeChild(dom);
            }
          }
        } catch (err) {
          console.error(err.message);
          dom.parentNode.removeChild(dom);
        }
      }
    } catch (err) {
      console.error(err.message);
      interval = clearInterval(interval);
    }
  }, 50);
}
```

3、`response.js`：轮询请求信息，若有初始化状态的请求，则发送事件通知`background.js`进行跨域请求

```javascript
//获取index.js里创建的yRequestDom元素
var yRequestDom;
var findDom = setInterval(function () {
  try {
    yRequestDom = document.getElementById(container);
    if (yRequestDom) {
      clearInterval(findDom);

      // 轮询执行run
      setInterval(function () {
        run();
      }, 100);
    }
  } catch (e) {
    clearInterval(findDom);
    console.error(e);
  }
}, 100);

function run() {
  var reqsDom = yRequestDom.childNodes;
  if (!reqsDom || reqsDom.length === 0) return;

  // 遍历yRequestDom
  reqsDom.forEach(function (dom) {
    try {
      var status = dom.getAttribute("status"),
        request;
      if (+status === INITSTATUS) {
        // 记录请求状态为进行中
        dom.setAttribute("status", RUNSTATUS);
        var data = decode(dom.innerText);
        var req = data.req;
        req.url = req.url || "";
        var id = dom.getAttribute("_id");
        data.runTime = new Date().getTime();

        // 发送事件通知background进行跨域请求
        sendAjaxByBack(
          id,
          req,
          function (res) {
            // 请求结束后的回调，把请求状态记录为结束
            responseCallback(res, dom, data);
          },
          function (err) {
            responseCallback(err, dom, data);
          }
        );
      }
    } catch (error) {
      console.error(error);
      dom.parentNode.removeChild(dom);
    }
  });
}

function sendAjaxByBack(id, req, successFn, errorFn) {
  successFns[id] = successFn;
  errorFns[id] = errorFn;
  // 发送事件
  connect.postMessage({
    id: id,
    req: req,
  });
}
```

4、`background.js`真正执行跨域请求

```javascript
// 定义了跨域请求的方法
function sendAjax(req, successFn, errorFn) {}

// 监听response.js 发送的onConnect的请求事件，执行跨域请求
chrome.runtime.onConnect.addListener(function (connect) {
  if (connect.name === "request") {
    connect.onMessage.addListener(function (msg) {
      sendAjax(
        msg.req,
        function (res) {
          // 成功发送响应信息返回给response.js
          connect.postMessage({
            id: msg.id,
            res: res,
          });
        },
        function (err) {
          // 出错发送错误信息给response.js
          connect.postMessage({
            id: msg.id,
            res: err,
          });
        }
      );
    });
  }
});
```

5、`response.js`里监听`background.js`返回的响应结果，把响应数据写入对应的dom元素

```javascript
// 有因为需要长时间的对话，而不是一次请求和回应。所以使用runtime.connect从内容脚本建立到background.js的长时间连接。建立的通道可以有一个可选的名称，区分不同类型的连接。
var connect = chrome.runtime.connect({ name: "request" });
connect.onMessage.addListener(function (msg) {
  var id = msg.id;
  var res = msg.res;
  // 执行对应的responseCallback回调，把请求状态设置成已完成
  res.status === 200 ? successFns[id](res) : errorFns[id](res);
  delete successFns[id];
  delete errorFns[id];
});

function responseCallback(res, dom, data) {
    var id = dom.getAttribute("_id");
    var headers = handleHeader(res.headers);
    data.runTime = new Date().getTime() - data.runTime;
    data.res = {
        id: id,
        status: res.status,
        statusText: res.statusText,
        header: headers,
        body: res.body
    }
    dom.innerText = encode(data);
    dom.setAttribute('status', ENDSTATUS);
}
```

6、`index.js`里`monitor`方法轮询到dom元素的响应数据，把结果通过crossRequest的回调回传到网页主程序。
