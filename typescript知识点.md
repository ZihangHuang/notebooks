## 常用映射类型

- Recode(内置)

根据 K 中所有可能值来设置 key 和 value 的类型

```typescript
//定义
type Record<K extends string, T> = { [P in K]: T };

type RecodeProps = Record<"prop1" | "prop2" | "prop3", string>;
let per1: RecodeProps = {
  prop1: "abc",
  prop2: "abc",
  prop3: "bcd",
};
```

- Pick(内置)

把某个类型中的子属性挑选出来

```typescript
//定义
type Pick<T, K extends keyof T> = { [P in K]: T[P] };

interface Person2 {
  name: string;
  age: number;
  gender: string;
}

type PickPerson = Pick<Person2, "name" | "age">;
let per2: PickPerson = { name: "123", age: 1 };
```

- Readonly(内置)

每个属性成为 readonly 类型

```typescript
//定义
type Readonly<T> = { readonly [P in keyof T]: T[P] };

type ReadonlyPerson = Readonly<Person2>;
let per3: ReadonlyPerson = {
  name: "22",
  age: 123,
};

//拓展，设置子元素也成为 readonly 类型
type DeepReadonly<T> = { readonly [P in keyof T]: DeepReadonly<T[P]> };
```

- Partial(内置)

每个属性成为可选

```typescript
//定义
type Partial<T> = { [P in keyof T]?: T[P] };
type PartialPerson = Partial<Person2>;
let per4: PartialPerson = {
  name: "fff", //name和age属性都可以不写
};
```

- Exclude<T, U> -- 从 T 中剔除可以赋值给 U 的类型。
- Extract<T, U> -- 提取 T 中可以赋值给 U 的类型。
- ReturnType<T> -- 获取函数返回值类型。
- InstanceType<T> -- 获取构造函数类型的实例类型。
- NonNullable<T> -- 从 T 中剔除 null 和 undefined。

```typescript
type T00 = Exclude<"a" | "b" | "c" | "d", "a" | "c" | "f">; // "b" | "d"
type T01 = Extract<"a" | "b" | "c" | "d", "a" | "c" | "f">; // "a" | "c"

type T02 = Exclude<string | number | (() => void), Function>; // string | number
type T03 = Extract<string | number | (() => void), Function>; // () => void

type T04 = NonNullable<string | number | undefined>; // string | number
type T05 = NonNullable<(() => string) | string[] | null | undefined>; // (() => string) | string[]

function f1(s: string) {
  return { a: 1, b: s };
}

class C {
  x = 0;
  y = 0;
}

type T10 = ReturnType<() => string>; // string
type T11 = ReturnType<(s: string) => void>; // void
type T12 = ReturnType<<T>() => T>; // {}
type T13 = ReturnType<<T extends U, U extends number[]>() => T>; // number[]
type T14 = ReturnType<typeof f1>; // { a: number, b: string }
type T15 = ReturnType<any>; // any
type T16 = ReturnType<never>; // any
type T17 = ReturnType<string>; // Error
type T18 = ReturnType<Function>; // Error

type T20 = InstanceType<typeof C>; // C
type T21 = InstanceType<any>; // any
type T22 = InstanceType<never>; // any
type T23 = InstanceType<string>; // Error
type T24 = InstanceType<Function>; // Error
```

- ClassOf

获取类本身的类型

```typescript
// 定义
type ClassOf<T> = new (...args: any[]): T;

//示例
class Person{}

let per: Person = new Person()

let per2: InstanceType<typeof Person> = new Person()

//Person是类实例的类型，ClassOf<Person>才是类本身的类型，或者可以写成typeof Person
let setPerson = function (Per: ClassOf<Person>): Person {
    return new Per()
}
```

- Override

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

## infer

infer 可以在 extends 条件类型的语句中，在真实分支中引用此推断类型变量，推断待推断的类型

用 infer 推断函数的返回值类型

```typescript
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;

type fn = () => number;
type fnReturnType = ReturnType<fn>; // number
```

infer R 代表待推断的返回值类型，如果 T 是一个函数(...args: any[]) => infer R，则返回函数的返回值 R，否则返回 any

