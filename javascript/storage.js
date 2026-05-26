/**
 * storage.js —— localStorage 数据持久化模块（IIFE）
 * 挂载 window.StudyStorage，提供收藏和最近访问的读写接口
 * localStorage key：studyhub:favorites（收藏ID数组，上限30）
 *                  studyhub:recent（最近访问对象数组，上限8）
 */
(function () {
    var FAVORITES_KEY = "studyhub:favorites";
    var RECENT_KEY = "studyhub:recent";

    // 安全读取localStorage，解析失败时返回默认值
    function read(key, fallback) {
        try {
            var raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (error) {
            return fallback;
        }
    }

    // 安全写入localStorage
    function write(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            return false;
        }
    }

    // 获取收藏ID数组
    function getFavorites() {
        return read(FAVORITES_KEY, []);
    }

    // 判断某资源是否已收藏
    function isFavorite(id) {
        return getFavorites().indexOf(id) >= 0;
    }

    // 切换收藏状态：已收藏则取消，未收藏则添加（放在数组最前面）
    function toggleFavorite(id) {
        var favorites = getFavorites();
        var index = favorites.indexOf(id);
        if (index >= 0) {
            favorites.splice(index, 1);
        } else {
            favorites.unshift(id);
        }
        write(FAVORITES_KEY, favorites.slice(0, 30)); // 上限30条防止超出存储限制
        return favorites.indexOf(id) >= 0;
    }

    // 获取最近访问记录
    function getRecent() {
        return read(RECENT_KEY, []);
    }

    // 添加最近访问记录：去重后放在最前面，保留最近8条
    function addRecent(item) {
        if (!item || !item.url) return;
        var recent = getRecent().filter(function (entry) {
            return entry.url !== item.url;
        });
        recent.unshift({
            title: item.title || "未命名页面",
            url: item.url,
            time: new Date().toISOString()
        });
        write(RECENT_KEY, recent.slice(0, 8));
    }

    // 挂载到全局
    window.StudyStorage = {
        getFavorites: getFavorites,
        isFavorite: isFavorite,
        toggleFavorite: toggleFavorite,
        getRecent: getRecent,
        addRecent: addRecent
    };
})();
