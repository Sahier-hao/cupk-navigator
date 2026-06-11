/**
 * common.js —— 全站公共脚本
 * 功能：动态导航栏/页脚生成、移动端折叠、实时时钟、返回顶部、
 *       暗色主题切换、滚动入场动画、最近访问记录、用户昵称系统、
 *       校徽入场转场动画、全局工具函数（escapeHtml、debounce、ShiguangStore）
 * 注：音乐播放器已独立为 javascript/player.js
 */

/* ================================================================
 * 页面检测（在 DOM 加载前执行）
 * ================================================================ */
(function () {
  // 从 URL 路径中提取当前页面文件名，若失败则默认为 index.html
  var path = location.pathname.split("/").pop() || "index.html";
  // 文件名到页面标识符的映射表，用于导航高亮和功能判断
  var pageMap = {
    "index.html": "home",
    "cupk.html": "cupk",
    "campus.html": "campus",
    "websites.html": "websites",
    "tools.html": "tools",
    "lostfound.html": "lostfound",
    "forum.html": "forum",
    "events.html": "events",
    "share.html": "share",
    "gallery.html": "gallery",
    "secondhand.html": "secondhand",
  };
  // 将页面标识符挂载到全局对象 window 上，供导航生成等其他模块读取
  window.__currentPage = pageMap[path] || "home";
})();

/* ================================================================
 * 校徽入场转场动画（仅首页）
 * ================================================================ */
(function () {
  /* 只在首页显示，其他页面跳过此动画 */
  if (window.__currentPage !== "home") return;

  // 创建全屏遮罩容器，包含背景层和校徽
  var splash = document.createElement("div");
  splash.id = "logo-splash";
  splash.innerHTML =
    '<div class="splash-bg"></div>' +
    '<div class="splash-inner">' +
    '<img src="images/中国石油大学矢量标.jpg" alt="中国石油大学" class="splash-logo" />' +
    '<div class="splash-ring"></div>' +
    "</div>";
  // 将转场动画元素添加到文档根节点
  document.documentElement.appendChild(splash);

  /* 兜底：1.6 秒后自动移除，防止动画因异常卡死 */
  setTimeout(function () {
    if (!splash.parentNode) return;
    splash.classList.add("splash-fade");
    // 淡出动画结束后从 DOM 中彻底移除
    setTimeout(function () {
      if (splash.parentNode) splash.parentNode.removeChild(splash);
    }, 500);
  }, 1600);
})();

/* ================================================================
 * SVG 图标辅助函数（全局可用）
 * ================================================================ */

/**
 * 生成 SVG 图标 HTML 字符串
 * 从 images/icons.svg 雪碧图中引用指定 id 的图标
 * @param {string} id - 图标在 SVG sprite 中的标识符
 * @param {number} [size=20] - 图标尺寸（宽高相同，单位 px）
 * @returns {string} 包含 <svg> 标签的 HTML 字符串
 */
function svgIcon(id, size) {
  size = size || 20;
  return (
    '<svg class="svg-icon" width="' +
    size +
    '" height="' +
    size +
    '" aria-hidden="true">' +
    '<use href="images/icons.svg#' +
    id +
    '"/>' +
    "</svg>"
  );
}

/* ================================================================
 * 全局工具函数
 * ================================================================ */

/**
 * HTML 转义，防止 XSS 攻击
 * 将特殊字符 & < > " 替换为对应的 HTML 实体
 * @param {string} str - 要转义的原始字符串
 * @returns {string} 转义后的安全字符串
 */
window.shiguangEscapeHtml = function (str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
};

/**
 * 防抖函数：限制高频操作的执行频率
 * 在连续调用时，只在最后一次调用后的 delay 毫秒后执行
 * @param {Function} fn - 需要防抖包装的函数
 * @param {number} [delay=300] - 防抖延迟时间（毫秒）
 * @returns {Function} 包装后的防抖函数
 */
window.shiguangDebounce = function (fn, delay) {
  delay = delay || 300;
  var timer = null;
  return function () {
    var args = arguments;
    var ctx = this;
    // 清除上一次的定时器，重新计时
    clearTimeout(timer);
    timer = setTimeout(function () { fn.apply(ctx, args); }, delay);
  };
};

/* ================================================================
 * localStorage 统一存取（向后兼容）
 * ================================================================ */
