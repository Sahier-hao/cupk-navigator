document.addEventListener("DOMContentLoaded", function () {
    var input = document.querySelector("#homeSearch");
    var button = document.querySelector("#homeSearchButton");
    var result = document.querySelector("#homeSearchResult");
    var favoritesPanel = document.querySelector("#favoritesPanel");
    var recentPanel = document.querySelector("#recentPanel");
    var resources = window.StudyResources || [];

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
            result.innerHTML = '<strong>没有找到完全匹配的资源</strong><p>可以换成“CUPK、教务、知网、论文、编程、AI”等更短的关键词，或进入资源库查看全部分类。</p><a class="button secondary" href="websites.html">查看资源库</a>';
            return;
        }

        result.innerHTML = matched.slice(0, 4).map(function (item) {
            return '<div class="search-result-row">' +
                '<div><span class="tag coral">' + item.type + '</span><strong>' + item.title + '</strong><p>' + item.description + '</p></div>' +
                '<div class="result-actions"><button class="button secondary" data-favorite="' + item.id + '">收藏</button><a class="button primary" href="' + item.url + '">进入</a></div>' +
                '</div>';
        }).join("");
        bindFavoriteButtons();
    }

    function findResource(id) {
        return resources.find(function (item) {
            return item.id === id;
        });
    }

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

    function renderFavorites() {
        if (!favoritesPanel || !window.StudyStorage) return;
        var favorites = window.StudyStorage.getFavorites().map(findResource).filter(Boolean);
        if (!favorites.length) {
            favoritesPanel.innerHTML = '<p class="empty-copy">还没有收藏。搜索资源后点击“收藏”，常用入口会出现在这里。</p>';
            return;
        }
        favoritesPanel.innerHTML = favorites.slice(0, 4).map(function (item) {
            return '<a class="mini-resource" href="' + item.url + '"><span>' + item.type + '</span><strong>' + item.title + '</strong></a>';
        }).join("");
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
            if (event.key === "Enter") {
                event.preventDefault();
                search();
            }
        });
    }

    renderFavorites();
    renderRecent();
});
