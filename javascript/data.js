/* ============================================================
 * 文件名: data.js
 * 说明: 石光驿站 — 学习资源集中数据源，挂载为 window.StudyResources
 *
 * 每条资源包含以下字段:
 *   id          - 唯一标识符（用作 URL 哈希和图标文件名）
 *   title       - 资源展示名称
 *   type        - 资源类型标签（如"在线课程""编程学习"，展示用）
 *   category    - 筛选分类标识（course / search / code / tool / ai / english / exam / design / creator）
 *   url         - 资源链接地址
 *   keywords    - 搜索关键词数组（用于首页和资源页搜索框匹配）
 *   description - 资源的简短介绍
 *   usage       - 使用建议或适用场景
 *   format      - 资源形式文字说明（如"网站""视频链接""电脑软件"）
 *   formatKey   - 资源形式标识（website / video / software / app / creator）
 *   platform    - 所属平台或品牌名称
 *   icon        - （可选）自定义图标文件路径
 *
 * 分类概览:
 *   course  - 在线课程、教学平台与视频课程
 *   search  - 学术检索、文献数据库与科研工具
 *   code    - 编程学习、刷题平台与开发工具
 *   tool    - 笔记、协作、办公、效率等实用工具
 *   ai      - AI 对话、搜索与创作平台
 *   english - 英语学习词典、听力与阅读资源
 *   exam    - 考试考证官方入口与备考资源
 *   design  - 设计素材、图标、图片与配色工具
 *   creator - 博主、UP 主与内容创作者推荐
 *
 * 更多说明参见 CLAUDE.md 或咨询项目维护者。
 * ============================================================ */

