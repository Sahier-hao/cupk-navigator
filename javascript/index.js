/**
 * index.js —— 首页专属脚本
 * 功能：Hero 背景图轮播（自动+手动+圆点）、搜索框资源检索、收藏/最近面板渲染、
 *       校园掠影展示、失物招领与论坛最新动态聚合
 * 数据来源：window.StudyResources (data.js) + localStorage (shiguang_lostfound, shiguang_forum)
 * 存储依赖：window.StudyStorage (storage.js)
 */
document.addEventListener("DOMContentLoaded", function () {
  // DOM 元素引用：搜索框、搜索按钮、搜索结果面板、收藏面板、最近访问面板
  var input = document.querySelector("#homeSearch");
  var button = document.querySelector("#homeSearchButton");
  var result = document.querySelector("#homeSearchResult");
  var favoritesPanel = document.querySelector("#favoritesPanel");
  var recentPanel = document.querySelector("#recentPanel");
  // 获取全局资源数据，若 data.js 未加载则降级为空数组
  var resources = window.StudyResources || [];

  /* ================================================================
     Hero 标题逐字弹出动画
     将标题文本拆分为单个字符，每个字符用 span 包裹，
     通过递增的 animationDelay 实现逐字出现的打字机效果
     ================================================================ */
  (function () {
    var title = document.querySelector(".hero-title");
    if (!title) return;
    var text = title.textContent.trim();
    // 跳过已包含 span 的情况（避免重复执行导致动画错乱）
    if (title.querySelector(".char-reveal")) return;
    var chars = text.split("");
    title.innerHTML = "";
    chars.forEach(function (ch, i) {
      var span = document.createElement("span");
      span.className = "char-reveal";
      span.textContent = ch;
      // 每个字的延迟递增 0.08 秒，形成从左到右依次弹出的效果
      span.style.animationDelay = (i * 0.08) + "s";
      title.appendChild(span);
    });
  })();

  /* ================================================================
     搜索功能
     在 StudyResources 中按标题、描述、关键词匹配，
     最多显示 4 条结果，超出显示"查看全部"链接
     ================================================================ */
  function search() {
    var value = input.value.trim();
    // 空输入时显示提示文案，引导用户尝试常见关键词
    if (!value) {
      result.classList.add("show");
      result.innerHTML = '<strong>请输入关键词</strong><p>可以试试：期末、笔记、论文、编程、AI。</p>';
      return;
    }
    var lower = value.toLowerCase();
    // 在资源数据的标题、描述、关键词数组中搜索匹配项
    var matched = resources.filter(function (item) {
      return item.title.toLowerCase().includes(lower) ||
        item.description.toLowerCase().includes(lower) ||
        // 关键词数组支持部分匹配：用户输入包含关键词或关键词包含用户输入均可命中
        item.keywords.some(function (key) {
          return lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower);
        });
    });
    result.classList.add("show");
    // 无匹配结果时显示提示，并附带进入资源库的快捷链接
    if (!matched.length) {
      result.innerHTML = '<strong>没有找到完全匹配的资源</strong><p>换"CUPK、教务、知网、论文、编程、AI"等关键词试试，或进入资源库查看全部分类。</p><a class="button secondary" href="websites.html">查看资源库</a>';
      return;
    }
    // 最多展示 4 条结果，超出时在底部显示"查看全部 N 个"
    var maxShow = 4;
    var hasMore = matched.length > maxShow;
    result.innerHTML = matched.slice(0, maxShow).map(function (item) {
      // 每行显示：类型标签 + 标题 + 描述 + 收藏按钮 + 跳转链接
      // 收藏按钮使用 data-favorite 属性记录资源id，供 bindFavoriteButtons 绑定事件
      return '<div class="search-result-row">' +
        '<div><span class="tag coral">' + item.type + '</span><strong>' + item.title + '</strong><p>' + item.description + '</p></div>' +
        '<div class="result-actions"><button class="button secondary" data-favorite="' + item.id + '">收藏</button><a class="button primary" href="' + item.url + '">进入</a></div>' +
        '</div>';
    }).join("") +
    (hasMore ? '<div class="search-more"><a class="button secondary" href="websites.html">查看全部 ' + matched.length + ' 个匹配资源 →</a></div>' : '');
    // 为新渲染的收藏按钮绑定点击事件
    bindFavoriteButtons();
  }

  // 根据资源 id 在 StudyResources 数组中查找对应的资源对象
  // 用于将收藏 ID 数组转换为完整的资源对象列表
  function findResource(id) {
    return resources.find(function (item) { return item.id === id; });
  }

  // 为搜索结果和收藏面板中的收藏按钮绑定点击事件
  // 点击后切换收藏状态，同步更新按钮文字和收藏面板内容
  function bindFavoriteButtons() {
    document.querySelectorAll("[data-favorite]").forEach(function (btn) {
      var id = btn.dataset.favorite;
      // 初始化按钮文字：已收藏的资源显示"已收藏"
      if (window.StudyStorage && window.StudyStorage.isFavorite(id)) {
        btn.textContent = "已收藏";
      }
      btn.addEventListener("click", function () {
        if (!window.StudyStorage) return;
        // 切换收藏状态，并获取最新状态以更新按钮文字
        var active = window.StudyStorage.toggleFavorite(id);
        btn.textContent = active ? "已收藏" : "收藏";
        // 收藏面板需要同步刷新以反映变化
        renderFavorites();
      });
    });
  }

  // 渲染收藏面板：最多显示 4 个已收藏的资源快捷入口
  function renderFavorites() {
    if (!favoritesPanel || !window.StudyStorage) return;
    // 从收藏 ID 数组映射为完整的资源对象，过滤掉已不存在的资源
    var favorites = window.StudyStorage.getFavorites().map(findResource).filter(Boolean);
    // 无收藏时显示引导文案
    if (!favorites.length) {
      favoritesPanel.innerHTML = '<p class="empty-copy">还没有收藏。搜索资源后点击"收藏"，常用入口会出现在这里。</p>';
      return;
    }
    var showCount = 4;
    var hasMore = favorites.length > showCount;
    // 渲染为 mini-resource 链接卡片，显示类型和标题
    // 每个卡片是一个可点击的链接，直接跳转到对应资源页面
    favoritesPanel.innerHTML = favorites.slice(0, showCount).map(function (item) {
      return '<a class="mini-resource" href="' + item.url + '"><span>' + item.type + '</span><strong>' + item.title + '</strong></a>';
    }).join("") +
    // 如果收藏数超过 4，显示"查看全部"链接跳转到资源库
    (hasMore ? '<a class="mini-resource" href="websites.html" style="text-align:center;color:var(--coral-dark);font-weight:600">查看全部 ' + favorites.length + ' 个收藏 →</a>' : '');
  }

  // 渲染最近访问面板：最多显示 4 个最近浏览过的页面入口
  function renderRecent() {
    if (!recentPanel || !window.StudyStorage) return;
    // 过滤掉首页自身的访问记录，避免首页出现在"最近访问"中
    var recent = window.StudyStorage.getRecent().filter(function (item) {
      return item.url !== "index.html";
    });
    // 无记录时显示引导文案
    if (!recent.length) {
      recentPanel.innerHTML = '<p class="empty-copy">访问其他页面后，这里会显示最近访问记录。</p>';
      return;
    }
    // 取最近 4 条记录渲染为 mini-resource 链接卡片
    recentPanel.innerHTML = recent.slice(0, 4).map(function (item) {
      return '<a class="mini-resource" href="' + item.url + '"><span>最近访问</span><strong>' + item.title + '</strong></a>';
    }).join("");
  }

  // 绑定搜索按钮点击事件 + 搜索框回车键事件
  // 点击搜索按钮或按下回车键时触发 search 函数
  if (button && input && result) {
    button.addEventListener("click", search);
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") { event.preventDefault(); search(); }
    });
  }

  // 页面加载完成后立即渲染收藏面板和最近访问面板
  renderFavorites();
  renderRecent();

  /* ================================================================
     Hero 背景图轮播
     自动淡入淡出，底部圆点可点击切换，左右箭头手动翻页
     图片：images/hero-bg-1.jpg ~ hero-bg-4.jpg
     ================================================================ */
  var bgSlides = document.querySelectorAll("#heroBg .hero-bg-img");
  var dotsContainer = document.querySelector("#heroDots");
  var prevBtn = document.querySelector("#heroPrev");
  var nextBtn = document.querySelector("#heroNext");

  // 只有在轮播元素存在时才初始化轮播逻辑
  if (bgSlides.length && dotsContainer) {
    var current = 0;       // 当前显示的幻灯片索引
    var timer = null;      // 自动轮播定时器句柄
    var INTERVAL = 4000;   // 自动切换间隔 4 秒

    // 为每一张背景图生成对应的底部圆点按钮
    // 每个圆点点击后跳转到对应的幻灯片，并重置自动轮播计时器
    // 使用 IIFE 捕获循环变量 i，避免闭包中 index 值混乱
    for (var i = 0; i < bgSlides.length; i++) {
      (function (index) {
        var dot = document.createElement("button");
        // 第一张图的圆点默认 active
        dot.className = "hero-dot" + (index === 0 ? " active" : "");
        dot.setAttribute("aria-label", "背景第" + (index + 1) + "张");
        // 点击圆点跳转到对应幻灯片，并重置自动轮播计时
        dot.addEventListener("click", function () {
          goTo(index);
          resetTimer();
        });
        dotsContainer.appendChild(dot);
      })(i);
    }

    var dots = dotsContainer.querySelectorAll(".hero-dot");

    // 切换到指定索引的幻灯片：移除当前 active，设置新 active
    function goTo(index) {
      bgSlides[current].classList.remove("active");
      dots[current].classList.remove("active");
      current = index;
      bgSlides[current].classList.add("active");
      dots[current].classList.add("active");
    }

    // 切换到下一张（循环到第一张）
    function next() {
      goTo((current + 1) % bgSlides.length);
    }

    // 切换到上一张（循环到最后一张）
    function prev() {
      goTo((current - 1 + bgSlides.length) % bgSlides.length);
    }

    // 重置自动轮播定时器：清除旧定时器并重新开始
    function resetTimer() {
      clearInterval(timer);
      timer = setInterval(next, INTERVAL);
    }

    // 左右箭头点击切换：手动翻页同时重置自动轮播计时
    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        prev();
        resetTimer();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        next();
        resetTimer();
      });
    }

    // 启动自动轮播
    timer = setInterval(next, INTERVAL);
  }

  /* ================================================================
     校园掠影
     将预设的校园图片数组渲染到 gallery 容器中
     使用 loading="lazy" 实现图片懒加载，优化首屏性能
     ================================================================ */
  (function () {
    var galleryEl = document.getElementById("homeGallery");
    if (!galleryEl) return;
    // 校园实拍图片列表，展示校区风光和校园生活场景
    var photos = [
      "images/cupk1.png",
      "images/cupk2.jpg",
      "images/cupk3.jpg",
      "images/cupk4.jpg",
      "images/cupk1.jpg",
    ];
    // 将图片数组拼接为 HTML 一次性插入，减少 DOM 操作次数
    galleryEl.innerHTML = photos
      .map(function (src) {
        // 每张图片使用 loading="lazy" 延迟加载，优化页面首屏渲染性能
      return '<img src="' + src + '" alt="校园风光" loading="lazy" />';
      })
      .join("");
  })();

  /* ================================================================
     最新动态：聚合失物招领 + 论坛
     从 localStorage 中读取失物招领和论坛的最新 4 条数据，
     按创建时间倒序排列，展示在首页底部
     ================================================================ */
  (function () {
    var latestEl = document.getElementById("homeLatest");
    if (!latestEl) return;

    // 安全地从 localStorage 读取 JSON 数据，解析失败时返回空数组
    // 使用 try/catch 包裹解析过程，防止其他页面写入的非 JSON 数据导致崩溃
    function loadFrom(key) {
      try {
        return JSON.parse(localStorage.getItem(key) || "[]");
      } catch (e) {
        // JSON 格式异常时降级返回空数组，避免页面崩溃
        return [];
      }
    }

    // HTML 转义函数，防止用户输入的内容包含 XSS 攻击代码
    // 将 & < > 三个特殊字符替换为对应的 HTML 实体，保证在 innerHTML 中安全显示
    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, "&amp;")   // & 必须最先转义，否则后续转义会被错误编码
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    // 渲染单条最新动态项为链接卡片
    // 参数：href=跳转链接，title=标题（已转义），meta=元信息（时间/地点/作者）
    function renderItem(href, title, meta) {
      return (
        '<a class="latest-item" href="' +
        href +
        '"><strong>' +
        escapeHtml(title) +
        "</strong><span>" +
        escapeHtml(meta) +
        "</span></a>"
      );
    }

    // 读取失物招领数据：只取 status 为 "open"（未认领）的条目
    // 已认领的条目不再显示在首页最新动态中
    var lfItems = loadFrom("shiguang_lostfound")
      .filter(function (it) {
        return it.status === "open";
      })
      // 按创建时间倒序排列，最新的在最前面
      .sort(function (a, b) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
      .slice(0, 4);  // 最多显示 4 条

    // 读取论坛帖子数据：不筛选状态，直接按时间倒序取最新 4 条
    var fmItems = loadFrom("shiguang_forum")
      .sort(function (a, b) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
      .slice(0, 4);

    // 构建失物招领的 HTML
    var lfHTML = "";
    if (lfItems.length) {
      lfHTML = lfItems
        .map(function (it) {
          var dateStr = new Date(it.createdAt).toLocaleDateString("zh-CN");
          return renderItem(
            "lostfound.html",
            // 根据类型显示不同前缀：红色圆点表示寻物，蓝色圆点表示招领
            (it.type === "lost" ? "🔴 寻物：" : "🔵 招领：") + it.title,
            it.location + " · " + dateStr
          );
        })
        .join("");
    } else {
      // 无数据时显示占位文案
      lfHTML =
        '<div class="latest-item" style="text-align:center;color:var(--muted)">暂无失物招领信息</div>';
    }

    // 构建论坛帖子的 HTML
    var fmHTML = "";
    if (fmItems.length) {
      fmHTML = fmItems
        .map(function (it) {
          var dateStr = new Date(it.createdAt).toLocaleDateString("zh-CN");
          var replyCount = (it.replies || []).length;
          return renderItem(
            "forum.html",
            "💬 " + it.title,
            // 显示发帖人、回复数和发布时间
            (it.nickname || "匿名") + " · " + (replyCount || 0) + " 回复 · " + dateStr
          );
        })
        .join("");
    } else {
      fmHTML =
        '<div class="latest-item" style="text-align:center;color:var(--muted)">暂无论坛帖子</div>';
    }

    // 将失物招领和论坛最新动态拼接到同一容器中，左右两列布局
    latestEl.innerHTML =
      '<div class="latest-col">' +
      '<h4>📦 最新失物招领</h4>' +
      lfHTML +
      "</div>" +
      '<div class="latest-col">' +
      '<h4>💬 最新论坛帖子</h4>' +
      fmHTML +
      "</div>";
  })();

  /* ================================================================
     Hero 分层视差：滚动时背景层以更慢速率移动，文字层正常滚动
     产生景深效果。使用 rAF 节流，尊重 reduced-motion 偏好。
     ================================================================ */
  (function () {
    var hero = document.getElementById("heroSection");
    if (!hero) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var bgLayer = document.querySelector(".hero-bg");
    if (!bgLayer) return;

    var ticking = false;
    window.addEventListener("scroll", function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          var scrollY = window.scrollY;
          // 只在 Hero 区域可见时应用视差
          var heroBottom = hero.offsetTop + hero.offsetHeight;
          if (scrollY < heroBottom) {
            // 背景层以 40% 的速率移动，产生景深感
            bgLayer.style.transform = "translateY(" + (scrollY * 0.4) + "px)";
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  })();
});
