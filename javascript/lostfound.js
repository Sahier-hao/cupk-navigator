/**
 * lostfound.js —— 失物招领页面逻辑
 *
 * 功能：发布寻物/招领信息、分类筛选、关键词搜索、标记认领
 * 数据通过 localStorage 持久化（key: shiguang_lostfound，上限 200 条，30 天自动过期）
 * 依赖：window.AppUser、window.ShiguangStore、window.shiguangEscapeHtml、window.shiguangDebounce
 */
(function () {
  /* 存储 key、上限及筛选状态变量 */
  var KEY = "shiguang_lostfound";
  var MAX_ITEMS = 200;
  var currentType = "all";    // 当前筛选类型：all/lost/found
  var currentCat = "all";     // 当前分类筛选
  var keyword = "";           // 搜索关键词
  var sortOrder = "newest";   // 排序方式：newest/oldest

  /**
   * 从 localStorage 加载失物招领数据
   * @returns {Array} 失物招领记录数组
   */
  function load() {
    if (window.ShiguangStore) return window.ShiguangStore.load(KEY);
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; }
  }
  /**
   * 保存失物招领数据到 localStorage
   * @param {Array} data - 记录数组
   */
  function save(data) {
    if (window.ShiguangStore) { window.ShiguangStore.save(KEY, data); return; }
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
  }

  /**
   * 清理超过 30 天的过期记录
   * @param {Array} items - 原始记录数组
   * @returns {Array} 过滤后的有效记录
   */
  function cleanOld(items) {
    var cutoff = Date.now() - 30 * 24 * 3600 * 1000;
    return items.filter(function (it) {
      return new Date(it.createdAt).getTime() > cutoff;
    });
  }

  /* 获取页面中失物招领的主要 DOM 元素引用 */
  var listEl = document.getElementById("lfList");
  var searchEl = document.getElementById("lfSearch");
  var modalEl = document.getElementById("lfModal");
  var claimModalEl = document.getElementById("lfClaimModal");
  var currentClaimId = null;

  /* 首次加载时写入种子示例数据（6 条，覆盖不同类型和分类） */
  if (!load().length) {
    var seedData = [
      { id: "lf_seed1", type: "lost", title: "黑色校园卡套", category: "钥匙卡片", description: "J2教学楼三楼教室，卡套内有校园卡和一张工商银行卡，卡号尾号4213", location: "J2教学楼三楼", contact: "微信 Cupk5201314", status: "open", nickname: "大二软件", password: "123", createdAt: "2026-06-06T10:30:00" },
      { id: "lf_seed2", type: "found", title: "灰色华为蓝牙耳机", category: "电子数码", description: "图书馆二楼自习区捡到，华为FreeBuds，充电盒有轻微划痕，放在失物招领处", location: "图书馆二楼", contact: "失物招领处自取", status: "open", nickname: "热心同学", password: "123", createdAt: "2026-06-07T14:15:00" },
      { id: "lf_seed3", type: "lost", title: "钥匙串（带哆啦A梦挂件）", category: "钥匙卡片", description: "一串钥匙，上面有个蓝色哆啦A梦挂件，可能在C5餐厅或D区操场附近丢失", location: "C5餐厅附近", contact: "手机 150xxxx6688", status: "open", nickname: "大一化工", password: "123", createdAt: "2026-06-05T18:00:00" },
      { id: "lf_seed4", type: "found", title: "《高等数学·上册》教材", category: "书籍文具", description: "三餐门口长椅上捡到，同济七版，书内有笔记，扉页写了名", location: "三餐门口", contact: "已放三餐一楼服务台", status: "claimed", nickname: "三餐阿姨", password: "123", createdAt: "2026-06-03T12:00:00" },
      { id: "lf_seed5", type: "lost", title: "银色Sony U盘（16G）", category: "电子数码", description: "银色金属外壳，16GB，里面存有课程设计和实验报告，非常重要！可能在C8机房或D3宿舍丢失", location: "C8机房", contact: "QQ 876xxxx21", status: "open", nickname: "大二计算机", password: "123", createdAt: "2026-06-08T09:45:00" },
      { id: "lf_seed6", type: "found", title: "一把蓝色折叠伞", category: "其他", description: "D3篮球场边捡到，蓝色格纹折叠伞，八成新", location: "D3篮球场", contact: "已放D3楼管处", status: "open", nickname: "打球同学", password: "123", createdAt: "2026-06-08T16:20:00" },
    ];
    /* 将种子数据存入 localStorage */
    save(seedData);
  }

  /**
   * 主渲染函数
   * 先从 localStorage 加载数据并清理过期记录
   * 然后按当前筛选条件（类型、分类、关键词）过滤
   * 最后按排序方式渲染卡片列表
   */
  function render() {
    var items = load();
    /* 先清理 30 天前过期数据，若有变更则更新存储 */
    /* 清理过期记录，若有变化则更新存储 */
    items = cleanOld(items);
    if (items.length !== load().length) save(items);

    /* 获取搜索关键词（若有搜索框） */
    keyword = searchEl ? searchEl.value.trim().toLowerCase() : "";

    /* 按类型、分类、关键词三重筛选 */
    var filtered = items.filter(function (it) {
      if (currentType !== "all" && it.type !== currentType) return false;
      if (currentCat !== "all" && it.category !== currentCat) return false;
      if (keyword && (it.title + it.description + it.location).toLowerCase().indexOf(keyword) < 0) return false;
      return true;
    });

    /* 按创建时间排序：参数 sortOrder 控制最新优先或最旧优先 */
    if (sortOrder === "oldest") {
      filtered.sort(function (a, b) { return new Date(a.createdAt) - new Date(b.createdAt); });
    } else {
      filtered.sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
    }

    var escapeH = window.shiguangEscapeHtml || function (s) { return String(s); };

    /* 无匹配数据时显示空状态提示 */
    if (!filtered.length) {
      var tips = ["还没有人丢东西，真是个平安的校园～", "拾金不昧是美德，捡到东西记得发招领哦！", "空无一物！快来做第一个发布的人吧 🎉", "你的一个小举动，可能帮到焦急的失主 💛"];
      listEl.innerHTML = '<div class="lf-empty"><img src="images/empty-lostfound.jpg" alt="" style="max-width:260px;border-radius:16px;margin-bottom:16px;opacity:0.85" loading="lazy" /><br/><strong>暂无信息</strong><p>' + tips[Math.floor(Math.random() * tips.length)] + '</p></div>';
      return;
    }

    /* 渲染每条记录为卡片，包含类型标签、分类、地点、日期、联系方式和作者 */
    listEl.innerHTML = filtered.map(function (it) {
      var dateStr = new Date(it.createdAt).toLocaleDateString("zh-CN");
      var typeLabel = it.type === "lost" ? "寻物" : "招领";
      var typeTag = it.type === "lost" ? "coral" : "blue";
      var claimedClass = it.status === "claimed" ? " claimed" : "";
      /* 根据状态显示"标记认领"按钮或"已认领"标签 */
      var claimBtn = it.status === "open"
        ? '<button class="lf-claim-btn" data-lf-id="' + it.id + '">标记认领</button>'
        : '<span class="tag">已认领 / 已找到</span>';

      return '<div class="lf-card lf-card ' + it.type + claimedClass + '">' +
        '<div class="lf-bar"></div>' +
        '<div class="lf-body">' +
        '<h3>' + escapeH(it.title) + '</h3>' +
        '<p>' + escapeH(it.description) + '</p>' +
        '<div class="lf-meta">' +
        '<span class="tag ' + typeTag + '">' + typeLabel + '</span>' +
        '<span class="tag">' + escapeH(it.category) + '</span>' +
        '<span>📍 ' + escapeH(it.location || "未知地点") + '</span>' +
        '<span>📅 ' + dateStr + '</span>' +
        '<span>📞 ' + escapeH(it.contact) + '</span>' +
        '<span>👤 ' + escapeH(it.nickname || "匿名") + '</span>' +
        '</div></div>' + claimBtn + '</div>';
    }).join("");

    /* 为所有"标记认领"按钮绑定点击事件 */
    bindClaimButtons();
  }

  /**
   * 为所有"标记认领"按钮绑定点击事件
   * 点击时记录目标 ID，打开密码验证弹窗
   */
  function bindClaimButtons() {
    document.querySelectorAll("[data-lf-id]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        currentClaimId = btn.dataset.lfId;
        document.getElementById("lfClaimPwd").value = "";
        document.getElementById("lfClaimError").style.display = "none";
        claimModalEl.classList.add("show");
      });
    });
  }

  /* ===== 表单内联错误提示 ===== */
  /**
   * 在指定输入框下方显示红色错误消息
   * @param {string} inputId - 输入框元素 ID
   * @param {string} msg - 错误提示文本
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
  /** 清除所有表单内联错误提示并恢复边框颜色 */
  function clearFieldErrors() {
    document.querySelectorAll(".field-error").forEach(function (e) { e.remove(); });
    ["lfTitle", "lfDesc", "lfContact"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.style.borderColor = "";
    });
  }

  /* ===== 提交发布 ===== */
  /**
   * "发布"按钮：校验标题、描述、联系方式三个必填项
   * 检查是否达上限，构造数据对象存入 localStorage
   */
  document.getElementById("btnLfSubmit").addEventListener("click", function () {
    clearFieldErrors();
    var title = document.getElementById("lfTitle").value.trim();
    var desc = document.getElementById("lfDesc").value.trim();
    var contact = document.getElementById("lfContact").value.trim();
    var hasError = false;
    if (!title) { showFieldError("lfTitle", "请填写标题"); hasError = true; }
    if (!desc) { showFieldError("lfDesc", "请填写描述"); hasError = true; }
    if (!contact) { showFieldError("lfContact", "请填写联系方式"); hasError = true; }
    if (hasError) return;

    var items = load();
    if (items.length >= MAX_ITEMS) {
      alert("发布已达上限（" + MAX_ITEMS + "条），请等待旧记录过期。");
      return;
    }
    /* 构造新记录对象，添加时间戳唯一 ID */
    items.push({
      id: "lf_" + Date.now(),
      type: document.getElementById("lfType").value,
      title: title,
      category: document.getElementById("lfCat").value,
      description: desc,
      location: document.getElementById("lfLocation").value.trim(),
      contact: contact,
      status: "open",
      nickname: window.AppUser ? window.AppUser.getNickname() || "匿名" : "匿名",
      password: document.getElementById("lfPwd").value.trim() || "123456",
      createdAt: new Date().toISOString()
    });
    /* 保存并关闭弹窗，刷新列表 */
    save(items);
    modalEl.classList.remove("show");
    render();
  });

  /* ===== 确认认领 ===== */
  /**
   * "确认认领"按钮：验证管理密码后更新状态为 "claimed"
   */
  document.getElementById("btnClaimConfirm").addEventListener("click", function () {
    if (!currentClaimId) return;
    var pwd = document.getElementById("lfClaimPwd").value.trim();
    var items = load();
    var item = items.find(function (it) { return it.id === currentClaimId; });
    /* 密码不匹配时显示错误 */
    if (!item || (item.password && item.password !== pwd)) {
      document.getElementById("lfClaimError").style.display = "block";
      return;
    }
    /* 更新状态并重新渲染 */
    item.status = "claimed";
    save(items);
    claimModalEl.classList.remove("show");
    currentClaimId = null;
    render();
  });

  /* ===== 弹窗控制 ===== */
  /* "发布寻物"按钮：设置表单类型为 lost，打开弹窗 */
  document.getElementById("btnNewLost").addEventListener("click", function () {
    document.getElementById("lfModalTitle").textContent = "发布寻物启事";
    document.getElementById("lfType").value = "lost";
    openModal();
  });
  /* "发布招领"按钮：设置表单类型为 found，打开弹窗 */
  document.getElementById("btnNewFound").addEventListener("click", function () {
    document.getElementById("lfModalTitle").textContent = "发布失物招领";
    document.getElementById("lfType").value = "found";
    openModal();
  });
  /** 打开模态框并清空所有表单字段 */
  function openModal() {
    clearFieldErrors();
    document.getElementById("lfTitle").value = "";
    document.getElementById("lfDesc").value = "";
    document.getElementById("lfLocation").value = "";
    document.getElementById("lfContact").value = "";
    document.getElementById("lfPwd").value = "";
    modalEl.classList.add("show");
  }
  /* 取消按钮关闭发布弹窗 */
  document.getElementById("btnLfCancel").addEventListener("click", function () {
    modalEl.classList.remove("show");
  });
  /* 取消按钮关闭认领弹窗 */
  document.getElementById("btnClaimCancel").addEventListener("click", function () {
    claimModalEl.classList.remove("show");
    currentClaimId = null;
  });
  /* 点击发布弹窗背景关闭 */
  modalEl.addEventListener("click", function (e) {
    if (e.target === modalEl) modalEl.classList.remove("show");
  });
  /* 点击认领弹窗背景关闭 */
  claimModalEl.addEventListener("click", function (e) {
    if (e.target === claimModalEl) claimModalEl.classList.remove("show");
  });

  /* ===== 筛选与排序 ===== */
  /*
   * 为所有筛选按钮（data-lf-type / data-lf-cat / data-lf-sort）绑定点击事件
   * 三种筛选互斥：选择分类时重置类型为 all，反之亦然
   * 排序独立于类型/分类筛选
   */
  document.querySelectorAll(".lf-filter").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var type = btn.dataset.lfType;
      var cat = btn.dataset.lfCat;

      if (type !== undefined) {
        /* 类型筛选：同时重置分类为 all */
        currentType = type;
        currentCat = "all";
        document.querySelectorAll("[data-lf-type]").forEach(function (b) { b.classList.toggle("active", b.dataset.lfType === type); });
        document.querySelectorAll("[data-lf-cat]").forEach(function (b) { b.classList.remove("active"); });
        document.querySelector("[data-lf-type='all']").classList.toggle("active", type === "all");
      } else if (cat !== undefined) {
        /* 分类筛选：同时重置类型为 all */
        currentCat = cat;
        currentType = "all";
        document.querySelectorAll("[data-lf-cat]").forEach(function (b) { b.classList.toggle("active", b.dataset.lfCat === cat); });
        document.querySelectorAll("[data-lf-type]").forEach(function (b) { b.classList.remove("active"); });
        document.querySelector("[data-lf-type='all']").classList.add("active");
      } else if (btn.dataset.lfSort !== undefined) {
        /* 排序切换 */
        sortOrder = btn.dataset.lfSort;
        document.querySelectorAll("[data-lf-sort]").forEach(function (b) { b.classList.toggle("active", b.dataset.lfSort === sortOrder); });
      }
      render();
    });
  });

  /* ===== 搜索框（防抖 300ms） ===== */
  if (searchEl) {
    var debouncedRender = (window.shiguangDebounce || function (fn) { return fn; })(render, 300);
    searchEl.addEventListener("input", function () { debouncedRender(); });
  }

  /* 初始渲染 */
  render();
})();
