# 止鹜个人博客进展记录

更新时间：2026-07-04

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
  - 服务器接口域名仍使用 `gjsx.uno` 的子域名；博客主站已在 2026-07-04 切换到 `101921.xyz`
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
<script src="https://101921.xyz/assets/project-visit-tracker.js"></script>
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
https://101921.xyz/admin/
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
- 后台访问地址规划为：`https://101921.xyz/admin/`。
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
### 2026-07-01 新增：首页隐藏站长入口
- 已在 `assets/main.js` 新增 `initAdminEasterEgg()`。
- 规则：只在首页 `body.home-page` 生效，连续点击左上角品牌/logo 5 次，会跳转到 `admin/`。
- 首页不显示“登录 / 后台 / 控制台”等显性入口，公开访问者不容易注意到。
- 已更新 `index.html` 中 `assets/main.js` 的缓存版本为 `v=20260701-admin-easter-egg`。
- GitHub Pages 需要上传：
```text
index.html
assets/main.js
progress.md
```
## 2026-07-02 新增：控制台文章编辑与图片仓库第一版

### 已完成
- `admin/index.html` 的“文章发布”模块升级为轻量 CMS：
  - 新增文章状态：`已发布 / 草稿`。
  - 新增“退出编辑”按钮。
  - 新增“图片仓库”上传区。
- `assets/admin.js` 新增：
  - 文章列表“查看 / 编辑”操作。
  - 点击编辑后读取 `GET /api/admin/articles/detail?slug=...`，回填标题、摘要、分类、标签、阅读时间、状态和 Markdown 正文。
  - 保存时调用 `POST /api/admin/articles/save`，用于新建或保存修订。
  - 图片上传前会在浏览器端压缩为 WebP，最大宽度约 1600px。
  - 上传图片调用 `POST /api/admin/articles/upload-image`，成功后自动插入 Markdown：`![图片名](/assets/articles/slug/图片名.webp)`。
- `assets/admin.css` 新增图片仓库、编辑按钮、状态选择和后台预览图片样式。
- `assets/articles.js` 新增草稿过滤：公开文章列表和详情页只展示 `status !== "draft"` 的文章。
- `assets/styles.css` 新增文章正文图片尺寸约束，避免海报图撑爆页面。
- `admin/SERVER_ADMIN_SETUP.md` 新增第 12 节，记录服务器端需要补充的文章详情、保存、图片上传接口。

### 当前约定
- 草稿只是在公开列表和详情页隐藏，不是严格私密，因为 GitHub 仓库仍是公开的。
- 编辑文章时暂时锁定 slug，不做路径重命名，避免旧 Markdown 文件残留。
- 图片会保存到 GitHub 仓库：`assets/articles/<slug>/<filename>.webp`。

### GitHub Pages 需要上传
```text
admin/index.html
admin/SERVER_ADMIN_SETUP.md
assets/admin.css
assets/admin.js
assets/articles.js
assets/styles.css
articles/index.html
articles/post.html
progress.md
```

### 服务器仍需手动完成
- 在 `~/projects/blog-proxy/server.js` 按 `admin/SERVER_ADMIN_SETUP.md` 第 12 节补充 helper 和 3 个接口：
```text
GET  /api/admin/articles/detail?slug=...
POST /api/admin/articles/save
POST /api/admin/articles/upload-image
```
- 保存后重建：
```bash
cd ~/projects/blog-proxy
docker compose up -d --build
```
## 2026-07-02 新增：教师教案生成项目入口

- 已在 `projects/index.html` 的项目页补充“教师教案生成”项目卡片。
- 项目地址：`https://ningyan1228.github.io/lesson-plan-generator/`
- 项目说明：上传学校模板和网上教案资源，按年级、学科、课题生成教学设计，并支持导出 Word。
- 当前只补入项目页入口，暂未加入首页星图；如果后续要统计星尘，需要再补 `lesson-plan-generator` 的星图配置和项目访问上报脚本。
## 2026-07-02 新增：教师教案生成入口密码保护

- 已把 `projects/index.html` 中“教师教案生成”的入口改为受保护入口，点击后先弹出密码验证。
- 已复用博客已有的 `/api/private-link/unlock` 服务器校验逻辑，密码不写入 GitHub 前端文件。
- 服务器还需要在 `~/projects/blog-proxy/server.js` 的 `privateLinks` 中增加 `lesson-plan-generator` 配置，并在 `.env` 中设置对应密码。
## 2026-07-02 新增：小红书情绪文案生成器入口密码保护

- 已把 `projects/index.html` 中“小红书情绪文案生成器”的入口改为受保护入口，点击后先弹出密码验证。
- 复用博客已有的 `/api/private-link/unlock` 服务器校验逻辑，密码不写入 GitHub 前端文件。
- 服务器还需要在 `~/projects/blog-proxy/server.js` 的 `privateLinks` 中增加 `xiaohongshu-copy` 配置，并在 `.env` 中设置对应密码。
## 2026-07-04 计划：GitHub Pages 主域名切换到 101921.xyz

