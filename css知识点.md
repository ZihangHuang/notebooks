### flex: 1 与 flex: auto 区别

- `flex: 1` 等于 `flex-grow: 1; flex-shrink: 1; flex-basis: 0%;`
- `flex: auto` 等于 `flex-grow: 1; flex-shrink: 1; flex-basis: auto;`

两者的差异只在`flex-basis`。

- `flex-basis: 0%;`: 自身指定的 width 被忽略，宽度通过占用比例计算出来。
- `flex-basis: auto;`: 自身指定的 width 有效，然后加上剩余的宽度占用比例。

### BFC

块级格式化上下文，具有 BFC 特性的元素可以看作是隔离了的独立容器，容器里面的元素不会在布局上影响到外面的元素，并且 BFC 具有普通容器所没有的一些特性。

触发的条件：

- 根元素
- float 不为 none
- position 为 absolute 或 fixed
- overflow 不为 visible
- display 为 table-cell inline-block flex inline-flex grid inline-grid table-caption(表格标题)

规则：

- 内部 box 会在垂直方向，一个接一个地放置。同属于一个 BFC 的两个相邻 box 的 margin 垂直方向会发生重叠。
- 计算 BFC 高度时，浮动元素也计算在内
- 每个元素的 margin 的左边， 与包含块 border 的左边相接触(对于从左往右的格式化，否则相反)。即使存在浮动也是如此。（因此存在文本环绕浮动元素问题）

### 高清屏适配

通过-webkit-device-pixel-ratio，-webkit-min-device-pixel-ratio 和 -webkit-max-device-pixel-ratio 进行媒体查询，对不同 dpr 的设备，做一些样式适配。

```css
@media only screen and (-webkit-min-device-pixel-ratio: 2) {
}
```

或者使用 js 的`window.devicePixelRatio`。

### css 兼容性问题

#### ios 适配虚拟 home 键（底部黑色横条）

```css
/*针对全面屏的底部安全区域做适配*/
/*constant()和env()位置不能换*/
/*env()和constant()函数有个必要的使用前提，H5网页设置viewport-fit=cover的时候才生效，小程序里的viewport-fit默认是cover。*/
@supports (bottom: constant(safe-area-inset-bottom)) or
  (bottom: env(safe-area-inset-bottom)) {
  .body {
    padding-bottom: constant(safe-area-inset-bottom); /* 兼容 iOS < 11.2 */
    padding-bottom: env(safe-area-inset-bottom); /* 兼容 iOS >= 11.2 */
    /* padding-bottom: calc(60px(假设值) + constant(safe-area-inset-bottom));
        padding-bottom: calc(60px(假设值) + env(safe-area-inset-bottom));*/
  }
}
```

#### 安卓上，input 输入框在获取焦点时会被唤起的软键盘遮盖。

```javascript
dom.onfocus = function () {
  if (isAndroid) {
    setTimeout(function () {
      dom.scrollIntoView && dom.scrollIntoView(false);
    }, 1000);
  }
};
```
