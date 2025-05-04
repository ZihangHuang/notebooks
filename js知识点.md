## let、const、var

- var 存在变量提升，const、let 不存在变量提升
- var 在全局作用域申明时会挂载在全局变量上，const、let 不会
- const、let 存在块级作用域
- const、let 禁止重复声明变量
- const、let 存在暂时死区（TDZ），JavaScript 引擎在扫描代码时发现变量声明时，如果遇到 var 就会将它们提升到当前作用域的顶端，如果遇到 let 或 const 就会将声明放到 TDZ 中，如果访问 TDZ 中的变量就会抛出错误，只有执行完 TDZ 中的变量才会将它移出，然后就可以正常使用。这机制只会在当前作用域生效。

```javascript
console.log(typeof value); // 报错
let value = 'value';
```

不同作用域：

```javascript
console.log(typeof value); // undefined
if (true) {
  let value = 'value';
}
```

## 0.1 + 0.2 不等于 0.3

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

精简回答：由于 js 使用 IEEE754 标准的双精度浮点数，0.1 和 0.2 在二进制转换时产生无限循环，导致存储和计算时精度丢失。

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

### 怎么解决精度问题？

1.将数字转成整数：

```javascript
function add(num1, num2) {
  const num1Digits = (num1.toString().split('.')[1] || '').length;
  const num2Digits = (num2.toString().split('.')[1] || '').length;
  const baseNum = Math.pow(10, Math.max(num1Digits, num2Digits));
  return (num1 * baseNum + num2 * baseNum) / baseNum;
}
```

2.误差容忍比较：检查差值是否小于最小精度：

```js
function epsilon(num1, num2, sum) {
  return Math.abs(num1 + num2 - sum) < Number.EPSILON;
}
```

## JS 整数是怎么表示的？

通过 Number 类型来表示，遵循 IEEE754 标准，通过 64 位来表示一个数字，（1 + 11 + 52），最大安全数字(`Number.MAX_SAFE_INTEGER`)是 Math.pow(2, 53) - 1，对于 16 位十进制。（符号位 + 指数位 + 小数部分有效位）

## symbol 模拟私有变量

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

## 事件冒泡与事件捕获

先捕获再冒泡

```html
<div class="parent">
  parent
  <div class="child">
    child
    <div class="grandson">grandson</div>
  </div>
</div>
```

事件句柄在冒泡阶段执行

```javascript
// 点击grandson，依次打印
// grandson
// child
// parent
document.querySelector('.parent').addEventListener('click', () => {
  console.log('parent');
});

document.querySelector('.child').addEventListener('click', () => {
  console.log('child');
});

document.querySelector('.grandson').addEventListener('click', () => {
  console.log('grandson');
});
```

事件句柄在捕获阶段执行

```javascript
// 点击grandson，依次打印
// parent
// child
// grandson
document.querySelector('.parent').addEventListener(
  'click',
  () => {
    console.log('parent');
  },
  true
);

document.querySelector('.child').addEventListener(
  'click',
  () => {
    console.log('child');
  },
  true
);

document.querySelector('.grandson').addEventListener(
  'click',
  () => {
    console.log('grandson');
  },
  true
);
```

事件句柄在冒泡阶段执行

```javascript
// 点击grandson，依次打印
// grandson
// child
// parent
document.querySelector('.parent').onclick = function () {
  console.log('parent');
};
document.querySelector('.child').onclick = function () {
  console.log('child');
};
document.querySelector('.grandson').onclick = function () {
  console.log('grandson');
};
```

## JS 值的传递方式

JS 的基本类型，是按值传递的。

```javascript
var a = 1;
function foo(x) {
  x = 2;
}
foo(a);
console.log(a); // 仍为1, 未受x = 2赋值所影响
```

再来看对象：

```javascript
var obj = { x: 1 };
function foo(o) {
  o.x = 3;
}
foo(obj);
console.log(obj.x); // 3, 被修改了!
```

说明 o 和 obj 是同一个对象，o 不是 obj 的副本。所以不是按值传递。 但这样是否说明 JS 的对象是按引用传递的呢？

