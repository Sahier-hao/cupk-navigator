/**
 * share.js —— 共享学习资源页面逻辑
 * ======================================================
 * 本文件为"学习资源共享"页面（share.html）的专属 JavaScript 逻辑。
 *
 * 功能概述：
 *   1. 提供"资料库"浏览页面，展示所有用户上传的共享学习资料（笔记、试卷、课件等）
 *   2. 支持按资料类型（笔记/试卷/课件/习题答案/实验报告）进行侧边栏分类筛选
 *   3. 支持关键词搜索（标题/课程/描述/类型），防抖处理提升性能
 *   4. 提供模拟文件上传功能（因纯静态前端，文件选择为模拟交互）
 *   5. 点击下载按钮模拟下载行为，累加下载次数
 *   6. 显示统计信息：资料总数、累计下载次数、当前筛选结果数
 *   7. 内置 6 条种子数据，首次加载时自动填充，方便演示
 *
 * 数据存储：
 *   localStorage key: shiguang_share
 *   数据上限：200 条（由 MAX_ITEMS 控制）
 *   优先使用 window.ShiguangStore 封装，否则降级为原生 localStorage
 *
 * 安全与边界处理：
 *   - HTML 转义使用 window.shiguangEscapeHtml（common.js 提供）
 *   - 资料名称必填校验，未选文件时阻止提交
 *   - 已达存储上限时提示用户
 *   - 下载计数为整数，不存在时默认为 0
 *
 * 依赖关系（加载顺序不可变）：
 *   storage.js → common.js → share.js （需在 share.html 中按此顺序引入）
 */
