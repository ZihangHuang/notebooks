### 并发控制

- 并行 n 个，n 个结束后才会执行以后的

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

### 深拷贝

```javascript
/**
 * 深拷贝
 * @param {Object} obj 要拷贝的对象
 * @param {Map} map 用于存储循环引用对象的地址
 */

function deepClone(obj = {}, map = new Map()) {
  if (typeof obj !== 'object') {
    return obj;
  }
  if (map.get(obj)) {
    return map.get(obj);
  }

  let result = {};
  if (
    obj instanceof Array ||
    // 加 || 的原因是为了防止 Array 的 prototype 被重写，Array.isArray 也是如此
    Object.prototype.toString(obj) === '[object Array]'
  ) {
    result = [];
  }
  // 防止循环引用
  map.set(obj, result);

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[key] = deepClone(obj[key], map);
    }
  }

  return result;
}
```

### Promise 的基础实现

```typescript
type MyPromiseCb = (resolve?: Function, reject?: Function) => any;

class MyPromise {
  private status: 'pending' | 'fullfilled' | 'rejected' = 'pending';
  private value: any = ''; // 保存resolve或者reject的值
  private handlers: Function[] = [];
  private errorHandlers: Function[] = [];

  constructor(func: MyPromiseCb) {
    func.call(this, this.resolve.bind(this), this.reject.bind(this));
  }

  resolve(...args) {
    this.value = args;
    let handler: Function;
    while ((handler = this.handlers.shift())) {
      handler(...args);
    }

    this.status = 'fullfilled';
  }

  reject(...args) {
    this.value = args;
    let handler: Function;
    while ((handler = this.errorHandlers.shift())) {
      handler(...args);
    }
    this.status = 'rejected';
  }

  then(onFulfilled?: any, onRejected?: any) {
    const t = this;

    return new MyPromise(function (onFulfilledNext, onRejectedNext) {
      let fulfilled = (val) => {
        try {
          if (typeof onFulfilled !== 'function') {
            onFulfilledNext(val);
          } else {
            let res = onFulfilled(val);

            if (res instanceof MyPromise) {
              // 如果回调函数返回MyPromise对象，则由它来执行下一个回调
              res.then(onFulfilledNext, onRejectedNext);
            } else {
              // 否则会将返回结果直接作为参数，传入新Promise的resolve函数
              onFulfilledNext(res);
            }
          }
        } catch (err) {
          onRejectedNext(err); // 传入的回调发生错误，则新promise失败
        }
      };

      let rejected = (err) => {
        try {
          if (typeof onRejected !== 'function') {
            onRejectedNext(err);
          } else {
            let res = onRejected(err);

            if (res instanceof MyPromise) {
              res.then(onFulfilledNext, onRejectedNext);
            } else {
              // 捕获错误后将返回结果传入新Promise的resolve函数
              onFulfilledNext(res);
            }
          }
        } catch (err) {
          onRejectedNext(err);
        }
      };

      switch (t.status) {
        case 'pending':
          t.handlers.push(fulfilled);
          t.errorHandlers.push(rejected);

          break;

        case 'fullfilled':
          onFulfilled(...t.value);
          break;

        case 'rejected':
          onRejected(...t.value);
          break;
      }
    });
  }

  catch(onRejected?: any) {
    return this.then(undefined, onRejected);
  }

  finally(callback?: any) {
    return this.then(
      (value) => {
        callback();
        return value; // 和es6的Promise一样，返回resolve的参数
      },
      (reason) => {
        callback();
        throw reason; // 抛出错误，让catch可以捕获
      }
    );
  }

  static race(promises: MyPromise[]) {
    return new MyPromise((resolve, reject) => {
      promises.forEach((promise) => {
        promise.then(resolve, reject).catch((err) => reject(err));
      });
    });
  }

  static all(promises: MyPromise[]) {
    return new MyPromise((resolve, reject) => {
      let len = promises.length;
      let res = [];
      let index = 0;
      promises.forEach((p, i) => {
        p.then((r) => {
          res[i] = r;
          index++;
          if (index === len) {
            resolve(res);
          }
        }, reject).catch((err) => reject(err));
      });
    });
  }
}

// 测试：
const p1 = new MyPromise((resolve) =>
  setTimeout(resolve.bind(null, 'resolved'), 2000)
);
p1.then((res) => res + ' then').then((...args) =>
  console.log('second', ...args)
);
// second resolved then

// then返回MyPromise
const p1_p = new MyPromise((resolve) =>
  setTimeout(resolve.bind(null, 'resolved'), 2000)
);
p1_p
  .then(
    (res) =>
      new MyPromise((resolve) => {
        resolve(res + ' then');
      })
  )
  .then((...args) => console.log('p1_p second', ...args));
// p1_p second resolved then

const p2 = new MyPromise((resolve, reject) =>
  setTimeout(reject.bind(null, 'rejected'), 2000)
);
p2.then((res) => res + ' then')
  .catch((...args) => {
    console.log('fail', ...args);
    return 'fail';
  })
  .then((res) => console.log(res + ' then2'));
// fail rejected
// fail then2

const p3 = new MyPromise((resolve) => {
  setTimeout(resolve.bind(null, 'p3'), 1000);
});
const p4 = new MyPromise((resolve) => {
  setTimeout(resolve.bind(null, 'p4'), 3000);
});
MyPromise.race([p3, p4]).then((res) => {
  console.log('promise race:', res);
});
// promise race: p3

const p5 = new MyPromise((resolve) => {
  setTimeout(resolve.bind(null, 'p5'), 1000);
});
const p6 = new MyPromise((resolve) => {
  setTimeout(resolve.bind(null, 'p6'), 3000);
});
MyPromise.all([p5, p6])
  .then((res) => {
    console.log('promise all:', res);
  })
  .catch((err) => console.log('promise all error:', err));
// promise all: ["p5", "p6"]

const p7 = new MyPromise((resolve, reject) => {
  setTimeout(resolve.bind(null, 'p7'), 1000);
});
p7.finally(() => {
  console.log('p7-finally'); // p7-finally
}).then((res) => {
  console.log(res);
});
// p7-finally
// p7

const p8 = new MyPromise((resolve, reject) => {
  setTimeout(reject.bind(null, 'p8-err'), 1000);
});
p8.finally(() => {
  console.log('p8-finally');
}).catch((res) => {
  console.log(res);
});
// p8-finally
// p8-err

// 这里实现的能捕获到，但原生的不能捕获到，会吃掉错误，所以原生的promise要写catch
try {
  new MyPromise((resolve, reject) => {
    throw new Error('err');
  });
} catch (e) {
  console.error('捕获到了:', e); // 捕获到了: Error: err
}

try {
  new Promise((resolve, reject) => {
    throw new Error('err'); // 报错：Uncaught (in promise)
  });
} catch (e) {
  console.error('捕获到了:', e);
}
```

