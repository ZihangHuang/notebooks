## git commit之后修改上一次commit的信息

刚commit还没有push

```shell
git commit --amend
```

会进入vim编辑器，点击i，修改commit信息后，点击esc，输入ZZ退出。

## 查看main分支和develop分支不同的文件

```shell
git diff --name-only main..develop
```

## 查看某次commit提交的文件

```shell
git show --name-status xxxxxxxx
```