window.ShiguangStore = {
  /**
   * 从 localStorage 读取并解析 JSON 数据
   * @param {string} key - 存储键名
   * @param {*} [fallback] - 解析失败或空值时的默认返回值
   * @returns {*} 解析后的数据或 fallback
   */
  load: function (key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : (fallback !== undefined ? fallback : []);
    } catch (e) { return fallback !== undefined ? fallback : []; }
  },
  /**
   * 将数据序列化为 JSON 后写入 localStorage
   * @param {string} key - 存储键名
   * @param {*} value - 要存储的数据（会被 JSON.stringify）
   * @returns {boolean} 写入成功返回 true，失败返回 false
   */
  save: function (key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { return false; }
  },
};

/* ================================================================
 * 用户昵称系统（无需登录，仅记录昵称）
 * ================================================================ */
(function () {
  // localStorage 中存储用户信息的键名
  var USER_KEY = "shiguang_user";

  // 将用户系统挂载到全局 window.AppUser
  window.AppUser = {
    /**
     * 获取当前用户信息
     * @returns {Object|null} 包含 nickname 和 createdAt 的对象，或 null
     */
    get: function () {
      try {
        var raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    },
    /**
     * 设置/登录用户，存入昵称和创建时间
     * @param {string} nickname - 用户昵称
     * @returns {Object} 用户信息对象
     */
    set: function (nickname) {
      var user = { nickname: nickname, createdAt: new Date().toISOString() };
      try {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      } catch (e) {}
      return user;
    },
    /**
     * 退出登录：从 localStorage 中移除用户信息
     */
    logout: function () {
      try {
        localStorage.removeItem(USER_KEY);
      } catch (e) {}
    },
    /**
     * 判断用户是否已登录
     * @returns {boolean} 已登录返回 true
     */
    isLoggedIn: function () {
      return !!this.get();
    },
    /**
     * 获取用户昵称的快捷方法
     * @returns {string} 昵称字符串，未登录返回空字符串
     */
    getNickname: function () {
      var user = this.get();
      return user ? user.nickname : "";
    },
  };
})();

/* ================================================================
 * 导航栏 HTML 生成
 * 根据当前页面标识符动态生成带高亮的导航结构
 * ================================================================ */

/**
 * 生成完整的顶部导航栏 HTML
 * 包含品牌 Logo、移动端折叠按钮、主题切换、下拉菜单、用户状态
 * @returns {string} 导航栏的完整 HTML 字符串
 */
function generateHeader() {
  // 当前页面标识符，用于判断导航项高亮
  var cp = window.__currentPage;

  /**
   * 判断指定页面是否为当前页，返回 CSS class 后缀
   * @param {string} page - 页面标识符
   * @returns {string} 当前页返回 ' active'，否则返回空字符串
   */
  function active(page) {
    return cp === page ? ' active' : "";
  }

  // 根据登录状态生成不同的用户栏 HTML：已登录显示昵称+退出，未登录显示输入框+按钮
  var user = window.AppUser.get();
  var userHTML = "";
  if (user) {
    userHTML =
      '<span class="nav-user-nick">' +
      user.nickname +
      '</span><button class="nav-user-logout" id="btnLogout" title="退出">退出</button>';
  } else {
    userHTML =
      '<input class="nav-user-input" id="navNickname" type="text" placeholder="取个昵称…" maxlength="12" />' +
      '<button class="nav-user-btn" id="btnLogin">进入</button>';
  }

  return (
    // 无障碍跳转：键盘用户可直接跳到主内容区，避免 Tab 穿过整个导航
    '<a class="skip-link" href="#main">跳到内容</a>' +
    '<header class="site-header">' +
    // 导航栏容器
    '<div class="nav-wrap">' +
    // 品牌标识：校徽 + 站点名称，点击返回首页
    '<a class="brand" href="index.html">' +
    '<img class="brand-mark" src="images/中国石油大学矢量标.jpg" alt="中国石油大学" />石光驿站' +
    "</a>" +
    // 移动端菜单折叠按钮
    '<button class="nav-toggle" type="button" aria-label="打开导航">' +
    svgIcon("icon-menu", 22) +
    '<span class="sr-only">打开导航</span>' +
    "</button>" +
    // 暗色/亮色主题切换按钮
    '<button class="theme-toggle" type="button" aria-label="切换到暗色模式" title="切换暗色模式">' +
    svgIcon("icon-moon", 18) +
    "</button>" +
    // 主导航链接区域
    '<nav class="site-nav">' +
    // 首页链接
    '<a class="nav-link' +
    active("home") +
    '" href="index.html">首页</a>' +
    /* 校园导航下拉菜单：包含常用网站、校园生活、校园掠影 */
    '<div class="nav-dropdown">' +
    '<span class="nav-link nav-dropdown-trigger' +
    (cp === "cupk" || cp === "campus" || cp === "gallery" ? " active" : "") +
    '">校园导航 ▾</span>' +
    '<div class="nav-dropdown-menu">' +
    '<a href="cupk.html"' +
    (cp === "cupk" ? ' class="active"' : "") +
    ">常用网站</a>" +
    '<a href="campus.html"' +
    (cp === "campus" ? ' class="active"' : "") +
    ">校园生活</a>" +
    '<a href="gallery.html"' +
    (cp === "gallery" ? ' class="active"' : "") +
    ">校园掠影</a>" +
    "</div>" +
    "</div>" +
    /* 学习资源下拉菜单：包含资源库、工具箱、共享资源 */
    '<div class="nav-dropdown">' +
    '<span class="nav-link nav-dropdown-trigger' +
    (cp === "websites" || cp === "tools" || cp === "share" ? " active" : "") +
    '">学习资源 ▾</span>' +
    '<div class="nav-dropdown-menu">' +
    '<a href="websites.html"' +
    (cp === "websites" ? ' class="active"' : "") +
    ">资源库</a>" +
    '<a href="tools.html"' +
    (cp === "tools" ? ' class="active"' : "") +
    ">工具箱</a>" +
    '<a href="share.html"' +
    (cp === "share" ? ' class="active"' : "") +
    ">共享资源</a>" +
    "</div>" +
    "</div>" +
    // 一级导航：失物招领、互助论坛、活动日历
    '<a class="nav-link' +
    active("lostfound") +
    '" href="lostfound.html">失物招领</a>' +
    '<a class="nav-link' +
    active("forum") +
    '" href="forum.html">互助论坛</a>' +
    '<a class="nav-link' +
    active("events") +
    '" href="events.html">活动日历</a>' +
    '<a class="nav-link' +
    active("secondhand") +
    '" href="secondhand.html">二手交易</a>' +
    "</nav>" +
    // 右侧用户栏（昵称/登录入口）
    '<div class="nav-user" id="navUser">' +
    userHTML +
    "</div>" +
    "</div>" +
    "</header>"
  );
}

/* ================================================================
 * 页脚 HTML 生成
 * ================================================================ */

/**
 * 生成完整的底部页脚 HTML
 * 包含站点简介、校园导航链接、学习资源链接、校园服务链接
 * @returns {string} 页脚的完整 HTML 字符串
 */
function generateFooter() {
  return (
    '<footer class="site-footer">' +
    '<div class="container footer-grid">' +
    // 站点简介区域
    "<div>" +
    "<h3>石光驿站</h3>" +
    "<p>面向中石克学生的校园入口、学习资源、工具和网站导航。</p>" +
    "</div>" +
    // 校园导航链接组
    "<div>" +
    "<h4>校园导航</h4>" +
    '<a href="cupk.html">常用网站</a>' +
    '<a href="campus.html">校园生活指南</a>' +
    '<a href="gallery.html">校园掠影</a>' +
    "</div>" +
    // 学习资源链接组
    "<div>" +
    "<h4>学习资源</h4>" +
    '<a href="websites.html">资源库</a>' +
    '<a href="tools.html">学习工具箱</a>' +
    "</div>" +
    // 校园服务链接组（包含关于我们）
    "<div>" +
    "<h4>校园服务</h4>" +
    '<a href="lostfound.html">失物招领</a>' +
    '<a href="forum.html">互助论坛</a>' +
    '<a href="events.html">活动日历</a>' +
    '<a href="secondhand.html">二手交易</a>' +
    '<a href="index.html#about">关于我们</a>' +
    "</div>" +
    "</div>" +
    "</footer>"
  );
}

/* ================================================================
 * DOMContentLoaded 主入口
 * 页面 DOM 解析完成后执行所有初始化逻辑
 * ================================================================ */
document.addEventListener("DOMContentLoaded", function () {
  /* ---- 0. 注销所有旧的 Service Worker（防止缓存问题） ---- */
  // 遍历所有已注册的 Service Worker 并逐一注销，避免旧缓存干扰页面更新
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
      registrations.forEach(function (reg) { reg.unregister(); });
    });
  }

  /* ---- 0.5 页面加载进度条 ---- */
  // 在页面顶部显示一个加载进度条，提升感知加载速度
  (function () {
    var loader = document.createElement("div");
    loader.className = "page-loader";
    loader.id = "pageLoader";
    document.body.prepend(loader);

    // 快速推进到 65%，模拟加载感知
    requestAnimationFrame(function () {
      loader.style.width = "65%";
    });

    // 页面渲染完成后匀速拉到 100% 再消失
    var finalize = function () {
      loader.style.width = "100%";
      loader.classList.add("done");
      // 完成动画后从 DOM 中移除进度条元素
      setTimeout(function () {
        if (loader.parentNode) loader.parentNode.removeChild(loader);
      }, 400);
    };

    // 最快 350ms 完成进度条
    setTimeout(finalize, 350);
    // 兜底：window.load 时必定完成，确保进度条不会卡住
    window.addEventListener("load", function () {
      setTimeout(finalize, 50);
    });
  })();

  /* ---- 0.6 滚动进度指示器 ---- */
  // 在页面顶部显示一个细条，随滚动实时显示阅读进度百分比
  (function () {
    var progress = document.createElement("div");
    progress.className = "scroll-progress";
    progress.id = "scrollProgress";
    document.body.prepend(progress);

    // 使用 requestAnimationFrame 节流滚动事件，避免频繁计算导致性能问题
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          // 计算当前滚动位置占可滚动总高度的百分比
          var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
          var scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
          var pct = scrollHeight > 0 ? Math.min(100, (scrollTop / scrollHeight) * 100) : 0;
          progress.style.width = pct + "%";
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  })();

  /* ---- 1. 注入 header ---- */
  // 查找 HTML 中 #siteHeader 占位符，替换为动态生成的导航栏
  var headerEl = document.getElementById("siteHeader");
  if (headerEl) {
    headerEl.outerHTML = generateHeader();
  }

  /* ---- 2. 注入 footer ---- */
  // 查找 HTML 中 #siteFooter 占位符，替换为动态生成的页脚
  var footerEl = document.getElementById("siteFooter");
  if (footerEl) {
    footerEl.outerHTML = generateFooter();
  }

  /* ---- 3. 重新获取 DOM 引用 ---- */
  // 注入完成后重新获取导航折叠按钮、导航菜单、返回顶部按钮的 DOM 引用
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");
  var backTop = document.querySelector(".back-top");

  /* ---- 4. 用户栏事件绑定 + 个人中心面板 ---- */
  // 实现昵称登录/退出、个人中心面板（含四个标签页）的完整交互逻辑
  (function () {
    // 获取用户栏中的 DOM 元素引用（注入后才可获取）
    var nicknameInput = document.getElementById("navNickname");
    var loginBtn = document.getElementById("btnLogin");
    var logoutBtn = document.getElementById("btnLogout");
    var navUser = document.getElementById("navUser");

    // 创建个人中心面板（浮层），包含遮罩层、标题、四个标签页、内容区
    var profilePanel = document.createElement("div");
    profilePanel.className = "profile-panel";
    profilePanel.id = "profilePanel";
    profilePanel.innerHTML =
      '<div class="profile-mask"></div>' +
      '<div class="profile-card">' +
      '<div class="profile-head">' +
      '<h3 id="profileName"></h3>' +
      '<button class="profile-close" id="profileClose">✕</button>' +
      '</div>' +
      // 四个标签页：我的帖子、失物招领、我的活动、我的收藏
      '<div class="profile-tabs">' +
      '<button class="profile-tab active" data-profile-tab="posts">我的帖子</button>' +
      '<button class="profile-tab" data-profile-tab="lostfound">失物招领</button>' +
      '<button class="profile-tab" data-profile-tab="events">我的活动</button>' +
      '<button class="profile-tab" data-profile-tab="favs">我的收藏</button>' +
      '</div>' +
      '<div class="profile-body" id="profileBody"></div>' +
      '</div>';
    document.body.appendChild(profilePanel);

    /**
     * 从 localStorage 读取并解析 JSON 数组
     * @param {string} key - localStorage 键名
     * @returns {Array} 解析后的数组
     */
    function loadFrom(key) {
      try { return JSON.parse(localStorage.getItem(key) || "[]"); }
      catch (e) { return []; }
    }

    /**
     * 简易 HTML 转义（局部使用）
     * @param {string} str - 原始字符串
     * @returns {string} 转义后的安全字符串
     */
    function escapeH(str) {
      return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    }

    /**
     * 渲染个人中心面板中指定标签页的内容
     * @param {string} tab - 标签页标识：posts/lostfound/events/favs
     */
    function renderProfileTab(tab) {
      var user = window.AppUser.get();
      if (!user) return;
      var nickname = user.nickname;
      var body = document.getElementById("profileBody");
      // 设置面板标题为当前用户昵称
      document.getElementById("profileName").textContent = "👤 " + nickname;
      // 切换标签页的高亮样式
      document.querySelectorAll(".profile-tab").forEach(function (t) {
        t.classList.toggle("active", t.dataset.profileTab === tab);
      });

      var html = "";
      // 根据标签页类型从不同 localStorage 数据源筛选当前用户的数据
      if (tab === "posts") {
        // 从 shiguang_forum 中按昵称筛选帖子，显示标题、日期和回复数
        var posts = loadFrom("shiguang_forum").filter(function (p) { return p.nickname === nickname; });
        if (!posts.length) { html = '<p class="profile-empty">还没有发过帖子</p>'; }
        else {
          html = posts.slice(0, 10).map(function (p) {
            return '<a class="profile-item" href="forum.html">' +
              '<strong>' + escapeH(p.title) + '</strong>' +
              '<span>' + new Date(p.createdAt).toLocaleDateString("zh-CN") + ' · ' + (p.replies||[]).length + ' 回复</span>' +
              '</a>';
          }).join("");
        }
      } else if (tab === "lostfound") {
        // 从 shiguang_lostfound 中按昵称筛选失物招领记录，标注状态
        var items = loadFrom("shiguang_lostfound").filter(function (it) { return it.nickname === nickname; });
        if (!items.length) { html = '<p class="profile-empty">还没有发布过失物招领</p>'; }
        else {
          html = items.slice(0, 10).map(function (it) {
            var statusText = it.status === "claimed" ? "已认领" : (it.type === "lost" ? "寻物中" : "招领中");
            return '<a class="profile-item" href="lostfound.html">' +
              '<strong>' + (it.type === "lost" ? "🔴 " : "🔵 ") + escapeH(it.title) + '</strong>' +
              '<span>' + new Date(it.createdAt).toLocaleDateString("zh-CN") + ' · ' + statusText + '</span>' +
              '</a>';
          }).join("");
        }
      } else if (tab === "events") {
        // 从 shiguang_events 中按昵称筛选活动，显示日期和地点
        var evs = loadFrom("shiguang_events").filter(function (e) { return e.nickname === nickname; });
        if (!evs.length) { html = '<p class="profile-empty">还没有发布过活动</p>'; }
        else {
          html = evs.slice(0, 10).map(function (e) {
            return '<a class="profile-item" href="events.html">' +
              '<strong>' + escapeH(e.title) + '</strong>' +
              '<span>' + e.date + (e.location ? ' · ' + escapeH(e.location) : '') + '</span>' +
              '</a>';
          }).join("");
        }
      } else if (tab === "favs") {
        // 从 StudyStorage 获取收藏 ID 列表，再到 StudyResources 中查找对应资源
        var favIds = window.StudyStorage ? window.StudyStorage.getFavorites() : [];
        var resources = window.StudyResources || [];
        var favs = favIds.map(function (id) { return resources.find(function (r) { return r.id === id; }); }).filter(Boolean);
        if (!favs.length) { html = '<p class="profile-empty">还没有收藏资源</p>'; }
        else {
          html = favs.slice(0, 10).map(function (r) {
            return '<a class="profile-item" href="' + r.url + '" target="_blank" rel="noopener noreferrer">' +
              '<strong>' + escapeH(r.title) + '</strong>' +
              '<span class="tag">' + escapeH(r.type) + '</span>' +
              '</a>';
          }).join("");
        }
      }
      body.innerHTML = html || '<p class="profile-empty">暂无内容</p>';
    }

    // 显示个人中心面板，默认打开"我的帖子"标签页
    function showProfile() {
      profilePanel.classList.add("show");
      renderProfileTab("posts");
    }
    // 隐藏个人中心面板
    function hideProfile() {
      profilePanel.classList.remove("show");
    }

    // 点击遮罩层或关闭按钮均可关闭面板
    profilePanel.querySelector(".profile-mask").addEventListener("click", hideProfile);
    document.getElementById("profileClose").addEventListener("click", hideProfile);
    // 为四个标签页绑定点击切换事件
    profilePanel.querySelectorAll(".profile-tab").forEach(function (t) {
      t.addEventListener("click", function () { renderProfileTab(t.dataset.profileTab); });
    });

    // 登录按钮点击事件：获取输入昵称，更新用户栏为已登录状态
    if (loginBtn && nicknameInput) {
      loginBtn.addEventListener("click", function () {
        var name = nicknameInput.value.trim();
        if (!name) return;
        window.AppUser.set(name);
        // 将用户栏替换为已登录界面：昵称（可点击打开个人中心）+ 退出按钮
        navUser.innerHTML =
          '<span class="nav-user-nick" id="navNickLabel">' +
          name +
          '</span><button class="nav-user-logout" id="btnLogout2" title="退出">退出</button>';
        document.getElementById("navNickLabel").addEventListener("click", showProfile);
        var newLogout = document.getElementById("btnLogout2");
        if (newLogout) {
          newLogout.addEventListener("click", function () {
            // 退出登录：清除用户信息，重置为未登录界面
            window.AppUser.logout();
            hideProfile();
            navUser.innerHTML =
              '<input class="nav-user-input" id="navNickname2" type="text" placeholder="取个昵称…" maxlength="12" />' +
              '<button class="nav-user-btn" id="btnLogin2">进入</button>';
            document.getElementById("btnLogin2").addEventListener("click", arguments.callee);
          });
        }
      });
      // 昵称输入框支持回车提交
      nicknameInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") loginBtn.click();
      });
    }

    // 首次加载时如果已有退出按钮（已登录状态），绑定退出事件
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        window.AppUser.logout();
        hideProfile();
        navUser.innerHTML =
          '<input class="nav-user-input" id="navNickname3" type="text" placeholder="取个昵称…" maxlength="12" />' +
          '<button class="nav-user-btn" id="btnLogin3">进入</button>';
        // 为重新生成的登录按钮和输入框绑定事件
        document.getElementById("btnLogin3").addEventListener("click", function () {
          var name = document.getElementById("navNickname3").value.trim();
          if (!name) return;
          window.AppUser.set(name);
          location.reload();
        });
        document.getElementById("navNickname3").addEventListener("keydown", function (e) {
          if (e.key === "Enter") document.getElementById("btnLogin3").click();
        });
      });
    }

    // 如果已登录，给昵称绑定点击事件，打开个人中心面板
    var existingNick = document.getElementById("navNickLabel") || document.querySelector(".nav-user-nick");
    if (existingNick && window.AppUser.isLoggedIn()) {
      existingNick.addEventListener("click", showProfile);
    }
  })();

  /* ---- 5. 导航栏实时时钟 ---- */
  // 创建 <time> 元素用于在导航栏显示当前日期和时间，每秒更新一次
  var clockEl = document.createElement("time");
  clockEl.className = "nav-clock";
  clockEl.setAttribute("datetime", "");
  clockEl.setAttribute("aria-label", "当前时间");

  /**
   * 时钟更新函数：获取当前时间并格式化为 "YYYY/MM/DD 周X HH:MM:SS" 格式
   */
  function tick() {
    var now = new Date();
    var hh = String(now.getHours()).padStart(2, "0");
    var mm = String(now.getMinutes()).padStart(2, "0");
    var ss = String(now.getSeconds()).padStart(2, "0");
    var y = now.getFullYear();
    var M = String(now.getMonth() + 1).padStart(2, "0");
    var d = String(now.getDate()).padStart(2, "0");
    var weekDays = ["日", "一", "二", "三", "四", "五", "六"];
    var w = weekDays[now.getDay()];
    clockEl.innerHTML =
      y + "/" + M + "/" + d + " 周" + w + "&nbsp;" + hh + ":" + mm + ":" + ss;
    clockEl.setAttribute("datetime", now.toISOString());
  }
  tick();                           // 立即执行一次，避免首次显示空白
  setInterval(tick, 1000);          // 每秒更新一次
  // 将时钟插入到导航栏前面
  if (nav && nav.parentNode) {
    nav.parentNode.insertBefore(clockEl, nav);
  }

  /* ---- 6. 移动端导航折叠 ---- */
  // 点击汉堡菜单按钮切换导航菜单的展开/折叠状态（移动端响应式布局）
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  /* ---- 7. 滚动入场动画 ---- */
  // 为页面中多种卡片和区块添加淡入动画，用户在滚动到它们时触发
  // 定义需要动画的目标元素 CSS 选择器列表（覆盖所有页面的主要区块）
  var fadeTargets = document.querySelectorAll(
    ".card, .campus-section, .media-section, .tools-section, .timeline-item, " +
    ".campus-image-card, .campus-icon-text-item, .campus-transport-card, " +
    ".resource-library-card, .media-gallery-card, .gpa-calculator, " +
    ".gpa-reference, .hero-slider, .workspace-panel, .resource-category-item, " +
    ".team-avatar, .login-card, .audio-player-card, .forum-post, .lf-card"
  );
  // 先统一添加 .fade-up 类（初始透明状态），等待 IntersectionObserver 触发可见
  fadeTargets.forEach(function (el) { el.classList.add("fade-up"); });

  // 检测浏览器是否支持 IntersectionObserver API
  if ("IntersectionObserver" in window) {
    var fadeObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          // 当元素进入视口时添加 .fade-up-visible 类触发 CSS 过渡动画
          if (entry.isIntersecting) {
            entry.target.classList.add("fade-up-visible");
            // 动画触发后停止观察，避免重复触发
            fadeObserver.unobserve(entry.target);
          }
        });
      },
      // 阈值 0.12（元素 12% 进入视口即触发），底部提前 30px 开始检测
      { threshold: 0.12, rootMargin: "0px 0px -30px 0px" }
    );

    document.querySelectorAll(".fade-up").forEach(function (el) {
      // 计算同层级中当前元素的索引，按顺序分配递增的动画延迟
      var parent = el.parentNode;
      if (parent) {
        var siblings = Array.prototype.filter.call(parent.children, function (c) {
          return c.classList.contains("fade-up");
        });
        var idx = siblings.indexOf(el);
        // 只对前 20 个元素分配延迟，避免过多元素堆叠延迟
        if (idx > 0 && idx <= 20) {
          el.style.transitionDelay = idx * 0.05 + "s";
        }
      }
      fadeObserver.observe(el);
    });
  } else {
    // 不支持 IntersectionObserver 的浏览器直接显示所有动画元素
    document.querySelectorAll(".fade-up").forEach(function (el) {
      el.classList.add("fade-up-visible");
    });
  }

  /* ---- 8. 返回顶部 ---- */
  // 当页面滚动超过 360px 时显示返回顶部按钮，点击后平滑滚动回页面顶部
  if (backTop) {
    window.addEventListener("scroll", function () {
      backTop.classList.toggle("show", window.scrollY > 360);
    });
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---- 9. 暗色主题 ---- */
  // 通过 data-theme 属性切换暗色/亮色主题，偏好持久化到 localStorage
  (function () {
    var THEME_KEY = "studyhub:theme";
    var toggle = document.querySelector(".theme-toggle");

    /**
     * 从 localStorage 读取主题偏好
     * @returns {string} "dark" 或 "light"
     */
    function getTheme() {
      try { return localStorage.getItem(THEME_KEY) || "light"; } catch (e) { return "light"; }
    }

    /**
     * 应用主题：设置/移除 data-theme 属性，更新按钮图标和 aria-label
     * @param {string} theme - "dark" 或 "light"
     */
    function setTheme(theme) {
      if (theme === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
      } else {
        document.documentElement.removeAttribute("data-theme");
      }
      if (toggle) {
        // 暗色模式显示太阳图标（可切换到亮色），亮色模式显示月亮图标
        toggle.innerHTML =
          theme === "dark" ? svgIcon("icon-sun", 18) : svgIcon("icon-moon", 18);
        toggle.setAttribute(
          "aria-label",
          theme === "dark" ? "切换到亮色模式" : "切换到暗色模式"
        );
      }
      // 将主题偏好持久化到 localStorage，下次访问自动恢复
      try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
    }

    // 页面加载时从 localStorage 恢复上次的主题设置
    setTheme(getTheme());

    // 点击主题切换按钮，在暗色和亮色之间来回切换
    if (toggle) {
      toggle.addEventListener("click", function () {
        var current = document.documentElement.hasAttribute("data-theme") ? "dark" : "light";
        setTheme(current === "dark" ? "light" : "dark");
      });
    }
  })();

  /* ---- 10. 最近访问记录 ---- */
  // 将当前页面标题和 URL 记录到 localStorage 的最近访问列表中
  if (window.StudyStorage) {
    window.StudyStorage.addRecent({
      title: document.title.replace(" - 石光驿站", ""),
      url: location.pathname.split("/").pop() || "index.html",
    });
  }

  /* ---- 11. 复制按钮 ---- */
  // 为带有 data-copy 属性的按钮绑定点击事件：将指定元素的内容复制到剪贴板
  document.querySelectorAll("[data-copy]").forEach(function (button) {
    button.addEventListener("click", function () {
      // data-copy 属性值为 CSS 选择器，指向要复制内容的目标元素
      var target = document.querySelector(button.dataset.copy);
      if (!target) return;
      // 使用 Clipboard API 将目标元素的纯文本内容写入剪贴板
      navigator.clipboard.writeText(target.innerText).then(function () {
        button.textContent = "已复制";
        // 1.4 秒后恢复按钮原始文字
        setTimeout(function () { button.textContent = "复制模板"; }, 1400);
      });
    });
  });

  /* ---- 11.5 按钮波纹效果 ---- */
  // 全局监听点击事件，为所有 .button 元素添加 Material Design 风格的波纹动画
  document.addEventListener("click", function (e) {
    // 查找被点击元素最近的 .button 祖先
    var btn = e.target.closest(".button");
    if (!btn) return;
    // 跳过已含波纹容器的重复触发，防止在波纹元素上再次生成波纹
    if (e.target.classList.contains("ripple-effect")) return;

    // 创建波纹元素（一个圆形的 <span>），定位在点击位置
    var ripple = document.createElement("span");
    ripple.className = "ripple-effect";
    var rect = btn.getBoundingClientRect();
    // 波纹直径取按钮宽高中的较大值的 1.2 倍，确保覆盖整个按钮
    var size = Math.max(rect.width, rect.height) * 1.2;
    ripple.style.width = size + "px";
    ripple.style.height = size + "px";
    // 计算波纹圆心对齐到鼠标点击位置
    ripple.style.left = (e.clientX - rect.left - size / 2) + "px";
    ripple.style.top = (e.clientY - rect.top - size / 2) + "px";

    btn.appendChild(ripple);
    // 动画结束后从 DOM 中移除波纹元素
    ripple.addEventListener("animationend", function () {
      if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
    });
  });

  /* ---- 11.6 为深色/重点卡片添加光晕扫描效果 ---- */
  // 为深色面板、统计项、快捷卡片等视觉重点元素添加 .card-glossy 类（CSS 光晕扫描动画）
  document.querySelectorAll(".panel-dark, .stat-item, .quick-card").forEach(function (el) {
    el.classList.add("card-glossy");
  });

  /* ---- 12. 音乐播放器 —— 已独立为 javascript/player.js，在 HTML 中引用 ---- */

  /* ---- 13. View Transition API 页面过渡（支持浏览器） ---- */
  // 使用 View Transition API 实现平滑的页面切换动画（仅支持该 API 的浏览器）
  if (document.startViewTransition) {
    document.addEventListener("click", function (e) {
      var link = e.target.closest("a[href]");
      if (!link) return;
      // 仅处理站内链接，跨域链接保持默认行为
      if (link.hostname !== location.hostname) return;
      // 排除锚点跳转（同页 hash）
      if (link.getAttribute("href") && link.getAttribute("href").charAt(0) === "#") return;
      // 排除有 target="_blank" 的新窗口/新标签页打开方式
      if (link.target === "_blank") return;
      // 排除下载链接
      if (link.hasAttribute("download")) return;
      // 阻止默认导航，改用 View Transition API 实现过渡效果
      e.preventDefault();
      document.startViewTransition(function () {
        location.href = link.href;
      });
    });
  }
});
