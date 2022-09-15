### 安装

- `husky`
- `@commitlint/cli`、`@commitlint/config-conventional`
- `lint-staged`（一个在 git 暂存区上运行 linters 的工具）
- `eslint`、`prettier`等

### 配置 husky

执行`npm set-script prepare "husky install"`后，可以在 package.json 文件的 scripts 配置项中看到 `"prepare": "husky install"`

执行`npm install` 或者 `npm run prepare` 初始化 husky。

### 代码提交 linters

package.json 文件添加：

```json
"lint-staged": {
    "*.{vue,ts,tsx}": [
        "prettier --write",
        "eslint -c .eslintrc --fix"
    ]
},
```

lint-staged 只针对更改的文件（`git add`的文件）做校验。

添加勾子`npx husky add .husky/pre-commit 'node_modules/.bin/lint-staged'`，在根目录的.husky 文件夹下多了一个 pre-commit 文件，其内容如下：

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

node_modules/.bin/lint-staged
```

### git commit 提交规范

`npx husky add .husky/commit-msg 'node_modules/.bin/commitlint --edit "$1"'`，在根目录的.husky 文件夹下多了一个 commit-msg 文件，其内容如下：

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

node_modules/.bin/commitlint --edit "$1"
```

创建 commitlint.config.js 文件

```javascript
module.exports = {
  extents: ["@commitlint/config-conventional"],
  rules: {
    "body-leading-blank": [1, "always"],
    "footer-leading-blank": [1, "always"],
    "header-max-length": [2, "always", 72],
    "scope-case": [2, "always", "lower-case"],
    "subject-case": [
      1,
      "never",
      ["sentence-case", "start-case", "pascal-case", "upper-case"],
    ],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "type-case": [2, "always", "lower-case"],
    "type-empty": [2, "never"],
    "type-enum": [
      2,
      "always",
      [
        "build",
        "chore",
        "ci",
        "docs",
        "feat",
        "fix",
        "perf",
        "refactor",
        "revert",
        "release",
        "style",
        "test",
        "improvement",
      ],
    ],
  },
};
```
