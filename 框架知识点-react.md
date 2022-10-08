## React18 的变化总结

- React17 之前，事件委托挂载在 document，React17 开始，变成挂载在渲染 react 树的根 dom 容器上，使得多版本并存成为可能。
- React18 中，增加了新的 RootAPI：`ReactDOM.createRoot()`，以开启并发模式。
- React17 之前，在 Promise 链、异步代码或者原生事件处理函数，不会合并多次的状态更新。React18 中，`ReactDOM.createRoot()`后，使用这些情况都会进行状态合并。如不想进行自动合并，可以使用`ReactDOM.flushSync()`。`flushSync`函数内部的多个 setState 仍然为批量更新，这样可以精准控制哪些不需要的批量更新。
- React 事件池仅支持在 React 16 及更早版本中，在 React 17 已经不使用事件池。
- 增加`startTransition`用于执行非紧急的状态更新。

## React 的 Fiber

React16 以后实现的一套新的更新机制，让 React 更新变得可控，避免了之前采用递归需要一气呵成影响性能的做法。

- 每个元素都会有一个 fiber 对象对应。这些 fiber 对象之间相互关联，构成了 fiber tree。
- react fiber 的更新过程是碎片化的，一次更新会分为 n 个任务片。每个片执行完成后就会把控制权交给调度器。
- 调度器会查看浏览器是否有级别更高的任务（比如：alert，onclick，等），如果有则执行这个高级别任务，如果没有继续执行 fiber 更新。这个功能是基于 requestIdleCallback 实现的。

## React diff 简介

由于 diff 本身也会带来性能消耗，为了降低算法复杂度，React 对 diff 做了三个预设限制：

- 只对同级元素进行 diff，如果某元素在更新之后跨越了层级，那么 React 不会复用它
- 两个不同类型的元素会产生两颗不同的树，即如果元素由 div 变成 p，那么 React 会删除 div 及其子孙节点，新建 p 及其子孙节点
- 对于同一层级的一组子节点，它们可以通过唯一 id 进行区分

基于以上三个前提，React 分别对 tree diff、component diff 以及 element diff 进行算法优化。

- React 通过分层求异的策略，对 tree diff 进行算法优化。
- React 通过相同类生成相似树形结构，不同类生成不同树形结构的策略，对 component diff 进行算法优化。
- React 通过设置唯一 key 的策略，对 element diff 进行算法优化。

## React 合成事件

在 react 中，我们绑定的事件 onClick 等，并不是原生事件，而是由原生事件合成的 React 事件，比如 click 事件合成为 onClick 事件。比如 blur , change , input , keydown , keyup 等 , 合成为 onChange。

为什么 react 采取这种事件合成的模式呢？

- 一方面，将事件绑定在 document 统一管理，防止很多事件直接绑定在原生的 dom 元素上。造成一些不可控的情况。
- 另一方面， React 想实现一个兼容全部浏览器的框架， 为了实现这种目标就需要提供全部浏览器一致性的事件系统，以此抹平不同浏览器的差异。

React 事件与原生事件执行顺序

```javascript
class App extends React.Component<any, any> {
  parentRef: any;
  childRef: any;
  constructor(props: any) {
    super(props);
    this.parentRef = React.createRef();
    this.childRef = React.createRef();
  }
  componentDidMount() {
    console.log("React componentDidMount！");
    this.parentRef.current?.addEventListener("click", () => {
      console.log("原生事件：父元素 DOM 事件监听！");
    });
    this.childRef.current?.addEventListener("click", () => {
      console.log("原生事件：子元素 DOM 事件监听！");
    });
    document.addEventListener("click", (e) => {
      console.log("原生事件：document DOM 事件监听！");
    });
  }
  parentClickFun = () => {
    console.log("React 事件：父元素事件监听！");
  };
  childClickFun = () => {
    console.log("React 事件：子元素事件监听！");
  };
  render() {
    return (
      <div ref={this.parentRef} onClick={this.parentClickFun}>
        <div ref={this.childRef} onClick={this.childClickFun}>
          分析事件执行顺序
        </div>
      </div>
    );
  }
}
export default App;
```

输出

```
原生事件：子元素 DOM 事件监听！
原生事件：父元素 DOM 事件监听！
React 事件：子元素事件监听！
React 事件：父元素事件监听！
原生事件：document DOM 事件监听！

```