- 已将仓库根目录 `CNAME` 从 `gjsx.uno` 改为 `101921.xyz`，用于让 GitHub Pages 绑定新的根域名。
- 现有服务器 API 域名继续使用 `api.gjsx.uno`，前端 `assets/main.js`、`assets/admin.js`、`assets/project-visit-tracker.js` 暂不改动。
- 切换后服务器 `blog-proxy` 的 CORS 需要允许 `https://101921.xyz`，否则管理后台、星图统计、私密入口解锁等接口可能被浏览器拦截。
- DNS 需要在域名服务商处为 `101921.xyz` 配置 GitHub Pages 的 A 记录；GitHub Pages 设置里 Custom domain 填 `101921.xyz` 并等待 HTTPS 证书签发。
- 如果还想保留 `gjsx.uno` 作为旧入口，需要额外做 URL 转发或服务器 301 跳转到 `https://101921.xyz/`。

## 2026-07-04 新增：主域名已切换到 101921.xyz

### 已完成
- GitHub Pages 的 Custom domain 已成功绑定为 `101921.xyz`。
- `101921.xyz` 的 DNS 检查已通过，根域名 A 记录指向 GitHub Pages：
```text
@  A  185.199.108.153
@  A  185.199.109.153
@  A  185.199.110.153
@  A  185.199.111.153
```
- `www.101921.xyz` 已配置为：
```text
www  CNAME  ningyan1228.github.io
```
- 排查过程中发现 `www` 记录值末尾带 `.` 时 GitHub / DNS 平台检测容易异常；重新保存为不带末尾点的 `ningyan1228.github.io` 后检查通过。
- 当前主站入口改为：
```text
http://101921.xyz/
http://101921.xyz/admin/
```
- GitHub Pages 的 HTTPS 证书仍在签发等待中，`Enforce HTTPS` 暂时不可勾选；等证书完成后再勾选。

### gjsx.uno 当前状态
- `gjsx.uno` / `www.gjsx.uno` 已不再被当前博客 GitHub Pages 站点认领，所以访问会出现 GitHub Pages 404。
- 这表示 `gjsx.uno` 的根域名和 `www.gjsx.uno` 可以给其他网站使用。
- 不要删除这些后端接口域名，它们仍指向腾讯云服务器 `43.128.149.75`：
```text
api.gjsx.uno
xhs-copy-api.gjsx.uno
lesson-plan-api.gjsx.uno
study-resource-api.gjsx.uno
echo-shelf-api.gjsx.uno
zaozixi-api.gjsx.uno
weread-api.gjsx.uno
```
- 如果要把 `gjsx.uno` 分配给新网站，只改 `@` 和 `www` 记录即可，保留所有 `*-api` 和 `api` 子域名。

### 后续待办
- 等 GitHub Pages HTTPS 证书签发完成后，在 Pages 设置中勾选 `Enforce HTTPS`。
- 如果博客后台或私密入口请求被 CORS 拦截，需要在服务器 `~/projects/blog-proxy/server.js` 的 `allowedOrigins` 中确认包含：
```js
"http://101921.xyz",
"https://101921.xyz",
"http://www.101921.xyz",
"https://www.101921.xyz",
```
- 修改服务器配置后重建：
```bash
cd ~/projects/blog-proxy
docker compose up -d --build
```

## 2026-07-04 修复：新域名访问后台和密码入口的 CORS

- 现象：从 `http://101921.xyz` 打开博客后，后台登录和所有“密码查看”入口都提示 `Failed to fetch` / `暂时无法连接服务器`。
- 原因：前端仍请求 `https://api.gjsx.uno`，但服务器 `~/projects/blog-proxy/server.js` 的 `allowedOrigins` 当时只允许旧主站、旧 `www` 站点和 `ningyan1228.github.io`。
- 已在服务器 `allowedOrigins` 中补充：
```js
"http://101921.xyz",
"https://101921.xyz",
"http://www.101921.xyz",
"https://www.101921.xyz",
```
- 已在服务器备份原文件：
```text
~/projects/blog-proxy/server.js.bak-20260704-cors
```
- 已重建并启动 `blog-proxy`：
```bash
cd ~/projects/blog-proxy
docker compose up -d --build
```
- 已验证 CORS 预检请求从 `Origin: http://101921.xyz` 访问 `https://api.gjsx.uno/api/private-link/unlock` 返回：
```text
HTTP/2 204
access-control-allow-origin: http://101921.xyz
```
- 修复后需要在浏览器刷新 `http://101921.xyz/admin/` 和项目页，再重新尝试登录或密码解锁。

## 2026-07-04 完成：站内链接统一与后台发布链路测试

### 站内链接统一
- 已把文档中仍指向旧博客页面的后台入口、文章返回链接等改为：
```text
https://101921.xyz/admin/
https://101921.xyz/articles/post.html?slug=...
```
- 已把项目访问上报脚本示例从旧主域名改为：
```html
<script src="https://101921.xyz/assets/project-visit-tracker.js"></script>
```
- 保留以下服务器接口域名不变：
```text
https://api.gjsx.uno
https://study-resource-api.gjsx.uno
https://weread-api.gjsx.uno
https://zaozixi-api.gjsx.uno
https://echo-shelf-api.gjsx.uno
```

