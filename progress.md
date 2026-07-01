# 止鹜个人博客进展记录

更新时间：2026-07-01

这份文件用于在新的 Codex 对话中快速接续当前项目，避免旧长上下文线程继续消耗额度。

## 当前线程状态

- 旧 Codex 线程：`019ebae1-5ba2-73f0-baab-a6903004e6f9`
- 旧线程状态：仍显示 `active / inProgress`，最近反复进入上下文压缩，没有看到实际文件写入结果。
- 旧线程最后明确任务：整理当前对话进展到 `progress.md`，方便新开对话继续。
- 本窗口已接管并完成进展整理，同时补上旧线程卡住未完成的“公考早自习”项目卡片。

## 已完成事项

- 搭建了个人博客 / 个人导航站静态页面，项目目录位于 `F:\文档\个人博客`。
- 网站名称为“止鹜个人博客”，定位为阅读、学习、创作、资源整理的个人数字工作台。
- 首页已具备深色星空、玻璃拟态、主题切换、星空动画、点击粒子效果和主要导航入口。
- 已有主要页面：
  - `/` 首页
  - `/articles/` 文章页
  - `/projects/` 项目入口页
  - `/practice/` 学习 / 刷题导航页
  - `/knowledge/` 笔记 / Notion 知识库入口页
  - `/calendar/` 日历工作台
  - `/tools/` 工具页
  - `/about/` 关于我
  - `/contact/` 联系页
- 首页已接入站点状态面板，脚本版本为 `assets/main.js?v=20260628-analytics`。
- 项目页采用 Finder 式项目窗口，支持卡片、列表、网格和图片视图切换。
- 项目页目前包含：
  - 学习资料库文档
  - 微信读书 Skills 网站
  - 朝夕壁纸网站
  - 考公备考助手
  - 拾音匣
  - 小红书情绪文案生成器
  - 网盘链接提取器
  - 电子书资料库
  - 公考早自习
- 已把“公考早自习”添加到 `projects/index.html`，入口为：
  - `https://ningyan1228.github.io/gongkao-morning-study/`
- 已新增首页“项目星图”入口：
  - 页面位置：`index.html` 首页项目入口后方
  - 数据配置：`assets/project-stars.json`
  - 前端逻辑：`assets/main.js` 会优先读取 `https://api.gjsx.uno/api/project-stars`，失败时回退本地配置，并对有 `healthUrl` 的项目做健康检测。
  - 当前五颗主星：微信读书 Skills、公考早自习、学习资料库、朝夕壁纸网站、电子书资料库。- 已创建可复用 Codex skill：`github-pages-proxy-migrator`。
  - 位置：`C:\Users\zhiwu\.codex\skills\github-pages-proxy-migrator`
  - 用途：把 GitHub Pages/static 项目的 Deno Deploy、Netlify Functions 或其他代理迁移到个人腾讯云服务器。
  - 以后可在其他 Codex 窗口使用：`Use $github-pages-proxy-migrator ...`
- 已为“公考早自习”服务器代理迁移准备过接力指令，建议代理域名：
  - `https://zaozixi-api.gjsx.uno/`
- 个人服务器当前背景信息：
  - 腾讯云轻量服务器：Ubuntu 22.04
  - 服务器 IP：`43.128.149.75`
  - 主域名：`gjsx.uno`
  - 已有统一 nginx 网关、`nginx-proxy`、`acme-companion`、Docker network：`web`
  - 博客代理已可访问：`https://api.gjsx.uno/health`
  - 微信读书代理方向为：`https://weread-api.gjsx.uno/`

## 关键决策

- 前端继续使用 GitHub Pages，不迁移到服务器。
- 服务器只承担后端代理、统计、API 转发等功能。
- 服务器项目统一放在 `~/projects/` 下，目标结构类似：

```text
~/projects/
├── nginx
├── blog-proxy
├── weread-proxy
├── zaozixi-proxy
└── README.md
```

- 新增代理服务优先使用 Docker + docker compose 管理。
- 新增代理服务接入已有 Docker 网络 `web`，通过 `nginx-proxy` 和 `acme-companion` 自动绑定域名并申请 HTTPS。
- DNS 由用户在阿里云添加 A 记录，等待生效后再测试 HTTPS。
- 不把 Cookie、Token、API Key、`.env` 等敏感信息写死或上传 GitHub。
- 如果原项目已有代理逻辑，优先迁移原逻辑；如果没有，再用 Node.js 代理保持前端 API 调用方式尽量不变。

## 未完成待办

