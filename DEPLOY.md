# 止鹜个人博客上线部署步骤

当前方案：

- 前端：GitHub Pages，直接发布仓库根目录静态文件
- 后端代理：Deno Deploy，入口文件 `deno/proxy.ts`

## 1. 上传到 GitHub 的文件

把本目录 `F:\文档\个人博客` 下的项目文件上传到 GitHub 仓库根目录。

需要上传：

- `.nojekyll`
- `README.md`
- `DEPLOY.md`
- `index.html`
- `articles.json`
- `assets/`
- `articles/`
- `posts/`
- `projects/`
- `practice/`
- `knowledge/`
- `deno/`
- `deno.json`

不要手动上传：

- `.git/`

## 2. GitHub Pages 设置

1. 打开 GitHub 仓库
2. 进入 `Settings`
3. 左侧进入 `Pages`
4. `Source` 选择 `Deploy from a branch`
5. `Branch` 选择 `main`
6. 文件夹选择 `/(root)`
7. 点击 `Save`

发布完成后，站点地址通常是：

```text
https://你的用户名.github.io/仓库名/
```

如果仓库名是 `ningyan1228.github.io`，地址通常是：

```text
https://ningyan1228.github.io/
```

## 3. Deno Deploy 代理设置

1. 打开 Deno Deploy 控制台
2. 新建 Project
3. 选择从 GitHub 仓库部署
4. 选择这个博客仓库
5. 入口文件设置为：

```text
deno/proxy.ts
```

6. 不需要 Build Command
7. 不需要 Install Command

## 4. Deno 环境变量

在 Deno Deploy 项目设置里添加：

```text
PROXY_TARGET_URL=https://你的真实后端或 API 根地址
ALLOWED_ORIGIN=https://你的-github-pages-域名
```

可选：

```text
PROXY_AUTHORIZATION=Bearer 你的服务端令牌
```

## 5. 验证 Deno 代理

部署完成后先访问：

```text
https://你的-deno项目域名/api/health
```

如果返回：

```json
{"ok":true,"service":"zhiwu-deno-proxy","usage":"/api/proxy/*"}
```

说明代理服务在线。

再测试：

```text
https://你的-deno项目域名/api/proxy/xxx
```

它会转发到：

```text
https://你的真实后端或 API 根地址/xxx
```

## 6. 当前站点页面

- `/` 首页
- `/articles/` 文章页
- `/projects/` 项目页
- `/practice/` 学习页
- `/knowledge/` 笔记/知识库页

`工具`、`关于我`、`联系` 当前还是导航占位，后续再补页面。
