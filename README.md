# CUPK 学习资源导航站

> CUPK Navigator

面向中国石油大学（北京）克拉玛依校区学生的学习资源与校园入口导航站。

项目整理了 CUPK 常用校内入口、图书馆数据库、教务与研究生系统、学院网站，以及通用学习网站、工具软件、视频课程和资料检索平台。网站为纯静态前端项目，可直接部署到 GitHub Pages。

## 在线预览

如果已开启 GitHub Pages，可通过仓库的 Pages 地址访问：

```text
https://<your-github-username>.github.io/<repository-name>/
```

## 功能

- CUPK 校园入口导航
- CUPK 页面本页搜索
- 学习资源库搜索与筛选
- 按用途筛选资源：课程、论文、编程、工具、AI、设计、英语、考试、博主推荐
- 按形式筛选资源：网站、App、电脑软件、视频链接、博主/账号
- 收藏资源，数据保存在浏览器 localStorage
- 最近访问记录，数据保存在浏览器 localStorage
- 响应式布局，适配桌面端和移动端

## 页面

```text
index.html       首页
websites.html    学习资源库
cupk.html        CUPK 校园入口
team.html        小组介绍
```

## 技术栈

- HTML
- CSS
- JavaScript
- localStorage
- GitHub Pages

项目没有构建步骤，也不依赖后端服务。

## 本地运行

直接打开 `index.html` 即可。

也可以用任意静态服务器预览，例如：

```bash
python -m http.server 8000
```

然后访问：

```text
http://localhost:8000/
```

## 部署到 GitHub Pages

1. 将项目推送到 GitHub 仓库。
2. 打开仓库 `Settings`。
3. 进入 `Pages`。
4. 在 `Build and deployment` 中选择：
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
5. 保存后等待 GitHub Pages 构建完成。

## 资源维护

学习资源数据维护在：

```text
javascript/data.js
```

新增资源时，向 `StudyResources` 数组添加一项：

```js
{
    id: "example",
    title: "Example Resource",
    type: "学习工具",
    format: "网站",
    formatKey: "website",
    platform: "Example",
    category: "tool",
    url: "https://example.com/",
    keywords: ["example", "tool"],
    description: "资源简介。",
    usage: "适合什么场景使用。"
}
```

如果新增资源需要图标，请将图标放到：

```text
images/icons/example.png
```

图标文件名应与资源 `id` 一致。

## 目录结构

```text
campus-study-nav/
├─ index.html
├─ websites.html
├─ cupk.html
├─ team.html
├─ css/
│  ├─ common.css
│  ├─ index.css
│  └─ pages.css
├─ javascript/
│  ├─ common.js
│  ├─ cupk.js
│  ├─ data.js
│  ├─ index.js
│  ├─ resources.js
│  └─ storage.js
└─ images/
   └─ icons/
```

## 说明

本站仅整理公开入口和常用学习资源。部分数据库、教务系统、校园服务可能需要校园网、统一身份认证或机构授权。
