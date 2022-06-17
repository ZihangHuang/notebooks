### flex: 1 与 flex: auto 区别

- `flex: 1` 等于 `flex-grow: 1; flex-shrink: 1; flex-basis: 0%;`
- `flex: auto` 等于 `flex-grow: 1; flex-shrink: 1; flex-basis: auto;`

两者的差异只在`flex-basis`。

- `flex-basis: 0%;`: 自身指定的width被忽略，宽度通过占用比例计算出来。
- `flex-basis: auto%;`: 自身指定的width有效，然后加上剩余的宽度占用比例。