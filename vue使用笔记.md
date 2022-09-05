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
- prettier

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