## isolatedModules 作用

将每个文件作为单独的模块。
当 ts 文件没有导出或导入模块，或者只使用类似`const enums`（内联替换的特性）和 `namespaces`类似的全局功能时，会提示“无法在 "--isolatedModules" 下编译 xx.ts，因为它被视为全局脚本文件。请添加导入、导出或空的 "export {}" 语句来使它成为模块。”。使用模块可以提高 typescript 的编译速度，因为全局脚本文件需要检查其他文件来生成某个文件，这会使输出速度变慢。

Vite 使用 esbuild 将 TypeScript 转译到 JavaScript，约是 tsc 速度的 20~30 倍。但在 ESbuild 中需要启用 isolatedModules 功能。因为 ESbuild 是单独编译每个文件，无法判断引入的是 Type(类型) 还是 值，所以需要开发者显示地声明是“Type”。

## 装饰器(decorator)

- 类装饰器

```ts
function classDecorator<T extends { new (...args: any[]): {} }>(target: T) {
  return class extends target {
    hello = "override";
  };
}

@classDecorator
class Greeter {
  property = "property";
  hello: string;
  constructor(m: string) {
    this.hello = m;
  }
}
console.log(new Greeter("world").hello); // override
```

- 方法装饰器

```ts
function enumerable(value: boolean) {
  /**
   * @param {any}                target      [装饰的属性所属的类的原型，如Greeter2.prototype]
   * @param {string}             propertyKey [装饰的属性的key]
   * @param {PropertyDescriptor} descriptor  [装饰的属性的对象的描述符对象即descriptor，表示可枚举可写等的对象]
   */
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const fun = descriptor.value; //即是装饰的属性的值
    descriptor.value = function (str: string) {
      console.log("我在前面加上了这句");
      const res = fun.call(this, str); //执行原来的方法，注意有可能不是方法而是属性，这里设定是方法
      return res + " china";
    };
    //可以返回一个新的描述符用来修改原描述符，如return {enumerable: false}
  };
}
class Greeter2 {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }

  @enumerable(false)
  greet(str) {
    return "Hello, " + this.greeting + str;
  }
}
let greet2 = new Greeter2("green");
console.log(greet2.greet(", welcome to"));
// 我在前面加上了这句
// Hello, green, welcome to china
```

## 常用工具

- 根据属性获取对象的某个值

```ts
function getProperty<T, K extends keyof T>(o: T, name: K): T[K] {
  return o[name]; // o[name] is of type T[K]
}
var aa3 = { a: 1, b: 2 };
getProperty(aa3, "a");
```

- 限制传入特定的参数

```ts
interface API {
  baidu: string;
  google: string;
}

function get<URL extends keyof API>(url: URL): API[URL] {
  return "https://www." + url + ".com";
}

get("baidu");
```

- Record 设置类型相同的类型

```ts
enum AnimalType {
  CAT = "cat",
  DOG = "dog",
  FROG = "frog",
}

type Maps = Record<AnimalType, Function>;

let animal: Maps = {
  cat() {},
  dog() {},
  frog() {},
};
```

- $('button')是个 DOM 元素选择器，可是返回值的类型是运行时才能确定的，除了返回 any ，还可以

```ts
function $<T extends HTMLElement>(id: string): T {
  return document.getElementById(id);
}

$<HTMLInputElement>("input").value;
```

- 在 window 对象上显式设置属性

```ts
// 1
(window as any).MyNamespace = {};

// 2
declare interface Window {
  MyNamespace: any;
}
window.MyNamespace = window.MyNamespace;
```

```ts
// 导出从别的模块导入的类型
export type { AuditMessage } from "@/types/voice";

// 遍历enum
export enum MotifIntervention {
  Intrusion,
  Identification,
  AbsenceTest,
  Autre,
}
// 1:
for (let item in MotifIntervention) {
  if (isNaN(Number(item))) {
    console.log(item);
  }
}
// 2:
Object.keys(MotifIntervention).filter(
  (key) => !isNaN(Number(MotifIntervention[key]))
);
```
