#### let、const、var

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