#### vue 列表的 key

key 在列表渲染中的作用是：在复杂的列表渲染中快速准确的找到与 newVnode 相对应的 oldVnode，提升 diff 效率。
vue 中使用 key 不一定能提提高 diff 效率。例如有个列表

```html
<!-- 初始 -->
<li>A</li>
<li>B</li>
<li>C</li>

<!-- 打乱顺序 -->
<li>C</li>
<li>A</li>
<li>C</li>
```

没有设置 key 时，vue 只需要更新 dom 的文本内容，如果给每个 li 设置了 key，vue 需要去对比新旧然后进行 dom 的移动、添加或删除，效率反而更低。

#### vue模板编译过程

- 将模板字符串转化成AST
- 遍历AST标记静态节点：因为静态节点不需要总是重新渲染，这样在虚拟dom更新节点时，发现节点有标记就不需要重新渲染它。
- 将AST转化成render函数

这三部分内容在模板编译中分别抽象出三个模块实现各自的功能：解析器、优化器和代码生成器。