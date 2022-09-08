```typescript
// 以下语句的意思就是 如果 T 是 U 的子类型的话，那么就会返回 X，否则返回 Y
// 对于联合类型来说会自动分发条件，例如 T extends U ? X : Y, T 可能是 A | B 的联合类型, 那实际情况就变成(A extends U ? X : Y) | (B extends U ? X : Y)
T extends U ? X : Y

// 去除对应类型，表示如果 T是 U的子类返回never类型，如果不是返回T类型。当T为联合类型的时候，它会自动分发条件。
type Exclude<T, U> = T extends U ? never : T 
// 使用
type AB = 'a' | 'b'
type BC = 'b' | 'c'
type Demo = Exclude<AB, BC> // => type Demo = 'a'


// 未包含
type Omit<T, K> = Pick<T, Exclude<keyof T, K>>
type Foo = Omit<{name: string, age: number}, 'name'> // -> { age: number }


// 覆盖类型
type Override<P, S> = Omit<P, keyof S> & S;
// 使用
type TypeStr = { b: string };
type TypeNum = Override<TypeStr, {b: number;}>;
```

### infer

infer 可以在 extends 条件类型的语句中，在真实分支中引用此推断类型变量，推断待推断的类型

用infer推断函数的返回值类型

```typescript
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;

type fn = () => number
type fnReturnType = ReturnType<fn> // number
```
infer R 代表待推断的返回值类型，如果 T 是一个函数(...args: any[]) => infer R，则返回函数的返回值 R，否则返回any

### isolatedModules 作用

将每个文件作为单独的模块。
当ts文件没有导出或导入模块，或者只使用类似`const enums`（内联替换的特性）和 `namespaces`类似的全局功能时，会提示“无法在 "--isolatedModules" 下编译xx.ts，因为它被视为全局脚本文件。请添加导入、导出或空的 "export {}" 语句来使它成为模块。”。使用模块可以提高typescript的编译速度，因为全局脚本文件需要检查其他文件来生成某个文件，这会使输出速度变慢。