- 停止或关闭旧的卡住 Codex 线程，避免它继续占用额度。
- 如需彻底整理旧线程，可以先把本文件作为新的接力上下文，不再让旧线程继续跑。
- 检查 `projects/index.html` 新增的“公考早自习”卡片在浏览器中的显示效果。
- 如需要让首页项目简介也出现“公考早自习”，可同步更新 `index.html` 中 Projects 卡片描述。
- 如要继续公考早自习服务器代理迁移：
  - 在阿里云 DNS 添加 `zaozixi-api.gjsx.uno -> 43.128.149.75`
  - 在服务器创建 `~/projects/zaozixi-proxy`
  - 写入 Docker / compose 配置
  - 接入 Docker network `web`
  - 测试 `https://zaozixi-api.gjsx.uno/health`
  - 修改公考早自习前端代理地址为 `https://zaozixi-api.gjsx.uno/`
- 本地 Git 状态目前显示大量未跟踪文件，原因可能是仓库尚未正式提交或当前 Git 安全目录需要指定 `safe.directory`。
- 如要检查 Git 状态，可使用：

```powershell
& 'F:\application_app\Git\Git\bin\git.exe' -c safe.directory='F:/文档/个人博客' status --short
```

## 给新对话的建议开场

```text
这是止鹜个人博客项目，目录在 F:\文档\个人博客。请先阅读 progress.md，然后继续处理未完成待办。不要继续使用旧线程 019ebae1-5ba2-73f0-baab-a6903004e6f9，因为它已经因上下文过长反复压缩卡住。
```
## 2026-07-01 项目星图与站长入口进展

### 已完成：项目星图升级为真实访问星尘

- 首页已新增“项目星图 / Project Constellation”，入口位于 `index.html`，视觉样式位于 `assets/styles.css`，交互逻辑位于 `assets/main.js`，项目配置位于 `assets/project-stars.json`。
- 星图当前包含 9 个项目：
  - `study-resource`：学习资料库
  - `weread-skills`：微信读书 Skills
  - `gongkao-morning`：公考早自习
  - `echo-shelf`：拾音匣
  - `zhaoxi-wallpaper`：朝夕壁纸网站
  - `ai-kaogong-assistant`：考公备考助手
  - `xiaohongshu-copy`：小红书情绪文案生成器
  - `wangpan-extractor`：网盘链接提取器
  - `ebook-library`：电子书资料库
- 已新增 `assets/project-visit-tracker.js`，用于放到每个 GitHub Pages 项目的 `index.html` 中，项目被真实访问时自动上报 pageview。
- 每个项目页面需要在 `</body>` 前加入：

```html
<script>window.ZHIWU_PROJECT_ID = "项目ID";</script>
<script src="https://gjsx.uno/assets/project-visit-tracker.js"></script>
```

- 已在多个项目仓库中加入访问上报脚本，并确认部分项目的“粒星尘”已经开始变化。
- 这个功能现在的含义是：公开页面不显示冰冷 PV，而是显示“今日有多少粒星尘经过”；每个项目的访问会变成对应星星的粒星尘。

### 已完成：服务器统计链路修复

- 服务器项目位置：`~/projects/blog-proxy`。
- 服务器接口：`https://api.gjsx.uno/api/project-stars`。
- 已在 `blog-proxy/server.js` 中给 analytics 事件增加 `projectId` 字段，用于区分不同项目。
- `/api/project-stars` 已改为读取 analytics 记录，按当天唯一访客统计 `pageview` 和 `click`，生成每个项目的 `visitsToday`。
- 因浏览器跨域上报被 CORS 拦截，已在 `setCors(req, res)` 中补充：

```js
res.setHeader("Access-Control-Allow-Credentials", "true");
```

- 已执行过：

```bash
cd ~/projects/blog-proxy
docker compose up -d --build
```

- 容器重建后，星图已经能读到部分真实项目访问量，说明链路已跑通：

```text
项目页面访问 -> project-visit-tracker.js -> api.gjsx.uno/api/analytics/track -> /api/project-stars -> 星图显示
```

### 当前规则与注意事项

- `visitsToday` 是“今日唯一访客”统计，不是每刷新一次就加一。
- 如果项目已经加脚本但星尘仍为 0，优先检查：
  - GitHub Pages 是否已部署最新版。
  - 真实项目页面源代码中是否能搜到 `project-visit-tracker`。
  - `window.ZHIWU_PROJECT_ID` 是否和 `assets/project-stars.json` 里的 id 完全一致。
  - 浏览器 Console 是否还有 CORS 报错。
- 测试项目访问时可以在 URL 后加缓存参数，例如：

```text
https://ningyan1228.github.io/echo-shelf/?v=6
```

### 新思路：登录功能不要做成访客系统，做成站长入口

- 用户提出想做登录功能，但登录后暂时没想好普通访客能做什么。
- 当前判断：不建议做“给访客用的登录系统”，因为个人博客、项目入口和笔记内容主要都是站长自己的内容，访客登录的价值不高，反而会让网站变重。
- 更适合的方向是做一个只给自己用的“站长入口 / 止鹜后台 / 控制台”。
- 推荐形态：

