# 石光驿站

> 中石克校园一站式资源站

面向中国石油大学（北京）克拉玛依校区学生的校园资源导航站。整合了 CUPK 常用校内入口、图书馆数据库、教务系统、校园生活指南，以及通用学习网站、工具软件、视频课程和资料检索平台。纯静态前端项目，可直接部署到 GitHub Pages。

## 在线预览

如果已开启 GitHub Pages，可通过仓库的 Pages 地址访问：

```text
https://<your-github-username>.github.io/<repository-name>/
```

## 页面

```text
index.html       首页（轮播图 + 搜索 + 九宫格校园入口 + 收藏）
cupk.html        CUPK 校园入口（官网、教务、图书馆、学院、数据库）
campus.html      校园生活指南（图文混排：食堂、宿舍、运动、出行）
websites.html    学习资源库（97个资源，三层筛选 + 搜索 + 收藏）
tools.html       学习工具箱（绩点计算器 + 推荐工具）
media.html       视听记录（HTML5 视频 + 音频）
team.html        小组介绍
```

## 功能

- 首页轮播图展示校园场景
- JS 下拉菜单二级导航
- CUPK 校园入口搜索与分类导航
- 学习资源库三层筛选：使用场景、资源类型、资源形式
- 关键词搜索资源
- 收藏资源，数据保存在 localStorage
- 最近访问记录
- 绩点计算器（动态增删课程，成绩转绩点，加权平均）
- HTML5 视频和音频播放
- 图文混排（3种布局变体）
- 暗色/亮色主题切换
- 响应式布局，适配桌面端和移动端
- 返回顶部按钮

## 技术栈

- HTML
- CSS
- JavaScript
- localStorage
- GitHub Pages

项目没有构建步骤，也不依赖后端服务。

## 本地运行

直接打开 `index.html` 即可。

也可以用任意静态服务器预览：

```bash
python -m http.server 8000
```

然后访问 `http://localhost:8000/`

## 目录结构

```text
├── index.html          首页
├── cupk.html           CUPK 校园入口
├── campus.html         校园生活指南
├── websites.html       学习资源库
├── tools.html          学习工具箱
├── media.html          视听记录
├── team.html           小组介绍
├── css/
│   ├── common.css      公共样式（导航、暗色模式、通用组件）
│   ├── index.css       首页样式（轮播图、卡片、搜索）
│   └── pages.css       子页面共享样式
├── javascript/
│   ├── data.js         资源数据（97条）
│   ├── storage.js      localStorage 封装
│   ├── common.js       导航折叠、下拉菜单、返回顶部、主题切换
│   ├── index.js        首页搜索、收藏面板、轮播图
│   ├── resources.js    资源库筛选渲染
│   ├── cupk.js         CUPK 页面搜索过滤
│   └── tools.js        绩点计算器、工具推荐
├── images/
│   └── icons/          资源图标
├── video/              视频文件
└── music/              音频文件
```

## 说明

本站仅整理公开入口和常用学习资源。部分数据库、教务系统、校园服务可能需要校园网、统一身份认证或机构授权。
