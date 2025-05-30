## React18 的变化总结

- React17 之前，事件委托挂载在 document，React17 开始，变成挂载在渲染 react 树的根 dom 容器上，使得多版本并存成为可能。
- React18 中，增加了新的 RootAPI：`ReactDOM.createRoot()`，以开启[并发模式](https://www.51cto.com/article/781259.html)。
- React 事件池仅支持在 React 16 及更早版本中，在 React 17 已经不使用事件池。
- 增加`startTransition`用于执行非紧急的状态更新。
- React17 之前，在 Promise 链、异步代码或者原生事件处理函数，不会合并多次的状态更新。React18 中，`ReactDOM.createRoot()`后，使用这些情况都会进行状态合并。如不想进行自动合并，可以使用`ReactDOM.flushSync()`。`flushSync`函数内部的多个 setState 仍然为批量更新，这样可以精准控制哪些不需要的批量更新。

React18 之前，仅在 React 合成事件、生命周期函数会合并多次状态更新，如
 
```js
const Demo = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // 点击按钮，这里会输出一次，会批量处理
    console.log('render');
  });

  const handleClick = () => {
    setCount(1);
    setCount(2);
  };

  return <button onClick={handleClick}></button>;
};
```

在 setTimeout/setInterval、Promise.then、async/await、原生 DOM 事件，不会合并多次的状态更新：

```js
const Demo = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // 点击按钮，这里会输出两次，不会批量处理
    console.log('render');
  });

  const handleClick = () => {
    setTimeout(() => {
      setCount(1);
      setCount(2);
    }, 10);
  };

  return <button onClick={handleClick}></button>;
};
```

在 React18 后，使用 createRoot() 挂载后，上面的场景都会自动合并多次的状态更新。

不想自动合并多次的状态更新，使用`flushSync`强制 React 刷新 DOM：

```js
const handleClick = () => {
  flushSync(() => {
    setCount(1);
  });
  flushSync(() => {
    setCount(2);
  });
};
```

## React 内部机制优化更新效率

Fiber 架构与任务拆分
React 16 引入的 Fiber 架构将虚拟 DOM 的更新过程拆分为多个可中断的小任务（每个 Fiber 节点对应一个任务），通过链表结构遍历组件树，替代了早期同步递归的方式。这种设计使得更新过程可中断、可恢复，避免了长时间阻塞主线程，确保浏览器能及时处理高优先级任务（如动画或用户交互）。

时间分片（Time Slicing）
在 Concurrent Mode 下，React 使用时间分片技术，将任务分配到多个浏览器帧中执行。每帧仅处理部分任务，若时间片耗尽则暂停更新，交还主线程给浏览器渲染，从而避免页面卡顿。这一机制通过 requestIdleCallback 或 MessageChannel 实现任务的调度与恢复。

Lane 调度算法
React 18 后采用 Lane 算法替代早期的 expirationTime 算法。Lane 通过 32 位二进制位表示优先级，允许更灵活的批次划分。例如，高优先级的用户交互（如点击）可打断低优先级任务（如数据请求），同时支持多个优先级任务并发执行，解决了 IO 密集型场景下的阻塞问题。

增量式协调（Reconciliation）
Fiber 架构的协调阶段（Reconciler）通过对比新旧 Fiber 树的差异（Diff 算法），仅更新必要的 DOM 节点。副作用链表（Effect List）的引入进一步优化了更新提交阶段，确保仅对变化的节点进行实际 DOM 操作。

## React 的 Fiber

学习文章：https://fe.azhubaby.com/React/Fiber.html

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

Fiber 可以理解为一种数据结构，Fiber 采用链表实现，每个 Virtual DOM 都可以表示为一个 Fiber。每个元素即每个 FiberNode，对应 React element，多个 FiberNode 形成 Fiber Tree 。它们的这种连接方式在数据结构里称为链表。一个 FiberNode 包含了 return、child、sibling 属性。

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

也可以将 Fiber 理解为一个执行单位，每次执行完一个执行单位，React 就会检查现在还剩多少时间，如果没有时间就将控制权让出来，它保存了本次更新相关的信息。

React Fiber 一个更新过程被分为两个阶段：

- render(Reconciler) 阶段（可中断）：找到 Virtual DOM 中变化的部分，打上增删改的标记。
- Commit 阶段（不可中断）：将变更的部分一次性更新到 DOM 上。

- React Fiber 的更新过程是碎片化的，一次更新会分为 n 个任务片。每个片执行完成后就会把控制权交给调度器。
- 调度器会查看浏览器是否有级别更高的任务（比如：alert，onclick，等），如果有则执行这个高级别任务，如果没有继续执行 fiber 更新。React 内部自行实现了 requestIdleCallback。

总结：React Fiber 是 16 版本引入的新协调算法，核心目标是提升复杂应用的渲染性能。它通过将渲染任务拆解为可中断的单元（Fiber 节点），使用链表结构实现增量渲染。相比旧版递归不可中断的更新，Fiber 允许高优先级任务抢占执行，同时支持时间分片渲染，确保动画等高频操作不卡顿。这也为后续的并发模式、Suspense 等特性奠定了基础。

自述：React Fiber 是一套更新机制，将渲染工作可以拆分成多个任务，Fiber 可以理解为一个数据结构，每个 React 元素 对应到一个 Fiber 节点，采用链表实现连接。也可以将 Fiber 理解为一个执行单位，每执行完一个执行单位，执行完成后就会把控制权交给调度器。调试器会查看是否有更高级别的任务，如用户交互（点击事件等），有就执行高级别任务，没有就继续执行 fiber 更新。

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
