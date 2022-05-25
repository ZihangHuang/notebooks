```typescript
// 覆盖类型
type Override<P, S> = Omit<P, keyof S> & S;

// 使用
type TypeStr = { b: string };
type TypeNum = Override<TypeStr, {b: number;}>;
```