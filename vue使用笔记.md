### 组件双向绑定

- vue2

```vue
<template>
  <el-dialog :visible.sync="isShow"></el-dialog>
</template>
<script>
export default {
  computed: {
    isShow: {
      get() {
        return this.visible; // props
      },
      set(val) {
        this.$emit("update:visible", val);
      },
    },
  },
};
</script>
```

外部使用组件:

```vue
<my-component :visible.sync="visible" />
```

- vue3

```vue
<template>
  <el-dialog v-model="isShow"></el-dialog>
</template>
<script setup>
const _props = defineProps({
  modelValue: {
    type: Boolean,
  },
});
const props = toRefs(_props);
const emit = defineEmits(["update:modelValue"]);
const isShow = computed({
  get() {
    return props.modelValue.value;
  },
  set(val) {
    emit("update:modelValue", val);
  },
});
</script>
```

外部使用组件:

```vue
<my-component v-model="visible" />
```

### Vue3 + Typescript 配置 Eslint + Prettier

安装：

- @typescript-eslint/eslint-plugin
- @typescript-eslint/parser
- @vue/eslint-config-typescript
- eslint
- eslint-config-prettier
- eslint-plugin-prettier
- eslint-plugin-vue
- vue-eslint-parser

.eslintrc 文件：

```json
{
  "root": true,
  "parser": "vue-eslint-parser",
  "plugins": ["@typescript-eslint"],
  "parserOptions": {
    "parser": "@typescript-eslint/parser",
    "ecmaVersion": 6,
    "sourceType": "module",
    "ecmaFeatures": {
      "experimentalObjectRestSpread": true
    },
    "project": "./tsconfig.json",
    "extraFileExtensions": [".vue"]
  },
  "env": {
    "es6": true,
    "browser": true,
    "node": true,
    "commonjs": true
  },
  "extends": [
    // "eslint:recommended",
    "@vue/typescript/recommended",
    "plugin:vue/vue3-recommended",
    "prettier",
    "plugin:prettier/recommended"
  ],
  "rules": {}
}
```

### vue3 性能提升点

#### diff 算法优化

vue3 在 diff 算法中相比 vue2 增加了静态标记。其作用是为了会发生变化的地方添加一个 flag 标记，下次发生变化的时候直接找该地方进行比较。标记为静态节点的节点在 diff 过程中则不会比较，把性能进一步提高。

#### 整体体积变小

移出了一些不常用的 api，支持 Tree shanking。任何一个函数，如 ref、computed 等，仅仅在用到的时候才打包，没用到的模块都被摇掉，打包的整体体积变小。

#### 响应式系统

vue2 中采用 defineProperty 来劫持整个对象，然后进行深度遍历所有属性，给每个属性添加 getter 和 setter，实现响应式。
vue3 采用 proxy 重写了响应式系统，因为 proxy 可以对整个对象进行监听，所以不需要遍历。

- 可以监听动态属性的添加
- 可以监听到数组的索引和数组 length 属性
- 可以监听删除属性

但是 proxy 仍无法监听深层次的嵌套对象。