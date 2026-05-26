/**
 * index.js —— 首页专属脚本
 * 功能：搜索框资源检索、收藏面板渲染、最近访问面板渲染、
 *       首页轮播图（自动播放+手动切换+圆点指示器）
 */
document.addEventListener("DOMContentLoaded", function () {
    var input = document.querySelector("#homeSearch");
    var button = document.querySelector("#homeSearchButton");
    var result = document.querySelector("#homeSearchResult");
    var favoritesPanel = document.querySelector("#favoritesPanel");
    var recentPanel = document.querySelector("#recentPanel");
    var resources = window.StudyResources || [];

    // 首页搜索：在资源库中匹配标题、描述和关键词
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
            result.innerHTML = '<strong>没有找到完全匹配的资源</strong><p>可以换成"CUPK、教务、知网、论文、编程、AI"等更短的关键词，或进入资源库查看全部分类。</p><a class="button secondary" href="websites.html">查看资源库</a>';
            return;
        }

        // 最多展示4条搜索结果
        result.innerHTML = matched.slice(0, 4).map(function (item) {
            return '<div class="search-result-row">' +
                '<div><span class="tag coral">' + item.type + '</span><strong>' + item.title + '</strong><p>' + item.description + '</p></div>' +
                '<div class="result-actions"><button class="button secondary" data-favorite="' + item.id + '">收藏</button><a class="button primary" href="' + item.url + '">进入</a></div>' +
                '</div>';
        }).join("");
        bindFavoriteButtons();
    }

    // 根据ID查找资源对象
    function findResource(id) {
        return resources.find(function (item) {
            return item.id === id;
        });
    }

    // 绑定收藏按钮事件，已收藏的显示"已收藏"
    function bindFavoriteButtons() {
        document.querySelectorAll("[data-favorite]").forEach(function (button) {
            var id = button.dataset.favorite;
            if (window.StudyStorage && window.StudyStorage.isFavorite(id)) {
                button.textContent = "已收藏";
            }
            button.addEventListener("click", function () {
                if (!window.StudyStorage) return;
                var active = window.StudyStorage.toggleFavorite(id);
                button.textContent = active ? "已收藏" : "收藏";
                renderFavorites();
            });
        });
    }

    // 渲染"我的收藏"面板（首页下方，最多展示4条）
    function renderFavorites() {
        if (!favoritesPanel || !window.StudyStorage) return;
        var favorites = window.StudyStorage.getFavorites().map(findResource).filter(Boolean);
        if (!favorites.length) {
            favoritesPanel.innerHTML = '<p class="empty-copy">还没有收藏。搜索资源后点击"收藏"，常用入口会出现在这里。</p>';
            return;
        }
        favoritesPanel.innerHTML = favorites.slice(0, 4).map(function (item) {
            return '<a class="mini-resource" href="' + item.url + '"><span>' + item.type + '</span><strong>' + item.title + '</strong></a>';
        }).join("");
    }

    // 渲染"最近访问"面板（排除首页自身）
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

    // 搜索按钮和回车键触发搜索
    if (button && input && result) {
        button.addEventListener("click", search);
        input.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                search();
            }
        });
    }

    renderFavorites();
    renderRecent();

    /* ========== 首页轮播图：自动播放 + 手动切换 + 圆点指示器 ========== */
    var sliderTrack = document.querySelector("#heroSlider");
    if (sliderTrack) {
        var slides = Array.prototype.slice.call(sliderTrack.querySelectorAll(".slider-slide"));
        var dotsContainer = document.querySelector("#sliderDots");
        var prevBtn = document.querySelector(".slider-prev");
        var nextBtn = document.querySelector(".slider-next");
        var currentIndex = 0;
        var autoTimer = null;
        var AUTO_INTERVAL = 3500; // 自动播放间隔3.5秒

        // 根据幻灯片数量生成底部圆点指示器
        if (dotsContainer && slides.length) {
            slides.forEach(function (_, i) {
                var dot = document.createElement("button");
                dot.className = "slider-dot" + (i === 0 ? " active" : "");
                dot.setAttribute("aria-label", "切换到第" + (i + 1) + "张");
                dot.addEventListener("click", function () {
                    goToSlide(i);
                    resetAutoPlay();
                });
                dotsContainer.appendChild(dot);
            });
        }

        var dots = dotsContainer ? Array.prototype.slice.call(dotsContainer.querySelectorAll(".slider-dot")) : [];

        // 切换到指定序号的幻灯片，更新active状态和圆点
        function goToSlide(index) {
            slides[currentIndex].classList.remove("active");
            if (dots[currentIndex]) dots[currentIndex].classList.remove("active");
            currentIndex = index;
            slides[currentIndex].classList.add("active");
            if (dots[currentIndex]) dots[currentIndex].classList.add("active");
        }

        // 切换到下一张（循环）
        function nextSlide() {
            var next = (currentIndex + 1) % slides.length;
            goToSlide(next);
        }

        // 切换到上一张（循环）
        function prevSlide() {
            var prev = (currentIndex - 1 + slides.length) % slides.length;
            goToSlide(prev);
        }

        // 启动自动播放定时器
        function startAutoPlay() {
            autoTimer = setInterval(nextSlide, AUTO_INTERVAL);
        }

        // 手动操作后重置定时器，避免刚切换就被自动切走
        function resetAutoPlay() {
            clearInterval(autoTimer);
            startAutoPlay();
        }

        // 绑定左右箭头按钮
        if (prevBtn) {
            prevBtn.addEventListener("click", function () {
                prevSlide();
                resetAutoPlay();
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener("click", function () {
                nextSlide();
                resetAutoPlay();
            });
        }

        startAutoPlay();
    }
});
