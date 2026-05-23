document.addEventListener("DOMContentLoaded", function () {
    var resources = (window.StudyResources || []).filter(function (item) {
        return item.category !== "internal";
    });
    var list = document.querySelector("#resourceList");
    var count = document.querySelector("#resourceCount");
    var searchInput = document.querySelector("#resourceSearch");
    var tabs = document.querySelectorAll("[data-resource-filter]");
    var formatTabs = document.querySelectorAll("[data-format-filter]");

    function isExternal(url) {
        return /^https?:\/\//.test(url);
    }

    function matchKeyword(item, keyword) {
        if (!keyword) return true;
        var text = [
            item.title,
            item.type,
            item.format,
            item.platform,
            item.description,
            item.usage,
            item.keywords.join(" ")
        ].join(" ").toLowerCase();
        return text.indexOf(keyword.toLowerCase()) >= 0;
    }

    function getFormatKey(item) {
        if (item.formatKey) return item.formatKey;
        if (item.format === "App") return "app";
        if (item.format === "电脑软件") return "software";
        if (item.format === "视频链接") return "video";
        if (item.format === "博主/账号") return "creator";
        return "website";
    }

    function getActiveCategory() {
        var active = document.querySelector("[data-resource-filter].active");
        return active ? active.dataset.resourceFilter : "all";
    }

    function getActiveFormat() {
        var active = document.querySelector("[data-format-filter].active");
        return active ? active.dataset.formatFilter : "all";
    }

    function render(category) {
        if (!list) return;
        category = category || getActiveCategory();
        var format = getActiveFormat();
        var keyword = searchInput ? searchInput.value.trim() : "";
        var visible = resources.filter(function (item) {
            var categoryMatched = !category || category === "all" || item.category === category;
            var formatMatched = !format || format === "all" || getFormatKey(item) === format;
            return categoryMatched && formatMatched && matchKeyword(item, keyword);
        });

        if (count) {
            count.textContent = "共 " + visible.length + " 个资源";
        }

        if (!visible.length) {
            list.innerHTML = '<div class="empty-state"><strong>没有找到匹配资源</strong><p>可以换一个关键词，或切换到“全部资源”。</p></div>';
            return;
        }

        list.innerHTML = visible.map(function (item) {
            var target = isExternal(item.url) ? ' target="_blank" rel="noopener noreferrer"' : "";
            var favText = window.StudyStorage && window.StudyStorage.isFavorite(item.id) ? "已收藏" : "收藏";
            var icon = item.icon || "images/icons/" + item.id + ".png";
            var fallback = item.title.slice(0, 1);
            var formatText = item.format || "网站";
            var platform = item.platform ? '<span class="tag">' + item.platform + '</span>' : "";
            return '<article class="card resource-card resource-library-card">' +
                '<div class="resource-card-head">' +
                '<div class="resource-title-group">' +
                '<span class="resource-icon"><img src="' + icon + '" alt="" onerror="this.parentNode.textContent=\'' + fallback + '\';"></span>' +
                '<span class="tag coral">' + item.type + '</span>' +
                '<span class="tag blue">' + formatText + '</span>' +
                '</div>' +
                '<button class="favorite-btn" data-favorite="' + item.id + '">' + favText + '</button>' +
                '</div>' +
                '<h3>' + item.title + '</h3>' +
                '<p>' + item.description + '</p>' +
                '<p class="usage-copy">' + item.usage + '</p>' +
                '<div class="tag-row">' + platform + item.keywords.slice(0, 3).map(function (key) { return '<span class="tag">' + key + '</span>'; }).join("") + '</div>' +
                '<a class="button primary" href="' + item.url + '"' + target + '>打开资源</a>' +
                '</article>';
        }).join("");
        bindFavoriteButtons();
    }

    function bindFavoriteButtons() {
        document.querySelectorAll("[data-favorite]").forEach(function (button) {
            button.addEventListener("click", function () {
                if (!window.StudyStorage) return;
                var active = window.StudyStorage.toggleFavorite(button.dataset.favorite);
                button.textContent = active ? "已收藏" : "收藏";
            });
        });
    }

    tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
            tabs.forEach(function (item) {
                item.classList.remove("active");
            });
            tab.classList.add("active");
            render(tab.dataset.resourceFilter);
        });
    });

    formatTabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
            formatTabs.forEach(function (item) {
                item.classList.remove("active");
            });
            tab.classList.add("active");
            render(getActiveCategory());
        });
    });

    if (searchInput) {
        searchInput.addEventListener("input", function () {
            render(getActiveCategory());
        });
    }

    render("all");
});
