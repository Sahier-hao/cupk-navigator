/**
 * index.js —— 首页专属脚本
 * 功能：Hero 背景图轮播（自动+手动+圆点）、搜索框资源检索、收藏/最近面板渲染
 */
document.addEventListener("DOMContentLoaded", function () {
  var input = document.querySelector("#homeSearch");
  var button = document.querySelector("#homeSearchButton");
  var result = document.querySelector("#homeSearchResult");
  var favoritesPanel = document.querySelector("#favoritesPanel");
  var recentPanel = document.querySelector("#recentPanel");
  var resources = window.StudyResources || [];

  /* ---- 搜索 ---- */
  function search() {
    var value = input.value.trim();
    if (!value) {
      result.classList.add("show");
      result.innerHTML = '<strong>请输入关键词</strong><p>可以试试：期末、笔记、论文、编程、AI。</p>';
      return;
    }
    var lower = value.toLowerCase();
    var matched = resources.filter(function (item) {
      return item.title.toLowerCase().includes(lower) ||
        item.description.toLowerCase().includes(lower) ||
        item.keywords.some(function (key) {
          return lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower);
        });
    });
    result.classList.add("show");
    if (!matched.length) {
      result.innerHTML = '<strong>没有找到完全匹配的资源</strong><p>换"CUPK、教务、知网、论文、编程、AI"等关键词试试，或进入资源库查看全部分类。</p><a class="button secondary" href="websites.html">查看资源库</a>';
      return;
    }
    var maxShow = 4;
    var hasMore = matched.length > maxShow;
    result.innerHTML = matched.slice(0, maxShow).map(function (item) {
      return '<div class="search-result-row">' +
        '<div><span class="tag coral">' + item.type + '</span><strong>' + item.title + '</strong><p>' + item.description + '</p></div>' +
        '<div class="result-actions"><button class="button secondary" data-favorite="' + item.id + '">收藏</button><a class="button primary" href="' + item.url + '">进入</a></div>' +
        '</div>';
    }).join("") +
    (hasMore ? '<div class="search-more"><a class="button secondary" href="websites.html">查看全部 ' + matched.length + ' 个匹配资源 →</a></div>' : '');
    bindFavoriteButtons();
  }

  function findResource(id) {
    return resources.find(function (item) { return item.id === id; });
  }

  function bindFavoriteButtons() {
    document.querySelectorAll("[data-favorite]").forEach(function (btn) {
      var id = btn.dataset.favorite;
      if (window.StudyStorage && window.StudyStorage.isFavorite(id)) {
        btn.textContent = "已收藏";
      }
      btn.addEventListener("click", function () {
        if (!window.StudyStorage) return;
        var active = window.StudyStorage.toggleFavorite(id);
        btn.textContent = active ? "已收藏" : "收藏";
        renderFavorites();
      });
    });
  }

  function renderFavorites() {
    if (!favoritesPanel || !window.StudyStorage) return;
    var favorites = window.StudyStorage.getFavorites().map(findResource).filter(Boolean);
    if (!favorites.length) {
      favoritesPanel.innerHTML = '<p class="empty-copy">还没有收藏。搜索资源后点击"收藏"，常用入口会出现在这里。</p>';
      return;
    }
    var showCount = 4;
    var hasMore = favorites.length > showCount;
    favoritesPanel.innerHTML = favorites.slice(0, showCount).map(function (item) {
      return '<a class="mini-resource" href="' + item.url + '"><span>' + item.type + '</span><strong>' + item.title + '</strong></a>';
    }).join("") +
    (hasMore ? '<a class="mini-resource" href="websites.html" style="text-align:center;color:var(--coral-dark);font-weight:600">查看全部 ' + favorites.length + ' 个收藏 →</a>' : '');
  }

  function renderRecent() {
    if (!recentPanel || !window.StudyStorage) return;
    var recent = window.StudyStorage.getRecent().filter(function (item) {
      return item.url !== "index.html";
    });
    if (!recent.length) {
      recentPanel.innerHTML = '<p class="empty-copy">访问其他页面后，这里会显示最近访问记录。</p>';
      return;
    }
    recentPanel.innerHTML = recent.slice(0, 4).map(function (item) {
      return '<a class="mini-resource" href="' + item.url + '"><span>最近访问</span><strong>' + item.title + '</strong></a>';
    }).join("");
  }

  if (button && input && result) {
    button.addEventListener("click", search);
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") { event.preventDefault(); search(); }
    });
  }

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

  if (bgSlides.length && dotsContainer) {
    var current = 0;
    var timer = null;
    var INTERVAL = 4000;

    // 生成圆点
    for (var i = 0; i < bgSlides.length; i++) {
      (function (index) {
        var dot = document.createElement("button");
        dot.className = "hero-dot" + (index === 0 ? " active" : "");
        dot.setAttribute("aria-label", "背景第" + (index + 1) + "张");
        dot.addEventListener("click", function () {
          goTo(index);
          resetTimer();
        });
        dotsContainer.appendChild(dot);
      })(i);
    }

    var dots = dotsContainer.querySelectorAll(".hero-dot");

    function goTo(index) {
      bgSlides[current].classList.remove("active");
      dots[current].classList.remove("active");
      current = index;
      bgSlides[current].classList.add("active");
      dots[current].classList.add("active");
    }

    function next() {
      goTo((current + 1) % bgSlides.length);
    }

    function prev() {
      goTo((current - 1 + bgSlides.length) % bgSlides.length);
    }

    function resetTimer() {
      clearInterval(timer);
      timer = setInterval(next, INTERVAL);
    }

    // 左右箭头
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

    timer = setInterval(next, INTERVAL);
  }
});
