## flex: 1 与 flex: auto 区别

- `flex: 1` 等于 `flex-grow: 1; flex-shrink: 1; flex-basis: 0%;`
- `flex: auto` 等于 `flex-grow: 1; flex-shrink: 1; flex-basis: auto;`

两者的差异只在`flex-basis`。

- `flex-basis: 0%;`: 自身指定的 width 被忽略，宽度通过占用比例计算出来。
- `flex-basis: auto;`: 自身指定的 width 有效，然后加上剩余的宽度占用比例。

## BFC

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

## 高清屏适配

通过-webkit-device-pixel-ratio，-webkit-min-device-pixel-ratio 和 -webkit-max-device-pixel-ratio 进行媒体查询，对不同 dpr 的设备，做一些样式适配。

```css
@media only screen and (-webkit-min-device-pixel-ratio: 2) {
}
```

或者使用 js 的`window.devicePixelRatio`。

## css 兼容性问题

### ios 适配虚拟 home 键（底部黑色横条）

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

### 安卓上，input 输入框在获取焦点时会被唤起的软键盘遮盖。

```javascript
dom.onfocus = function () {
  if (isAndroid) {
    setTimeout(function () {
      dom.scrollIntoView && dom.scrollIntoView(false);
    }, 1000);
  }
};
```

## 容易混淆的css属性

换行相关

- `word-break:break-all`：所有的都换行。
- `word-wrap:break-word`：自动换行，但如果这一行文字有可以换行的点，如空格，或CJK(Chinese/Japanese/Korean)(中文/日文/韩文)之类的，则就不打英文单词或字符的主意了，让这些换行点换行，至于对不对齐，好不好看，则不关心，因此，很容易出现一片一片空白的情况。
- `white-space:nowrap`：强制不换行。
- `white-space: pre-wrap`：保留空白符序列，识别字符串中的'\n'自动换行。

其他

- `word-spacing`：单词之间间距的。
- `white-space`：字符是否换行显示的。

## 常用 css

```css
/* 禁止点击 */
.disabled {
  pointer-events: none;
  cursor: default;
}

body,
div,
ul,
li,
h1,
h2,
h3,
h4,
h5,
input,
form,
a,
p,
textarea {
  margin: 0;
  padding: 0;
}
ol ul li {
  list-style: none;
}
a {
  text-decoration: none;
  display: block;
  color: #fff;
}
img {
  border: 0;
  display: block;
}

/* 清除浮动 */
.clearfloat {
  zoom: 1;
}
.clearfloat:after {
  display: block;
  clear: both;
  content: "";
  visibility: hidden;
  height: 0;
}

/*修改placeholder样式*/
:-moz-placeholder {
  /* Mozilla Firefox 4 to 18 */
  color: hsla(40, 70%, 100%, 0.3) !important;
  font-size: 14px;
  opacity: 1; /*火狐浏览器默认opacity小=小于1*/
}
::-moz-placeholder {
  /* Mozilla Firefox 19+ */
  color: hsla(40, 70%, 100%, 0.3) !important;
  font-size: 14px;
  opacity: 1;
}
:-ms-input-placeholder {
  color: #fff !important;
  font-size: 14px;
}
::-webkit-input-placeholder {
  color: #fff !important;
  font-size: 14px;
  opacity: 0.3;
}

/*单行省略*/
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/*多行省略溢出省略号*/
p {
  position: relative;
  line-height: 1.4em;
  /* 3 times the line-height to show 3 lines */
  height: 4.2em;
  overflow: hidden;
}
p::after {
  content: "...";
  font-weight: bold;
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 0 20px 1px 45px;
  background: url(http://css88.b0.upaiyun.com/css88/2014/09/ellipsis_bg.png)
    repeat-y;
}
/*注意：
height高度真好是line-height的3倍；
结束的省略好用了半透明的png做了减淡的效果，或者设置背景颜色；
IE6-7不显示content内容，所以要兼容IE6-7可以是在内容中加入一个标签，比如用<span class="line-clamp">...</span>去模拟；
要支持IE8，需要将::after替换成:after；*/

/*webkit内核多行省略*/
.ellipsis-webkit {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 限制在一个块元素显示的文本的行数 */
  -webkit-box-orient: vertical;
}

/*多行文字水平垂直居中（一般是尾部）*/
footer {
  display: table;
  width: 100%;
  height: 80px;
  text-align: center;
}
footer > div {
  display: table-cell;
  vertical-align: middle;
}
footer > div > p {
}

/*绝对定位的div相对父类居中*/
div {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/*去掉谷歌浏览器报错Unable to preventDefault inside passive event listener due to target being treated as passive. */
* {
  touch-action: pan-y;
}

/*实现0.5px的线*/
.line1 {
  transform: scaleY(0.5);
  transform-origin: 50% 100%;
  width: 200px;
  height: 1px;
  background: #000;
}
.line2 {
  width: 200px;
  height: 1px;
  background: linear-gradient(0deg, #fff, #000);
}
.line3 {
  width: 200px;
  height: 1px;
  background: none;
  box-shadow: 0 0.5px 0 #000;
}

/*下面每两个一组是相等的*/
/*当flex取值为一个非负数字，则该数字为flex-grow 值，flex-shrink为1，flex-basis为0% ，使子元素平分空间*/
.item {
  flex: 1;
}
.item {
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0%;
}

/*元素会根据自身宽高来设置尺寸。它是完全非弹性的：既不会缩短，也不会伸长来适应 flex 容器。*/
.item {
  flex: none;
}
.item {
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: auto;
}

/*元素会根据自身的宽度与高度来确定尺寸，但是会伸长并吸收 flex 容器中额外的自由空间，也会缩短自身来适应 flex 容器。*/
.item {
  flex: auto;
}
.item {
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: auto;
}

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

/*三角形*/
.triangle-up {
  width: 0;
  height: 0;
  border-left: 50px solid transparent;
  border-right: 50px solid transparent;
  border-bottom: 100px solid red;
}

.triangle-down {
  width: 0;
  height: 0;
  border-left: 50px solid transparent;
  border-right: 50px solid transparent;
  border-top: 100px solid red;
}

.triangle-left {
  width: 0;
  height: 0;
  border-top: 50px solid transparent;
  border-right: 100px solid red;
  border-bottom: 50px solid transparent;
}

.triangle-right {
  width: 0;
  height: 0;
  border-top: 50px solid transparent;
  border-left: 100px solid red;
  border-bottom: 50px solid transparent;
}

.triangle-topleft {
  width: 0;
  height: 0;
  border-top: 100px solid red;
  border-right: 100px solid transparent;
}

.triangle-topright {
  width: 0;
  height: 0;
  border-top: 100px solid red;
  border-left: 100px solid transparent;
}

.triangle-bottomleft {
  width: 0;
  height: 0;
  border-bottom: 100px solid red;
  border-right: 100px solid transparent;
}

/*钝角箭头*/
.right-arrow {
  width: 44px;
  height: 44px;
  border-top: 1px solid #ccc;
  border-right: 1px solid #ccc;
  transform: rotate(45deg) skew(30deg, 30deg);
}

/*纯css实现loading*/
.loading {
  width: 20px;
  height: 20px;
  border: 2px solid #7d329c;
  border-bottom: 2px solid transparent;
  border-radius: 50%;
  animation: load 1.5s linear infinite;
}

@keyframes load {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```
