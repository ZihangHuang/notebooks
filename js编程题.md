#### 并发控制

- 并行n个，n个结束后才会执行以后的

```javascript
function myfetch(url) {
  return new Promise((resolve, reject) => {
    // const timeout = parseInt(Math.random() * 3 * 1000)
    const timeout = 1000;
    setTimeout(() => {
      console.log('res:' + url);
      resolve('res:' + url);
    }, timeout);
  });
}
function sendRequest(urls, num, callback) {
  (function request(res) {
    urls.length
      ? Promise.all(urls.splice(0, num).map((url) => myfetch(url))).then((r) =>
          request(res.concat(r))
        )
      : callback(res);
  })([]);
}

sendRequest(['a.com', 'b.com', 'c.com', 'd.com', 'e.com'], 2, () => {
  console.log('done');
});
```

- 并行 n 个，每个执行结束后就马上下一个了

```javascript
function handleFetchQueue(urls, max, callback) {
  const urlCount = urls.length;
  const requestsQueue = [];
  const results = [];
  let i = 0;
  const handleRequest = (url) => {
    const req = myfetch(url)
      .then((res) => {
        console.log('当前并发： ' + requestsQueue);
        const len = results.push(res);
        if (len < urlCount && i + 1 < urlCount) {
          requestsQueue.shift();
          handleRequest(urls[++i]);
        } else if (len === urlCount) {
          'function' === typeof callback && callback(results);
        }
      })
      .catch((e) => {
        results.push(e);
      });
    if (requestsQueue.push(req) < max) {
      handleRequest(urls[++i]);
    }
  };
  handleRequest(urls[i]);
}

const urls = Array.from({ length: 10 }, (v, k) => k);

const myfetch = function (idx) {
  return new Promise((resolve) => {
    console.log(`start request ${idx}`);
    // const timeout = parseInt(Math.random() * 1e4)
    const timeout = 1000;
    setTimeout(() => {
      console.log(`end request ${idx}`);
      resolve(idx);
    }, timeout);
  });
};

const max = 2;

const callback = () => {
  console.log('run callback');
};
```
