/* ================================================================
 * 校园二手交易（secondhand.js）
 * 功能：商品发布、分类筛选、关键词搜索、联系卖家、标记售出、删除管理
 * 数据存储在 localStorage（key: shiguang_secondhand）
 * ================================================================ */

(function () {
  "use strict";

  /* ---- 常量 ---- */
  var STORAGE_KEY = "shiguang_secondhand";
  var MAX_ITEMS = 200;

  /* ---- 种子数据 ---- */
  var SEED_ITEMS = [
    {
      id: "seed_sh_1",
      title: "高等数学（第七版）上册",
      price: 15,
      category: "书籍教材",
      desc: "九成新，只有前两章有少量笔记，其余全新。考研换专业了用不上了。",
      contact: "QQ: 1234567890",
      nickname: "石光小站",
      status: "active",
      createdAt: "2026-05-15",
      password: "123",
      isSeed: true,
    },
    {
      id: "seed_sh_2",
      title: "罗技 K380 蓝牙键盘",
      price: 45,
      category: "数码配件",
      desc: "粉色款，用了半年，功能完好。配 iPad 很合适，换了机械键盘所以出。",
      contact: "微信: campus_vendor",
      nickname: "石光小站",
      status: "active",
      createdAt: "2026-05-18",
      password: "123",
      isSeed: true,
    },
    {
      id: "seed_sh_3",
      title: "宿舍用小台灯",
      price: 0,
      category: "生活用品",
      desc: "免费送！USB 充电款，亮度可调，毕业带不走了。先到先得。",
      contact: "微信: dorm_light",
      nickname: "石光小站",
      status: "active",
      createdAt: "2026-05-20",
      password: "123",
      isSeed: true,
    },
  ];

  /* ---- 工具函数 ---- */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getNow() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  /* ---- 数据读写 ---- */
  function loadAll() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (_) {
      return [];
    }
  }

  function saveAll(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (_) {
      alert("存储空间不足，请清理一些旧数据。");
    }
  }

  function ensureSeeded() {
    var existing = loadAll();
    if (existing.length === 0) {
      saveAll(SEED_ITEMS);
    }
  }

  /* ---- 获取当前用户昵称 ---- */
  function getCurrentUser() {
    if (window.AppUser) {
      return window.AppUser.getNickname ? window.AppUser.getNickname() : (window.AppUser.get() ? window.AppUser.get().nickname : "");
    }
    try {
      var u = JSON.parse(localStorage.getItem("shiguang_user") || "{}");
      return u.nickname || "";
    } catch (_) {
      return "";
    }
  }

  /* ---- 状态管理 ---- */
  var currentCategory = "all";
  var currentStatus = "active";  // 默认只看在售
  var searchKeyword = "";

  /* ---- 渲染 ---- */
  function render() {
    var list = document.getElementById("shList");
    var empty = document.getElementById("shEmpty");
    var stats = document.getElementById("shStats");
    if (!list) return;

    var all = loadAll();
    var filtered = all.filter(function (item) {
      if (currentCategory !== "all" && item.category !== currentCategory) return false;
      if (currentStatus === "active" && item.status !== "active") return false;
      if (searchKeyword) {
        var kw = searchKeyword.toLowerCase();
        var text = (item.title + " " + item.desc + " " + item.category + " " + item.nickname).toLowerCase();
        if (text.indexOf(kw) === -1) return false;
      }
      return true;
    });

    // 按时间倒序
    filtered.sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });

    // 统计
    var activeCount = all.filter(function (it) { return it.status === "active"; }).length;
    if (stats) {
      stats.innerHTML =
        '<span class="sh-stat">共 <strong>' + all.length + '</strong> 件商品</span>' +
        '<span class="sh-stat">在售 <strong>' + activeCount + '</strong> 件</span>' +
        (currentCategory !== "all" ? '<span class="sh-stat">筛选：<strong>' + escapeHtml(currentCategory) + '</strong></span>' : '') +
        (searchKeyword ? '<span class="sh-stat">搜索："<strong>' + escapeHtml(searchKeyword) + '</strong>"</span>' : '');
    }

    if (filtered.length === 0) {
      list.innerHTML = "";
      if (empty) {
      empty.style.display = "block";
      var tips = ["闲置不浪费，你的旧物可能是别人的宝贝 💎", "书架上吃灰的书，柜子里落单的耳机——都来架吧！", "物尽其用，石大二手市场等你开张 🛒", "买买买之后才发现用不上？来这里找到新主人吧～"];
      empty.innerHTML = '<img src="images/empty-secondhand.jpg" alt="" style="max-width:280px;border-radius:16px;margin-bottom:16px;opacity:0.85" loading="lazy" /><br/><strong>还没有商品</strong><p>' + tips[Math.floor(Math.random() * tips.length)] + '</p>';
    }
      return;
    }
    if (empty) empty.style.display = "none";

    var html = "";
    for (var i = 0; i < filtered.length; i++) {
      var item = filtered[i];
      var isSold = item.status === "sold";
      var priceDisplay = item.price > 0 ? "¥" + item.price : "免费";
      html +=
        '<div class="sh-card' + (isSold ? " sold" : "") + '" data-id="' + item.id + '">' +
        '<img class="sh-card-img" src="images/card-secondhand.jpg" alt="' + escapeHtml(item.title) + '" loading="lazy" />' +
        '<div class="sh-card-body">' +
        '<h3>' +
        escapeHtml(item.title) +
        '<span class="sh-status ' + item.status + '">' + (isSold ? '已售出' : '在售') + '</span>' +
        '</h3>' +
        (item.desc ? '<p>' + escapeHtml(item.desc) + '</p>' : '') +
        '<div class="sh-card-meta">' +
        '<span class="tag">' + escapeHtml(item.category) + '</span>' +
        '<span>📷 ' + escapeHtml(item.nickname) + '</span>' +
        '<span>' + escapeHtml(item.createdAt) + '</span>' +
        '</div>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">' +
        '<span class="sh-price' + (item.price === 0 ? ' free' : '') + '">' + priceDisplay + '</span>' +
        (!isSold ? '<button class="sh-contact-btn" data-id="' + item.id + '">📞 联系卖家</button>' : '') +
        (!isSold && !item.isSeed ? '<button class="sh-mark-sold-btn" data-id="' + item.id + '">✓ 标记售出</button>' : '') +
        (!item.isSeed ? '<button class="sh-mark-sold-btn" data-id="' + item.id + '" data-action="delete" style="color:var(--coral)">🗑️ 删除</button>' : '') +
        '</div>' +
        '</div>';
    }
    list.innerHTML = html;

    // 绑定联系卖家按钮
    var contactBtns = list.querySelectorAll(".sh-contact-btn");
    for (var c = 0; c < contactBtns.length; c++) {
      contactBtns[c].addEventListener("click", function (e) {
        e.stopPropagation();
        showContact(this.getAttribute("data-id"));
      });
    }

    // 绑定标记售出按钮
    var markBtns = list.querySelectorAll(".sh-mark-sold-btn[data-action]");
    for (var m = 0; m < markBtns.length; m++) {
      markBtns[m].addEventListener("click", function (e) {
        e.stopPropagation();
        var id = this.getAttribute("data-id");
        if (this.getAttribute("data-action") === "delete") {
          handleDelete(id);
        }
      });
    }
    // 绑定非 data-action 的标记售出按钮
    var soldBtns = list.querySelectorAll(".sh-mark-sold-btn:not([data-action])");
    for (var s = 0; s < soldBtns.length; s++) {
      soldBtns[s].addEventListener("click", function (e) {
        e.stopPropagation();
        handleMarkSold(this.getAttribute("data-id"));
      });
    }
  }

  /* ---- 发布 ---- */
  function setupPublish() {
    var openBtn = document.getElementById("btnNewItem");
    var modal = document.getElementById("publishModal");
    var submitBtn = document.getElementById("btnPublishSubmit");
    var cancelBtn = document.getElementById("btnPublishCancel");

    if (!openBtn || !modal) return;

    openBtn.addEventListener("click", function () {
      modal.classList.add("show");
      var titleEl = document.getElementById("shTitle");
      if (titleEl) {
        // 自动填充昵称不在这里做，让用户自己输入
      }
    });

    cancelBtn.addEventListener("click", function () {
      modal.classList.remove("show");
      clearPublishForm();
    });

    // 点击遮罩关闭
    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        modal.classList.remove("show");
        clearPublishForm();
      }
    });

    submitBtn.addEventListener("click", function () {
      var title = document.getElementById("shTitle").value.trim();
      var priceEl = document.getElementById("shPrice");
      var price = parseFloat(priceEl.value);
      var category = document.getElementById("shCategory").value;
      var desc = document.getElementById("shDesc").value.trim();
      var contact = document.getElementById("shContact").value.trim();
      var pwd = document.getElementById("shPwd").value.trim();

      if (!title) { alert("请填写商品名称～"); return; }
      if (isNaN(price) || price < 0) { alert("请输入有效的价格（0 表示免费）～"); return; }
      if (!contact) { alert("请填写联系方式，方便买家找到你～"); return; }
      if (!pwd) { alert("请设置管理密码，后续标记售出或删除需要用到～"); return; }

      var all = loadAll();
      if (all.length >= MAX_ITEMS) {
        alert("已达存储上限（" + MAX_ITEMS + "条），请先清理旧数据。");
        return;
      }

      var newItem = {
        id: "sh_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
        title: title,
        price: price,
        category: category,
        desc: desc,
        contact: contact,
        nickname: getCurrentUser() || "匿名同学",
        status: "active",
        createdAt: getNow(),
        password: pwd,
        isSeed: false,
      };

      all.unshift(newItem);
      saveAll(all);
      modal.classList.remove("show");
      clearPublishForm();
      render();
      alert("🎉 发布成功！你的商品已上架。");
    });
  }

  function clearPublishForm() {
    var modal = document.getElementById("publishModal");
    if (!modal) return;
    var inputs = modal.querySelectorAll("input, textarea");
    for (var i = 0; i < inputs.length; i++) { inputs[i].value = ""; }
  }

  /* ---- 联系卖家 ---- */
  function showContact(itemId) {
    var all = loadAll();
    var item = null;
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === itemId) { item = all[i]; break; }
    }
    if (!item) return;

    var modal = document.getElementById("contactModal");
    var info = document.getElementById("contactInfo");
    if (!modal || !info) return;

    info.innerHTML =
      '<p><strong>商品：</strong>' + escapeHtml(item.title) + '</p>' +
      '<p><strong>卖家：</strong>' + escapeHtml(item.nickname) + '</p>' +
      '<p><strong>联系方式：</strong><br/>' + escapeHtml(item.contact) + '</p>';
    modal.classList.add("show");
  }

  function setupContactModal() {
    var modal = document.getElementById("contactModal");
    if (!modal) return;
    document.getElementById("btnContactClose").addEventListener("click", function () {
      modal.classList.remove("show");
    });
    modal.addEventListener("click", function (e) {
      if (e.target === modal) modal.classList.remove("show");
    });
  }

  /* ---- 标记售出 ---- */
  function handleMarkSold(itemId) {
    var all = loadAll();
    var item = null;
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === itemId) { item = all[i]; break; }
    }
    if (!item) return;

    var pwd = prompt("请输入管理密码以标记「" + item.title + "」为已售出：");
    if (pwd === null) return;
    if (pwd !== item.password) { alert("❌ 密码错误。"); return; }

    if (!confirm("确认将「" + item.title + "」标记为已售出吗？")) return;

    item.status = "sold";
    saveAll(all);
    render();
  }

  /* ---- 删除 ---- */
  function handleDelete(itemId) {
    var all = loadAll();
    var item = null;
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === itemId) { item = all[i]; break; }
    }
    if (!item) return;

    var pwd = prompt("请输入管理密码以删除「" + item.title + "」：");
    if (pwd === null) return;
    if (pwd !== item.password) { alert("❌ 密码错误，删除失败。"); return; }

    if (!confirm("确认删除「" + item.title + "」吗？此操作不可撤销。")) return;

    var updated = all.filter(function (it) { return it.id !== itemId; });
    saveAll(updated);
    render();
  }

  /* ---- 筛选与搜索 ---- */
  function setupFilters() {
    // 分类筛选
    var categoryBtns = document.querySelectorAll("#shSidebar [data-sh-category]");
    for (var i = 0; i < categoryBtns.length; i++) {
      categoryBtns[i].addEventListener("click", function () {
        currentCategory = this.getAttribute("data-sh-category");
        // 更新侧边栏活跃态
        document.querySelectorAll("#shSidebar [data-sh-category]").forEach(function (b) { b.classList.remove("active"); });
        this.classList.add("active");
        // 取消状态筛选的高亮（因为切换了分类）
        document.querySelectorAll("#shSidebar [data-sh-status]").forEach(function (b) { b.classList.remove("active"); });
        currentStatus = "all";
        render();
      });
    }

    // 状态筛选
    var statusBtns = document.querySelectorAll("#shSidebar [data-sh-status]");
    for (var j = 0; j < statusBtns.length; j++) {
      statusBtns[j].addEventListener("click", function () {
        currentStatus = this.getAttribute("data-sh-status");
        document.querySelectorAll("#shSidebar [data-sh-status]").forEach(function (b) { b.classList.remove("active"); });
        this.classList.add("active");
        render();
      });
    }

    // 搜索（防抖 300ms）
    var searchInput = document.getElementById("shSearch");
    if (searchInput) {
      var searchTimer = null;
      searchInput.addEventListener("input", function () {
        clearTimeout(searchTimer);
        var self = this;
        searchTimer = setTimeout(function () {
          searchKeyword = self.value.trim();
          render();
        }, 300);
      });
    }
  }

  /* ---- 初始化 ---- */
  function init() {
    ensureSeeded();
    render();
    setupPublish();
    setupContactModal();
    setupFilters();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
