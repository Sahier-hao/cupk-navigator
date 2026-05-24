document.addEventListener("DOMContentLoaded", function () {
    var resources = (window.StudyResources || []).filter(function (item) {
        return item.category !== "internal";
    });
    var list = document.querySelector("#resourceList");
    var count = document.querySelector("#resourceCount");
    var searchInput = document.querySelector("#resourceSearch");
    var scenarioTabs = document.querySelectorAll("[data-scenario-filter]");
    var tabs = document.querySelectorAll("[data-resource-filter]");
    var formatTabs = document.querySelectorAll("[data-format-filter]");
    var scenarioLabels = {
        course: "课程预习",
        final: "期末复习",
        paper: "写课程论文",
        web: "Web 大作业",
        english: "英语四六级",
        exam: "考试考证",
        career: "实习就业",
        team: "小组协作",
        ai: "AI 辅助"
    };

    function isExternal(url) {
        return /^https?:\/\//.test(url);
    }

    function matchKeyword(item, keyword) {
        if (!keyword) return true;
        var accessLabels = getAccessLabels(item);
        var scenarioNames = getScenarioKeys(item).map(function (key) {
            return scenarioLabels[key] || key;
        });
        var text = [
            item.title,
            item.type,
            item.format,
            item.platform,
            item.description,
            item.usage,
            accessLabels.join(" "),
            scenarioNames.join(" "),
            (item.keywords || []).join(" ")
        ].join(" ").toLowerCase();
        return text.indexOf(keyword.toLowerCase()) >= 0;
    }

    function getSearchText(item) {
        return [
            item.title,
            item.type,
            item.format,
            item.platform,
            item.description,
            item.usage,
            (item.keywords || []).join(" ")
        ].join(" ").toLowerCase();
    }

    function addScenario(list, key) {
        if (list.indexOf(key) < 0) {
            list.push(key);
        }
    }

    function getScenarioKeys(item) {
        if (item.scenarios) {
            return Array.isArray(item.scenarios) ? item.scenarios : [item.scenarios];
        }

        var text = getSearchText(item);
        var scenarios = [];

        if (item.category === "course" || /课程|公开课|mooc|教材|预习|open course/.test(text)) {
            addScenario(scenarios, "course");
        }

        if (/期末|复习|高数|串讲|题型|真题|错题/.test(text)) {
            addScenario(scenarios, "final");
        }

        if (item.category === "search" || /论文|文献|学术|期刊|知网|cnki|zotero|latex|overleaf|引用|参考文献|翻译|英文摘要/.test(text)) {
            addScenario(scenarios, "paper");
        }

        if (item.category === "code" || item.category === "design" || /html|css|javascript|web|前端|github|图标|素材|原型|界面|网页|流程图|压缩|抠图/.test(text)) {
            addScenario(scenarios, "web");
        }

        if (item.category === "english" || /英语|四六级|cet|听力|词典|单词|雅思|托福|ielts|toefl|bbc|voa|ted/.test(text)) {
            addScenario(scenarios, "english");
        }

        if (item.category === "exam" || /考试|考证|报名|成绩|计算机等级|ncre|软考|考研|研招|刷题|笔试|证书/.test(text)) {
            addScenario(scenarios, "exam");
        }

        if (/实习|就业|校招|招聘|面试|岗位|简历|牛客|leetcode|笔试/.test(text)) {
            addScenario(scenarios, "career");
        }

        if (/协作|小组|团队|文档|任务|notion|语雀|飞书|腾讯文档|processon|draw\.io|figma|github|wps|todoist/.test(text)) {
            addScenario(scenarios, "team");
        }

        if (item.category === "ai" || /ai|chatgpt|kimi|deepseek|豆包|元宝|perplexity|总结|问答|学习助手/.test(text)) {
            addScenario(scenarios, "ai");
        }

        if (!scenarios.length) {
            addScenario(scenarios, "course");
        }

        return scenarios;
    }

    function renderScenarioTags(item) {
        return getScenarioKeys(item).slice(0, 3).map(function (key) {
            return '<span class="tag scenario-tag">场景：' + (scenarioLabels[key] || key) + '</span>';
        }).join("");
    }

    function getAccessLabels(item) {
        if (item.access) {
            return Array.isArray(item.access) ? item.access : [item.access];
        }

        var title = item.title || "";
        var url = item.url || "";
        var platform = item.platform || "";
        var text = [title, url, platform, item.description || "", item.usage || ""].join(" ").toLowerCase();

        if (/cnki|知网|万方|web of science|sciencedirect|onepetro|engineering village|jcr|springer/.test(text)) {
            return ["校园网/VPN"];
        }

        if (/google scholar|谷歌学术|coursera|edx|mit opencourseware|ielts|toefl/.test(text)) {
            return ["公开访问", "网络环境"];
        }

        if (item.category === "ai") {
            return ["公开访问", "需登录"];
        }

        if (item.formatKey === "software" || item.format === "电脑软件" || item.formatKey === "app" || item.format === "App") {
            return ["下载安装"];
        }

        if (/notion|语雀|飞书|figma|overleaf|grammarly|todoist|腾讯文档|leetcode|牛客/.test(text)) {
            return ["公开访问", "需登录"];
        }

        return ["公开访问"];
    }

    function getAccessClass(label) {
        if (/校园网|VPN|机构/.test(label)) return "campus";
        if (/登录|账号/.test(label)) return "login";
        if (/下载|安装/.test(label)) return "install";
        if (/网络环境/.test(label)) return "network";
        return "public";
    }

    function renderAccessTags(item) {
        return getAccessLabels(item).map(function (label) {
            return '<span class="tag access-tag ' + getAccessClass(label) + '">访问：' + label + '</span>';
        }).join("");
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

    function getActiveScenario() {
        var active = document.querySelector("[data-scenario-filter].active");
        return active ? active.dataset.scenarioFilter : "all";
    }

    function render(category) {
        if (!list) return;
        category = category || getActiveCategory();
        var format = getActiveFormat();
        var scenario = getActiveScenario();
        var keyword = searchInput ? searchInput.value.trim() : "";
        var visible = resources.filter(function (item) {
            var categoryMatched = !category || category === "all" || item.category === category;
            var formatMatched = !format || format === "all" || getFormatKey(item) === format;
            var scenarioMatched = !scenario || scenario === "all" || getScenarioKeys(item).indexOf(scenario) >= 0;
            return scenarioMatched && categoryMatched && formatMatched && matchKeyword(item, keyword);
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
                '<div class="tag-row scenario-row">' + renderScenarioTags(item) + '</div>' +
                '<div class="tag-row access-row">' + renderAccessTags(item) + '</div>' +
                '<div class="tag-row">' + platform + (item.keywords || []).slice(0, 3).map(function (key) { return '<span class="tag">' + key + '</span>'; }).join("") + '</div>' +
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

    scenarioTabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
            scenarioTabs.forEach(function (item) {
                item.classList.remove("active");
            });
            tab.classList.add("active");
            render(getActiveCategory());
        });
    });

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
