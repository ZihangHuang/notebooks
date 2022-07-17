### let、const、var

- var 存在变量提升，const、let 不存在变量提升
- var 在全局作用域申明时会挂载在全局变量上，const、let 不会
- const、let 存在块级作用域
- const、let 禁止重复声明变量
- const、let 存在暂时死区（TDZ），JavaScript 引擎在扫描代码时发现变量声明时，如果遇到 var 就会将它们提升到当前作用域的顶端，如果遇到 let 或 const 就会将声明放到 TDZ 中，如果访问 TDZ 中的变量就会抛出错误，只有执行完 TDZ 中的变量才会将它移出，然后就可以正常使用。这机制只会在当前作用域生效。

```javascript
console.log(typeof value); // 报错
let value = "value";
```

不同作用域：

```javascript
console.log(typeof value); // undefined
if (true) {
  let value = "value";
}
```

### 0.1 + 0.2 不等于 0.3

JavaScript 用 Number 类型标识数字，使用 IEEE754 标准，通过 64 位来表示一个数字。

- 第 0 位：符号位，0 表示正数，1 表示负数(s)
- 第 1 位到第 11 位：储存指数部分（e）
- 第 12 位到第 63 位：储存小数部分（即有效数字）f

计算机无法直接对十进制的数字进行运算，所以先按照 IEEE 754 转成相应的二进制，然后对阶运算。

0.1 和 0.2 转成二进制后会无限循环

```
0.1 -> 0.0001100110011001...(无限循环)
0.2 -> 0.0011001100110011...(无限循环)
```

但是由于`IEEE 754`尾数位数限制，需要截掉后面多余的，这样就丢失了精度。

为什么 x=0.1 能得到 0.1？
标准中规定尾数 f 的固定长度是 52 位，再加上省略的一位，这 53 位是 JS 精度范围。它最大可以表示 2^53(9007199254740992), 长度是 16，所以可以使用 toPrecision(16) 来做精度运算，超过的精度会自动做凑整处理

```
0.10000000000000000555.toPrecision(16)
// 返回 0.1000000000000000，去掉末尾的零后正好为 0.1

// 但来一个更高的精度：
0.1.toPrecision(21) = 0.100000000000000005551
```

由于指数位数不相同，运算时需要对阶运算 这部分也可能产生精度损失

总结：精度损失可能出现在进制转化和对阶运算过程中。本质是 二进制模拟十进制进行计算时 的精度问题，二进制精度丢失 -> 两个精度丢失的值加起来精度更丢失。

#### 怎么解决精度问题？

将数字转成整数：

```javascript
function add(num1, num2) {
  const num1Digits = (num1.toString().split(".")[1] || "").length;
  const num2Digits = (num2.toString().split(".")[1] || "").length;
  const baseNum = Math.pow(10, Math.max(num1Digits, num2Digits));
  return (num1 * baseNum + num2 * baseNum) / baseNum;
}
```

### JS 整数是怎么表示的？

通过 Number 类型来表示，遵循 IEEE754 标准，通过 64 位来表示一个数字，（1 + 11 + 52），最大安全数字(`Number.MAX_SAFE_INTEGER`)是 Math.pow(2, 53) - 1，对于 16 位十进制。（符号位 + 指数位 + 小数部分有效位）

### symbol 模拟私有变量

symbol 不会被常规的方法（除了 Object.getOwnPropertySymbols 外）遍历到，所以可以用来模拟私有变量。

```javascript
var Person = (function () {
  let _name = Symbol();
  class Person {
    constructor(name) {
      this[_name] = name;
    }

    get name() {
      return this[_name];
    }
  }
  return Person;
})();
```