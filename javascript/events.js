/**
 * events.js —— 活动日历页面逻辑
 * 提取自 events.html 内联 <script>
 *
 * 功能概述：
 *   本文件负责"活动日历"（events.html）的全部交互逻辑，主要包括：
 *   - 日历组件：月历网格渲染、月份切换、日期选中、有活动日期标记
 *   - 活动列表：按日期/分类筛选、区分"近期活动"与"已结束"、卡片渲染
 *   - 发布弹窗：表单验证、字段错误提示、数据持久化保存
 *   - 活动删除：弹窗式密码确认，验证通过后删除并刷新视图
 *   - 种子数据：首次使用时自动生成 6 条基于当前日期的示例活动
 *
 * 依赖：window.AppUser, window.ShiguangStore, window.shiguangEscapeHtml
 * 数据存储：localStorage key "shiguang_events"，上限 200 条
 */
(function () {
  /* ---- 模块级常量与状态变量 ---- */
  var KEY = "shiguang_events";           // localStorage 中存储活动数据的键名
  var MAX_ITEMS = 200;                   // 活动存储上限，超过时阻止新发布
  var currentYear, currentMonth;         // 日历当前显示的年份和月份（月份值 0=一月，11=十二月）
  var selectedDate = null;               // 用户当前选中的日期，格式 "YYYY-MM-DD"，null 表示未选中
  var currentCat = "all";                // 当前分类筛选条件，"all" 表示显示所有分类

  /* ---- 数据存取：封装 localStorage（兼容 ShiguangStore 工具类） ---- */

  /**
   * 从 localStorage 加载活动数据
   * 优先使用 window.ShiguangStore 工具类（提供自动过期清理等增强功能），
   * 若该工具类不可用，则降级使用原生 localStorage + JSON.parse
   * @returns {Array} 活动对象数组，数据不存在或 JSON 损坏时返回空数组
   */
  function load() {
    if (window.ShiguangStore) return window.ShiguangStore.load(KEY);
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; }
  }

  /**
   * 将活动数据持久化到 localStorage
   * @param {Array} data - 活动对象数组，每个对象包含 id, title, date, category,
   *                       time, location, description, nickname, password, createdAt 等字段
   */
  function save(data) {
    if (window.ShiguangStore) { window.ShiguangStore.save(KEY, data); return; }
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
  }

  // 获取 HTML 转义函数，用于防止 XSS 攻击；若全局未定义则使用原样返回的兜底函数
  var escapeH = window.shiguangEscapeHtml || function (s) { return String(s); };

  // 判断两个日期字符串是否指向同一天（忽略具体时间，只比较年月日）
  function datesEqual(a, b) {
    return new Date(a).toDateString() === new Date(b).toDateString();
  }

  /* ---- 种子数据：首次使用时写入示例活动（日期基于当前时间偏移） ---- */
  if (!load().length) {
    var now = new Date();
    // 相对日期辅助函数：以今天为基准，偏移 d 天后返回 YYYY-MM-DD 格式字符串
    function rel(d) { var dt = new Date(now); dt.setDate(dt.getDate() + d); return dt.toISOString().slice(0, 10); }
    // 预置 6 条涵盖不同分类的示例活动，日期分布在今天前后，确保近期和已结束都有展示
    save([
      // 比赛类：2 天后的蓝桥杯说明会
      { id: "ev_seed1", title: "蓝桥杯校内选拔赛说明会", category: "比赛", date: rel(2), time: "16:00", location: "C4教学楼210教室", description: "讲解校内选拔赛的报名流程、比赛规则和备赛建议。面向大一到大三同学，欢迎对编程竞赛感兴趣的同学参加。", nickname: "计算机协会", password: "123", createdAt: now.toISOString() },
      { id: "ev_seed2", title: "大学生创新创业项目申报讲座", category: "讲座", date: rel(5), time: "19:00", location: "J2国际交流中心报告厅", description: "教务处老师讲解大创项目申报流程、选题技巧和经费管理，有往年优秀项目展示。", nickname: "教务处", password: "123", createdAt: now.toISOString() },
      { id: "ev_seed3", title: "羽毛球社团招新友谊赛", category: "社团", date: rel(3), time: "14:00", location: "体育馆二楼羽毛球馆", description: "新学期社团招新友谊赛，新手友好，提供球拍。前三名有奖品！", nickname: "羽球社", password: "123", createdAt: now.toISOString() },
      { id: "ev_seed4", title: "四六级模拟考", category: "考试", date: rel(1), time: "09:00", location: "C8教学楼各教室", description: "全真模拟四六级考试环境，考后提供参考答案。建议带2B铅笔和耳机。", nickname: "英语社", password: "123", createdAt: now.toISOString() },
      { id: "ev_seed5", title: "'AI在课堂'主题分享会", category: "讲座", date: rel(7), time: "16:30", location: "C5教学楼308", description: "邀请计算机系老师分享AI辅助学习的经验和工具推荐，包括ChatGPT、Kimi等工具的教学场景使用。", nickname: "AI兴趣小组", password: "123", createdAt: now.toISOString() },
      { id: "ev_seed6", title: "电影之夜：C5露天放映", category: "社团", date: rel(-1), time: "21:00", location: "C5广场", description: "放映《星际穿越》，免费入场，提供零食饮料。欢迎大家自带坐垫！", nickname: "电影社", password: "123", createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
    ]);
  }

  // 获取当天日期字符串（格式 YYYY-MM-DD），用于日历高亮标记和发布表单默认日期
  var today = new Date();
  var todayStr = today.getFullYear() + "-" +
    String(today.getMonth() + 1).padStart(2, "0") + "-" +
    String(today.getDate()).padStart(2, "0");

  /* ---- 日历组件渲染：生成月历网格，标记有活动的日期 ---- */
  function renderCalendar() {
    // 获取日历容器 DOM 元素
    var cal = document.getElementById("evCalendar");

    // 计算当前月第一天是星期几，以及本月总天数和上月总天数（用于网格布局填充）
    var firstDay = new Date(currentYear, currentMonth, 1);
    var startDay = firstDay.getDay();            // 返回值：0=星期日, 1=星期一, ..., 6=星期六
    var daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();  // 本月总天数
    var daysInPrev = new Date(currentYear, currentMonth, 0).getDate();       // 上月总天数

    // 星期表头行："日 一 二 三 四 五 六"
    var weekDays = ["日", "一", "二", "三", "四", "五", "六"];
    // 月份标签文字，如 "2026年6月"
    var monthLabel = currentYear + "年" + (currentMonth + 1) + "月";

    // 遍历所有活动，构建"有活动的日期"映射表，用于在日历格子上打点标记
    var events = load();
    var eventDates = {};
    events.forEach(function (e) { eventDates[e.date] = true; });

    // 构建日历 HTML：表头（月份标签 + 前后翻页按钮）、星期行、日期网格
    var html = '<div class="ev-cal-header">' +
      '<button id="evPrev">&lt;</button>' +
      '<h3>' + monthLabel + '</h3>' +
      '<button id="evNext">&gt;</button>' +
      '</div>' +
      '<div class="ev-cal-weekdays">' + weekDays.map(function (d) { return '<span>' + d + '</span>'; }).join("") + '</div>' +
      '<div class="ev-cal-days">';

    // 渲染上个月末尾的占位日期（灰色文字，不可点击）
    for (var i = startDay - 1; i >= 0; i--) {
      var d = daysInPrev - i;
      html += '<div class="ev-day other-month">' + d + '</div>';
    }

    // 渲染当前月的所有日期，动态附加 CSS 类名以控制样式
    for (var d = 1; d <= daysInMonth; d++) {
      var dateStr = currentYear + "-" + String(currentMonth + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
      var cls = "ev-day";
      if (dateStr === todayStr) cls += " today";          // 当天：特殊高亮背景色
      if (eventDates[dateStr]) cls += " has-event";       // 有活动：显示小圆点标记
      if (dateStr === selectedDate) cls += " selected";   // 被选中：蓝色边框标识
      html += '<div class="' + cls + '" data-date="' + dateStr + '">' + d + '</div>';
    }

    // 渲染下个月开头的占位日期，补全最后一行（确保日历网格总是 7 列对齐）
    var total = startDay + daysInMonth;
    var remaining = total % 7 === 0 ? 0 : 7 - (total % 7);
    for (var d = 1; d <= remaining; d++) {
      html += '<div class="ev-day other-month">' + d + '</div>';
    }
    html += "</div>";
    cal.innerHTML = html;

    // "上个月"翻页按钮：月份减一，跨年时递减年份
    document.getElementById("evPrev").addEventListener("click", function () {
      currentMonth--;
      if (currentMonth < 0) { currentMonth = 11; currentYear--; }
      renderCalendar();
    });

    // "下个月"翻页按钮：月份加一，跨年时递增年份
    document.getElementById("evNext").addEventListener("click", function () {
      currentMonth++;
      if (currentMonth > 11) { currentMonth = 0; currentYear++; }
      renderCalendar();
    });

    // 日期格子点击事件：选中该日期（非本月灰色日期不响应），重新渲染日历和活动列表
    cal.querySelectorAll(".ev-day:not(.other-month)").forEach(function (el) {
      el.addEventListener("click", function () {
        selectedDate = el.dataset.date;
        renderCalendar();
        renderEvents();
      });
    });
  }

  /* ---- 活动列表渲染：根据当前筛选条件展示活动卡片 ---- */
  function renderEvents() {
    // 加载全部活动并按日期升序排列（最早的排在最前面）
    var events = load();
    events.sort(function (a, b) { return new Date(a.date) - new Date(b.date); });

    var titleEl = document.getElementById("evListTitle");

    // 如果用户选中了具体日期，则仅显示该日期的活动
    if (selectedDate) {
      events = events.filter(function (e) { return e.date === selectedDate; });
      var sd = new Date(selectedDate + "T00:00:00");
      titleEl.textContent = (sd.getMonth() + 1) + "月" + sd.getDate() + "日 活动";
    } else {
      // 未选中日期时，按侧边栏分类筛选（如果当前不是"全部"分类）
      if (currentCat !== "all") {
        events = events.filter(function (e) { return e.category === currentCat; });
      }
      titleEl.textContent = currentCat === "all" ? "近期活动" : currentCat;
    }

    // 将筛选后的活动按当前时间拆分为"近期活动"和"已结束"两组
    // 判断依据：活动日期当天的 23:59:59 是否大于等于当前时间
    var now = new Date();
    // upcoming：尚未结束的活动（日期 >= 今天）；past：已结束的活动（日期 < 今天）
    var upcoming = events.filter(function (e) { return new Date(e.date + "T23:59:59") >= now; });
    var past = events.filter(function (e) { return new Date(e.date + "T23:59:59") < now; });

    var itemsEl = document.getElementById("evItems");
    // 如果两组都没有活动，显示空状态提示信息
    if (!upcoming.length && !past.length) {
      var tips = ["最近校园好安静……来个活动热闹一下？🎈", "讲座、比赛、社团招新——等你来发起！", "好时光不等人，快把活动分享给大家 📅", "说不定你的活动会成为石大最火的聚会 🔥"];
      itemsEl.innerHTML = '<div class="ev-empty"><img src="images/empty-events.jpg" alt="" style="max-width:260px;border-radius:16px;margin-bottom:16px;opacity:0.85" loading="lazy" /><br/><strong>暂无活动</strong><p>' + tips[Math.floor(Math.random() * tips.length)] + '</p></div>';
      return;
    }

    /**
     * 渲染单个活动卡片的 HTML 字符串
     * 卡片包含：左侧日期块、分类标签、标题、描述、时间/地点/发布者元信息、删除按钮
     * @param {Object} e - 活动对象，包含 title, date, category, description, location,
     *                     time, nickname, id 等字段
     * @returns {string} 活动卡片的 HTML 字符串
     */
    function renderCard(e) {
      var d = new Date(e.date + "T00:00:00");
      var dateLabel = (d.getMonth() + 1) + "月" + d.getDate() + "日";
      // 如果活动日期早于今天，降低卡片透明度以在视觉上区分已结束的活动
      var pastClass = d < (new Date(new Date().toDateString())) ? ' style="opacity:0.5"' : "";
      return '<div class="ev-card"' + pastClass + '>' +
        '<div class="ev-card-date"><span class="ev-d">' + d.getDate() + '</span><span class="ev-m">' + (d.getMonth() + 1) + '月</span></div>' +
        '<div class="ev-card-body">' +
        '<h4><span class="tag">' + escapeH(e.category) + '</span>' + escapeH(e.title) + '</h4>' +
        (e.description ? '<p>' + escapeH(e.description) + '</p>' : '') +
        '<div class="ev-card-meta">' +
        '<span>📅 ' + dateLabel + (e.time ? ' · ' + e.time : '') + '</span>' +
        (e.location ? '<span>📍 ' + escapeH(e.location) + '</span>' : '') +
        '<span>👤 ' + escapeH(e.nickname || "匿名") + '</span>' +
        '<button class="button secondary ev-del-btn" data-ev-del="' + e.id + '" style="font-size:11px;padding:2px 8px;margin-left:auto">删除</button>' +
        '</div></div></div>';
    }

    var html = "";
    // 先渲染近期活动（完整的活动列表，按日期升序排列）
    if (upcoming.length) html += upcoming.map(renderCard).join("");

    // 再渲染已结束活动（最多显示最近 5 条），仅在未按日期筛选时展示
    if (past.length && !selectedDate) {
      // 如果近期活动也存在，在两者之间插入"已结束"分区标题
      if (upcoming.length) html += '<h4 style="color:var(--muted);margin:12px 0 8px;font-size:14px">已结束</h4>';
      // slice(-5) 取数组末尾 5 项，即距离当前时间最近的 5 个已结束活动
      html += past.slice(-5).map(renderCard).join("");
    }
    itemsEl.innerHTML = html;

    // 为每个活动卡片上的"删除"按钮绑定点击事件，点击后弹出密码确认弹窗
    document.querySelectorAll("[data-ev-del]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();            // 阻止事件冒泡，避免触发卡片其他点击行为
        var id = btn.dataset.evDel;     // 获取活动 ID
        showDeleteDialog(id);           // 弹出删除确认弹窗
      });
    });
  }

  /**
   * 弹窗式删除确认（替代原生 prompt，提供更好的用户体验）
   * 动态创建模态覆盖层，包含管理密码输入框、确认和取消按钮
   * 密码验证通过后从数据中移除目标活动，并刷新日历和列表视图
   * @param {string} eventId - 要删除的活动 ID
   */
  function showDeleteDialog(eventId) {
    var overlay = document.createElement("div");
    overlay.className = "ev-modal-overlay show";
    overlay.innerHTML =
      '<div class="ev-modal">' +
      '<h3>删除活动</h3>' +
      '<p style="color:var(--muted);margin:0 0 16px">请输入发布时设置的管理密码来确认删除。</p>' +
      '<div class="form-field">' +
      '<label for="evDelPwdTemp">管理密码</label>' +
      '<input type="text" id="evDelPwdTemp" placeholder="请输入管理密码" maxlength="20" />' +
      '</div>' +
      '<p id="evDelErrorTemp" style="color:var(--coral);font-size:13px;display:none;margin:8px 0 0">密码错误，请重试。</p>' +
      '<div class="modal-btns">' +
      '<button class="button secondary" id="btnEvDelCancelTemp">取消</button>' +
      '<button class="button coral" id="btnEvDelConfirmTemp">确认删除</button>' +
      '</div></div>';
    document.body.appendChild(overlay);

    // 关闭弹窗的辅助函数：从 DOM 中移除覆盖层
    var close = function () { overlay.remove(); };

    // 点击覆盖层背景（非弹窗内容区域）触发关闭
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
    // 点击"取消"按钮直接关闭弹窗
    overlay.querySelector("#btnEvDelCancelTemp").addEventListener("click", close);

    // 点击"确认删除"按钮：验证管理密码，匹配成功则执行删除操作
    overlay.querySelector("#btnEvDelConfirmTemp").addEventListener("click", function () {
      var pwd = overlay.querySelector("#evDelPwdTemp").value.trim();
      var all = load();
      var ev = all.find(function (e) { return e.id === eventId; });
      // 如果活动不存在，或密码不匹配（密码为空时视为不需要密码），显示错误提示
      if (!ev || (ev.password && ev.password !== pwd)) {
        overlay.querySelector("#evDelErrorTemp").style.display = "block";
        return;
      }
      // 从活动数组中过滤掉目标活动，保存数据并刷新视图
      all = all.filter(function (e) { return e.id !== eventId; });
      save(all);
      close();
      renderCalendar();  // 刷新：活动标记点可能消失
      renderEvents();    // 刷新：活动列表移除该卡片
    });
  }

  /* ---- 侧边栏分类筛选切换 ---- */
  document.querySelectorAll(".ev-tag").forEach(function (btn) {
    btn.addEventListener("click", function () {
      currentCat = btn.dataset.evCat;                          // 更新当前分类条件
      selectedDate = null;                                      // 切换分类时清除日期选中状态
      document.querySelectorAll(".ev-tag").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");                              // 高亮当前选中的分类标签按钮
      renderCalendar();                                         // 日历上取消日期高亮
      renderEvents();                                           // 按新分类重新渲染活动列表
    });
  });

  /* ---- 活动发布弹窗逻辑 ---- */
  var modal = document.getElementById("evModal");

  // 点击"发布活动"按钮：清空所有表单字段，设置默认日期为今天，显示弹窗
  document.getElementById("btnNewEvent").addEventListener("click", function () {
    document.getElementById("evTitle").value = "";
    document.getElementById("evDesc").value = "";
    document.getElementById("evLocation").value = "";
    document.getElementById("evPwd").value = "";
    document.getElementById("evDate").value = todayStr;       // 默认选中今天
    clearEvFieldErrors();
    modal.classList.add("show");                              // 显示弹窗
  });

  // 点击弹窗"取消"按钮关闭弹窗
  document.getElementById("btnEvCancel").addEventListener("click", function () { modal.classList.remove("show"); });

  // 点击弹窗背景（灰色遮罩区域）关闭弹窗
  // 判断条件：事件目标 e.target 是 modal 背景本身，而非其内部的子元素
  modal.addEventListener("click", function (e) { if (e.target === modal) modal.classList.remove("show"); });

  /**
   * 在指定输入框下方显示红色错误提示信息
   * 如果该输入框已有错误提示元素则更新其内容，否则动态创建新的提示元素
   * @param {string} inputId - 输入框 DOM 元素的 id
   * @param {string} msg - 要显示的错误提示文字内容
   */
  function showFieldError(inputId, msg) {
    var el = document.getElementById(inputId);
    if (!el) return;
    el.style.borderColor = "var(--coral)";                   // 输入框边框变红以引起注意
    var next = el.nextElementSibling;
    if (next && next.classList.contains("field-error")) {
      next.textContent = msg;                                // 已有错误提示，直接更新内容
    } else {
      // 创建新的错误提示 span 元素，插入到输入框后面
      var err = document.createElement("span");
      err.className = "field-error";
      err.style.cssText = "color:var(--coral);font-size:12px;margin-top:2px;display:block;";
      err.textContent = msg;
      el.parentNode.insertBefore(err, el.nextSibling);
    }
  }

  // 清除弹窗中所有输入框的错误提示样式和错误消息元素
  function clearEvFieldErrors() {
    document.querySelectorAll("#evModal .field-error").forEach(function (e) { e.remove(); });
    ["evTitle", "evDate"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.style.borderColor = "";                     // 恢复输入框的默认边框颜色
    });
  }

  // 发布活动表单提交处理：验证必填字段、检查上限、保存数据、刷新视图
  document.getElementById("btnEvSubmit").addEventListener("click", function () {
    clearEvFieldErrors();                                    // 先清除旧的错误提示
    var title = document.getElementById("evTitle").value.trim();
    var date = document.getElementById("evDate").value;
    var hasError = false;

    // 必填字段校验："活动名称"和"活动日期"不能为空
    if (!title) { showFieldError("evTitle", "请填写活动名称"); hasError = true; }
    if (!date) { showFieldError("evDate", "请选择日期"); hasError = true; }
    if (hasError) return;                                    // 有必填字段为空，终止提交

    var events = load();
    // 检查是否达到活动数量上限，达到则阻止发布并提示用户
    if (events.length >= MAX_ITEMS) { alert("活动数已达上限。"); return; }

    // 构建新的活动对象，添加到活动数组末尾
    events.push({
      id: "ev_" + Date.now(),                                // 基于时间戳生成全局唯一 ID
      title: title,
      category: document.getElementById("evCat").value,
      date: date,
      time: document.getElementById("evTime").value,
      location: document.getElementById("evLocation").value.trim(),
      description: document.getElementById("evDesc").value.trim(),
      nickname: window.AppUser ? window.AppUser.getNickname() || "匿名" : "匿名",
      password: document.getElementById("evPwd").value.trim() || "123456",
      createdAt: new Date().toISOString()
    });
    save(events);                                            // 持久化到 localStorage

    modal.classList.remove("show");                          // 关闭发布弹窗
    renderCalendar();                                        // 刷新日历（新活动日期上出现标记点）
    renderEvents();                                          // 刷新活动列表（新活动显示在卡片中）
  });

  /* ---- 初始化：定位到当前月份，首次渲染日历和活动列表 ---- */
  currentYear = today.getFullYear();
  currentMonth = today.getMonth();
  renderCalendar();
  renderEvents();
})();
