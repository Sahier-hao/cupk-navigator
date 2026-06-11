/**
 * forum.js —— 互助论坛页面逻辑
 *
 * 功能：发布帖子、分类筛选、关键词搜索、帖子详情查看、回复、删除
 * 数据通过 localStorage 持久化（key: shiguang_forum，上限 200 条）
 * 依赖：window.AppUser（用户昵称）、window.ShiguangStore（存储封装）、
 *       window.shiguangEscapeHtml（XSS 过滤）、window.shiguangDebounce（防抖）
 */
(function () {
  /* 论坛数据存储 key 及上限 */
  var KEY = "shiguang_forum";
  var MAX_ITEMS = 200;
  /* 当前筛选状态：分类筛选、关键词搜索、详情视图、删除目标 */
  var currentCat = "all";
  var keyword = "";
  var detailPostId = null;
  var deleteTargetId = null;

  /**
   * 从 localStorage 加载论坛帖子列表
   * 优先使用 ShiguangStore 封装，降级使用原生 localStorage
   * @returns {Array} 帖子数组
   */
  function load() {
    if (window.ShiguangStore) return window.ShiguangStore.load(KEY);
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; }
  }
  /**
   * 保存帖子列表到 localStorage
   * @param {Array} data - 帖子数组
   */
  function save(data) {
    if (window.ShiguangStore) { window.ShiguangStore.save(KEY, data); return; }
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
  }

  /* HTML 转义函数，用于安全渲染用户输入内容 */
  var escapeH = window.shiguangEscapeHtml || function (s) { return String(s); };

  /* 获取页面中论坛模块的主要 DOM 元素引用 */
  var mainEl = document.getElementById("forumMain");
  var modalEl = document.getElementById("fmModal");
  var deleteModalEl = document.getElementById("fmDeleteModal");

  /* 首次加载（数据为空）时写入种子示例数据 */
  /*
   * 种子数据包含 5 条覆盖不同分类的帖子
   * 每条帖子包含：标题、内容、分类、昵称、管理密码、创建时间和回复列表
   * 第 1 条：学习互助 —— 高数期末复习疑问，有两条学长回复
   * 第 2 条：二手交易 —— 数据结构教材转让，包含交易对话
   * 第 3 条：校园活动 —— 蓝桥杯组队招募，有组队讨论
   * 第 4 条：求助问答 —— 校园网故障咨询
   * 第 5 条：吹水闲聊 —— 周末游玩推荐合集
   */
  if (!load().length) {
    var seedData = [
      { id: "p_seed1", title: "求问：高数期末重点是什么？", content: "听说今年换老师了，有没有学长学姐知道高数下期末考试重点考哪些章节呀？极限和导数考得多还是积分考得多？有往年试卷参考吗？感谢！", category: "学习互助", nickname: "大一新生", password: "123", createdAt: "2026-06-07T20:15:00", replies: [{ id: "r_seed1", content: "重点看多元函数微分和重积分，曲线曲面积分一般考一道大题。往年题可以去图书馆三楼资料室翻翻。", nickname: "大二学长", createdAt: "2026-06-07T21:30:00" }, { id: "r_seed2", content: "建议把课后习题的奇数题都做一遍，考试题型和课后题很像。", nickname: "过来人", createdAt: "2026-06-08T08:10:00" }] },
      { id: "p_seed2", title: "二手：出《数据结构（C语言版）》几乎全新", content: "上学期买的，就翻了几页，基本全新。原价49，现在25出。可以C5餐厅面交。", category: "二手交易", nickname: "计算机大三", password: "123", createdAt: "2026-06-06T12:00:00", replies: [{ id: "r_seed3", content: "还在吗？我要了，明天中午C5可以吗？", nickname: "大一软件", createdAt: "2026-06-06T13:20:00" }, { id: "r_seed4", content: "已出，谢谢大家。", nickname: "计算机大三", createdAt: "2026-06-07T10:00:00" }] },
      { id: "p_seed3", title: "组队：有没有一起参加蓝桥杯的同学", content: "打算参加下一届蓝桥杯C/C++组，想找两三个队友一起刷题互相督促。目前我在刷AcWing的算法基础课，进度到动态规划了。有兴趣的同学留个言，我们可以建个群。", category: "校园活动", nickname: "ACM预备役", password: "123", createdAt: "2026-06-05T16:45:00", replies: [{ id: "r_seed5", content: "我我我！Java组的可以吗？", nickname: "Java爱好者", createdAt: "2026-06-05T17:30:00" }, { id: "r_seed6", content: "建议去加学校的ACM社团群，里面有很多备赛资源。", nickname: "老油条", createdAt: "2026-06-06T09:00:00" }] },
      { id: "p_seed4", title: "求助：校园网连不上了怎么办", content: "今天下午开始宿舍的校园网一直连不上，重启了路由器也没用。有没有人遇到同样的问题？该怎么解决？", category: "求助问答", nickname: "断网少年", password: "123", createdAt: "2026-06-08T15:00:00", replies: [{ id: "r_seed7", content: "试试访问 campus.cupk.edu.cn 融合门户，里面有个网络报修入口。或者直接打网络中心电话 0990-6633086。", nickname: "网络管理员", createdAt: "2026-06-08T15:30:00" }] },
      { id: "p_seed5", title: "克拉玛依周末去哪玩——个人推荐合集", content: "来克校区一年了，整理一下亲测好玩的：\n1. 黑油山——离学校最近，打车15分钟，适合傍晚去拍照\n2. 世界魔鬼城——稍微远一点但很壮观，建议包车去\n3. 九龙潭——市区公园，免费，适合周末放松\n4. 汇嘉时代广场——克市最大的商场，有电影院\n\n大家有补充的吗？", category: "吹水闲聊", nickname: "旅游达人", password: "123", createdAt: "2026-06-04T19:00:00", replies: [{ id: "r_seed8", content: "补充：学校对面的小夜市也不错，夏天的晚上很热闹。", nickname: "吃货一枚", createdAt: "2026-06-04T20:00:00" }, { id: "r_seed9", content: "竟然没有红山湖？学校自己的湖不配拥有姓名吗哈哈哈", nickname: "湖景房住户", createdAt: "2026-06-05T08:20:00" }, { id: "r_seed10", content: "周末想去魔鬼城，有一起拼车的吗？4个人一人30左右", nickname: "拼车小队", createdAt: "2026-06-06T11:00:00" }] },
    ];
    save(seedData);
  }

  /* ===== 列表视图：渲染帖子列表 ===== */
  /**
   * 渲染论坛帖子列表（或搜索结果）
   * 根据 currentCat 分类筛选和 keyword 关键词搜索，按时间倒序排列
   * 同时注入搜索输入框（防抖 300ms）和帖子点击进入详情的事件
   */
  function renderList() {
    var posts = load();
    /* 按当前分类和关键词筛选帖子 */
    var filtered = posts.filter(function (p) {
      if (currentCat !== "all" && p.category !== currentCat) return false;
      if (keyword && (p.title + p.content).toLowerCase().indexOf(keyword.toLowerCase()) < 0) return false;
      return true;
    });
    /* 按创建时间从最新到最旧排序 */
    filtered.sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });

    /* 无匹配帖子时显示空状态提示 */
    if (!filtered.length) {
      var tips = ["潜水太久了吧，快来发第一个帖子！💬", "这里还没有人说话，你就是开坛元老 👑", "有问题？有想法？发个帖子大家帮你～", "石大朋友圈等你来暖场 🎉"];
      mainEl.innerHTML = '<div class="forum-empty"><img src="images/empty-forum.jpg" alt="" style="max-width:260px;border-radius:16px;margin-bottom:16px;opacity:0.85" loading="lazy" /><br/><strong>暂无帖子</strong><p>' + tips[Math.floor(Math.random() * tips.length)] + '</p></div>';
      return;
    }

    /* 渲染搜索框和帖子列表 */
    mainEl.innerHTML =
      '<div class="forum-topbar">' +
      '<input id="fmSearch" type="search" placeholder="搜索帖子…" value="' + escapeH(keyword) + '" />' +
      '</div>' +
      '<div class="forum-posts">' +
      filtered.map(function (p) {
        var preview = p.content.length > 120 ? p.content.slice(0, 120) + "…" : p.content;
        var replyCount = (p.replies || []).length;
        var dateStr = new Date(p.createdAt).toLocaleDateString("zh-CN");
        /* 每条帖子显示：分类标签、标题、内容预览（截断120字）、回复数、作者、日期 */
        return '<div class="forum-post" data-post-id="' + p.id + '">' +
          '<h3><span class="tag">' + escapeH(p.category) + '</span>' + escapeH(p.title) + '</h3>' +
          '<p class="post-preview">' + escapeH(preview) + '</p>' +
          '<div class="post-meta">' +
          (replyCount ? '<span class="reply-count">' + replyCount + ' 回复</span>' : '<span style="color:var(--muted)">暂无回复</span>') +
          '<span>👤 ' + escapeH(p.nickname || "匿名") + '</span>' +
          '<span>📅 ' + dateStr + '</span>' +
          '</div></div>';
      }).join("") +
      '</div>';

    /* 为搜索框绑定防抖输入事件 */
    var searchInput = document.getElementById("fmSearch");
    if (searchInput) {
      var debouncedFn = (window.shiguangDebounce || function (fn) { return fn; })(function () {
        keyword = searchInput.value;
        renderList();
      }, 300);
      searchInput.addEventListener("input", debouncedFn);
    }

    /* 为每条帖子绑定点击事件，进入详情视图 */
    document.querySelectorAll(".forum-post").forEach(function (el) {
      el.addEventListener("click", function () {
        var input = document.getElementById("fmSearch");
        if (input) keyword = input.value;
        detailPostId = el.dataset.postId;
        renderDetail(detailPostId);
      });
    });
  }

  /* ===== 详情视图：渲染帖子和回复 ===== */
  /**
   * 渲染帖子详情页，包含内容、回复列表、回复输入框
   * 同时绑定"返回列表"、"发表回复"、"删除帖子"事件
   * @param {string} postId - 帖子 ID
   */
  function renderDetail(postId) {
    var posts = load();
    var p = posts.find(function (p) { return p.id === postId; });
    /* 帖子不存在时回退到列表视图 */
    if (!p) { renderList(); return; }

    var replies = (p.replies || []);
    var dateStr = new Date(p.createdAt).toLocaleString("zh-CN");
    /* 渲染页面：返回按钮、帖子完整内容、所有回复、回复输入框 */
    mainEl.innerHTML =
      '<button class="button secondary forum-back" id="btnBack">← 返回列表</button>' +
      '<div class="forum-detail">' +
      '<span class="tag">' + escapeH(p.category) + '</span>' +
      '<h2>' + escapeH(p.title) + '</h2>' +
      '<div class="detail-meta">👤 ' + escapeH(p.nickname || "匿名") + ' · 📅 ' + dateStr + '</div>' +
      '<div class="detail-content">' + escapeH(p.content) + '</div>' +
      '<div class="detail-meta">' +
      '<button class="button secondary" id="btnDeletePost" style="font-size:12px;padding:4px 10px;">删除帖子</button>' +
      '</div>' +
      '</div>' +
      /* 回复列表：显示回复数、内容和作者信息 */
      '<h4>' + (replies.length ? replies.length : "暂无") + ' 条回复</h4>' +
      replies.map(function (r, i) {
        var rDate = new Date(r.createdAt).toLocaleString("zh-CN");
        return '<div class="forum-reply">' +
          '<div class="reply-content">' + escapeH(r.content) + '</div>' +
          '<div class="reply-meta">#' + (i + 1) + ' · 👤 ' + escapeH(r.nickname || "匿名") + ' · 📅 ' + rDate + '</div>' +
          '</div>';
      }).join("") +
      /* 回复输入区：文本框 + 提交按钮 */
      '<div class="forum-reply-box">' +
      '<textarea id="replyContent" placeholder="写下你的回复…" maxlength="1000"></textarea>' +
      '<div class="reply-actions">' +
      '<button class="button coral" id="btnReply">回复</button>' +
      '</div></div>';

    /* "返回列表"按钮 */
    document.getElementById("btnBack").addEventListener("click", function () {
      detailPostId = null;
      renderList();
    });
    /* "回复"按钮：获取当前昵称，添加回复到帖子并重新渲染 */
    document.getElementById("btnReply").addEventListener("click", function () {
      var content = document.getElementById("replyContent").value.trim();
      if (!content) return;
      var all = load();
      var post = all.find(function (p) { return p.id === postId; });
      if (!post) return;
      if (!post.replies) post.replies = [];
      post.replies.push({
        id: "r_" + Date.now(),
        content: content,
        nickname: window.AppUser ? window.AppUser.getNickname() || "匿名" : "匿名",
        createdAt: new Date().toISOString()
      });
      save(all);
      renderDetail(postId);
    });
    /* "删除帖子"按钮：弹出密码验证弹窗 */
    document.getElementById("btnDeletePost").addEventListener("click", function () {
      deleteTargetId = postId;
      document.getElementById("fmDeletePwd").value = "";
      document.getElementById("fmDeleteError").style.display = "none";
      deleteModalEl.classList.add("show");
    });
  }

  /* ===== 删除弹窗：密码验证确认删除 ===== */
  /* "取消删除"按钮 */
  document.getElementById("btnFmDeleteCancel").addEventListener("click", function () {
    deleteModalEl.classList.remove("show");
    deleteTargetId = null;
  });
  /* "确认删除"按钮：验证管理密码后执行删除 */
  document.getElementById("btnFmDeleteConfirm").addEventListener("click", function () {
    if (!deleteTargetId) return;
    var pwd = document.getElementById("fmDeletePwd").value.trim();
    var all = load();
    var post = all.find(function (p) { return p.id === deleteTargetId; });
    /* 密码不匹配时显示错误 */
    if (!post || (post.password && post.password !== pwd)) {
      document.getElementById("fmDeleteError").style.display = "block";
      return;
    }
    /* 密码正确，从数组中移除该帖子 */
    all = all.filter(function (p) { return p.id !== deleteTargetId; });
    save(all);
    deleteModalEl.classList.remove("show");
    deleteTargetId = null;
    detailPostId = null;
    renderList();
  });
  /* 点击弹窗背景关闭 */
  deleteModalEl.addEventListener("click", function (e) {
    if (e.target === deleteModalEl) { deleteModalEl.classList.remove("show"); deleteTargetId = null; }
  });

  /* ===== 发帖弹窗 ===== */
  /* "发布新帖"按钮：清空表单并打开弹窗 */
  document.getElementById("btnNewPost").addEventListener("click", function () {
    document.getElementById("fmTitle").value = "";
    document.getElementById("fmContent").value = "";
    document.getElementById("fmPwd").value = "";
    clearFieldErrors();
    modalEl.classList.add("show");
  });
  /* "取消"按钮关闭弹窗 */
  document.getElementById("btnFmCancel").addEventListener("click", function () {
    modalEl.classList.remove("show");
  });
  /* 点击弹窗背景关闭 */
  modalEl.addEventListener("click", function (e) {
    if (e.target === modalEl) modalEl.classList.remove("show");
  });

  /* ===== 表单内联错误提示工具函数 ===== */
  /**
   * 在指定输入框下方显示错误提示
   * @param {string} inputId - 输入框元素 ID
   * @param {string} msg - 错误消息
   */
  function showFieldError(inputId, msg) {
    var el = document.getElementById(inputId);
    if (!el) return;
    el.style.borderColor = "var(--coral)";
    var next = el.nextElementSibling;
    if (next && next.classList.contains("field-error")) {
      next.textContent = msg;
    } else {
      var err = document.createElement("span");
      err.className = "field-error";
      err.style.cssText = "color:var(--coral);font-size:12px;margin-top:2px;display:block;";
      err.textContent = msg;
      el.parentNode.insertBefore(err, el.nextSibling);
    }
  }
  /** 清除所有表单内联错误提示和红色边框 */
  function clearFieldErrors() {
    document.querySelectorAll(".field-error").forEach(function (e) { e.remove(); });
    ["fmTitle", "fmContent"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.style.borderColor = "";
    });
  }

  /* ===== 提交帖子 ===== */
  /**
   * "发布"按钮：校验标题和内容，构造帖子对象存储到 localStorage
   * 帖子包含 id、标题、内容、分类、昵称、管理密码、创建时间、空回复列表
   */
  document.getElementById("btnFmSubmit").addEventListener("click", function () {
    clearFieldErrors();
    var title = document.getElementById("fmTitle").value.trim();
    var content = document.getElementById("fmContent").value.trim();
    var hasError = false;
    if (!title) { showFieldError("fmTitle", "请填写标题"); hasError = true; }
    if (!content) { showFieldError("fmContent", "请填写内容"); hasError = true; }
    if (hasError) return;
    var posts = load();
    if (posts.length >= MAX_ITEMS) { alert("帖子数已达上限（" + MAX_ITEMS + "）。"); return; }
    posts.push({
      id: "p_" + Date.now(),
      title: title,
      content: content,
      category: document.getElementById("fmCat").value,
      nickname: window.AppUser ? window.AppUser.getNickname() || "匿名" : "匿名",
      password: document.getElementById("fmPwd").value.trim() || "123456",
      createdAt: new Date().toISOString(),
      replies: []
    });
    save(posts);
    modalEl.classList.remove("show");
    renderList();
  });

  /* ===== 侧边栏分类切换 ===== */
  /* 为侧边栏所有分类按钮绑定点击事件，切换 currentCat 并重新渲染 */
  document.querySelectorAll("#forumSidebar button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      currentCat = btn.dataset.fmCat;
      detailPostId = null;
      document.querySelectorAll("#forumSidebar button").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      renderList();
    });
  });

  /* 初始渲染列表 */
  renderList();
})();
