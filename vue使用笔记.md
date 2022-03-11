#### 组件双向绑定

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
	        	return this.visible // props
	      	},
	      	set(val) {
	        	this.$emit('update:visible', val)
	        }
	    }
	}
}
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
})
const props = toRefs(_props)
const emit = defineEmits(['update:modelValue'])
const isShow = computed({
  get() {
    return props.modelValue.value
  },
  set(val) {
   emit('update:modelValue', val)
  },
})
</script>
```

外部使用组件:

```vue
<my-component v-model="visible" />
```