再看下面的例子：

```javascript
var obj = { x: 1 };
function foo(o) {
  o = 100;
}
foo(obj);
console.log(obj.x); // 仍然是1, obj并未被修改为100
```

如果是按引用传递，修改形参 o 的值，应该影响到实参才对。但这里修改 o 的值并未影响 obj。 因此 JS 中的对象并不是按引用传递。
准确的说，JS 中的基本类型按值传递，对象类型按共享传递的(call by sharing，也叫按对象传递、按对象共享传递)。
调用函数传参时，函数接受对象实参引用的副本(既不是按值传递的对象副本，也不是按引用传递的隐式引用)。 它和按引用传递的不同在于：在共享传递中对函数形参的赋值，不会影响实参的值。如上面面例子中，不可以通过修改形参 o 的值，来修改 obj 的值。

## js 垃圾回收

### 引用计数法

引用计数算法的核心思想是在内部通过引用计数器来维护当前对象的引用数，从而判断该对象的引用数值是否为 0 来决定他是不是一个垃圾对象。当这个数值为 0 的时候 GC（垃圾回收机制）就开始工作，将其所在的对象空间进行回收和释放。

优点：引用计数规则会在发现垃圾的时候立即进行回收，因为他可以根据当前引用数是否为 0 来决定对象是不是垃圾。如果是就可以立即进行释放。由于这个特点的存在，引用计数可以最大限度的减少程序的卡顿，因为只要这个空间即将被占满的时候，垃圾回收器就会进行工作，将内存进行释放，让内存空间总有一些可用的地方。

缺点：

1、没有办法将那些循环引用的对象进行空间回收。

例子：
定义一个普通的函数 fn 在函数体的内部定义两个变量，对象 obj1 和 obj2，让 obj1 下面有一个 name 属性然后指向 obj2，让 obj2 有一个属性指向 obj1。在函数最后的地方 return 返回一个普通字符，接着在最外层调用一下函数。

```js
function fn() {
  const obj1 = {};
  const obj2 = {};

  obj1.name = obj2;
  obj2.name = obj1;

  return 'abc';
}
```

函数在执行结束以后，他内部所在的空间肯定需要有涉及到空间回收的情况。比如说 obj1 和 obj2，因为在全局的地方其实已经不再去指向他了，所以这个时候他的引用计数应该是为 0 的。
但是这个时候会有一个问题，在里边会发现，当 GC 想要去把 obj1 删除的时候，会发现 obj2 有一个属性是指向 obj1 的。换句话讲就是虽然按照之前的规则，全局的作用域下找不到 obj1 和 obj2 了，但是由于他们两者之间在作用域范围内明显还有着一个互相的指引关系。这种情况下他们身上的引用计数器数值并不是 0，GC 就没有办法将这两个空间进行回收。也就造成了内存空间的浪费，这就是所谓的对象之间的循环引用。这也是引用计数算法所面临到的一个问题。

2、引用计数算法所消耗的时间会更大一些，因为当前的引用计数，需要维护一个数值的变化，在这种情况下要时刻的监控着当前对象的引用数值是否需要修改。对象数值的修改需要消耗时间，如果说内存里边有更多的对象需要修改，时间就会显得很大。所以相对于其他的 GC 算法会觉得引用计数算法的时间开销会更大一些。

### 标记清除法

标记清除算法的核心思想就是将整个垃圾回收操作分成两个阶段，第一个阶段遍历所有对象然后找到活动对象进行标记。第二个阶段仍然会遍历所有的对象，把没有标记的对象进行清除。需要注意的是在第二个阶段当中也会把第一个阶段设置的标记抹掉，便于 GC 下次能够正常工作。这样一来就可以通过两次遍历行为把当前垃圾空间进行回收，最终再交给相应的空闲列表进行维护，后续的程序代码就可以使用了。

其实就是两个操作，第一是标记，第二是清除。

优点：可以解决对象循环引用的回收操作。

