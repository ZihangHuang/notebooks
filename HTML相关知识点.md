## script 标签中 defer 和 async 的区别

### script

当浏览器加载 HTML 并遇到`<script>...</script>`标签时，它无法继续构建 DOM。它必须立即执行脚本。外部脚本`<script src="..."></script>`也是如此：浏览器必须等待脚本下载，执行下载的脚本，然后才能处理页面的其余部分。
这导致一个重要问题：

如果页面顶部有一个庞大的脚本，它会“阻塞页面”。在下载并运行之前，用户无法看到页面内容

### defer

defer 属性告诉浏览器不要等待脚本，浏览器会继续处理 HTML，构建 DOM。该脚本“在后台”加载，然后在 DOM 完全构建完成后再运行。defer 脚本总是在 DOM 准备好时执行（但在 DOMContentLoaded 事件之前）。

defer 脚本保持相对顺序来执行，就像常规脚本一样

例如：我们有两个延迟脚本：long.js 和 small.js：

```html
<script
  defer
  src="https://javascript.info/article/script-async-defer/long.js"
></script>
<script
  defer
  src="https://javascript.info/article/script-async-defer/small.js"
></script>
```

这两个脚本会并行下载，small.js 可能会比 long.js 先下载完成，但是执行的时候依然会先执行 long.js。所以 defer 可用于对脚本执行顺序有严格要求的情况。

### async

async 特性与 defer 有些类似。它也能够让脚本不阻塞页面。但是，在行为上二者有着重要的区别。

- 不会阻塞页面
- 浏览器不会阻止 async 脚本
- 其他脚本也不会等待 async 脚本，async 脚本也不会等待其他脚本
- DOMContentLoaded 和 async 脚本不会互相等待。DOMContentLoaded 可能在 async 脚本执行之前触发（如果 async 脚本在页面解析完成后完成加载），或在 async 脚本执行之后触发（如果 async 脚本很快加载完成或在 HTTP 缓存中）

换句话说，async 脚本会在后台加载，并在加载就绪时运行。DOM 和其他脚本不会等待它们，它们也不会等待其它的东西。async 脚本就是一个会在加载完成时执行的完全独立的脚本。

```html
<p>...content before scripts...</p>

<script>
  document.addEventListener('DOMContentLoaded', () => alert('DOM ready!'));
</script>

<script
  async
  src="https://javascript.info/article/script-async-defer/long.js"
></script>
<script
  async
  src="https://javascript.info/article/script-async-defer/small.js"
></script>

<p>...content after scripts...</p>
```

上面的例子中：

- 页面内容立刻显示出来：加载写有 async 的脚本不会阻塞页面渲染。
- DOMContentLoaded 可能在 async 之前或之后触发，不能保证谁先谁后。
- 较小的脚本 small.js 排在第二位，但可能会比 long.js 这个长脚本先加载完成，所以 small.js 会先执行。虽然，可能是 long.js 先加载完成，如果它被缓存了的话，那么它就会先执行。换句话说，异步脚本以“加载优先”的顺序执行。

当我们将独立的第三方脚本集成到页面时，此时采用异步加载方式是非常棒的：计数器，广告等，因为它们不依赖于我们的脚本，我们的脚本也不应该等待它们：

```html
<!-- Google Analytics 脚本通常是这样嵌入页面的 -->
<script async src="https://google-analytics.com/analytics.js"></script>
```

### 总结

| --    | 顺序                                                         | DOMContentLoaded                                                                                           |
| ----- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| async | 加载优先顺序。脚本在文档中的顺序不重要 —— 先加载完成的先执行 | 不相关。可能在文档加载完成前加载并执行完毕。如果脚本很小或者来自于缓存，同时文档足够长，就会发生这种情况。 |
| defer | 文档顺序（它们在文档中的顺序）                               | 在文档加载和解析完成之后（如果需要，则会等待），即在 DOMContentLoaded 之前执行。                           |

## 浏览器渲染过程

- DOM 树构建：渲染引擎使用 HTML 解析器（调用 XML 解析器）解析 HTML 文档，将各个 HTML 元素逐个转化成 DOM 节点，从而生成 DOM 树；
- CSSOM 树构建：CSS 解析器解析 CSS，并将其转化为 CSS 对象，将这些 CSS 对象组装起来，构建 CSSOM 树；
- 渲染树构建：DOM 树和 CSSOM 树都构建完成以后，浏览器会根据这两棵树构建出一棵渲染树；
- 页面布局：渲染树构建完毕之后，元素的位置关系以及需要应用的样式就确定了，这时浏览器会计算出所有元素的大小和绝对位置；
- 页面绘制：页面布局完成之后，浏览器会将根据处理出来的结果，把每一个页面图层转换为像素，并对所有的媒体文件进行解码。
- 合成：当文档的各个部分以不同的层绘制，相互重叠时，必须进行合成，以确保它们以正确的顺序绘制到屏幕上，并正确显示内容。

当页面继续加载资源时，可能会发生回流，回流会触发重新绘制和重新合成。

减少回流 (Reflow) 和重绘 (Repaint)
在浏览器渲染过程中最后一步骤是合成 (compositing)，在某些情况，我们可以透过一些技巧只需要让浏览器合成 (compositing)，而避免回流 (Reflow) 和重绘 (Repaint)。

以下提供几个方法:

- 移动调整元素时，使用 transform
- 使用 opacity 来改变元素的能见度
- 如果需要频繁重绘或回流的节点，可以通过 will-change 设定成独立的图层，因为独立的图层可以避免该节点渲染行为影像到其他节点。

```css
body > .sidebar {
  will-change: transform;
}
```

避免频繁用 JavaScript 操作 DOM 节点
