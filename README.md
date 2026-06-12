# 止鹜个人博客

深色星空风格的个人博客 / 个人导航站，前端可以部署在 GitHub Pages，后端代理使用 Deno Deploy。

上线步骤见 [DEPLOY.md](DEPLOY.md)。

## 页面

- `/`：首页
- `/articles/`：文章列表页
- `/articles/how-to-build-blog.html`：单篇文章示例页
- `/projects/`：项目入口页
- `/practice/`：学习 / 刷题导航页
- `/knowledge/`：笔记 / Notion 知识库入口页

## 写文章

文章列表来自根目录的 `articles.json`，Markdown 文件放在 `posts/` 目录。

新增文章时：

1. 在 `posts/` 新增一篇 `.md` 文件，例如 `my-note.md`
2. 在 `articles.json` 里新增对应记录，`slug` 写成 `my-note`
3. 复制一份 `articles/how-to-build-blog.html`，改名为 `articles/my-note.html`
4. 把新 HTML 的 `<body data-article-slug="...">` 改成 `my-note`

## GitHub Pages 部署

这个站点不需要构建。把仓库推到 GitHub 后，在仓库的 `Settings -> Pages` 中选择从分支发布即可。

如果部署到项目页，例如 `https://用户名.github.io/仓库名/`，建议把页面中的链接按实际仓库路径检查一遍。

## Deno Deploy 代理

代理入口在 `deno/proxy.ts`，发布后路径是：

```text
https://你的-deno-app.deno.net/api/proxy/*
```

需要在 Deno Deploy 环境变量中配置：

```text
PROXY_TARGET_URL=https://你的真实后端或 API 根地址
ALLOWED_ORIGIN=https://你的 GitHub Pages 域名
```

如果真实后端需要固定鉴权头，可以额外配置：

```text
PROXY_AUTHORIZATION=Bearer 你的服务端令牌
```

示例：

```text
GET https://你的-deno-app.deno.net/api/proxy/notion/pages
```

会代理到：

```text
GET https://你的真实后端或 API 根地址/notion/pages
```

### Deno Deploy 配置

在 Deno Deploy 新建应用时选择当前 GitHub 仓库：

- Runtime configuration：`Dynamic`
- Dynamic Entrypoint：`deno/proxy.ts`
- Install command：留空
- Build command：留空

本地调试代理：

```bash
deno task proxy
```

## 后续替换链接

当前所有 Notion、项目入口和刷题链接都使用 `#` 占位。后续直接在对应 HTML 文件里替换 `href="#"` 即可。