### 斐波那契

- 递归

```javascript
// 获取对应数字
function fib(n) {
  if (n === 1) {
    return 1;
  } else if (n === 0) {
    return 0;
  }
  return fib(n - 1) + fib(n - 2);
}

// 获取数列
function bobo(n, a = 0, b = 1, arr = [0]) {
  if (n - 1 < 1) {
    return arr;
  }

  arr.push(b);

  n--;
  return bobo(n, b, a + b, arr);
}
```

- 循环

```javascript
function fib(n) {
  let memo = [0, 1];
  let i = 2;
  while (i <= n) {
    memo[i] = memo[i - 1] + memo[i - 2];
    i++;
  }

  return memo[n];
}

function fib2(n) {
  if (n == 0) {
    return 0;
  }
  let a = 0; //  相当于 memo[i-2]
  let b = 1; // 相当于 memo[i-1]
  let sum = 0; // 相当于 memo[i]
  let i = 2;

  while (i <= n) {
    sum = a + b;
    a = b;
    b = sum;
    i++;
  }

  return sum;
}

function fib3(n) {
  let a = 0; //  相当于 memo[i]
  let b = 1; // 相当于 memo[i+1]
  let sum = 0;
  let i = 0;

  while (i < n) {
    sum = a + b;
    a = b;
    b = sum;
    i++;
  }

  return a;
}
```

### 数组变扁平

```javascript
function flat(arr) {
  return Array.isArray(arr) ? [].concat(...arr.map(flat)) : arr;
}
```

### 获取 url 参数

```javascript
const url = 'http://baidu.com?name=jack&age=45';

// 获取对应参数
function getUrlQuery(url, key) {
  return new URLSearchParams(new URL(url).search).get(key);
}
console.log(getUrlQuery(url, 'name')); // jack

// 获取所有参数
function getUrlQueries(url) {
  const search = new URLSearchParams(new URL(url).search);
  const obj = {};
  for (item of search) {
    obj[item[0]] = item[1];
  }
  return obj;
}
console.log(getUrlQueries(url)); // {name: 'jack', age: '45'}

// 获取对应参数（正则）
function getUrlQuery2(url, key) {
  const reg = new RegExp(`(^|&)${key}=([^&]*)(&|$)`, 'i');

  const match = new URL(url).search.slice(1).match(reg);

  if (match) return match[2];
}
console.log(getUrlQuery2(url, 'name')); // jack
```

### JavaScript 代码的执行顺序

```js
async function testSometing() {
  console.log('执行testSometing');
  return 'testSometing';
}
async function testAsync() {
  console.log('执行testAsync');
  return Promise.resolve('hello async');
}
async function test() {
  console.log('test start...');
  const v1 = await testSometing();
  console.log(v1);
  const v2 = await testAsync();
  console.log(v2);
  console.log(v1, v2);
}
test();
var promise = new Promise((resolve) => {
  console.log('promise start...');
  resolve('promise');
});
promise.then((val) => console.log(val));
console.log('test end...');
```

这段代码的打印顺序如下：

```js
// 同步代码执行
test start...

执行testSometing

promise start...

test end...

// 异步代码执行
// 微任务队列处理（第一轮）
// 当前微任务队列有两个任务：
// 1、test() 中第一个 await 之后的代码（即 console.log(v1)）
// 2、promise.then 的回调（即 val => console.log(val)）

// 执行第一个微任务（来自 test()）
testSometing

// 执行 testAsync() 的同步代码
执行testAsync

// await 暂停 test() 的执行，后续代码变为新的微任务，进入队列。
// 执行第二个微任务（来自 promise.then）
promise

hello async

testSometing hello async
```

为什么 promise 在 testAsync 之后输出？

根据事件循环的机制，微任务队列中的任务会一次性全部执行完毕，直到队列为空。所以当处理第一个微任务时，执行到第二个 await，会立即执行 testAsync 中的同步代码（打印"执行 testAsync"），然后将后面的代码加入微任务队列。此时，当前微任务执行完毕，继续处理下一个微任务（promise 的 then 回调），打印"promise"。然后继续处理剩下的微任务，即第二个 await 之后的代码，打印 v2 和最后的 log。

核心机制总结：

执行顺序优先级：同步代码 > 微任务（Promise.then、await） > 宏任务（如 setTimeout）。

async/await 本质：await 会暂停函数执行，将后续代码包装为微任务。

微任务队列先进先出：多个微任务按入队顺序依次执行。