```text
公开博客 = 给别人看的数字花园
登录后台 = 给自己用的控制室
```

- 后台第一版可以考虑放在：

```text
https://gjsx.uno/admin/
```

- 不需要在首页明显放“登录”，可以做成很克制、隐蔽的站长入口。
- 第一版登录方式不需要复杂账号系统，可以使用服务器 `.env` 中的管理密码，登录后发短期 token。
- 登录后的实际用途可以是：
  - 星图后台：编辑项目名称、链接、分类、颜色、是否显示、排序。
  - 项目健康面板：查看哪些代理在线、哪些项目最近被访问、哪些接口挂了。
  - 快速发布入口：填写“今日更新”，自动显示到首页或资料库。
  - 私密笔记：保存服务器部署记录、Cookie 配置提醒、密钥说明、未来计划。
  - 访问星尘详情：公开页面只显示“几粒星尘”，登录后查看项目访问趋势和来源。

### 下一步建议

- 继续打开所有真实项目页面，确认每个项目的 `visitsToday` 都能增加。
- 如果某个项目仍然不增加，单独检查该项目的 `PROJECT_ID` 和页面源代码。
- 后续如果要做登录功能，优先实现 `admin` 站长控制台，而不是普通用户登录系统。
### 2026-07-01 新增：站长登录控制台第一版

- 已新增静态后台入口：`admin/index.html`。
- 已新增后台样式：`assets/admin.css`。
- 已新增后台脚本：`assets/admin.js`。
- 已新增服务器接入说明：`admin/SERVER_ADMIN_SETUP.md`。
- 后台访问地址规划为：`https://gjsx.uno/admin/`。
- 当前后台不是普通访客系统，而是“站长控制台”：
  - 登录前显示站长密码输入框。
  - 登录后显示今日星尘、在线代理、项目星图状态。
  - 后续预留星图编辑、今日更新、私密笔记、访问详情四个控制区。
- 前端不会保存明文密码，登录请求会发到 `https://api.gjsx.uno/api/admin/login`。
- 真正的密码校验必须部署在腾讯云服务器 `~/projects/blog-proxy/server.js` 中，并从服务器 `.env` 读取 `ADMIN_PASSWORD`。
- 服务器还需要新增：
  - `POST /api/admin/login`
  - `GET /api/admin/me`
  - `POST /api/admin/logout`
- CORS 需要允许 `Authorization` 请求头：

```js
res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Analytics-Token");
```

- GitHub Pages 需要上传的新文件：
  - `admin/index.html`
  - `admin/SERVER_ADMIN_SETUP.md`
  - `assets/admin.css`
  - `assets/admin.js`

## 2026-07-01 新增：控制台文章发布第一版

### 已完成
- 在 `admin/index.html` 新增“文章发布 / Article Publisher”模块。
- 在 `assets/admin.css` 增加发布表单、Markdown 编辑框、预览区和后台文章列表样式。
- 在 `assets/admin.js` 增加文章发布逻辑：
  - 标题、摘要、分类、标签、阅读分钟数表单。
  - slug 自动生成；中文标题会退回到 `post-年月日时分` 格式。
  - 支持上传 `.md` / `.markdown` 文件并自动填入正文。
  - 支持 Markdown 预览。
  - 登录后读取 `GET https://api.gjsx.uno/api/admin/articles`。
  - 点击发布时调用 `POST https://api.gjsx.uno/api/admin/articles/publish`。
- 更新 `admin/SERVER_ADMIN_SETUP.md`，补充服务器端文章发布接口、GitHub Token 环境变量和重建命令。

### 文章发布链路
```text
/admin/ 写文章或上传 .md
  -> api.gjsx.uno 后台接口校验站长 token
  -> 服务器读取 .env 里的 GitHub Token
  -> 写入 GitHub 仓库：posts/新文章.md
  -> 更新 GitHub 仓库：articles.json
  -> GitHub Pages 重新部署
  -> /articles/ 自动多一篇文章
```

### 服务器仍需手动完成
- 在 `~/projects/blog-proxy/.env` 增加：
```env
GITHUB_TOKEN=你的 fine-grained GitHub token
GITHUB_OWNER=ningyan1228
GITHUB_REPO=zhiwu-blog
GITHUB_BRANCH=main
```
- GitHub Token 权限只给 `ningyan1228/zhiwu-blog`：
```text
Contents: Read and write
Metadata: Read
```
- 按 `admin/SERVER_ADMIN_SETUP.md` 第 8-11 节，把 GitHub helper 和文章路由粘到 `~/projects/blog-proxy/server.js`。
- 重建服务器容器：
```bash
cd ~/projects/blog-proxy
docker compose up -d --build
```

### GitHub Pages 需要上传
```text
admin/index.html
admin/SERVER_ADMIN_SETUP.md
assets/admin.css
assets/admin.js
progress.md
```