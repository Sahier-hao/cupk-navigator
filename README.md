# 石光驿站

> 中石克校园一站式资源站

面向中国石油大学（北京）克拉玛依校区学生的校园资源导航站。整合 CUPK 常用校内入口、图书馆数据库、教务系统、校园生活指南，以及通用学习网站、工具软件、视频课程和资料检索平台。包含失物招领、互助论坛、活动日历、二手交易、共享资源和校园掠影等社区模块，数据通过浏览器 localStorage 模拟存储。

纯静态前端项目，可直接部署到 GitHub Pages。

## 在线预览

```text
https://<your-github-username>.github.io/<repository-name>/
```

## 页面

```text
index.html       首页（轮播图 + 十宫格快捷入口 + 校园动态 + 关于我们）
cupk.html        常用网站（CUPK 官网、教务、图书馆、数据库，搜索+分类导航）
campus.html      校园生活指南（食堂、宿舍、校园卡、交通、费用，配场景插图）
websites.html    学习资源库（150+ 资源，三层筛选 + 搜索 + 收藏）
tools.html       学习工具箱（绩点计算器 + 番茄钟 + 倒计时 + 体测计算器）
share.html       共享学习资源（上传/浏览笔记、试卷、课件，分类筛选）
lostfound.html   失物招领（寻物/招领发布、分类筛选、密码标记认领）
forum.html       互助论坛（发帖/回帖、学习互助/二手交易/校园活动分类）
events.html      活动日历（发布校园活动、日历视图 + 列表、分类筛选）
gallery.html     校园掠影（瀑布流相册、上传/点赞/灯箱查看）
secondhand.html  二手交易（发布商品、分类筛选、联系卖家、标记售出）
```

## 功能

- 首页轮播图展示校园场景，滚动分层视差效果
- 纯 CSS hover 下拉导航菜单，移动端折叠展开
- 动态导航栏和页脚（common.js 统一生成，一处修改全局生效）
- 首页十宫格快捷入口覆盖全站功能，每张卡片配有 AI 生成的专属配图
- 卡片 hover 渐变光晕扩散效果（色彩匹配各主题色）
- CUPK 校园入口搜索与分类侧边栏导航
- 学习资源库三层筛选：使用场景、资源类型、资源形式
- 关键词搜索资源，实时过滤
- 收藏资源，数据保存在 localStorage
- 最近访问记录
- 绩点计算器（动态增删课程，成绩→绩点，加权平均，历史记录）
- 体测计算器（按性别/年级计算各项评分与总分等级）
- 番茄钟（25/15/45 分钟可调，SVG 圆环进度，浏览器通知）
- 倒计时（四六级、暑假、开学，当天触发脉冲心跳动画）
- 失物招领（寻物/招领发布，分类/状态筛选，管理密码标记认领）
- 互助论坛（发帖/回帖，分类浏览，关键词搜索，管理密码删除）
- 活动日历（活动发布，日历组件 + 列表双视图，年月翻页）
- 校园掠影（瀑布流相册布局，上传/点赞/灯箱查看，删除密码保护）
- 二手交易（发布商品/价格/联系方式，分类筛选，标记售出，密码管理）
- 共享学习资源（笔记/试卷/课件上传，类型筛选，模拟文件选择）
- 个人中心（点击导航栏昵称弹出，聚合帖子/招领/活动/收藏四个标签页）
- 用户昵称系统（轻量，localStorage 存储，无需注册登录）
- 首页最新动态聚合（失物招领 + 论坛最新内容，左侧色条区分类型）
- 空状态趣味随机文案（失物招领/论坛/活动/二手各 4 句随机切换）
- 跨页面音乐播放器（右下角浮动胶囊控制条）
- 暗色/亮色主题切换（color-scheme 适配原生控件，meta theme-color 浏览器顶栏配色）
- 校徽入场转场动画（首页加载时全屏遮罩 + 缩放弹入）
- 页面滚动渐入动画（IntersectionObserver + 递增延迟）
- Float Blob 背景装饰 + Hero 粒子 Canvas 特效
- 响应式布局（四断点覆盖桌面/平板/手机）

## 技术栈

- HTML + CSS + JavaScript
- localStorage（模拟后端数据持久化）
- GitHub Pages（自动部署）
- AI 生成配图（Agnes Image API）

项目没有构建步骤，也不依赖后端服务或 npm 包。

## 本地运行

```bash
python -m http.server 8000
```

访问 `http://localhost:8000/`

