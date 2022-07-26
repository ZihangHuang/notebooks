### 使用 `useReducer` 和 `context` 作为状态管理

- reducer.ts

```typescript
import React from "react";

export interface State {
  name: string;
  age: number;
}

type ActionType = "SET_NAME" | "SET_AGE";

export interface Action {
  type: ActionType;
  data: any;
}

export interface ContextProps {
  state: State;
  dispatch: React.Dispatch<Action>;
}

export const initialState: State = {
  name: "jack",
  age: 30,
};

export const reducer: React.Reducer<State, Action> = function (state, action) {
  switch (action.type) {
    case "SET_NAME":
      return {
        ...state,
        name: action.data,
      };
    case "SET_AGE":
      return {
        ...state,
        age: action.data,
      };

    default:
      return state;
  }
};
```

- store.ts

```typescript
import React from "react";
import { ContextProps } from "./reducer";

const Store = React.createContext({} as ContextProps);

export default Store;
```

- App.tsx

```typescript
import React, { useReducer } from "react";
import ReactDOM from "react-dom";
import { reducer, initialState } from "./reducer";
import Store from "./store";

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <Store.Provider value={{ state, dispatch }}>
      <div>App</div>
    </Store.Provider>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
```

- 子组件

```typescript
import React, { useContext } from "react";
import Store from "./store";

const Child = () => {
  const storeContext = useContext(Store);
  const { state, dispatch } = storeContext;

  // 读取state
  const name = state.name;

  // 设置state
  const setName = () => {
    dispatch({
      type: "SET_NAME",
      data: "tom",
    });
  };

  return <div>Child</div>;
};
```

### React18 的变化总结

- React17 之前，事件委托挂载在 document，React17 开始，变成挂载在渲染 react 树的根 dom 容器上，使得多版本并存成为可能。
- React18 中，增加了新的 RootAPI：`ReactDOM.createRoot()`，以开启并发模式。
- React17 之前，在 Promise 链、异步代码或者原生事件处理函数，不会合并多次的状态更新。React18 中，`ReactDOM.createRoot()`后，使用这些情况都会进行状态合并。如不想进行自动合并，可以使用`ReactDOM.flushSync()`。`flushSync`函数内部的多个 setState 仍然为批量更新，这样可以精准控制哪些不需要的批量更新。
- 增加`startTransition`用于执行非紧急的状态更新。

### React的Fiber

React16以后实现的一套新的更新机制，让React更新变得可控，避免了之前采用递归需要一气呵成影响性能的做法。

- 每个元素都会有一个fiber对象对应。这些fiber对象之间相互关联，构成了fiber tree。
- react fiber的更新过程是碎片化的，一次更新会分为n个任务片。每个片执行完成后就会吧控制权交给调度器。
- 调度器会查看浏览器是否有级别更高的任务（比如：alert，onclick，等），如果有执行这个高级别任务，如果没有继续执行fiber更新。这个功能是基于requestIdleCallback实现的。