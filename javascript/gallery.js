/* ================================================================
 * 校园掠影（gallery.js）
 * 功能：校园照片画廊、上传、灯箱查看、点赞、删除
 * 数据存储在 localStorage（key: shiguang_gallery）
 * ================================================================ */

(function () {
  "use strict";

  /* ---- 常量 ---- */
  /* localStorage 中存储照片数据使用的键名 */
  var STORAGE_KEY = "shiguang_gallery";
  /* 用户上传照片的数量上限，防止超出 localStorage 存储限额 */
  var MAX_PHOTOS = 100;

  /* ---- 种子数据：预先填充的校园照片 ---- */
  /**
   * 种子照片数据字段说明：
   * - id:       唯一标识符，以 "seed_" 前缀标记，用于区分用户上传数据
   * - title:    照片展示标题
   * - desc:     照片的描述文本
   * - url:      图片文件路径
   * - uploader: 上传者昵称
   * - likes:    点赞数
   * - date:     上传日期（YYYY-MM-DD 格式）
   * - isSeed:   是否为种子标记，种子照片不可从界面删除
   */
  var SEED_PHOTOS = [
    {
      id: "seed_1",
      title: "红山湖畔 · 夕阳",
      desc: "夕阳下的红山湖，波光粼粼，是校园最美的角落。",
      url: "images/cupk1.png",
      uploader: "石光小站",
      likes: 42,
      date: "2026-04-15",
      isSeed: true,
    },
    {
      id: "seed_2",
      title: "C5教学楼 · 晚霞",
      desc: "下课后的C5，天边染上了绚烂的晚霞。",
      url: "images/cupk2.jpg",
      uploader: "石光小站",
      likes: 38,
      date: "2026-04-20",
      isSeed: true,
    },
    {
      id: "seed_3",
      title: "校园大道 · 秋意",
      desc: "秋天的校园，金黄一片，走在路上心情都变好了。",
      url: "images/cupk3.jpg",
      uploader: "石光小站",
      likes: 35,
      date: "2026-05-02",
      isSeed: true,
    },
    {
      id: "seed_4",
      title: "图书馆 · 静谧时光",
      desc: "图书馆的一角，阳光透过玻璃窗洒在书页上。",
      url: "images/cupk4.jpg",
      uploader: "石光小站",
      likes: 51,
      date: "2026-05-10",
      isSeed: true,
    },
    {
      id: "seed_5",
      title: "校园地标 · 中石大",
      desc: "校门口的标志性石刻，见证着一届又一届学子的成长。",
      url: "images/cupk1.jpg",
      uploader: "石光小站",
      likes: 29,
      date: "2026-05-18",
      isSeed: true,
    },
  ];

  /* ---- 工具函数 ---- */
  /**
   * 转义 HTML 特殊字符，防止 XSS 攻击
   * 在将用户输入的内容插入 DOM 前必须经过此函数处理
   * @param {string} str - 待转义的原始字符串
   * @returns {string} 转义后的安全字符串
   */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /**
   * 获取当前日期，格式化为 YYYY-MM-DD
   * 用于记录照片上传日期
   * @returns {string} 格式化后的日期字符串
   */
  function getNow() {
    var d = new Date();
    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0")
    );
  }

  /* ---- 数据读写 ---- */
  /**
   * 从 localStorage 读取全部照片数据
   * 数据以 JSON 数组格式存储，解析失败时返回空数组
   * @returns {Array} 照片对象数组
   */
  function loadAll() {
    var all = [];
    try {
      all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (_) {
      /* JSON 解析异常时返回空数组，避免程序崩溃 */
      all = [];
    }
    return all;
  }

  /**
   * 将照片数组序列化为 JSON 后写入 localStorage
   * 存储空间不足时静默失败，不阻塞用户后续操作
   * @param {Array} photos - 待存储的照片数据数组
   */
  function saveAll(photos) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
    } catch (_) {
      /* localStorage 满时静默失败 */
    }
  }

  /**
   * 首次使用时用种子数据初始化存储
   * 检测到本地无数据时，将预设的校园风景照片写入存储
   */
  /* 首次使用时用种子数据初始化 */
  function ensureSeeded() {
    var existing = loadAll();
    if (existing.length === 0) {
      saveAll(SEED_PHOTOS);
    }
  }

  /* ---- 获取当前用户昵称 ---- */
  /**
   * 获取当前登录用户的昵称
   * 优先通过 window.AppUser 统一接口获取，
   * 若不可用则降级为直接解析 localStorage 中的 shiguang_user 数据
   * @returns {string} 用户昵称，未登录时返回空字符串
   */
  function getCurrentUser() {
    if (window.AppUser) {
      return window.AppUser.getNickname
        ? window.AppUser.getNickname()
        : window.AppUser.get()
          ? window.AppUser.get().nickname
          : "";
    }
    try {
      var u = JSON.parse(localStorage.getItem("shiguang_user") || "{}");
      return u.nickname || "";
    } catch (_) {
      /* localStorage 数据异常时返回空字符串 */
      return "";
    }
  }

  /* ---- 渲染 ---- */
  /**
   * 渲染画廊网格视图
   * 读取全部照片数据，动态构建卡片 HTML 并插入 DOM，
   * 同时绑定卡片点击打开灯箱、点赞按钮和删除按钮的交互事件
   */
  function render() {
    var grid = document.getElementById("galleryGrid");
    var empty = document.getElementById("galleryEmpty");
    var countEl = document.getElementById("photoCount");
    /* 网格容器不存在时直接返回，避免后续操作报错 */
    if (!grid) return;

    var photos = loadAll();

    /* 更新照片总数统计显示 */
    if (countEl) {
      countEl.textContent = "共 " + photos.length + " 张照片";
    }

    /* 无照片时显示空状态提示，隐藏照片网格 */
    if (photos.length === 0) {
      grid.innerHTML = "";
      if (empty) empty.style.display = "block";
      return;
    }
    if (empty) empty.style.display = "none";

    /* 逐张遍历照片，拼接卡片 HTML 字符串 */
    var html = "";
    for (var i = 0; i < photos.length; i++) {
      var p = photos[i];
      html +=
        '<div class="gallery-card" data-id="' +
        p.id +
        '">' +
        '<div class="gallery-card-img-wrap">' +
        '<img src="' +
        escapeHtml(p.url) +
        '" alt="' +
        escapeHtml(p.title) +
        '" loading="lazy" />' +
        "</div>" +
        '<div class="gallery-card-body">' +
        "<h3>" +
        escapeHtml(p.title) +
        "</h3>" +
        (p.desc
          ? '<p class="gallery-card-desc">' + escapeHtml(p.desc) + "</p>"
          : "") +
        '<div class="gallery-card-meta">' +
        '<span class="gallery-card-uploader">📷 ' +
        escapeHtml(p.uploader) +
        "</span>" +
        '<span class="gallery-card-date">' +
        escapeHtml(p.date) +
        "</span>" +
        "</div>" +
        '<div class="gallery-card-actions">' +
        '<button class="gallery-like-btn' +
        (p.liked ? " liked" : "") +
        '" data-id="' +
        p.id +
        '">' +
        (p.liked ? "❤️" : "🤍") +
        " <span>" +
        (p.likes || 0) +
        "</span></button>" +
        (!p.isSeed
          ? '<button class="gallery-del-btn" data-id="' +
            p.id +
            '">🗑️ 删除</button>'
          : "") +
        "</div>" +
        "</div>" +
        "</div>";
    }
    /* 将拼接好的 HTML 一次性插入网格容器，减少 DOM 操作次数 */
    grid.innerHTML = html;

    /* 绑定事件：点击图片区域打开灯箱查看大图 */
    var cards = grid.querySelectorAll(".gallery-card-img-wrap");
    for (var j = 0; j < cards.length; j++) {
      cards[j].addEventListener("click", function (e) {
        var card = this.closest(".gallery-card");
        if (card) openLightbox(card.getAttribute("data-id"));
      });
    }

    /* 绑定事件：点赞按钮切换点赞状态 */
    var likeBtns = grid.querySelectorAll(".gallery-like-btn");
    for (var k = 0; k < likeBtns.length; k++) {
      likeBtns[k].addEventListener("click", function (e) {
        e.stopPropagation();
        toggleLike(this.getAttribute("data-id"));
      });
    }

    /* 绑定事件：删除按钮触发密码验证后删除照片 */
    var delBtns = grid.querySelectorAll(".gallery-del-btn");
    for (var m = 0; m < delBtns.length; m++) {
      delBtns[m].addEventListener("click", function (e) {
        e.stopPropagation();
        handleDelete(this.getAttribute("data-id"));
      });
    }
  }

  /* ---- 上传 ---- */
  /**
   * 初始化照片上传功能
   * 配置上传表单的显示/隐藏切换、自动填充昵称、表单验证和提交保存流程
   */
  function setupUpload() {
    var toggleBtn = document.getElementById("btnUploadToggle");
    var form = document.getElementById("uploadForm");
    var submitBtn = document.getElementById("btnUploadSubmit");
    var cancelBtn = document.getElementById("btnUploadCancel");

    /* 上传按钮或表单 DOM 不存在时直接退出 */
    if (!toggleBtn || !form) return;

    /* 切换表单显示 */
    toggleBtn.addEventListener("click", function () {
      var isHidden = form.style.display === "none";
      form.style.display = isHidden ? "block" : "none";
      if (isHidden) {
        /* 展开时自动填充当前登录用户的昵称 */
        /* 自动填充昵称 */
        var uploaderInput = document.getElementById("galleryUploader");
        if (uploaderInput && !uploaderInput.value) {
          uploaderInput.value = getCurrentUser();
        }
      }
    });

    /* 取消上传：隐藏表单并清空所有输入项 */
    cancelBtn.addEventListener("click", function () {
      form.style.display = "none";
      form.querySelectorAll("input, textarea").forEach(function (el) {
        el.value = "";
      });
    });

    /* 提交上传：执行表单验证并保存照片数据 */
    submitBtn.addEventListener("click", function () {
      var title = document.getElementById("galleryTitle");
      var url = document.getElementById("galleryUrl");
      var desc = document.getElementById("galleryDesc");
      var uploader = document.getElementById("galleryUploader");
      var password = document.getElementById("galleryPassword");

      /* 校验：照片标题不能为空 */
      if (!title.value.trim()) {
        alert("请填写照片标题～");
        title.focus();
        return;
      }

      /* 校验：上传者昵称不能为空 */
      if (!uploader.value.trim()) {
        alert("请填写你的昵称～");
        uploader.focus();
        return;
      }

      /* 校验：管理密码不能为空，后续删除照片需要密码验证 */
      if (!password.value.trim()) {
        alert("请设置管理密码，后续删除照片需要用到～");
        password.focus();
        return;
      }

      /* 校验图片链接：若未填写则从种子照片中随机选取一张占位 */
      var imageUrl = url.value.trim();
      if (!imageUrl) {
        /* 从种子数据中随机抽取一张图片路径作为占位 */
        var randomSeed =
          SEED_PHOTOS[Math.floor(Math.random() * SEED_PHOTOS.length)];
        imageUrl = randomSeed.url;
      }

      /* 检查用户上传数量是否已达上限 */
      var all = loadAll();
      var userCount = all.filter(function (p) {
        return !p.isSeed;
      }).length;
      if (userCount >= MAX_PHOTOS) {
        alert("已达存储上限（" + MAX_PHOTOS + "张），请先删除一些旧照片。");
        return;
      }

      /* 构造新的照片数据对象 */
      var newPhoto = {
        /* id 使用时间戳加随机字符串保证唯一性 */
        id: "user_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
        title: title.value.trim(),
        desc: desc.value.trim(),
        url: imageUrl,
        uploader: uploader.value.trim(),
        likes: 0,
        liked: false,
        date: getNow(),
        password: password.value.trim(),
        isSeed: false,
      };

      /* 将新照片插入到数组头部，最新上传显示在最前面 */
      var allPhotos = loadAll();
      allPhotos.unshift(newPhoto);
      saveAll(allPhotos);

      /* 上传完成后清空表单输入并隐藏上传面板 */
      form.querySelectorAll("input, textarea").forEach(function (el) {
        el.value = "";
      });
      form.style.display = "none";

      /* 重新渲染画廊网格以显示新照片 */
      render();
      alert("🎉 上传成功！你的照片已加入校园相册。");
    });
  }

  /* ---- 点赞 ---- */
  /**
   * 切换指定照片的点赞状态
   * 已点赞则取消点赞（点赞数减一），未点赞则执行点赞（点赞数加一）
   * @param {string} photoId - 照片的唯一标识符
   */
  function toggleLike(photoId) {
    var all = loadAll();
    var found = false;
    /* 遍历照片数组查找目标照片 */
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === photoId) {
        if (all[i].liked) {
          /* 已点赞则取消：点赞数减一，状态置为 false */
          all[i].likes = Math.max(0, (all[i].likes || 0) - 1);
          all[i].liked = false;
        } else {
          /* 未点赞则执行点赞：点赞数加一，状态置为 true */
          all[i].likes = (all[i].likes || 0) + 1;
          all[i].liked = true;
        }
        found = true;
        break;
      }
    }
    /* 找到目标照片则保存数据并重新渲染界面 */
    if (found) {
      saveAll(all);
      render();
    }
  }

  /* ---- 删除（需密码验证） ---- */
  /**
   * 删除指定照片，需输入管理密码验证身份
   * 验证通过后从存储中移除该照片并重新渲染画廊
   * @param {string} photoId - 要删除的照片的唯一标识符
   */
  function handleDelete(photoId) {
    var all = loadAll();
    var target = null;
    /* 在照片数组中查找目标对象 */
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === photoId) {
        target = all[i];
        break;
      }
    }
    /* 未找到目标照片则直接返回 */
    if (!target) return;

    /* 弹出密码输入框要求用户输入管理密码 */
    var pwd = prompt(
      '请输入管理密码以删除「' + target.title + '」：',
    );
    if (pwd === null) return; /* 取消 */
    /* 密码校验失败则提示错误并终止删除操作 */
    if (pwd !== target.password) {
      alert("❌ 密码错误，删除失败。");
      return;
    }

    /* 二次确认对话框，防止用户误删照片 */
    /* 确认删除 */
    if (!confirm('确认删除「' + target.title + '」吗？')) return;

    /* 过滤掉要删除的照片，保留其余照片 */
    var updated = all.filter(function (p) {
      return p.id !== photoId;
    });
    saveAll(updated);
    render();
  }

  /* ---- 灯箱 ---- */
  /**
   * 打开灯箱查看大图
   * 在页面中央显示照片大图，同时展示标题、描述、上传者和点赞数
   * @param {string} photoId - 要查看的照片的唯一标识符
   */
  function openLightbox(photoId) {
    var all = loadAll();
    var target = null;
    /* 查找目标照片数据 */
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === photoId) {
        target = all[i];
        break;
      }
    }
    /* 未找到目标照片则直接返回 */
    if (!target) return;

    var overlay = document.getElementById("lightbox");
    var img = document.getElementById("lightboxImg");
    var info = document.getElementById("lightboxInfo");

    /* 灯箱 DOM 元素不完整时退出，避免操作不存在的元素 */
    if (!overlay || !img || !info) return;

    /* 设置大图地址和替代文本，用于图片加载和辅助阅读 */
    img.src = target.url;
    img.alt = target.title;
    /* 动态构建照片详情信息 HTML，展示在图片下方 */
    info.innerHTML =
      "<h3>" +
      escapeHtml(target.title) +
      "</h3>" +
      (target.desc
        ? "<p>" + escapeHtml(target.desc) + "</p>"
        : "") +
      '<div class="lightbox-meta">' +
      "📷 " +
      escapeHtml(target.uploader) +
      " &nbsp;·&nbsp; " +
      escapeHtml(target.date) +
      " &nbsp;·&nbsp; ❤️ " +
      (target.likes || 0) +
      "</div>";

    /* 显示灯箱遮罩层，同时禁止页面背景滚动 */
    overlay.style.display = "flex";
    document.body.style.overflow = "hidden";
  }

  /**
   * 初始化灯箱的交互事件
   * 包括关闭按钮点击、遮罩背景点击和 ESC 键三种关闭方式
   */
  function setupLightbox() {
    var overlay = document.getElementById("lightbox");
    if (!overlay) return;

    /* 点击关闭按钮 */
    var closeBtn = overlay.querySelector(".lightbox-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", closeLightbox);
    }

    /* 点击遮罩背景（非图片区域）也关闭灯箱，符合用户直觉 */
    /* 点击遮罩背景关闭 */
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeLightbox();
    });

    /* 按下键盘 ESC 键关闭灯箱，提升键盘操作体验 */
    /* ESC 键关闭 */
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeLightbox();
    });
  }

  /**
   * 关闭灯箱
   * 隐藏遮罩层并恢复页面的背景滚动能力
   */
  function closeLightbox() {
    var overlay = document.getElementById("lightbox");
    if (overlay) overlay.style.display = "none";
    document.body.style.overflow = "";
  }

  /* ---- 初始化 ---- */
  /**
   * 入口初始化函数
   * 依次执行：种子数据初始化、画廊渲染、上传功能绑定、灯箱事件绑定
   */
  function init() {
    ensureSeeded();
    render();
    setupUpload();
    setupLightbox();
  }

  /* DOM 就绪后执行初始化 */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    /* DOM 已就绪则立即执行 */
    init();
  }
})();
