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