缺点：
1、产生空间碎片化的问题，不能让空间得到最大化的使用。就是由于当前所回收的垃圾对象在地址上本身是不连续的，由于这种不连续从而造成了回收之后分散在各个角落，后续要想去使用的时候，如果新的生成空间刚好与他们的大小匹配，就能直接用。一旦是多了或是少了就不太适合使用了。具体查看https://juejin.cn/post/7025473557106802725#heading-7。

2、标记清除不能立即回收垃圾对象，而且他去清除的时候当前的程序其实是停止工作的。即便第一阶段发现了垃圾，也要等到第二阶段清除的时候才会回收掉。

### 标记整理法

在 V8 中标记整理算法会被频繁的使用到，下面来看一下是如何实现的。

首先认为标记整理算法是标记清除的增强操作，他们在第一个阶段是完全一样的，都会去遍历所有的对象，然后将可达活动对象进行标记。第二阶段清除时，标记清除是直接将没有标记的垃圾对象做空间回收，标记整理则会在清除之前先执行整理操作，移动对象的位置，让他们能够在地址上产生连续。

假设回收之前有很多的活动对象和非活动对象，以及一些空闲的空间，当执行标记操作的时候，会把所有的活动对象进行标记，紧接着会进行整理的操作。整理其实就是位置上的改变，会把活动对象先进行移动，在地址上变得连续。紧接着会将活动对象右侧的范围进行整体的回收，这相对标记清除算法来看好处是显而易见的。

因为在内存里不会大批量出现分散的小空间，从而回收到的空间都基本上都是连续的。这在后续的使用过程中，就可以尽可能的最大化利用所释放出来的空间。这个过程就是标记整理算法，会配合着标记清除，在 V8 引擎中实现频繁的 GC 操作。

### V8 引擎的垃圾回收策略

在程序的使用过程中会用到很多的数据，数据又可以分为原始的数据和对象类型的数据。基础的原始数据都是由程序的语言自身来进行控制的。所以这里所提到的回收主要还是指的是存活在堆区里的对象数据，因此这个过程是离不开内存操作的。

V8 采用的是分代回收的思想，把内存空间按照一定的规则分成两类，新生代存储区和老生代存储区。有了分类后，就会针对不同代采用最高效的 GC 算法，从而对不同的对象进行回收操作。这也就意味着 V8 回收会使用到很多的 GC 算法。

V8 对不同代对象采用的是不同的 GC 算法来完成垃圾回收操作，具体就是针对新生代采用复制算法和标记整理算法，针对老生代对象主要采用标记清除，标记整理和增量标记这样三个算法。

## setMonth()方法的小问题

某天发现一个问题，从英文日期转化中文日期，月份总会有“6 月”变为“7 月”。于是在本地反复测试，发现如下规律：只要 setMonth()的参数为小于 31 天的月份时就会变为下一个月。

原因是：因为当前月份是 31 天，而设置的月份小于 31 天，就会把日期顺延。在 setMonth 的说明是这样的：

setMonth 方法
设置 Date 对象中用 本地时间表示的月份值。

dateObj.setMonth(numMonth[, dateVal])

参数
dateObj：必选项。任意 Date 对象。

numMonth：必选项。一个等于月份值的数值。
dateVal

dateVal：可选，一个代表日期的数值。如果没有提供此参数，那么将使用通过调用 getDate 方法而得到的数值。

所以，从对 dataVal 参数的说明可以看出，在设置月份的同时，使用 getDate 获取日期，并使用得到的日期值设置了日期。于是就会发生月份顺延的情况。

解决方法：

- 设置月份时，将日期设为 1，记 setMonth(month, 1)，当然可以在 setMonth 之前先调用 setDate()设置日期；
- 也可以在初始化 Date 对象时，就指定一个日期，也就是使用：dateObj = new Date(year, month, date[, hours[, minutes[, seconds[,ms]]]]) 的形式。
- 也可以使用 setFullYear()同时设置年、月、日，即 setFullYear(numYear[, numMonth[, numDate]])。
