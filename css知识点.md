### flex: 1 与 flex: auto 区别

- `flex: 1` 等于 `flex-grow: 1; flex-shrink: 1; flex-basis: 0%;`
- `flex: auto` 等于 `flex-grow: 1; flex-shrink: 1; flex-basis: auto;`

两者的差异只在`flex-basis`。

- `flex-basis: 0%;`: 自身指定的width被忽略，宽度通过占用比例计算出来。
- `flex-basis: auto%;`: 自身指定的width有效，然后加上剩余的宽度占用比例。

### BFC

块级格式化上下文，具有 BFC 特性的元素可以看作是隔离了的独立容器，容器里面的元素不会在布局上影响到外面的元素，并且 BFC 具有普通容器所没有的一些特性。

触发的条件：
- 根元素
- float 不为 none
- position为absolute 或 fixed
- overflow不为visible
- display 为 table-cell inline-block flex inline-flex grid inline-grid table-caption(表格标题)

规则：
- 内部box会在垂直方向，一个接一个地放置。同属于一个BFC的两个相邻box的margin垂直方向会发生重叠。
- 计算BFC高度时，浮动元素也计算在内
- 每个元素的margin的左边， 与包含块border的左边相接触(对于从左往右的格式化，否则相反)。即使存在浮动也是如此。（因此存在文本环绕浮动元素问题）