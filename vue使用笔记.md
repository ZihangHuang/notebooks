### 组件双向绑定

- vue2

1、.sync

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

2、v-model

```vue
<template>
  <el-dialog :visible.sync="isShow"></el-dialog>
</template>
<script>
export default {
  props: {
    value: String,
  },
  computed: {
    isShow: {
      get() {
        return this.value; // props
      },
      set(val) {
        this.$emit("input", val);
      },
    },
  },
};
</script>
```

外部使用组件:

```vue
<my-component v-model="visible" />
```

- vue3

```vue
<template>
  <el-dialog v-model="isShow"></el-dialog>
  <el-dialog v-model="isShow2"></el-dialog>
</template>
<script setup>
const _props = defineProps({
  modelValue: {
    type: Boolean,
  },
  dialogVisible: {
    type: Boolean,
  },
});
const props = toRefs(_props);
const emit = defineEmits(["update:modelValue", "update:dialogVisible"]);
const isShow = computed({
  get() {
    return props.modelValue.value;
  },
  set(val) {
    emit("update:modelValue", val);
  },
});

const isShow2 = computed({
  get() {
    return _props.dialogVisible;
  },
  set(val) {
    emit("update:dialogVisible", val);
  },
});
</script>
```

外部使用组件:

```vue
<my-component v-model="visible" v-model:dialogVisible="visible" />
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

### vue3 + ts 定义 props 和 emits

```typescript
import { withDefaults } from "vue";

interface Props {
  name: string;
}

const props = withDefaults(defineProps<Props>(), {
  name: "jack",
});

const emits = defineEmits<{
  (e: "onClick", value: any): void;
}>();
```

### vue2 自定义指令

```typescript
const trigger = (el, type) => {
  const e = document.createEvent("HTMLEvents");
  e.initEvent(type, true, true);
  el.dispatchEvent(e);
};
Vue.directive("int", {
  inserted: function (el) {
    let input: HTMLInputElement;
    if (el.tagName === "input") {
      input = el as HTMLInputElement;
    } else {
      input = el.getElementsByTagName("input")[0];
    }

    if (!input) return;

    input.onkeyup = function (e) {
      if (input.value.length === 1) {
        input.value = input.value.replace(/[^1-9]/g, "");
      } else {
        input.value = input.value.replace(/[^\d]/g, "");
      }
      trigger(input, "input");
    };
  },
});
```