### 后台 CMS 路由补齐
- 发现线上 `~/projects/blog-proxy/server.js` 只有旧版文章发布接口 `/api/admin/articles/publish`，而新版后台实际调用：
```text
GET  /api/admin/articles/detail?slug=...
POST /api/admin/articles/save
POST /api/admin/articles/upload-image
```
- 已在服务器补齐上述 3 个接口，并保留旧 `/api/admin/articles/publish` 兼容接口。
- 已将服务器 `/api/status` 和文章接口返回的 `articleUrl` 更新为 `https://101921.xyz/...`。
- 已在服务器备份旧文件：
```text
~/projects/blog-proxy/server.js.bak-20260704-cms-routes
```
- 已重建并启动：
```bash
cd ~/projects/blog-proxy
docker compose up -d --build
```

### 完整链路测试结果
- 已用测试 slug 跑通后台发布链路：
```text
codex-admin-chain-test-20260704
```
- 测试结果：
```text
后台登录：成功
Session 校验：成功
图片上传：成功
文章保存：成功
文章详情读取：成功
公开 articles.json：成功
公开 posts/*.md：成功
公开图片文件：成功
文章页 shell：成功
```
- 2026-07-04 用户确认不需要保留测试内容，已从 GitHub 仓库和公开站点清理：
```text
articles.json 中的测试条目
posts/codex-admin-chain-test-20260704.md
assets/articles/codex-admin-chain-test-20260704/chain-test.webp
```
- 清理后已验证：公开 `articles.json` 不再包含测试 slug，测试 Markdown 返回 `404`。

## 2026-07-04 完成：首页定位与写作系统增强

### 首页定位
- 已把首页第一屏定位收束为：
```text
止鹜个人博客：我的阅读、学习、创作与工具实验室。
```
- 第一屏新增三个清晰主入口：
```text
读文章 -> /articles/
看项目 -> /projects/
进知识库 -> /knowledge/
```
- 已更新首页样式和移动端布局兜底，避免三个入口在窄屏拥挤。

### 写作系统增强
- 后台文章表单新增：
```text
系列 / 专题
封面图 URL
置顶文章
```
- 后台文章列表新增筛选和搜索：
```text
按状态筛选
按系列筛选
按标签筛选
按标题 / 摘要 / slug 搜索
```
- 后台文章列表新增删除入口；服务器已新增：
```text
POST /api/admin/articles/delete
```
- 删除逻辑会同步清理：
```text
articles.json 中的文章条目
posts/{slug}.md
assets/articles/{slug}/ 下的文章图片
```
- 公开文章列表新增系列、标签、关键词筛选；文章列表和详情页支持封面图、置顶标记和系列展示。
- 已在服务器备份旧文件：
```text
~/projects/blog-proxy/server.js.bak-20260704-writing-system
```
- 已重建并启动 `blog-proxy`，并用不存在的测试 slug 验证删除接口返回 `404`，未改动现有文章内容。

## 2026-07-04 新增：Codex 复用技能 GitHub API Server Publisher

- 已创建本机 Codex skill：
```text
C:\Users\zhiwu\.codex\skills\github-api-server-publisher
```
- 用途：其他 Codex 窗口可以通过 `$github-api-server-publisher`，把指定本地文件经由服务器临时中转，再用服务器 `.env` 中的 `GITHUB_TOKEN` 直接提交到对应 GitHub 仓库。
- 技能内置脚本：
```text
scripts/publish_via_server.ps1
```
- 默认服务器配置：
```text
Server: ubuntu@43.128.149.75
SSH key: .ssh/gjsx_server_codex
Token env: /home/ubuntu/projects/blog-proxy/.env
Docker publish runtime: node:20-alpine
```
- 安全边界：
```text
只发布明确传入的文件列表
拒绝 .env / .ssh / token / cookie / credential / secret 等疑似敏感路径
默认清理本地和服务器临时文件
支持 -DryRun 先检查文件打包，不连接服务器、不提交 GitHub
```
- 已验证：
```text
PowerShell 语法解析通过
DryRun 打包 progress.md 成功
真实发布 progress.md 成功，提交：83b914b53c518276aad6adb0d9259f8ac92cd0a4
```
- 实战测试中发现并修复：PowerShell 5 默认写出的 UTF-8 JSON 带 BOM，会导致服务器 Node 脚本 `JSON.parse` 失败；现已改为无 BOM UTF-8 写入 `manifest.json` 和 `publish.js`。
- 说明：`skill-creator` 的 `quick_validate.py` 在当前 Python 环境缺少 `PyYAML`，因此官方校验脚本未能运行；已人工检查 `SKILL.md` frontmatter、`agents/openai.yaml` 和脚本结构。
