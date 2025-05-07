## React18 的变化总结

- React17 之前，事件委托挂载在 document，React17 开始，变成挂载在渲染 react 树的根 dom 容器上，使得多版本并存成为可能。
- React18 中，增加了新的 RootAPI：`ReactDOM.createRoot()`，以开启并发模式。
- React17 之前，在 Promise 链、异步代码或者原生事件处理函数，不会合并多次的状态更新。React18 中，`ReactDOM.createRoot()`后，使用这些情况都会进行状态合并。如不想进行自动合并，可以使用`ReactDOM.flushSync()`。`flushSync`函数内部的多个 setState 仍然为批量更新，这样可以精准控制哪些不需要的批量更新。
- React 事件池仅支持在 React 16 及更早版本中，在 React 17 已经不使用事件池。
- 增加`startTransition`用于执行非紧急的状态更新。

## React 的 Fiber

React16 以后实现的一套新的更新机制，让 React 更新变得可控，避免了之前采用递归需要一气呵成影响性能的做法。

Fiber 协调器的主要目标是增量渲染，更好更平滑地渲染 UI 动画和手势，以及用户互动的响应性。协调器还允许你将工作分为多个块，并将渲染工作分为多个帧。它还增加了为每个工作单元定义优先级的能力，以及暂停、重复使用和中止工作的能力。

要解决的问题：

- 旧架构瓶颈：原先的 Stack Reconciler 采用递归遍历，更新过程不可中断，可能导致主线程长时间阻塞
- 动画/交互卡顿：复杂更新可能影响动画帧率（16ms 渲染周期）
- 优先级调度：缺乏任务优先级控制机制

核心特性：

- 增量渲染：将渲染工作拆分为多个小任务（时间分片）
- 任务可中断/恢复：使用链表结构替代递归调用栈
- 优先级调度：高优先级更新（如用户输入）可抢占低优先级任务
- 错误边界：更细粒度的错误捕获机制

调度流程：

- Reconciliation 阶段（可中断）：生成副作用列表
- Commit 阶段（不可中断）：应用 DOM 变更

Fiber 节点结构

```js
{
  tag: FunctionComponent/ClassComponent/HostComponent,
  stateNode,    // 对应的组件实例/DOM节点
  return,       // 父节点
  child,        // 第一个子节点
  sibling,      // 兄弟节点
  alternate,    // 新旧fiber链接
  effectTag,    // 需要执行的副作用（插入/更新/删除）
  // ...其他属性
}
```

- 每个元素都会有一个 fiber 对象对应。这些 fiber 对象之间相互关联，构成了 fiber tree。虽然我们称之为树，但 React Fiber 其实创建了一个链表，其中每个节点都是一个 fiber。 并且在父、子和兄弟姐妹之间存在着一种关系。React 使用一个 return 键来指向父节点，任何一个子 fiber 在完成工作后都应该返回该节点。
- React Fiber 的更新过程是碎片化的，一次更新会分为 n 个任务片。每个片执行完成后就会把控制权交给调度器。
- 调度器会查看浏览器是否有级别更高的任务（比如：alert，onclick，等），如果有则执行这个高级别任务，如果没有继续执行 fiber 更新。React 内部自行实现了 requestIdleCallback。

总结：React Fiber 是 16 版本引入的新协调算法，核心目标是提升复杂应用的渲染性能。它通过将渲染任务拆解为可中断的单元（Fiber 节点），使用链表结构实现增量渲染。相比旧版递归不可中断的更新，Fiber 允许高优先级任务抢占执行，同时支持时间分片渲染，确保动画等高频操作不卡顿。这也为后续的并发模式、Suspense 等特性奠定了基础。

## React diff 简介

由于 diff 本身也会带来性能消耗，为了降低算法复杂度，React 对 diff 做了三个预设限制：

- 只对同级元素进行 diff，如果某元素在更新之后跨越了层级，那么 React 不会复用它
- 两个不同类型的元素会产生两颗不同的树，即如果元素由 div 变成 p，那么 React 会删除 div 及其子孙节点，新建 p 及其子孙节点
- 对于同一层级的一组子节点，它们可以通过唯一 id 进行区分

基于以上三个前提，React 分别对 tree diff、component diff 以及 element diff 进行算法优化。

- tree diff：只会对同一层次的节点进行比较，如果节点不存在直接删除创建。
- component diff：同一类型的组件继续 tree diff 比较，不同类型的组件直接删除重建。
- element diff：根据唯一 key（如有），对节点进行插入，移动，删除。

相关文章：https://juejin.cn/post/6978370715573714952

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
    console.log('React componentDidMount！');
    this.parentRef.current?.addEventListener('click', () => {
      console.log('原生事件：父元素 DOM 事件监听！');
    });
    this.childRef.current?.addEventListener('click', () => {
      console.log('原生事件：子元素 DOM 事件监听！');
    });
    document.addEventListener('click', (e) => {
      console.log('原生事件：document DOM 事件监听！');
    });
  }
  parentClickFun = () => {
    console.log('React 事件：父元素事件监听！');
  };
  childClickFun = () => {
    console.log('React 事件：子元素事件监听！');
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
