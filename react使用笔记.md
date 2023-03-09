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

### 惰性初始 state

`useState`可以传入一个函数，在函数中计算并返回初始的 state，此函数只在初始渲染时被调用。
