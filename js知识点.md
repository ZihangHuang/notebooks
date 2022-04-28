#### let、const、var
- var存在变量提升，const、let不存在变量提升
- var在全局作用域申明时会挂载在全局变量上，const、let不会
- const、let存在块级作用域
- const、let禁止重复声明变量
- const、let存在暂时死区（TDZ），JavaScript引擎在扫描代码时发现变量声明时，如果遇到var就会将它们提升到当前作用域的顶端，如果遇到let或const就会将声明放到TDZ中，如果访问TDZ中的变量就会抛出错误，只有执行完TDZ中的变量才会将它移出，然后就可以正常使用。这机制只会在当前作用域生效。

```javascript
console.log(typeof value) // 报错
let value = 'value'
```

不同作用域：
```javascript
console.log(typeof value) // undefined
if(true) {
    let value = 'value'
}
```