(function () {
  /* ---- 常量与状态变量定义 ---- */
  // localStorage 存储键名，所有资料数据存储于此键下
  var KEY = "shiguang_share";
  // 资料存储上限，达到此数量后不再允许上传新资料
  var MAX_ITEMS = 200;
  // 当前选中的分类筛选条件，"all" 表示显示全部类型
  var currentType = "all";
  // 当前搜索关键词（小写），由搜索输入框实时更新
  var keyword = "";
  // 模拟上传时选中的文件名，提交资料时写入记录中；null 表示未选择文件
  var mockFileName = null;

  /* ---- 数据持久化：加载与保存 ---- */
  /**
   * 从存储中加载所有共享资料数据
   * 优先使用 window.ShiguangStore 封装（由 storage.js 提供），
   * 降级时直接从 localStorage 读取 JSON 并解析为数组。
   * @returns {Array} 资料对象数组，存储为空或异常时返回空数组
   */
  function load() {
    if (window.ShiguangStore) return window.ShiguangStore.load(KEY);
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; }
  }
  /**
   * 将资料数据数组持久化写入存储
   * 优先使用 ShiguangStore 封装，降级时序列化为 JSON 写入 localStorage。
   * @param {Array} data - 待保存的资料对象数组
   */
  function save(data) {
    if (window.ShiguangStore) { window.ShiguangStore.save(KEY, data); return; }
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
  }
  // HTML 转义函数：优先采用 common.js 提供的 shiguangEscapeHtml，否则返回原字符串
  var esc = window.shiguangEscapeHtml || function (s) { return String(s); };

  /* ---- 种子数据初始化 ---- */
  // 首次访问时（存储为空），自动填充 6 条示例学习资料，
  // 涵盖笔记、试卷、课件、习题答案、实验报告等类型，方便用户直观体验页面功能。
  if (!load().length) {
    save([
      // 第1条：高等数学A（一）期末复习笔记 —— 涵盖极限、导数等章节，手写扫描版
      { id:"s_seed1", title:"高等数学A（一）期末复习笔记", course:"高等数学A（一）", type:"笔记", description:"涵盖极限、导数、微分中值定理、不定积分等章节的复习要点和典型例题，手写扫描版。", fileName:"高数A期末笔记.pdf", fileSize:"3.2MB", nickname:"大二数学系", password:"123", createdAt:"2026-06-05T14:00:00", downloads:128 },
      // 第2条：英语四级真题试卷及答案，含听力原文和完整解析
      { id:"s_seed2", title:"2025年12月四级真题+答案", course:"大学英语", type:"试卷", description:"2025年12月CET4真题，含听力原文和完整答案详解。", fileName:"2025-12-CET4.pdf", fileSize:"8.5MB", nickname:"英语学霸", password:"123", createdAt:"2026-06-03T10:00:00", downloads:256 },
      // 第3条：数据结构期末复习提纲，含重点算法和常见题型归纳
      { id:"s_seed3", title:"数据结构期末复习提纲", course:"数据结构", type:"笔记", description:"重点算法整理、时间复杂度对比、常见题型归纳。", fileName:"数据结构提纲.pdf", fileSize:"1.8MB", nickname:"计算机大三", password:"123", createdAt:"2026-06-07T20:00:00", downloads:89 },
      // 第4条：大学物理实验报告模板合集，覆盖力学/热学/电磁学12个实验
      { id:"s_seed4", title:"大学物理实验报告合集", course:"大学物理实验", type:"实验报告", description:"包含力学、热学、电磁学共12个实验的完整报告模板，可直接参考格式。", fileName:"大物实验报告合集.docx", fileSize:"4.1MB", nickname:"物理课代表", password:"123", createdAt:"2026-06-01T16:00:00", downloads:167 },
      // 第5条：线性代数课后习题答案（同济版），奇数题手写详细解答
      { id:"s_seed5", title:"线性代数课后习题答案", course:"线性代数", type:"习题答案", description:"同济版线性代数课后习题奇数题详细解答过程，手写版。", fileName:"线代习题答案.pdf", fileSize:"5.6MB", nickname:"线代小王子", password:"123", createdAt:"2026-06-06T09:00:00", downloads:203 },
      // 第6条：C语言程序设计整学期课件合集，含课堂例题和课后作业
      { id:"s_seed6", title:"C语言程序设计课件汇总", course:"C语言程序设计", type:"课件", description:"整学期全部课件PPT合集，含课堂例题和课后作业。", fileName:"C语言课件.pptx", fileSize:"12.3MB", nickname:"课代表", password:"123", createdAt:"2026-06-08T11:00:00", downloads:145 },
    ]);
  }

  /* ---- 资料类型与图标映射 ---- */
  // 每种资料类型对应一个 Emoji 图标，用于在资料卡片左侧展示
  var typeIcons = {
    "笔记": "📝", "试卷": "📄", "课件": "📊", "习题答案": "📐", "实验报告": "🔬", "其他": "📌"
  };

  /**
   * 根据资料类型名称获取对应的 Emoji 图标
   * 若类型不在映射表中，返回默认的 📎（回形针）图标
   * @param {string} t - 资料类型（如 "笔记"、"试卷"）
   * @returns {string} 对应的 Emoji 字符
   */
  function getIcon(t) { return typeIcons[t] || "📎"; }

  /* ---- 核心渲染函数：筛选、排序、生成 DOM ---- */
  /**
   * render —— 根据当前筛选条件和搜索关键词，重新渲染整个资料列表和统计面板
   * 每次调用都会重新从存储加载数据、执行过滤、排序，生成 HTML 后注入 DOM，
   * 并重新为下载按钮绑定点击事件。
   * 调用时机：页面初始化、切换分类、输入搜索关键词、上传新资料、下载资料后
   */
  function render() {
    // 从存储加载全部资料数据
    var items = load();
    // 读取搜索输入框中的关键词，忽略首尾空白并转为小写（大小写不敏感匹配）
    keyword = (document.getElementById("shareSearch") || {}).value || "";
    keyword = keyword.trim().toLowerCase();

    // ---- 筛选逻辑：按分类 + 关键词双重过滤 ----
    var filtered = items.filter(function (it) {
      // 若当前分类不为 "all"，则只保留类型一致的资料
      if (currentType !== "all" && it.type !== currentType) return false;
      // 若有搜索关键词，在标题、课程名、描述、类型的拼接字符串中检索（不区分大小写）
      if (keyword && (it.title + it.course + it.description + it.type).toLowerCase().indexOf(keyword) < 0) return false;
      return true;
    });
    // 按创建时间降序排列，最新的资料显示在最前面
    filtered.sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });

    // ---- 渲染顶部统计信息 ----
    var statsEl = document.getElementById("shareStats");
    // 使用 reduce 累加所有资料的下载次数（不存在时按 0 处理）
    var totalDL = items.reduce(function (s, it) { return s + (it.downloads || 0); }, 0);
    statsEl.innerHTML =
      '<span class="share-stat">共 <strong>' + items.length + '</strong> 份资料</span>' +
      '<span class="share-stat">累计下载 <strong>' + totalDL + '</strong> 次</span>' +
      // 仅在启用了筛选或搜索时显示"当前筛选 N 条"提示
      (keyword || currentType !== "all" ? '<span class="share-stat">当前筛选 <strong>' + filtered.length + '</strong> 条</span>' : '');

    // ---- 渲染资料卡片列表 ----
    var listEl = document.getElementById("shareList");
    // 筛选结果为空时显示空状态提示，鼓励用户上传
    if (!filtered.length) {
      listEl.innerHTML = '<div class="share-empty"><strong>暂无资料</strong><p>成为第一个上传学习资料的同学吧！</p></div>';
      return;
    }

    // 将筛选后的资料数组映射为卡片 HTML，join 为完整字符串后一次性注入，减少 DOM 操作次数
    listEl.innerHTML = filtered.map(function (it) {
      // 将 ISO 格式时间戳转换为本地化日期字符串（如 "2026/6/10"）
      var dateStr = new Date(it.createdAt).toLocaleDateString("zh-CN");
      return '<div class="share-card">' +
        // 左侧：资料类型的 Emoji 图标
        '<div class="share-icon">' + getIcon(it.type) + '</div>' +
        '<div class="share-body">' +
        // 标题（已转义）
        '<h3>' + esc(it.title) + '</h3>' +
        // 描述文本，超出 80 字符时截断并追加省略号
        '<p>' + esc(it.description).slice(0, 80) + (it.description.length > 80 ? '…' : '') + '</p>' +
        // 元信息行：类型标签、课程名称、日期、上传者、下载次数、文件大小
        '<div class="share-meta">' +
        '<span class="tag">' + esc(it.type) + '</span>' +
        '<span>' + esc(it.course) + '</span>' +
        '<span>📅 ' + dateStr + '</span>' +
        '<span>👤 ' + esc(it.nickname || "匿名") + '</span>' +
        '<span>⬇ ' + (it.downloads || 0) + '</span>' +
        '<span>' + esc(it.fileSize) + '</span>' +
        '</div></div>' +
        // 下载按钮，使用 data-share-dl 属性存储资料 ID 供事件委托使用
        '<button class="share-dl-btn" data-share-dl="' + it.id + '">⬇ 下载</button>' +
        '</div>';
    }).join("");

    // ---- 为所有下载按钮绑定点击事件 ----
    document.querySelectorAll("[data-share-dl]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        // 从按钮的 data-share-dl 属性获取资料 ID
        var id = btn.dataset.shareDl;
        var all = load();
        // 在全部资料中查找对应项（使用 find 找到第一个匹配项即可）
        var item = all.find(function (it) { return it.id === id; });
        if (!item) return;
        // 下载次数 +1 并保存回存储
        item.downloads = (item.downloads || 0) + 1;
        save(all);
        // 弹出模拟下载提示 Toast，2.5 秒后自动消失
        var toast = document.createElement("div");
        toast.style.cssText = "position:fixed;bottom:20px;right:20px;z-index:999;padding:14px 22px;border-radius:var(--radius-lg);background:var(--success);color:#fff;font-size:14px;font-weight:600;font-family:inherit;box-shadow:0 8px 24px rgba(0,0,0,0.15);animation:fadeInUp 0.3s ease;";
        toast.textContent = "✅ 正在下载 " + esc(item.fileName) + "…（模拟）";
        document.body.appendChild(toast);
        // 定时移除 Toast 元素，避免 DOM 垃圾堆积
        setTimeout(function () { toast.remove(); }, 2500);
        // 重新渲染列表以更新下载次数的显示
        render();
      });
    });
  }

  /* ---- 上传弹窗与模拟文件选择 ---- */
  // 获取上传弹窗 DOM 元素，用于展示/隐藏资料上传表单
  var modal = document.getElementById("uploadModal");
  // 获取文件选择区域 DOM 元素，点击后模拟选择文件
  var uploadZone = document.getElementById("uploadZone");
  // 模拟文件列表：静态前端无法真正上传文件，因此提供一组预设文件名和大小供随机选择
  var mockFiles = [
    { name: "期末复习笔记.pdf", size: "2.8MB" },
    { name: "课程课件PPT.pptx", size: "6.5MB" },
    { name: "历年真题合集.pdf", size: "10.1MB" },
    { name: "实验报告模板.docx", size: "1.4MB" },
    { name: "习题详细解答.pdf", size: "3.7MB" },
    { name: "课程笔记整理.pdf", size: "4.2MB" },
  ];

  // 点击文件选择区：从 mockFiles 中随机选取一个文件作为"已选择"的模拟文件
  uploadZone.addEventListener("click", function () {
    // 从模拟文件列表中随机选取一个
    var pick = mockFiles[Math.floor(Math.random() * mockFiles.length)];
    mockFileName = pick.name;                         // 记录选中的文件名，供提交时使用
    // 显示文件信息区域，告知用户当前选择的模拟文件
    document.getElementById("fileInfo").style.display = "block";
    document.getElementById("fileInfo").textContent = "📎 " + pick.name + "（" + pick.size + "）—— 模拟文件";
    document.getElementById("uploadHint").textContent = "📁 点击换一个文件";
    uploadZone.classList.add("has-file");             // 添加样式标记，改变视觉状态
  });

  // 点击"上传资料"按钮：重置表单并打开上传弹窗
  document.getElementById("btnUpload").addEventListener("click", function () {
    // 清空表单各输入字段
    document.getElementById("shareTitle").value = "";
    document.getElementById("shareCourse").value = "";
    document.getElementById("shareDesc").value = "";
    document.getElementById("sharePwd").value = "";
    mockFileName = null;                              // 重置文件选择状态
    document.getElementById("fileInfo").style.display = "none";        // 隐藏文件信息
    document.getElementById("uploadHint").textContent = "📁 点击选择文件（模拟上传）";
    uploadZone.classList.remove("has-file");          // 移除已选文件的视觉样式
    clearErrors();                                    // 清除之前的表单验证错误提示
    modal.classList.add("show");                      // 显示上传弹窗
  });

  // 点击"取消"按钮：关闭上传弹窗
  document.getElementById("btnUploadCancel").addEventListener("click", function () {
    modal.classList.remove("show");
  });
  // 点击弹窗背景蒙层（modal 自身）：关闭弹窗，提升用户体验
  modal.addEventListener("click", function (e) {
    if (e.target === modal) modal.classList.remove("show");
  });

  /**
   * showError —— 在指定输入框下方显示红色错误提示文字
   * 将输入框边框变为珊瑚色（var(--coral)），并在其下方插入或更新 .field-error 元素
   * @param {string} inputId - 目标输入框的 DOM id
   * @param {string} msg - 错误提示信息文本
   */
  function showError(inputId, msg) {
    var el = document.getElementById(inputId);
    if (!el) return;                                // 对应元素不存在时静默跳过
    el.style.borderColor = "var(--coral)";          // 将输入框边框标红提示
    var next = el.nextElementSibling;
    // 若下一个兄弟元素已经是错误提示，则复用该元素仅更新文本内容
    if (next && next.classList.contains("field-error")) {
      next.textContent = msg;
    } else {
      // 否则新建一个 .field-error 元素插入到输入框之后
      var err = document.createElement("span");
      err.className = "field-error";
      err.style.cssText = "color:var(--coral);font-size:12px;margin-top:2px;display:block;";
      err.textContent = msg;
      el.parentNode.insertBefore(err, el.nextSibling);
    }
  }
  /**
   * clearErrors —— 清除上传弹窗内的所有表单验证错误提示
   * 移除所有 .field-error 元素，并将输入框边框恢复默认颜色
   */
  function clearErrors() {
    document.querySelectorAll("#uploadModal .field-error").forEach(function (e) { e.remove(); });
    ["shareTitle"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.style.borderColor = "";
    });
  }

  // 点击"提交"按钮：校验表单、构造资料对象、保存并刷新列表
  document.getElementById("btnUploadSubmit").addEventListener("click", function () {
    clearErrors();                                  // 先清除旧错误提示
    var title = document.getElementById("shareTitle").value.trim();
    // 资料名称为必填项，为空时显示错误并阻止提交
    if (!title) { showError("shareTitle", "请填写资料名称"); return; }
    // 必须先在文件选择区选择一个模拟文件才能提交
    if (!mockFileName) {
      alert("请先点击文件选择区，选择一个模拟文件。");
      return;
    }
    var items = load();
    // 检查是否达到存储上限，超限时提示用户
    if (items.length >= MAX_ITEMS) { alert("资料已达上限（" + MAX_ITEMS + "）。"); return; }

    // 在 mockFiles 中查找与当前选中文件名匹配的项，获取其文件大小
    var pick = mockFiles.find(function (f) { return f.name === mockFileName; });
    // 构造新的资料对象并追加到数组尾部
    items.push({
      id: "s_" + Date.now(),                       // 以当前时间戳生成唯一 ID，避免冲突
      title: title,                                 // 资料标题（必填，已校验）
      course: document.getElementById("shareCourse").value.trim() || "未分类",  // 课程名，为空时默认"未分类"
      type: document.getElementById("shareType").value,  // 资料类型，来自下拉选择框
      description: document.getElementById("shareDesc").value.trim(),  // 详细描述
      fileName: mockFileName,                       // 模拟文件名
      fileSize: pick ? pick.size : "未知",          // 文件大小，未匹配到时显示"未知"
      nickname: window.AppUser ? window.AppUser.getNickname() || "匿名" : "匿名",  // 用户昵称，优先取登录用户
      password: document.getElementById("sharePwd").value.trim() || "123456",     // 管理密码，用于后续删除/编辑
      createdAt: new Date().toISOString(),           // 当前时间 ISO 格式
      downloads: 0                                  // 新资料下载次数从 0 开始
    });
    save(items);                                    // 写入存储
    modal.classList.remove("show");                 // 关闭弹窗
    render();                                       // 重新渲染列表以显示新资料
  });

  /* ---- 侧边栏分类筛选 ---- */
  // 监听所有 data-share-type 属性按钮的点击事件，切换资料分类
  document.querySelectorAll("[data-share-type]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      // 更新当前选中的分类值
      currentType = btn.dataset.shareType;
      // 移除所有分类按钮的 active 状态，再为当前点击的按钮添加 active 高亮
      document.querySelectorAll("[data-share-type]").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      render();                                     // 重新渲染列表
    });
  });

  /* ---- 关键词搜索（带防抖） ---- */
  // 监听搜索输入框的 input 事件，实时过滤资料列表
  var searchEl = document.getElementById("shareSearch");
  if (searchEl) {
    // 使用 common.js 提供的 shiguangDebounce 进行防抖（300ms），
    // 避免每次按键都触发重渲染；若未提供则直接执行
    var debounced = (window.shiguangDebounce || function (fn) { return fn; })(render, 300);
    searchEl.addEventListener("input", function () { debounced(); });
  }

  /* ---- 初始化渲染 ---- */
  // DOM 准备就绪后，执行首次渲染，展示全部资料列表
  render();
})();