window.StudyResources = [
    // 国家高等教育智慧教育平台 — 国家级权威课程平台
    // 汇聚各高校优质慕课与教材资源，适合按专业和课程查找在线课程
    // 课程预习、系统补课、查找教材配套资源时的首选平台
    {
        id: "smartedu",
        title: "国家高等教育智慧教育平台",
        type: "在线课程",
        category: "course",
        url: "https://higher.smartedu.cn/",
        keywords: ["国家平台", "课程", "教材", "慕课", "智慧教育"],
        description: "国家级高等教育课程与资源平台，适合按专业、课程和教材查找权威学习资源。",
        usage: "适合课程预习、系统补课、查找教材配套资源。"
    },
    // 中国大学 MOOC — 国内最大的中文慕课平台
    // 由高校教师开设的系统课程，覆盖各学科门类
    // 适合期末复习、预习补漏和课外拓展学习
    {
        id: "icourse163",
        title: "中国大学 MOOC",
        type: "在线课程",
        category: "course",
        url: "https://www.icourse163.org/",
        keywords: ["mooc", "中国大学", "公开课", "视频课程", "期末复习"],
        description: "高校课程资源丰富，适合按课程名搜索视频课，用于预习和期末补漏。",
        usage: "先看课程目录，再选择与本学期教学内容对应的章节。"
    },
    // 学堂在线 — 清华大学发起的综合性在线课程平台
    // 汇聚国内外高校公开课和通识课程资源
    // 适合补充课堂上未深入展开的知识点
    {
        id: "xuetangx",
        title: "学堂在线",
        type: "在线课程",
        category: "course",
        url: "https://www.xuetangx.com/",
        keywords: ["学堂在线", "公开课", "清华", "课程", "视频"],
        description: "综合性在线课程平台，适合寻找高校公开课和通识课程。",
        usage: "适合补充课堂没有展开的知识点。"
    },
    // Coursera — 全球知名的国际在线课程平台
    // 提供世界顶尖高校的英文课程和微证书项目
    // 适合有英文学习需求的同学，建议选择带字幕的课程
    {
        id: "coursera",
        title: "Coursera",
        type: "在线课程",
        category: "course",
        url: "https://www.coursera.org/",
        keywords: ["coursera", "英文课程", "国际课程", "证书"],
        description: "国际在线课程平台，适合有英文学习需求或想了解国际课程体系的同学。",
        usage: "建议选择带字幕课程，配合笔记整理关键词。"
    },

    // ==================== 资料检索与学术工具 ====================

    // 百度学术 — 中文学术搜索引擎
    // 适合课程论文前期的文献调研，快速了解某主题的研究概况
    // 检索后记录题名、作者和来源，方便资料溯源
    {
        id: "baidu-scholar",
        title: "百度学术",
        type: "资料检索",
        category: "search",
        url: "https://xueshu.baidu.com/",
        keywords: ["百度学术", "论文", "文献", "检索", "资料"],
        description: "适合课程论文前期检索，可以快速了解某个主题有哪些论文和关键词。",
        usage: "检索后记录题名、作者、年份和来源，方便资料来源记录。"
    },
    // 中国知网（CNKI）— 国内使用最广泛的学术文献数据库
    // 收录期刊论文、学位论文、会议论文等中文学术资源
    // 校园网环境下可直接访问，下载权限以学校订购为准
    {
        id: "cnki",
        title: "中国知网",
        type: "资料检索",
        category: "search",
        url: "https://www.cnki.net/",
        keywords: ["知网", "cnki", "论文", "期刊", "文献"],
        description: "常用中文学术资源平台，适合查找期刊论文、学位论文和会议资料。",
        usage: "校园网环境下可优先尝试访问，下载权限以学校订购为准。"
    },
    // Google Scholar — 国际学术搜索引擎
    // 适合检索英文文献、查看引用关系和追踪研究方向
    // 访问情况受网络环境影响，可配合学校代理使用
    {
        id: "google-scholar",
        title: "Google Scholar",
        type: "资料检索",
        category: "search",
        url: "https://scholar.google.com/",
        keywords: ["google scholar", "谷歌学术", "英文论文", "引用"],
        description: "适合检索英文文献、查看引用关系和相关研究方向。",
        usage: "适合英文论文和国际资料查找；访问情况受网络环境影响。"
    },
    // Zotero — 开源的文献管理工具
    // 支持文献条目保存、PDF 管理和参考文献自动生成
    // 写课程论文和毕业论文时整理文献资料的必备工具
    {
        id: "zotero",
        title: "Zotero",
        type: "资料管理",
        category: "tool",
        url: "https://www.zotero.org/",
        keywords: ["zotero", "文献管理", "引用", "论文"],
        description: "开源文献管理工具，适合课程论文、毕业论文和资料引用整理。",
        usage: "写课程论文时可用来保存文献条目和生成参考文献。"
    },

    // ==================== 编程学习与开发工具 ====================

    // MDN Web Docs — Web 前端开发的权威技术文档
    // 由 Mozilla 维护，涵盖 HTML、CSS、JavaScript、Web API 等标准用法
    // 写 Web 作业遇到标签、属性或 DOM API 不确定时优先查阅
    {
        id: "mdn",
        title: "MDN Web Docs",
        type: "编程学习",
        category: "code",
        url: "https://developer.mozilla.org/",
        keywords: ["mdn", "html", "css", "javascript", "web", "前端"],
        description: "Web 前端权威文档，适合查询 HTML、CSS、JavaScript 标准用法。",
        usage: "写 Web 作业遇到标签、属性、DOM API 不确定时优先查它。"
    },
    // W3School 在线教程 — 中文 Web 基础教程网站
    // 适合快速查看 HTML、CSS、JavaScript 等基础示例
    // 适合新手入门参考，最终代码需自己理解和改写
    {
        id: "w3school",
        title: "W3School 在线教程",
        type: "编程学习",
        category: "code",
        url: "https://www.w3school.com.cn/",
        keywords: ["w3school", "html", "css", "javascript", "教程"],
        description: "中文 Web 基础教程，适合快速查看示例和入门概念。",
        usage: "适合新手查基础示例，但最终代码仍要自己理解和改写。"
    },
    // 菜鸟教程（RunooB）— 覆盖多种编程语言的中文教程
    // 提供大量代码示例和在线运行环境
    // 适合快速查询语法和基础概念
    {
        id: "runoob",
        title: "菜鸟教程",
        type: "编程学习",
        category: "code",
        url: "https://www.runoob.com/",
        keywords: ["菜鸟教程", "runoob", "编程", "前端", "示例"],
        description: "覆盖多种编程语言和 Web 基础内容，适合快速入门和查例子。",
        usage: "适合查语法示例，资料整理中不要直接复制整段代码。"
    },
    // GitHub Docs — 版本管理与协作开发的官方文档
    // 学习 Git 基本操作、Pull Request 和团队协作流程的权威参考
    // 小组项目遇到提交、分支、合并问题时可以查阅
    {
        id: "github-docs",
        title: "GitHub Docs",
        type: "编程学习",
        category: "code",
        url: "https://docs.github.com/",
        keywords: ["github", "git", "版本管理", "协作"],
        description: "适合学习 GitHub 仓库、协作和版本管理的官方文档。",
        usage: "小组协作时可参考分支、提交和仓库管理说明。"
    },

    // ==================== 笔记协作与实用工具 ====================

    // Notion — 集笔记、知识库和项目管理于一体的工具
    // 适合建立课程知识库、项目任务板和小组资料库
    // 建议按课程建立页面分层管理，避免所有内容堆在一个页面
    {
        id: "notion",
        title: "Notion",
        type: "笔记工具",
        category: "tool",
        url: "https://www.notion.so/",
        keywords: ["notion", "笔记", "知识库", "任务管理"],
        description: "适合建立课程知识库、项目任务板和小组资料库。",
        usage: "建议按课程建立页面，不要把所有资料堆在一个页面里。"
    },
    // 语雀 — 阿里巴巴出品的知识库与文档协作工具
    // 适合个人做课程笔记、小组整理项目文档
    // 结构化文档编辑体验优秀，适合长期维护学习笔记
    {
        id: "yuque",
        title: "语雀",
        type: "知识库工具",
        category: "tool",
        url: "https://www.yuque.com/",
        keywords: ["语雀", "知识库", "笔记", "文档", "团队协作"],
        description: "适合建立课程笔记、项目文档和小组作业资料库。",
        usage: "适合小组统一整理资料，也适合个人做课程知识库。"
    },
    // 飞书文档 — 字节跳动出品的在线协作办公套件
    // 支持多人实时协同编辑文档、表格和插入各种内容块
    // 小组作业可用一个文档记录分工、进度和最终材料
    {
        id: "feishu",
        title: "飞书文档",
        type: "协作工具",
        category: "tool",
        url: "https://www.feishu.cn/product/docs",
        keywords: ["飞书", "文档", "协作", "小组作业", "在线文档"],
        description: "适合多人协作写文档、做表格和管理小组任务。",
        usage: "小组作业可以用一个文档记录分工、进度和最终材料。"
    },
    // ProcessOn — 在线思维导图和流程图绘制工具
    // 支持多种图表类型：思维导图、流程图、UML、原型图等
    // 复习时可用它整理章节关系，构建课程知识框架
    {
        id: "processon",
        title: "ProcessOn",
        type: "思维导图",
        category: "tool",
        url: "https://www.processon.com/",
        keywords: ["思维导图", "流程图", "processon", "结构"],
        description: "适合画思维导图、流程图和课程知识结构图。",
        usage: "复习时可用来整理章节关系和知识框架。"
    },

    // ==================== 设计素材与工具 ====================

    // 阿里巴巴矢量图标库（Iconfont）— 国内最流行的图标资源平台
    // 提供海量 SVG 矢量图标，支持自定义颜色和尺寸
    // 适合网页按钮、分类图标和项目视觉素材
    {
        id: "iconfont",
        title: "阿里巴巴矢量图标库 Iconfont",
        type: "素材资源",
        category: "design",
        url: "https://www.iconfont.cn/",
        keywords: ["iconfont", "图标", "素材", "svg", "设计"],
        description: "常用中文图标资源平台，适合网页按钮、分类图标和项目视觉素材。",
        usage: "使用图标时注意授权说明，公开说明可记录素材来源。"
    },
    // Pexels — 高质量免费摄影图片素材网站
    // 提供大量精美摄影作品，可用于网页背景和展示配图
    // 下载后建议压缩图片体积，并在项目说明中记录来源
    {
        id: "pexels",
        title: "Pexels",
        type: "图片素材",
        category: "design",
        url: "https://www.pexels.com/",
        keywords: ["图片", "素材", "pexels", "摄影", "背景"],
        description: "免费图片素材网站，适合寻找学习场景、科技感或背景图片。",
        usage: "下载后建议压缩图片体积，并在借鉴说明中记录来源。"
    },
    // Canva 可画 — 在线图形设计平台
    // 提供海量模板，无需专业设计技能即可制作海报和演示素材
    // 适合课程展示配图和文档封面制作
    {
        id: "canva",
        title: "Canva 可画",
        type: "设计工具",
        category: "design",
        url: "https://www.canva.cn/",
        keywords: ["canva", "可画", "海报", "PPT", "模板", "设计"],
        description: "在线设计工具，适合做展示图、文档插图、封面和简单 PPT 视觉素材。",
        usage: "适合不熟悉专业设计软件的同学快速制作展示素材。"
    },

    // ==================== AI 工具与平台 ====================

    // ChatGPT — OpenAI 出品的通用 AI 对话助手
    // 擅长概念解释、文本总结、提纲生成和头脑风暴
    // 适合辅助学习理清思路，不建议直接用于代写作业
    {
        id: "chatgpt",
        title: "ChatGPT",
        type: "AI 工具",
        category: "ai",
        url: "https://chatgpt.com/",
        keywords: ["chatgpt", "ai", "AI", "总结", "问答", "学习助手"],
        description: "通用 AI 对话工具，适合辅助理解概念、拆解学习任务和生成提纲。",
        usage: "适合辅助学习，不建议直接用于代写作业。"
    },
    // Kimi — 月之暗面出品的 AI 对话工具
    // 擅长长文本阅读、资料总结和 PDF 文档问答
    // 可用于辅助梳理文献和整理资料，重要结论需自己核对
    {
        id: "kimi",
        title: "Kimi",
        type: "AI 工具",
        category: "ai",
        url: "https://kimi.moonshot.cn/",
        keywords: ["kimi", "ai", "长文档", "总结", "阅读"],
        description: "适合长文本阅读、资料总结和文档问答的 AI 工具。",
        usage: "可用于辅助梳理资料，但重要结论需要自己核对。"
    },
    // DeepSeek — 深度求索出品的 AI 对话模型
    // 在代码生成和逻辑推理方面表现突出
    // 适合辅助代码理解、题目思路分析和知识点讲解
    {
        id: "deepseek",
        title: "DeepSeek",
        type: "AI 工具",
        category: "ai",
        url: "https://chat.deepseek.com/",
        keywords: ["deepseek", "ai", "代码", "推理", "学习"],
        description: "AI 对话工具，适合辅助代码理解、题目思路分析和知识点解释。",
        usage: "用于学习辅助时，建议让它解释过程而不是只给答案。"
    },

    // ==================== 英语学习资源 ====================

    // 有道词典 — 网易出品的查词与翻译工具
    // 支持中英互译、例句查询和在线发音
    // 阅读英文资料时边读边查，建议建立个人生词本
    {
        id: "youdao",
        title: "有道词典",
        type: "英语学习",
        category: "english",
        url: "https://www.youdao.com/",
        keywords: ["英语", "词典", "翻译", "例句"],
        description: "适合查词、例句和基础翻译，阅读英文资料时比较方便。",
        usage: "建议记录高频专业词汇，而不是只临时查一下。"
    },
    // TED Talks — 全球知名的演讲视频平台
    // 涵盖科技、教育、文化等各领域的前沿思考和故事
    // 适合练英语听力、积累表达方式和获取主题灵感
    {
        id: "ted",
        title: "TED Talks",
        type: "英语学习",
        format: "视频链接",
        formatKey: "video",
        platform: "TED",
        category: "english",
        url: "https://www.ted.com/talks",
        keywords: ["ted", "英语", "听力", "演讲", "字幕"],
        description: "适合英语听力、演讲表达和主题素材积累。",
        usage: "选择 5-10 分钟视频做精听，比随便刷视频更有效。"
    },
    // 哔哩哔哩学习区 — B站知识类视频的集中入口
    // 有大量课程讲解、公开课切片和学习方法分享
    // 建议搜索具体关键词，如"高数 极限""JavaScript 入门"
    {
        id: "bilibili-study",
        title: "哔哩哔哩学习区",
        type: "视频课程",
        format: "视频链接",
        formatKey: "video",
        platform: "B站",
        category: "course",
        url: "https://www.bilibili.com/v/knowledge/",
        keywords: ["b站", "bilibili", "视频", "课程", "公开课"],
        description: "B站知识区里有大量课程讲解、公开课切片和学习经验视频，适合按具体课程或知识点搜索。",
        usage: "建议搜索具体关键词，比如“高数 极限”“JavaScript DOM”，不要只刷推荐流。"
    },

    // ==================== 考试考证 ====================

    // B站期末复习视频检索 — 临近期末的备考利器
    // 按课程名或考试科目搜索重点串讲和题型讲解视频
    // 优先选择目录清晰、时长适中、评论反馈好的合集
    {
        id: "bilibili-exam",
        title: "B站考试复习视频检索",
        type: "考试考证",
        format: "视频链接",
        formatKey: "video",
        platform: "B站",
        category: "exam",
        url: "https://search.bilibili.com/all?keyword=%E6%9C%9F%E6%9C%AB%E5%A4%8D%E4%B9%A0",
        keywords: ["期末", "考试", "复习", "b站", "视频"],
        description: "适合临近期末时查找某门课的重点串讲、题型讲解和复习经验。",
        usage: "优先选择目录清楚、时长适中、评论区反馈较好的视频合集。"
    },
    // Microsoft Learn — 微软官方技术学习与文档平台
    // 提供交互式学习路径、模块化课程和技术文档
    // 适合查询 Windows、Office、Azure 和开发工具相关资料
    {
        id: "microsoft-learn",
        title: "Microsoft Learn",
        type: "编程学习",
        format: "网站",
        formatKey: "website",
        platform: "微软",
        category: "code",
        url: "https://learn.microsoft.com/",
        keywords: ["microsoft", "learn", "文档", "azure", "开发"],
        description: "微软官方技术文档和学习路径，适合查询 Windows、Office、Azure 和开发工具相关资料。",
        usage: "做课程项目遇到微软生态工具时，可以优先查官方文档。"
    },
    // Stack Overflow — 全球最大的编程问答社区
    // 几乎所有常见的开发错误和疑问都能在这里找到解答
    // 搜索报错时保留关键错误文本，注意判断答案适用的版本
    {
        id: "stackoverflow",
        title: "Stack Overflow",
        type: "编程问答",
        format: "网站",
        formatKey: "website",
        platform: "Stack Overflow",
        category: "code",
        url: "https://stackoverflow.com/",
        keywords: ["stackoverflow", "报错", "debug", "代码", "问答"],
        description: "程序报错和开发问题问答社区，适合查找常见错误原因和解决思路。",
        usage: "搜索报错信息时保留关键错误文本，注意判断答案适用版本。"
    },
    // LeetCode — 算法与数据结构在线刷题平台
    // 收录各大厂面试真题和竞赛题目，支持多种编程语言
    // 建议按题型专题练习，做完后复盘思路和时间复杂度
    {
        id: "leetcode",
        title: "LeetCode",
        type: "刷题平台",
        format: "网站",
        formatKey: "website",
        platform: "LeetCode",
        category: "code",
        url: "https://leetcode.cn/",
        keywords: ["leetcode", "算法", "刷题", "面试", "数据结构"],
        description: "算法与数据结构练习平台，适合准备程序设计课程、竞赛和技术面试。",
        usage: "建议按题型专题练习，做完后复盘思路和复杂度。"
    },
    // 牛客网 — 集刷题、笔试模拟和面经于一体的求职平台
    // 涵盖编程题、选择题和大厂笔试真题
    // 适合准备实习、校招和课程练习时使用
    {
        id: "niuke",
        title: "牛客网",
        type: "刷题平台",
        format: "网站",
        formatKey: "website",
        platform: "牛客",
        category: "exam",
        url: "https://www.nowcoder.com/",
        keywords: ["牛客", "刷题", "面试", "笔试", "题库"],
        description: "覆盖编程题、笔试题和面试经验，适合准备实习、校招和课程练习。",
        usage: "适合按学校课程或目标岗位筛选题目，练习后整理错题。"
    },
    // Typora — 简洁优雅的 Markdown 桌面编辑器
    // 所见即所得的写作体验，支持代码高亮和数学公式
    // 适合整理课程笔记、实验报告和项目技术文档
    {
        id: "typora",
        title: "Typora",
        type: "笔记工具",
        format: "电脑软件",
        formatKey: "software",
        platform: "桌面端",
        category: "tool",
        url: "https://typora.io/",
        keywords: ["typora", "markdown", "笔记", "写作"],
        description: "Markdown 写作软件，适合整理课程笔记、实验文档草稿和项目说明。",
        usage: "适合把课堂知识点整理成结构化 Markdown 文档。"
    },
    // Obsidian — 本地优先的 Markdown 知识库工具
    // 支持双向链接和关系图谱，适合构建个人知识体系
    // 适合按课程、章节、概念做笔记，用链接串联相关知识
    {
        id: "obsidian",
        title: "Obsidian",
        type: "笔记工具",
        format: "电脑软件",
        formatKey: "software",
        platform: "桌面端",
        category: "tool",
        url: "https://obsidian.md/",
        keywords: ["obsidian", "markdown", "双链", "知识库", "笔记"],
        description: "本地 Markdown 知识库工具，适合长期维护课程笔记和个人知识体系。",
        usage: "适合按课程、章节、概念建立笔记，并用链接串联相关知识。"
    },
    // XMind — 专业的思维导图软件
    // 支持多种导图结构：思维导图、逻辑图、括号图、时间轴等
    // 复习课时先用导图搭出章节骨架，再填充细节
    {
        id: "xmind",
        title: "XMind",
        type: "思维导图",
        format: "电脑软件",
        formatKey: "software",
        platform: "桌面端",
        category: "tool",
        url: "https://xmind.cn/",
        keywords: ["xmind", "思维导图", "复习", "结构"],
        description: "思维导图工具，适合整理章节结构、文档框架和小组展示思路。",
        usage: "复习一门课时，可以先用导图搭出章节骨架。"
    },
    // 扇贝单词 — 英语词汇积累 App
    // 提供四六级、考研、雅思等词库和打卡复习机制
    // 建议每天固定少量复习，考前突击效果有限
    {
        id: "shanbay",
        title: "扇贝单词",
        type: "英语学习",
        format: "App",
        formatKey: "app",
        platform: "移动端",
        category: "english",
        url: "https://web.shanbay.com/",
        keywords: ["扇贝", "单词", "英语", "四六级", "背词"],
        description: "英语词汇学习工具，适合四六级、考研英语和日常词汇积累。",
        usage: "建议每天固定少量复习，比考前突击背大量新词更稳。"
    },
    // Figma — 基于浏览器的界面设计与原型工具
    // 支持多人实时协作，适合网页和 App 的 UI 设计
    // 适合先画页面结构和交互流程，再着手写代码
    {
        id: "figma",
        title: "Figma",
        type: "设计工具",
        format: "网站",
        formatKey: "website",
        platform: "Figma",
        category: "design",
        url: "https://www.figma.com/",
        keywords: ["figma", "ui", "设计", "原型", "协作"],
        description: "在线界面设计与原型工具，适合网页作业、App 原型和小组协作设计。",
        usage: "适合先画页面结构和交互流程，再开始写 HTML 和 CSS。"
    },
    // Unsplash — 高质量免费摄影图片素材库
    // 图片质量高、风格多样，适合网页背景和展示封面
    // 下载后记得压缩体积并在项目说明中标注来源
    {
        id: "unsplash",
        title: "Unsplash",
        type: "图片素材",
        format: "网站",
        formatKey: "website",
        platform: "Unsplash",
        category: "design",
        url: "https://unsplash.com/",
        keywords: ["unsplash", "图片", "素材", "摄影", "背景"],
        description: "高质量摄影素材网站，适合查找展示封面、网页背景和展示图。",
        usage: "下载后记得压缩图片体积，并在项目说明中记录素材来源。"
    },
    // Font Awesome — 最流行的网页图标库
    // 提供 1500+ 免费 SVG 图标，通过 CSS 或 JS 调用
    // 适合按钮、导航栏和功能入口的图标选用
    {
        id: "fontawesome",
        title: "Font Awesome",
        type: "图标素材",
        format: "网站",
        formatKey: "website",
        platform: "Font Awesome",
        category: "design",
        url: "https://fontawesome.com/",
        keywords: ["fontawesome", "图标", "icon", "网页", "素材"],
        description: "常用图标库，适合网页按钮、导航和功能入口图标选择。",
        usage: "用于项目时注意免费版本范围和授权说明。"
    },

    // ==================== 博主与内容创作者推荐 ====================

    // B站学习博主检索 — 按学习方法或课程名搜索优质 UP 主
    // 可找到持续输出学习经验的创作者，拓展学习信息来源
    // 先浏览主页判断内容质量，再收藏适合自己的账号
    {
        id: "study-creator-search",
        title: "B站学习博主检索",
        type: "博主推荐",
        format: "博主/账号",
        formatKey: "creator",
        platform: "B站",
        category: "creator",
        url: "https://search.bilibili.com/upuser?keyword=%E5%AD%A6%E4%B9%A0",
        keywords: ["博主", "up主", "学习方法", "b站", "推荐"],
        description: "按学习方法、课程名、考试方向检索相关 UP 主，适合扩展长期关注的学习来源。",
        usage: "先看主页内容是否持续更新，再收藏真正适合自己课程方向的账号。"
    },
    // 编程学习博主检索 — 按编程方向寻找优质 UP 主
    // 覆盖前端、后端、算法等不同技术方向
    // 建议结合具体学习目标筛选，提高学习效率
    {
        id: "programming-creator-search",
        title: "编程学习博主检索",
        type: "博主推荐",
        format: "博主/账号",
        formatKey: "creator",
        platform: "B站",
        category: "creator",
        url: "https://search.bilibili.com/upuser?keyword=%E7%BC%96%E7%A8%8B",
        keywords: ["编程", "up主", "前端", "教程", "博主"],
        description: "用于查找编程入门、前端开发、算法刷题等方向的内容创作者。",
        usage: "建议结合具体学习目标筛选，比如“前端项目”“数据结构”“Java 入门”。"
    },
    // MIT OpenCourseWare — 麻省理工学院开放课程资源
    // 免费提供课程大纲、讲义、作业和考试材料
    // 适合查阅国际顶尖高校的课程体系和教学标准
    {
        id: "mit-ocw",
        title: "MIT OpenCourseWare",
        type: "在线课程",
        format: "网站",
        formatKey: "website",
        platform: "MIT",
        category: "course",
        url: "https://ocw.mit.edu/",
        keywords: ["mit", "公开课", "英文课程", "大学课程", "open course"],
        description: "麻省理工公开课程资源，覆盖数学、计算机、工程和通识课程。",
        usage: "适合想看国际高校课程大纲、讲义和作业材料的同学。"
    },
    // edX — 由 MIT 和哈佛联合创办的国际在线课程平台
    // 提供全球顶尖高校的正式课程和微硕士项目
    // 建议先试听免费内容，再决定是否获取证书
    {
        id: "edx",
        title: "edX",
        type: "在线课程",
        format: "网站",
        formatKey: "website",
        platform: "edX",
        category: "course",
        url: "https://www.edx.org/",
        keywords: ["edx", "公开课", "英文课程", "证书", "大学课程"],
        description: "国际在线课程平台，适合查找高校和机构发布的英文课程。",
        usage: "建议先试听免费内容，再决定是否长期学习或获取证书。"
    },
    // Khan Academy — 非营利性免费学习平台
    // 涵盖数学、科学、计算机等基础学科，支持练习和进度追踪
    // 基础薄弱时可按主题从短视频和习题开始补起
    {
        id: "khan-academy",
        title: "Khan Academy",
        type: "在线课程",
        format: "网站",
        formatKey: "website",
        platform: "Khan Academy",
        category: "course",
        url: "https://www.khanacademy.org/",
        keywords: ["khan", "数学", "基础", "视频", "英文"],
        description: "适合补数学、科学和基础学科概念的免费视频学习平台。",
        usage: "基础薄弱时可以按主题从短视频和练习题开始补。"
    },
    // OpenStax — 免费开放的高质量教材平台
    // 提供大学数学、物理、经济学等学科的完整教材
    // 适合查阅英文教材的解释、例题和章节结构
    {
        id: "openstax",
        title: "OpenStax",
        type: "教材资源",
        format: "网站",
        formatKey: "website",
        platform: "OpenStax",
        category: "course",
        url: "https://openstax.org/",
        keywords: ["openstax", "教材", "英文教材", "开放教材"],
        description: "开放教材平台，提供数学、物理、经济学等英文教材资源。",
        usage: "适合查英文教材解释、例题和章节结构。"
    },
    // 中国大学 MOOC 课程检索页 — 直接搜索课程列表
    // 按课程名搜索可快速找到相关的系统性视频课程
    // 选课时优先看开课学校、课程目录和学习人数
    {
        id: "icourse-video-search",
        title: "中国大学 MOOC 课程检索",
        type: "视频课程",
        format: "视频链接",
        formatKey: "video",
        platform: "中国大学 MOOC",
        category: "course",
        url: "https://www.icourse163.org/search.htm?search=%E8%AE%A1%E7%AE%97%E6%9C%BA",
        keywords: ["mooc", "视频", "课程检索", "计算机", "大学课程"],
        description: "直接进入 MOOC 课程搜索结果，适合按课程名寻找成体系的视频课。",
        usage: "找课时优先看开课学校、课程目录和学习人数。"
    },
    // arXiv — 学术预印本论文平台
    // 计算机、数学、物理等领域的论文通常在正式发表前先发到这里
    // 适合了解前沿研究，引用前需确认论文的正式发表版本
    {
        id: "arxiv",
        title: "arXiv",
        type: "资料检索",
        format: "网站",
        formatKey: "website",
        platform: "arXiv",
        category: "search",
        url: "https://arxiv.org/",
        keywords: ["arxiv", "论文", "预印本", "英文文献", "科研"],
        description: "预印本论文平台，常用于计算机、数学、物理等方向的英文论文查找。",
        usage: "适合了解前沿研究，但引用前要确认论文版本和正式发表情况。"
    },
    // Semantic Scholar — 语义化学术搜索引擎
    // 利用 AI 提取论文核心内容和引用关系
    // 适合快速扫读摘要和影响力指标，再决定是否精读原文
    {
        id: "semantic-scholar",
        title: "Semantic Scholar",
        type: "资料检索",
        format: "网站",
        formatKey: "website",
        platform: "Semantic Scholar",
        category: "search",
        url: "https://www.semanticscholar.org/",
        keywords: ["semantic scholar", "论文", "引用", "英文文献", "学术"],
        description: "学术搜索工具，适合查看论文摘要、引用关系和相关研究。",
        usage: "适合先扫摘要和引用，再决定是否深入阅读原文。"
    },
    // PubMed — 美国国立医学图书馆文献检索平台
    // 医学与生命科学领域最权威的文献数据库之一
    // 适合医药、生物、健康主题的英文文献检索
    {
        id: "pubmed",
        title: "PubMed",
        type: "资料检索",
        format: "网站",
        formatKey: "website",
        platform: "PubMed",
        category: "search",
        url: "https://pubmed.ncbi.nlm.nih.gov/",
        keywords: ["pubmed", "医学", "论文", "生命科学", "文献"],
        description: "医学与生命科学方向常用文献检索平台。",
        usage: "适合医药、生物、健康主题课程资料的英文文献检索。"
    },
    // Web of Science — 全球权威的学术引文索引数据库
    // 支持高质量文献检索、引用分析和科研评价
    // 访问权限通常与学校订购有关，建议通过校园网访问
    {
        id: "web-of-science",
        title: "Web of Science",
        type: "资料检索",
        format: "网站",
        formatKey: "website",
        platform: "Clarivate",
        category: "search",
        url: "https://www.webofscience.com/",
        keywords: ["web of science", "wos", "论文", "引用", "检索"],
        description: "常用学术数据库入口，适合进行高质量文献和引用关系检索。",
        usage: "访问权限通常和学校订购有关，校园网或图书馆入口更容易使用。"
    },
    // WorldCat — 全球图书馆馆藏联合检索系统
    // 可查询图书在哪些图书馆有收藏，以及不同版本信息
    // 适合课程论文需要引用图书或确认出版信息时使用
    {
        id: "worldcat",
        title: "WorldCat",
        type: "资料检索",
        format: "网站",
        formatKey: "website",
        platform: "WorldCat",
        category: "search",
        url: "https://search.worldcat.org/",
        keywords: ["worldcat", "图书", "馆藏", "资料", "文献"],
        description: "全球图书馆馆藏检索工具，适合查找书籍、版本和馆藏信息。",
        usage: "适合课程论文需要引用图书或确认出版信息时使用。"
    },
    // ResearchGate — 面向科研工作者的学术社交网络
    // 研究人员在此发布论文、关注同行和获取研究动态
    // 适合通过作者主页追踪特定研究方向的最新成果
    {
        id: "researchgate",
        title: "ResearchGate",
        type: "资料社区",
        format: "网站",
        formatKey: "website",
        platform: "ResearchGate",
        category: "search",
        url: "https://www.researchgate.net/",
        keywords: ["researchgate", "论文", "作者", "科研", "学术社区"],
        description: "科研社交平台，可查看作者主页、论文条目和部分公开全文。",
        usage: "适合根据作者或研究方向继续追踪相关资料。"
    },
    // freeCodeCamp — 非营利性编程学习平台
    // 提供交互式教程，覆盖前端、后端、数据科学等方向
    // 适合边学边做项目，还配有技术文章和视频频道
    {
        id: "freecodecamp",
        title: "freeCodeCamp",
        type: "编程学习",
        format: "网站",
        formatKey: "website",
        platform: "freeCodeCamp",
        category: "code",
        url: "https://www.freecodecamp.org/",
        keywords: ["freecodecamp", "编程", "前端", "练习", "英文"],
        description: "免费编程学习平台，包含前端、后端、数据分析等练习路径。",
        usage: "适合边学边做小练习，英文内容也能顺便训练技术阅读。"
    },
    // 现代 JavaScript 教程（中文版）— 系统性 JS 学习资源
    // 从基础语法到高级概念均有详尽讲解，配有示例代码
    // 适合想在 Web 开发中扎实掌握 JavaScript 的同学
    {
        id: "javascript-info",
        title: "现代 JavaScript 教程",
        type: "编程学习",
        format: "网站",
        formatKey: "website",
        platform: "javascript.info",
        category: "code",
        url: "https://zh.javascript.info/",
        keywords: ["javascript", "js", "教程", "前端", "中文"],
        description: "系统讲解 JavaScript 语言基础、浏览器机制和异步编程。",
        usage: "适合 Web 作业中想把 JS 基础补扎实时使用。"
    },
    // Git 官方文档 — 学习版本控制的权威参考资料
    // 包含 Git 基本原理、命令参考和最佳实践
    // 遇到分支合并、提交回退等问题时优先查阅
    {
        id: "git-scm",
        title: "Git 官方文档",
        type: "编程学习",
        format: "网站",
        formatKey: "website",
        platform: "Git",
        category: "code",
        url: "https://git-scm.com/doc",
        keywords: ["git", "版本管理", "文档", "协作"],
        description: "Git 官方文档和教程入口，适合学习版本控制基本命令。",
        usage: "小组项目遇到提交、分支、合并问题时可以查官方说明。"
    },
    // Python 官方文档（中文版）— Python 学习的一手资料
    // 包含语言参考、标准库文档和安装指南
    // 遇到模块用法或语法问题时优先查这里
    {
        id: "python-docs",
        title: "Python 官方文档",
        type: "编程学习",
        format: "网站",
        formatKey: "website",
        platform: "Python",
        category: "code",
        url: "https://docs.python.org/zh-cn/3/",
        keywords: ["python", "官方文档", "中文", "编程"],
        description: "Python 官方中文文档，适合查询标准库、语法和教程。",
        usage: "写 Python 作业时遇到模块用法不确定，可以优先查这里。"
    },
    // cppreference — C 和 C++ 标准库的权威参考文档
    // 涵盖函数用法、容器特性和语言核心语法
    // 写数据结构或算法题时查阅 C++ STL 用法的好帮手
    {
        id: "cppreference",
        title: "cppreference",
        type: "编程学习",
        format: "网站",
        formatKey: "website",
        platform: "cppreference",
        category: "code",
        icon: "images/icons/cppreference.svg",
        url: "https://en.cppreference.com/",
        keywords: ["c++", "cpp", "标准库", "文档", "编程"],
        description: "C/C++ 标准库和语言特性参考资料，适合查函数、容器和语法细节。",
        usage: "适合数据结构、算法和 C++ 课程中查标准库用法。"
    },
    // Regex101 — 正则表达式在线测试与调试平台
    // 支持多语言风格（PCRE、JavaScript、Python 等），实时高亮匹配结果
    // 写表单校验、文本处理或爬虫规则时先在这里验证
    {
        id: "regex101",
        title: "Regex101",
        type: "编程工具",
        format: "网站",
        formatKey: "website",
        platform: "Regex101",
        category: "code",
        url: "https://regex101.com/",
        keywords: ["regex", "正则表达式", "调试", "工具"],
        description: "正则表达式测试和解释工具，适合调试匹配规则。",
        usage: "写表单校验、文本处理或爬虫规则时可以先在这里验证。"
    },
    // Can I use — Web 技术浏览器兼容性查询工具
    // 输入 CSS 属性或 JavaScript API 即可查看各浏览器支持情况
    // 使用较新的 Web 特性前先查一下兼容性，避免线上出问题
    {
        id: "caniuse",
        title: "Can I use",
        type: "编程工具",
        format: "网站",
        formatKey: "website",
        platform: "Can I use",
        category: "code",
        url: "https://caniuse.com/",
        keywords: ["浏览器兼容", "css", "html", "前端", "兼容性"],
        description: "查询 Web 特性浏览器兼容性的工具。",
        usage: "使用新的 CSS 或 HTML 特性前，可以查看主流浏览器支持情况。"
    },
    // CodePen — 前端代码在线编辑与分享社区
    // 可在线编写 HTML、CSS、JavaScript 并实时预览效果
    // 适合快速实验小功能或展示前端代码片段
    {
        id: "codepen",
        title: "CodePen",
        type: "编程工具",
        format: "网站",
        formatKey: "website",
        platform: "CodePen",
        category: "code",
        url: "https://codepen.io/",
        keywords: ["codepen", "前端", "在线编辑", "demo", "html"],
        description: "前端在线代码演示平台，适合快速验证 HTML、CSS 和 JavaScript 效果。",
        usage: "适合做小组件实验，不建议把完整作业只放在线平台。"
    },
    // CodeSandbox — 云端开发环境
    // 支持 React、Vue、Angular 等框架项目模板
    // 适合快速搭建前端原型和分享可运行的项目代码
    {
        id: "codesandbox",
        title: "CodeSandbox",
        type: "编程工具",
        format: "网站",
        formatKey: "website",
        platform: "CodeSandbox",
        category: "code",
        icon: "images/icons/codesandbox.svg",
        url: "https://codesandbox.io/",
        keywords: ["codesandbox", "在线开发", "前端", "react", "demo"],
        description: "在线开发环境，适合快速搭建前端示例和框架项目。",
        usage: "适合演示小项目或学习框架，但正式发布仍建议保留本地代码。"
    },
    // npm — JavaScript 生态的包管理平台
    // 可搜索前端库和工具包的版本、文档和依赖信息
    // 选库时关注更新时间、下载量和许可证类型
    {
        id: "npmjs",
        title: "npm",
        type: "编程工具",
        format: "网站",
        formatKey: "website",
        platform: "npm",
        category: "code",
        url: "https://www.npmjs.com/",
        keywords: ["npm", "javascript", "包", "前端", "依赖"],
        description: "JavaScript 包检索平台，适合查前端库、版本和使用说明。",
        usage: "选库时看更新时间、下载量、文档和许可证，不要只看名字。"
    },
    // PyPI — Python 官方的第三方包索引平台
    // 可搜索和浏览所有 Python 第三方库
    // 安装前先看项目说明、维护状态和兼容性
    {
        id: "pypi",
        title: "PyPI",
        type: "编程工具",
        format: "网站",
        formatKey: "website",
        platform: "PyPI",
        category: "code",
        url: "https://pypi.org/",
        keywords: ["pypi", "python", "包", "库", "依赖"],
        description: "Python 包索引平台，适合查第三方库、版本和安装方式。",
        usage: "安装第三方库前先看项目说明、版本和维护状态。"
    },
    // draw.io — 免费开源的在线绘图工具
    // 支持流程图、架构图、UML、ER 图等多种图表类型
    // 做实验报告和项目展示时用它画章节配图
    {
        id: "drawio",
        title: "draw.io",
        type: "绘图工具",
        format: "网站",
        formatKey: "website",
        platform: "diagrams.net",
        category: "tool",
        url: "https://app.diagrams.net/",
        keywords: ["drawio", "流程图", "架构图", "图表", "绘图"],
        description: "在线流程图和架构图工具，适合画实验流程、系统结构和项目图。",
        usage: "做报告时可以用它画清晰的流程图和模块图。"
    },
    // Overleaf — 在线 LaTeX 论文协作写作平台
    // 提供丰富的论文模板，支持多人实时协作编辑
    // 适合需要规范排版的课程论文和毕业论文
    {
        id: "overleaf",
        title: "Overleaf",
        type: "论文写作",
        format: "网站",
        formatKey: "website",
        platform: "Overleaf",
        category: "tool",
        url: "https://www.overleaf.com/",
        keywords: ["overleaf", "latex", "论文", "写作", "模板"],
        description: "在线 LaTeX 写作平台，适合论文、数学公式较多的报告和英文模板。",
        usage: "适合需要规范排版、公式和参考文献管理的课程资料。"
    },
    // WolframAlpha — 计算知识与答案引擎
    // 可以解方程、画函数图像、查化学数据等
    // 适合辅助验证计算过程和理解数学概念
    {
        id: "wolframalpha",
        title: "WolframAlpha",
        type: "学习工具",
        format: "网站",
        formatKey: "website",
        platform: "WolframAlpha",
        category: "tool",
        url: "https://www.wolframalpha.com/",
        keywords: ["wolfram", "数学", "计算", "公式", "查询"],
        description: "计算知识引擎，适合数学、方程、函数和单位换算查询。",
        usage: "适合辅助验证计算过程，但作业仍要写出自己的推导。"
    },
    // WPS Office — 国产办公软件套件
    // 包含文字、表格和演示三大组件，兼容 Office 格式
    // 小组作业最终交付文档和展示 PPT 时最常用
    {
        id: "wps",
        title: "WPS Office",
        type: "办公软件",
        format: "电脑软件",
        formatKey: "software",
        platform: "桌面端",
        category: "tool",
        url: "https://www.wps.cn/",
        keywords: ["wps", "office", "文档", "表格", "ppt"],
        description: "常用办公套件，适合写文档、做表格和制作演示文稿。",
        usage: "小组作业最终交付文档、表格、PPT 时比较常用。"
    },
    // 腾讯文档 — 在线协作文档与表格工具
    // 支持多人同时编辑，实时同步，历史版本可追溯
    // 适合小组收集资料、分工记录和共同修改报告
    {
        id: "tencent-docs",
        title: "腾讯文档",
        type: "协作工具",
        format: "网站",
        formatKey: "website",
        platform: "腾讯文档",
        category: "tool",
        url: "https://docs.qq.com/",
        keywords: ["腾讯文档", "在线文档", "协作", "表格", "小组作业"],
        description: "在线文档和表格协作工具，适合小组共同编辑作业材料。",
        usage: "适合收集资料、分工记录和多人共同修改报告。"
    },
    // DeepL — 来自德国的神经网络翻译引擎
    // 翻译质量高，尤其擅长欧洲语言之间的翻译
    // 翻译后需自己核对专业术语和语境，不宜直接照搬
    {
        id: "deepl",
        title: "DeepL",
        type: "翻译工具",
        format: "网站",
        formatKey: "website",
        platform: "DeepL",
        category: "tool",
        url: "https://www.deepl.com/translator",
        keywords: ["deepl", "翻译", "英文", "论文", "写作"],
        description: "翻译工具，适合辅助理解英文资料和润色表达。",
        usage: "翻译后要自己核对专业词汇和语境，不要直接照搬。"
    },
    // Grammarly — 英文写作辅助工具
    // 可检查语法错误、拼写问题和表达建议
    // 适合检查英文邮件、摘要和课程报告的初稿
    {
        id: "grammarly",
        title: "Grammarly",
        type: "写作工具",
        format: "网站",
        formatKey: "website",
        platform: "Grammarly",
        category: "tool",
        url: "https://www.grammarly.com/",
        keywords: ["grammarly", "英文写作", "语法", "润色"],
        description: "英文写作检查工具，适合检查语法、拼写和表达问题。",
        usage: "适合英文邮件、英文摘要和课程资料初稿检查。"
    },
    // Todoist — 跨平台的待办事项管理工具
    // 支持项目分组的任务管理，可设置提醒和优先级
    // 适合把课程任务拆成小项，逐一追踪完成进度
    {
        id: "todoist",
        title: "Todoist",
        type: "效率工具",
        format: "App",
        formatKey: "app",
        platform: "移动端",
        category: "tool",
        url: "https://todoist.com/",
        keywords: ["todoist", "待办", "任务", "效率", "app"],
        description: "待办事项管理工具，适合记录课程任务、截止日期和小组分工。",
        usage: "适合把项目展示拆成多个小任务，并设置提醒。"
    },
    // Anki — 基于间隔重复算法的记忆卡片工具
    // 适合背诵单词、定理、公式和专业术语
    // 坚持每日复习少量卡片，比考前集中突击更有效
    {
        id: "anki",
        title: "Anki",
        type: "记忆工具",
        format: "电脑软件",
        formatKey: "software",
        platform: "桌面端",
        category: "tool",
        url: "https://apps.ankiweb.net/",
        keywords: ["anki", "记忆", "卡片", "背诵", "复习"],
        description: "间隔重复记忆卡片工具，适合背单词、概念、公式和专业术语。",
        usage: "适合长期复习，不适合只在考试前一天临时塞大量卡片。"
    },
    // 豆包 — 字节跳动出品的 AI 对话助手
    // 支持文本问答、文档分析和语言翻译
    // 可辅助梳理资料思路，重要结论需回到原始来源确认
    {
        id: "doubao",
        title: "豆包",
        type: "AI 工具",
        format: "App",
        formatKey: "app",
        platform: "字节跳动",
        category: "ai",
        url: "https://www.doubao.com/",
        keywords: ["豆包", "ai", "问答", "写作", "学习"],
        description: "通用 AI 助手，适合辅助问答、资料理解和文本整理。",
        usage: "适合让它解释概念、列提纲，重要信息仍需回到资料来源核对。"
    },
    // 腾讯元宝 — 腾讯出品的 AI 对话工具
    // 支持长文本理解和内容生成
    // 辅助阅读和整理资料时可用，专业结论需二次核验
    {
        id: "yuanbao",
        title: "腾讯元宝",
        type: "AI 工具",
        format: "App",
        formatKey: "app",
        platform: "腾讯",
        category: "ai",
        url: "https://yuanbao.tencent.com/",
        keywords: ["元宝", "腾讯", "ai", "问答", "学习"],
        description: "AI 对话与资料处理工具，适合辅助阅读、问答和内容整理。",
        usage: "适合辅助梳理思路，涉及专业结论时要二次核验。"
    },
    // Perplexity — AI 驱动的智能搜索引擎
    // 结合大模型理解能力和搜索引擎，给出带引用的回答
    // 适合快速了解新主题，引用前打开原始来源核实
    {
        id: "perplexity",
        title: "Perplexity",
        type: "AI 工具",
        format: "网站",
        formatKey: "website",
        platform: "Perplexity",
        category: "ai",
        url: "https://www.perplexity.ai/",
        keywords: ["perplexity", "ai", "搜索", "资料", "问答"],
        description: "结合搜索和问答的 AI 工具，适合快速了解主题和追踪来源。",
        usage: "适合初步调研，引用前仍要打开原始来源确认。"
    },
    // Remove.bg — 在线 AI 智能抠图工具
    // 上传图片即可自动去除背景，支持人像和物体
    // 处理报告配图、头像和网页素材时非常方便
    {
        id: "removebg",
        title: "Remove.bg",
        type: "设计工具",
        format: "网站",
        formatKey: "website",
        platform: "Remove.bg",
        category: "design",
        url: "https://www.remove.bg/",
        keywords: ["removebg", "抠图", "背景", "图片", "设计"],
        description: "在线图片去背景工具，适合处理报告配图、头像和网页素材。",
        usage: "处理后注意图片边缘质量，必要时再手动微调。"
    },
    // TinyPNG — 在线图片压缩工具
    // 支持 PNG 和 JPG 格式，在几乎不损失画质的前提下大幅减小体积
    // 网页项目发布前压缩大图，能显著提升页面加载速度
    {
        id: "tinypng",
        title: "TinyPNG",
        type: "设计工具",
        format: "网站",
        formatKey: "website",
        platform: "TinyPNG",
        category: "design",
        url: "https://tinypng.com/",
        keywords: ["tinypng", "压缩", "图片", "png", "jpg"],
        description: "图片压缩工具，适合减小网页图片和报告图片体积。",
        usage: "网页项目发布前可以压缩大图，提升打开速度。"
    },
    // Pixabay — 免费图片、插画和视频素材库
    // 素材采用 CC0 协议，可免费商用无需署名
    // 适合查找展示背景和报告配图
    {
        id: "pixabay",
        title: "Pixabay",
        type: "图片素材",
        format: "网站",
        formatKey: "website",
        platform: "Pixabay",
        category: "design",
        url: "https://pixabay.com/",
        keywords: ["pixabay", "图片", "素材", "插图", "视频"],
        description: "图片、插画和视频素材网站，适合查找展示背景和报告配图。",
        usage: "下载素材后建议在项目说明中记录来源。"
    },
    // unDraw — 免费可商用的 SVG 插画素材网站
    // 插画风格统一，支持在线调整主色调
    // 适合网页空状态、功能说明页和展示页配图
    {
        id: "undraw",
        title: "unDraw",
        type: "插画素材",
        format: "网站",
        formatKey: "website",
        platform: "unDraw",
        category: "design",
        url: "https://undraw.co/illustrations",
        keywords: ["undraw", "插画", "svg", "素材", "网页"],
        description: "免费 SVG 插画素材网站，适合网页空状态、说明页和展示页配图。",
        usage: "适合做轻量插画，但要注意整体风格统一。"
    },
    // Color Hunt — 配色方案灵感社区
    // 收录大量设计师分享的配色组合，支持按颜色搜索
    // 为网页、海报和 PPT 选择色彩搭配时的参考来源
    {
        id: "colorhunt",
        title: "Color Hunt",
        type: "配色工具",
        format: "网站",
        formatKey: "website",
        platform: "Color Hunt",
        category: "design",
        url: "https://colorhunt.co/",
        keywords: ["colorhunt", "配色", "颜色", "设计", "网页"],
        description: "配色方案灵感网站，适合网页、海报和 PPT 选择色彩组合。",
        usage: "选色后要结合项目主题调整，不要直接套满整个页面。"
    },
    // Cambridge Dictionary — 剑桥大学出版社的权威英语词典
    // 提供英文释义、例句、词语搭配和发音
    // 阅读英文资料时看英文释义有助于理解真实语境
    {
        id: "cambridge-dictionary",
        title: "Cambridge Dictionary",
        type: "英语学习",
        format: "网站",
        formatKey: "website",
        platform: "Cambridge",
        category: "english",
        url: "https://dictionary.cambridge.org/",
        keywords: ["cambridge", "dictionary", "英语", "词典", "例句"],
        description: "权威英语词典，适合查英文释义、例句和词语搭配。",
        usage: "阅读英文资料时优先看英文释义，有助于理解真实语境。"
    },
    // BBC Learning English — 英国广播公司推出的英语学习平台
    // 提供听力、口语、语法和词汇等学习材料
    // 短视频和新闻素材贴近真实语境，适合日常积累
    {
        id: "bbc-learning-english",
        title: "BBC Learning English",
        type: "英语学习",
        format: "视频链接",
        formatKey: "video",
        platform: "BBC",
        category: "english",
        url: "https://www.bbc.co.uk/learningenglish/",
        keywords: ["bbc", "英语", "听力", "口语", "视频"],
        description: "BBC 英语学习资源，包含听力、口语、语法和短视频材料。",
        usage: "适合每天听一小段，积累真实表达和语音语调。"
    },
    // VOA Learning English — 美国之音的慢速英语学习节目
    // 语速较慢、用词基础，附带文本对照
    // 适合边听边看文本，积累新闻英语常用表达
    {
        id: "voa-learning-english",
        title: "VOA Learning English",
        type: "英语学习",
        format: "视频链接",
        formatKey: "video",
        platform: "VOA",
        category: "english",
        url: "https://learningenglish.voanews.com/",
        keywords: ["voa", "英语", "听力", "新闻", "慢速英语"],
        description: "慢速英语新闻和学习材料，适合训练英文听力和新闻阅读。",
        usage: "适合边听边看文本，记录常见新闻词汇和表达。"
    },
    // 欧路词典 — 支持跨设备同步的词典工具
    // 可导入自定义词库，支持 PDF 划词翻译
    // 建议把课程专业词汇整理到生词本中反复复习
    {
        id: "eudic",
        title: "欧路词典",
        type: "英语学习",
        format: "App",
        formatKey: "app",
        platform: "移动端",
        category: "english",
        url: "https://www.eudic.net/",
        keywords: ["欧路", "词典", "英语", "app", "生词本"],
        description: "词典和生词本工具，适合查词、保存生词和同步复习。",
        usage: "适合把课程专业词汇整理到生词本里反复复习。"
    },
    // 全国大学英语四六级考试 — 官方报名与成绩查询入口
    // 提供考试公告、报名流程、准考证打印和成绩发布
    // 考试时间安排以官网和学校教务处通知为准
    {
        id: "cet-neea",
        title: "全国大学英语四六级考试",
        type: "考试考证",
        format: "网站",
        formatKey: "website",
        platform: "中国教育考试网",
        category: "exam",
        url: "https://cet.neea.edu.cn/",
        keywords: ["四六级", "cet", "英语考试", "报名", "成绩"],
        description: "大学英语四六级考试官方入口，适合查看报名、准考证和成绩信息。",
        usage: "考试相关时间以官网和学校通知为准。"
    },
    // 全国计算机等级考试 — 官方报名与信息发布平台
    // 涵盖一级到四级多个科目，包括 Office、C 语言、Python 等
    // 备考时需结合考试大纲、历年真题和上机练习
    {
        id: "ncre-neea",
        title: "全国计算机等级考试",
        type: "考试考证",
        format: "网站",
        formatKey: "website",
        platform: "中国教育考试网",
        category: "exam",
        url: "https://ncre.neea.edu.cn/",
        keywords: ["计算机等级考试", "ncre", "二级", "考试", "报名"],
        description: "全国计算机等级考试官方入口，适合查看考试介绍、报名和成绩查询。",
        usage: "备考时结合考试大纲、真题和上机练习安排复习。"
    },
    // 软考 — 计算机技术与软件专业技术资格（水平）考试
    // 涵盖软件设计师、网络工程师、系统分析师等专业方向
    // 适合计划考取计算机行业职称证书的同学关注
    {
        id: "ruankao",
        title: "中国计算机技术职业资格网",
        type: "考试考证",
        format: "网站",
        formatKey: "website",
        platform: "软考",
        category: "exam",
        url: "https://www.ruankao.org.cn/",
        keywords: ["软考", "计算机", "职业资格", "考试", "证书"],
        description: "计算机技术与软件专业技术资格考试官方信息入口。",
        usage: "适合准备软件设计师、网络工程师等证书时查看官方通知。"
    },
    // 学信网 — 中国高等教育学生信息网
    // 提供学籍查询、学历认证、在线验证报告等服务
    // 涉及学籍信息和考研报名时以官方数据为准
    {
        id: "chsi",
        title: "学信网",
        type: "考试考证",
        format: "网站",
        formatKey: "website",
        platform: "学信网",
        category: "exam",
        url: "https://www.chsi.com.cn/",
        keywords: ["学信网", "学历", "学籍", "考研", "验证"],
        description: "学籍学历信息和招生考试相关服务入口。",
        usage: "涉及学籍、学历验证、考研报名等事项时应以官方信息为准。"
    },
    // 研招网 — 全国硕士研究生招生考试官方平台
    // 提供院校信息、报名入口、调剂系统和录取查询
    // 准备考研的同学需密切关注网站发布的官方通知
    {
        id: "yz-chsi",
        title: "中国研究生招生信息网",
        type: "考试考证",
        format: "网站",
        formatKey: "website",
        platform: "研招网",
        category: "exam",
        url: "https://yz.chsi.com.cn/",
        keywords: ["研招网", "考研", "研究生", "报名", "调剂"],
        description: "研究生招生报名、调剂和信息查询官方平台。",
        usage: "准备考研时用来查看招生单位、报名流程和官方通知。"
    },
    // IELTS 雅思 — 国际英语语言测试系统官方入口
    // 评估听说读写四项英语能力，分学术类和培训类
    // 有留学计划或英语能力证明需求时再系统准备
    {
        id: "ielts",
        title: "IELTS",
        type: "考试考证",
        format: "网站",
        formatKey: "website",
        platform: "IELTS",
        category: "exam",
        url: "https://ielts.org/",
        keywords: ["ielts", "雅思", "英语考试", "留学"],
        description: "雅思考试官方信息入口，适合了解考试形式、报名和备考资源。",
        usage: "留学或英语能力证明需求明确时再系统规划备考。"
    },
    // TOEFL 托福 — 美国教育考试服务中心（ETS）主办的英语测试
    // 评估非英语母语者在学术环境中的英语运用能力
    // 备考前先确认目标院校的具体分数要求
    {
        id: "toefl",
        title: "TOEFL",
        type: "考试考证",
        format: "网站",
        formatKey: "website",
        platform: "ETS",
        category: "exam",
        url: "https://www.ets.org/toefl.html",
        keywords: ["toefl", "托福", "英语考试", "留学"],
        description: "托福考试官方信息入口，适合了解考试内容、报名和分数要求。",
        usage: "备考前先确认目标院校或项目的分数要求。"
    },
    // B站高等数学视频检索 — 搜索高数相关的视频教程
    // 涵盖极限、导数、积分、微分方程等章节内容
    // 适合按具体知识点搜索，作为课堂学习的视频补充
    {
        id: "bilibili-gaoshu",
        title: "B站高等数学视频检索",
        type: "视频课程",
        format: "视频链接",
        formatKey: "video",
        platform: "B站",
        category: "course",
        url: "https://search.bilibili.com/all?keyword=%E9%AB%98%E7%AD%89%E6%95%B0%E5%AD%A6",
        keywords: ["高数", "数学", "b站", "视频", "课程"],
        description: "快速检索高等数学相关视频课程、串讲和题型讲解。",
        usage: "适合按章节查找，比如“极限”“导数”“积分”。"
    },
    // B站四六级备考视频检索 — 搜索英语等级考试备考内容
    // 涵盖听力、阅读、写作和翻译各题型的技巧讲解
    // 建议分题型选择视频学方法，再通过真题巩固练习
    {
        id: "bilibili-cet",
        title: "B站四六级备考视频检索",
        type: "视频课程",
        format: "视频链接",
        formatKey: "video",
        platform: "B站",
        category: "exam",
        url: "https://search.bilibili.com/all?keyword=%E5%9B%9B%E5%85%AD%E7%BA%A7%E5%A4%87%E8%80%83",
        keywords: ["四六级", "英语", "b站", "备考", "视频"],
        description: "检索英语四六级听力、阅读、写作和翻译备考视频。",
        usage: "建议按题型选择视频，不要只收藏不练题。"
    },
    // B站计算机二级备考视频检索 — 搜索二级考试辅导视频
    // 覆盖 Office、Python、C 语言、Access 等科目
    // 适合搭配考试大纲和上机模拟软件一起使用
    {
        id: "bilibili-ncre",
        title: "B站计算机二级视频检索",
        type: "视频课程",
        format: "视频链接",
        formatKey: "video",
        platform: "B站",
        category: "exam",
        url: "https://search.bilibili.com/all?keyword=%E8%AE%A1%E7%AE%97%E6%9C%BA%E4%BA%8C%E7%BA%A7",
        keywords: ["计算机二级", "ncre", "b站", "视频", "考试"],
        description: "检索计算机二级 Office、Python、C 语言等方向备考视频。",
        usage: "适合搭配真题和上机练习一起使用。"
    },
    // TED-Ed — TED 旗下的教育动画频道
    // 每个视频 5-10 分钟，用动画生动讲解一个知识点
    // 适合练英语听力学知识，短小精悍易于坚持
    {
        id: "ted-ed",
        title: "TED-Ed",
        type: "视频课程",
        format: "视频链接",
        formatKey: "video",
        platform: "TED",
        category: "english",
        url: "https://ed.ted.com/",
        keywords: ["ted-ed", "英语", "动画", "科普", "视频"],
        description: "TED 教育短视频平台，适合英语听力、科普知识和演讲素材积累。",
        usage: "适合选择短视频做精听，同时记录主题词汇。"
    },
    // 小红书学习经验检索 — 搜索学习方法与备考经验分享
    // 有很多在校生分享笔记方法、时间管理和备考计划
    // 经验帖需结合自身实际情况筛选，不宜照搬他人作息
    {
        id: "xiaohongshu-study-search",
        title: "小红书学习经验检索",
        type: "博主推荐",
        format: "博主/账号",
        formatKey: "creator",
        platform: "小红书",
        category: "creator",
        url: "https://www.xiaohongshu.com/search_result?keyword=%E5%AD%A6%E4%B9%A0%E7%BB%8F%E9%AA%8C",
        keywords: ["小红书", "学习经验", "博主", "方法", "推荐"],
        description: "检索学习经验、时间管理和备考分享内容，适合作为方法参考。",
        usage: "经验帖要结合自己的课程节奏筛选，不要照搬别人的作息。"
    },
    // 知乎学习方法检索 — 搜索高质量的学习经验问答
    // 各专业同学和老师们分享的学习心得和方法论
    // 参考多个不同角度的回答，综合形成自己的理解
    {
        id: "zhihu-study-search",
        title: "知乎学习方法检索",
        type: "博主推荐",
        format: "博主/账号",
        formatKey: "creator",
        platform: "知乎",
        category: "creator",
        url: "https://www.zhihu.com/search?q=%E5%AD%A6%E4%B9%A0%E6%96%B9%E6%B3%95&type=content",
        keywords: ["知乎", "学习方法", "经验", "问答", "博主"],
        description: "检索学习方法、专业学习和考试经验相关回答。",
        usage: "适合参考不同人的经验，但要保留判断，不把高赞回答当唯一答案。"
    },
    // CSDN — 中文最大的 IT 技术社区
    // 提供技术博客、问答和代码下载，覆盖各编程领域
    // 参考博客时注意发布时间和运行环境版本
    {
        id: "csdn-search",
        title: "CSDN 编程问题检索",
        type: "博主推荐",
        format: "博主/账号",
        formatKey: "creator",
        platform: "CSDN",
        category: "creator",
        url: "https://so.csdn.net/so/search?q=%E5%89%8D%E7%AB%AF",
        keywords: ["csdn", "编程", "博客", "问题", "教程"],
        description: "中文编程博客和问题检索入口，适合查找报错经验和教程文章。",
        usage: "参考博客时注意发布时间、环境版本和评论反馈。"
    },
    // 掘金 — 中文高质量技术社区
    // 前端、后端、算法和架构方向的优质文章较多
    // 适合课外拓展和项目实践经验的参考学习
    {
        id: "juejin",
        title: "掘金",
        type: "博主推荐",
        format: "博主/账号",
        formatKey: "creator",
        platform: "掘金",
        category: "creator",
        url: "https://juejin.cn/",
        keywords: ["掘金", "前端", "后端", "技术博客", "编程"],
        description: "中文技术社区，适合关注前端、后端、算法和项目经验文章。",
        usage: "适合课外拓展和项目实践，但要区分教程、经验和广告内容。"
    },

    // ========== 学习平台补充 ==========
    // 雨课堂 — 课堂互动与教学管理平台（学堂在线旗下）
    // CUPK 多门课程使用它进行签到、发布课件和布置作业
    // 绑定学校账号后一键登录，课后可查看课件和回放
    {
        id: "yuketang",
        title: "雨课堂",
        type: "教学平台",
        format: "网站/App",
        formatKey: "website",
        platform: "学堂在线",
        category: "course",
        url: "https://www.yuketang.cn/",
        keywords: ["雨课堂", "上课", "签到", "课件", "作业"],
        description: "课堂互动与教学管理平台，很多课程用它签到、发课件和布置作业。",
        usage: "绑定学校账号后，课上扫码签到，课后查看课件和回放。"
    },
    // 智慧树 — 在线通识课程学习与考试平台
    // 部分公选课和通识课在此完成线上学习和考试
    // 注意课程截止日期，不要等到最后一天突击刷课
    {
        id: "zhihuishu",
        title: "智慧树",
        type: "教学平台",
        format: "网站/App",
        formatKey: "website",
        platform: "智慧树",
        category: "course",
        url: "https://onlineweb.zhihuishu.com/onlinestuh5",
        keywords: ["智慧树", "网课", "公选课", "通识课", "学分"],
        description: "在线通识课程平台，部分公选课和通识课在这里完成学习和考试。",
        usage: "注意课程截止时间和考试时间，不要拖到最后一天刷课。"
    },
    // 头歌（Educoder）— 在线编程实训平台
    // CUPK 多门课程（操作系统、数据结构、算法等）的实验在此进行
    // 实验代码注意保留本地备份，截止时间前预留调试余量
    {
        id: "educoder",
        title: "头歌（Educoder）",
        type: "编程平台",
        format: "网站",
        formatKey: "website",
        platform: "头歌",
        category: "tool",
        url: "https://www.educoder.net/",
        keywords: ["头歌", "educoder", "编程", "实验", "操作系统", "算法"],
        description: "在线编程实训平台，CUPK多门课程（操作系统、算法等）在此完成实验。",
        usage: "实验代码注意保存本地备份，截止时间前留够调试时间。"
    },
    // 希冀信息类一体化教学平台 — 在线评测与实验环境
    // 支持在线编程、自动评测和作业管理功能
    // 提交前在本地充分调试，注意题目规定的输入输出格式
    {
        id: "educg",
        title: "希冀信息类一体化平台",
        type: "编程平台",
        format: "网站",
        formatKey: "website",
        platform: "希冀",
        category: "tool",
        url: "https://course.educg.net/",
        keywords: ["希冀", "编程", "实验", "在线评测", "CUPK"],
        description: "信息类专业在线教学与实验平台，支持在线编程、自动评测和作业管理。",
        usage: "提交前在本地调试通过，注意题目要求的输入输出格式。"
    },
    // 蓝桥云课（CUPK 专属入口）— 编程竞赛与实训平台
    // 校区已接入，用学校统一账号即可登录
    // 蓝桥杯备赛必用平台，也提供丰富的编程课程
    {
        id: "lanqiao-cupk",
        title: "蓝桥云课（CUPK入口）",
        type: "编程平台",
        format: "网站",
        formatKey: "website",
        platform: "蓝桥",
        category: "tool",
        url: "https://saas.lanqiao.cn/saas/cupk/student/overview/",
        keywords: ["蓝桥", "蓝桥杯", "算法", "编程竞赛", "CUPK"],
        description: "蓝桥云课CUPK专属入口，蓝桥杯备赛和编程实训平台。",
        usage: "校区已接入，用学校账号登录即可，蓝桥杯备赛必用。"
    },
    // PTA（拼题A）— 程序设计类课程常用在线评测平台
    // 收录大量编程题目，支持 C、C++、Java、Python 等语言
    // 数据结构、算法课的作业和考试常在此进行，建议多刷题
    {
        id: "pintia",
        title: "PTA 程序设计辅助平台",
        type: "编程平台",
        format: "网站",
        formatKey: "website",
        platform: "拼题A",
        category: "tool",
        url: "https://pintia.cn/",
        keywords: ["PTA", "拼题A", "编程", "题库", "算法", "考试"],
        description: "程序设计类课程常用的在线评测平台，含大量编程题库和真题。",
        usage: "数据结构、算法课的作业和考试常在这里，建议多刷题库练习。"
    },

    // ========== AI 工具扩展 ==========
    // 通义千问 — 阿里巴巴出品的 AI 对话助手
    // 擅长长文档分析，可直接上传 PDF 让 AI 总结和问答
    // 适合阅读论文和整理资料，能快速提取文档要点
    {
        id: "qianwen",
        title: "通义千问",
        type: "AI工具",
        format: "网站/App",
        formatKey: "website",
        platform: "阿里",
        category: "ai",
        url: "https://www.qianwen.com/",
        keywords: ["通义千问", "阿里", "AI问答", "文档分析", "长文本"],
        description: "阿里旗下AI助手，擅长长文档分析和中文对话，有代码和写作能力。",
        usage: "上传PDF或长文档让它总结和问答，适合阅读论文和整理资料。"
    },
    // 智谱清言 — 智谱 AI 推出的智能对话助手
    // 支持代码生成、AI 绘图和联网搜索等功能
    // 代码生成和算法讲解能力较强，适合辅助编程学习
    {
        id: "chatglm",
        title: "智谱清言",
        type: "AI工具",
        format: "网站/App",
        formatKey: "website",
        platform: "智谱AI",
        category: "ai",
        url: "https://chatglm.cn/",
        keywords: ["智谱清言", "chatglm", "AI问答", "代码", "绘图"],
        description: "智谱AI出品的智能助手，支持代码生成、AI绘图和联网搜索。",
        usage: "它的代码生成能力不错，适合辅助编程和算法题讲解。"
    },
    // 秘塔 AI 搜索 — 无广告直达答案的搜索引擎
    // 支持学术搜索和深度研究模式，不收录广告内容
    // 做课程论文和文献调研时，学术模式比传统搜索效率更高
    {
        id: "metaso",
        title: "秘塔AI搜索",
        type: "AI工具",
        format: "网站",
        formatKey: "website",
        platform: "秘塔科技",
        category: "ai",
        url: "https://metaso.cn/",
        keywords: ["秘塔", "AI搜索", "学术搜索", "深度研究", "无广告"],
        description: "AI驱动的搜索引擎，无广告直达答案，支持学术搜索和深度研究模式。",
        usage: "做课程论文和文献调研时，开启学术模式比传统搜索效率高很多。"
    },
    // 硅基流动（SiliconCloud）— 一站式大模型 API 服务平台
    // 汇集 Llama、Qwen 等多种开源模型，按量计费
    // 开发和课程项目中需要调用 AI 能力时，模型全、价格低
    {
        id: "siliconflow",
        title: "硅基流动 (SiliconCloud)",
        type: "AI平台",
        format: "网站",
        formatKey: "website",
        platform: "硅基流动",
        category: "ai",
        url: "https://cloud.siliconflow.cn/",
        keywords: ["硅基流动", "API", "大模型", "AI开发", "模型调用"],
        description: "一站式大模型API服务平台，汇集多种开源模型，适合AI应用开发。",
        usage: "开发和课程项目中需要调用大模型API时，这里模型全、价格低。"
    },
    // 扣子（Coze）— 字节跳动出品的 AI Bot 搭建平台
    // 可零代码搭建专属 AI 助手，支持知识库和插件扩展
    // 可把课件资料喂给 Bot，打造个人学习问答助手
    {
        id: "coze",
        title: "扣子（Coze）AI办公空间",
        type: "AI工具",
        format: "网站/App",
        formatKey: "website",
        platform: "字节跳动",
        category: "ai",
        url: "https://www.coze.cn/",
        keywords: ["扣子", "coze", "AI助手", "自动化", "Bot"],
        description: "字节跳动出品的AI Bot搭建平台，可创建专属AI助手和自动化工作流。",
        usage: "适合搭建学习助手Bot，把课件资料喂给它，随时问答。"
    },
    // MarsCode — 字节跳动的 AI 编程助手
    // 支持代码自动补全、解释、错误定位和多语言翻译
    // 写代码时辅助提效，支持多种主流 IDE 和编程语言
    {
        id: "marscode",
        title: "豆包 MarsCode",
        type: "AI工具",
        format: "网站",
        formatKey: "website",
        platform: "字节跳动",
        category: "ai",
        url: "https://www.marscode.cn/",
        keywords: ["marscode", "豆包", "编程助手", "代码补全", "AI编程"],
        description: "字节跳动的AI编程助手，支持代码补全、解释、Debug和多语言。",
        usage: "写大作业和项目时辅助编程，支持多种语言，响应速度快。"
    },

    // ========== 科研工具补充 ==========
    // Sci-Hub — 学术论文免费获取工具
    // 输入论文 DOI 即可绕过付费墙下载全文 PDF
    // 镜像站地址可能随封锁变动，搜索最新可用地址使用
    {
        id: "sci-hub",
        title: "Sci-Hub",
        type: "科研工具",
        format: "网站",
        formatKey: "website",
        platform: "Sci-Hub",
        category: "search",
        url: "https://www.sci-hub.ee/",
        keywords: ["sci-hub", "论文", "文献下载", "DOI", "免费"],
        description: "学术论文免费下载工具，输入DOI即可获取付费论文全文。",
        usage: "找到论文DOI后粘贴到搜索框即可下载，镜像站地址可能变动。"
    },
    // Connected Papers — 学术论文关系图谱可视化工具
    // 输入一篇核心论文，自动生成关联论文图谱
    // 文献调研时快速了解某个研究方向的发展和关键文献
    {
        id: "connected-papers",
        title: "Connected Papers",
        type: "科研工具",
        format: "网站",
        formatKey: "website",
        platform: "Connected Papers",
        category: "search",
        url: "https://www.connectedpapers.com/",
        keywords: ["connected papers", "文献图谱", "论文关系", "文献调研"],
        description: "学术论文关系图谱工具，可视化展示论文之间的引用关系和关联研究。",
        usage: "找论文时输入一篇关键文献，可以快速看到整个研究方向的全貌。"
    },
    // Z-Library（Z-Lib）— 全球最大的电子图书馆之一
    // 收藏数千万册电子书和学术文章，可免费下载
    // 搜索英文原版教材和计算机类书籍特别方便，注意版权合规
    {
        id: "z-lib",
        title: "Z-Library 电子图书馆",
        type: "资料检索",
        format: "网站",
        formatKey: "website",
        platform: "Z-Library",
        category: "search",
        url: "https://zh.z-lib.gd/",
        keywords: ["z-library", "电子书", "教材", "下载", "免费"],
        description: "全球最大的电子图书馆之一，可免费下载大量教材和专业书籍。",
        usage: "搜英文原版教材和计算机类书籍特别方便，注意版权合规使用。"
    },
    // 学之策学术导航 — 科研工具聚合导航站
    // 汇集文献检索、论文写作、数据可视化和科研协作工具入口
    // 一站式找到各类科研工具，节省来回搜索网址的时间
    {
        id: "xuezhice",
        title: "学之策学术导航",
        type: "科研工具",
        format: "网站",
        formatKey: "website",
        platform: "学之策",
        category: "search",
        url: "https://www.xuezhice.com/practical-tools/index",
        keywords: ["学之策", "学术导航", "科研工具", "文献管理", "论文写作"],
        description: "学术科研工具聚合导航站，汇集文献检索、论文写作、数据可视化等工具。",
        usage: "一站式找到各种科研工具，省去到处搜索工具网址的时间。"
    },

    // ========== 开发与实用工具 ==========
    // AcWing 算法学习平台 — 算法与数据结构学习社区
    // 课程体系完整，从语法基础到竞赛算法全覆盖
    // 配合学校算法课程，学完一个知识点就去刷对应的题目
    {
        id: "acwing",
        title: "AcWing 算法学习平台",
        type: "编程平台",
        format: "网站",
        formatKey: "website",
        platform: "AcWing",
        category: "tool",
        url: "https://www.acwing.com/",
        keywords: ["acwing", "算法", "数据结构", "刷题", "竞赛"],
        description: "算法学习与刷题平台，课程体系完整，从基础到竞赛全覆盖。",
        usage: "配合算法课学习，每学一个知识点就去刷对应的题目巩固。"
    },
    // Learn Git Branching — 交互式 Git 学习工具
    // 通过可视化关卡游戏的方式学习分支、合并、rebase 等概念
    // 在浏览器中一步步操作，比看纯文字教程直观很多
    {
        id: "git-branching",
        title: "Learn Git Branching",
        type: "教程",
        format: "网站",
        formatKey: "website",
        platform: "开源项目",
        category: "tool",
        url: "https://learngitbranching.js.org/?locale=zh_CN",
        keywords: ["git", "分支", "版本控制", "可视化", "教程"],
        description: "交互式Git学习工具，通过可视化关卡理解分支、合并、rebase等概念。",
        usage: "跟着关卡一步步操作，比看文字教程直观太多，Git新手强烈推荐。"
    },
    // JSON 在线视图 — JSON 数据的格式化与校验工具
    // 自动格式化 JSON 字符串，支持树形视图和压缩视图
    // 调试后端 API 返回数据时，粘贴进去就能看结构
    {
        id: "bejson",
        title: "JSON在线视图工具",
        type: "开发工具",
        format: "网站",
        formatKey: "website",
        platform: "BeJSON",
        category: "tool",
        url: "https://www.bejson.com/jsonviewernew/",
        keywords: ["json", "格式化", "在线工具", "数据", "API"],
        description: "在线JSON格式化、校验和可视化工具，适合调试API返回的JSON数据。",
        usage: "复制JSON字符串进去自动格式化，支持树形视图方便查看结构。"
    },
    // 正则表达式在线测试工具（MKLab）
    // 输入正则和测试文本，实时高亮显示匹配结果
    // 调试正则表达式时边写边测，大幅提高开发效率
    {
        id: "mklab-regex",
        title: "正则表达式在线测试",
        type: "开发工具",
        format: "网站",
        formatKey: "website",
        platform: "MKLab",
        category: "tool",
        url: "https://www.mklab.cn/utils/regex",
        keywords: ["正则表达式", "regex", "匹配", "测试", "文本处理"],
        description: "在线正则表达式测试工具，实时显示匹配结果，适合学习和调试正则。",
        usage: "写正则时边写边测，不用反复运行程序，效率高很多。"
    },
    // 奇妙工具箱 — 多功能在线工具集合
    // 包含图片处理、格式转换、编码解码、时间戳转换等常用功能
    // 需要快速处理文件或数据格式时，不用安装软件直接在线搞定
    {
        id: "magicalbox",
        title: "奇妙工具箱",
        type: "实用工具",
        format: "网站",
        formatKey: "website",
        platform: "奇妙工具",
        category: "tool",
        url: "https://www.magicalbox.cn/",
        keywords: ["工具箱", "在线工具", "图片处理", "格式转换", "实用"],
        description: "一站式在线工具集合，包含图片处理、格式转换、编码解码等。",
        usage: "需要处理图片或转换文件格式时，不用装软件，网页端一键搞定。"
    },
    // 考试酷 — 永久免费的在线考试与题库平台
    // 收录大量学科试卷和习题，支持在线自测和评分
    // 考前搜索相关课程的公开试卷做自测，有效查漏补缺
    {
        id: "examcoo",
        title: "考试酷（在线题库）",
        type: "学习平台",
        format: "网站",
        formatKey: "website",
        platform: "考试酷",
        category: "exam",
        url: "https://www.examcoo.com/",
        keywords: ["考试酷", "题库", "试卷", "自测", "练习"],
        description: "永久免费的在线考试与题库平台，含大量公开试卷和习题。",
        usage: "考前搜索相关课程的公开试卷做自测，查漏补缺。"
    },
    // 实习僧 — 大学生专属实习与校招求职平台
    // 提供各行业实习岗位和应届生校招信息
    // 大二暑假即可开始投递简历，越早积累经历越有优势
    {
        id: "shixiseng",
        title: "实习僧",
        type: "求职招聘",
        format: "网站/App",
        formatKey: "website",
        platform: "实习僧",
        category: "tool",
        url: "https://www.shixiseng.com/",
        keywords: ["实习僧", "实习", "校招", "求职", "暑期实习"],
        description: "大学生实习与校招求职平台，汇集各行业实习和应届生岗位。",
        usage: "大二暑假就可以开始投实习，越早积累经历越有优势。"
    },
    // 自由字体 — 免费可商用中文字体下载站
    // 提供思源系列、站酷系列等高质量免费字体
    // 做 PPT 和网页时选用专业字体，视觉效果立竿见影
    {
        id: "ziyouziti",
        title: "自由字体（免费商用字体）",
        type: "资源",
        format: "网站",
        formatKey: "website",
        platform: "自由字体",
        category: "design",
        url: "https://ziyouziti.com/",
        keywords: ["字体", "免费商用", "中文", "设计", "排版"],
        description: "免费可商用中文字体下载站，做PPT、海报、网页设计都适用。",
        usage: "做课程展示和项目汇报时，换一套好看的字体，视觉档次瞬间提升。"
    }
];