> 导航栏和页脚由 common.js 动态生成，需通过 HTTP 服务器访问（不支持 file:// 协议）。

## 目录结构

```text
├── index.html              首页
├── cupk.html               常用网站
├── campus.html             校园生活指南
├── websites.html           学习资源库
├── tools.html              学习工具箱
├── share.html              共享学习资源
├── lostfound.html          失物招领
├── forum.html              互助论坛
├── events.html             活动日历
├── gallery.html            校园掠影
├── secondhand.html         二手交易
├── css/
│   ├── common.css          公共样式（变量、导航、布局、按钮、卡片、表单、暗色模式、音乐播放器）
│   ├── index.css           首页样式（Hero 轮播、十宫格光晕、校园动态、关于我们）
│   ├── pages.css           子页面样式（Hero Banner、筛选卡片、番茄钟、GPA、画廊瀑布流）
│   └── crud.css            CRUD 共享样式（侧边栏、弹窗、卡片、暗色模式）
├── javascript/
│   ├── data.js             资源数据（150+ 条）
│   ├── storage.js          localStorage 封装
│   ├── common.js           导航/页脚生成、主题切换、校徽转场、时钟、用户系统、个人中心
│   ├── index.js            首页轮播、搜索、收藏面板、最新动态、Hero 视差
│   ├── resources.js        资源库三层筛选与渲染
│   ├── cupk.js             CUPK 页面搜索过滤与侧边栏高亮
│   ├── tools.js            绩点计算器、番茄钟、倒计时脉冲、体测计算器
│   ├── lostfound.js        失物招领发布/筛选/认领
│   ├── forum.js            论坛发帖/回帖/分类/搜索
│   ├── events.js           活动日历发布/日历组件/日期筛选
│   ├── share.js            共享资源上传/筛选/删除
│   ├── gallery.js          校园相册上传/点赞/灯箱
│   ├── secondhand.js       二手交易发布/筛选/联系卖家/标记售出
│   ├── player.js           跨页面音乐播放器
│   └── effects.js          粒子特效、浮动 Blob、数字滚动计数器
├── images/
│   ├── card-*.jpg          首页十宫格卡片配图（10 张 AI 生成）
│   ├── hero-*.jpg          各页面 Hero 背景图（9 张）
│   ├── empty-*.jpg         空状态插图（4 张）
│   ├── illust-*.jpg        校园生活场景插图（4 张）
│   ├── cupk*.jpg/png       校园风光照片
│   └── icons.svg           SVG sprite（23 个图标）
├── music/                  背景音乐文件
└── .github/workflows/      GitHub Pages 自动部署
```

## localStorage 数据表

| Key | 用途 | 上限 |
| --- | --- | --- |
| `studyhub:favorites` | 收藏资源 ID 数组 | 30 条 |
| `studyhub:recent` | 最近访问记录 | 8 条 |
| `studyhub:theme` | 主题偏好（light / dark） | — |
| `shiguang_user` | 用户昵称 | — |
| `shiguang_player` | 音乐播放器状态 | — |
| `shiguang_lostfound` | 失物招领数据 | 200 条，30 天过期 |
| `shiguang_forum` | 论坛帖子数据 | 200 条 |
| `shiguang_events` | 校园活动数据 | 200 条 |
| `shiguang_secondhand` | 二手交易数据 | 200 条 |
| `shiguang_gallery` | 校园相册数据 | 100 条 |
| `shiguang_share` | 共享资源数据 | 200 条 |
| `shiguang_gpa_history` | GPA 计算历史 | 20 条 |

## 设计规范

- **配色**：暖白 (`#faf8f3`) + 珊瑚橙 (`#d4856a`) + 学习蓝 (`#5b9bd5`)
- **字体**：Noto Serif SC（标题）+ Noto Sans SC（正文）+ JetBrains Mono（代码/数字）
- **暗色模式**：`[data-theme="dark"]` 驱动 CSS 变量覆盖，`color-scheme: dark` 适配原生控件
- **无障碍**：skip-to-content 跳转、`:focus-visible` 焦点环、`prefers-reduced-motion` 尊重
- **性能**：`transition` 明确属性列表（非 `all`）、`touch-action: manipulation` 消除双击延迟、`loading="lazy"` 延迟加载图片

## 说明

本站仅整理公开入口和常用学习资源。部分数据库、教务系统、校园服务可能需要校园网、统一身份认证或机构授权。失物招领、论坛、活动、二手交易等社区数据存储在浏览器 localStorage 中，清除浏览器数据会导致记录丢失。
