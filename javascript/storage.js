/**
 * storage.js —— localStorage 数据持久化模块（IIFE）
 * 挂载 window.StudyStorage，提供收藏和最近访问的读写接口
 * localStorage key：studyhub:favorites（收藏ID数组，上限30）
 *                  studyhub:recent（最近访问对象数组，上限8）
 *
 * 设计说明：
 * - 所有读写操作均包裹在 try/catch 中，防止 localStorage 不可用或配额超限时崩溃
 * - 收藏和最近访问各自独立存储，互不影响
 * - 收藏为新插前（unshift），最近访问为去重后插前
 */
(function () {
    var FAVORITES_KEY = "studyhub:favorites";
    var RECENT_KEY = "studyhub:recent";

    // 安全读取localStorage，解析失败时返回默认值
    // fallback 参数指定 JSON.parse 失败或 key 不存在时的兜底值
    function read(key, fallback) {
        try {
            var raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (error) {
            // 解析出错（如数据被篡改），返回 fallback 保证程序正常运行
            return fallback;
        }
    }

    // 安全写入localStorage
    // 写入失败（如存储配额超限）时返回 false，不抛异常
    function write(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            return false;
        }
    }

    // 获取收藏ID数组
    // 返回数组中每个元素为资源id字符串，按收藏先后顺序排列
    function getFavorites() {
        return read(FAVORITES_KEY, []);
    }

    // 判断某资源是否已收藏
    // 通过 id 在数组中是否存在来判断
    function isFavorite(id) {
        return getFavorites().indexOf(id) >= 0;
    }

    // 切换收藏状态：已收藏则取消，未收藏则添加（放在数组最前面）
    // 返回值表示切换后的收藏状态：true=已收藏，false=未收藏
    function toggleFavorite(id) {
        var favorites = getFavorites();
        var index = favorites.indexOf(id);
        if (index >= 0) {
            // 已存在则移除（取消收藏）
            favorites.splice(index, 1);
        } else {
            // 不存在则插入到数组头部（新收藏）
            favorites.unshift(id);
        }
        // 截断至上限30条，防止用户无限收藏导致 localStorage 超限
        write(FAVORITES_KEY, favorites.slice(0, 30));
        // 返回操作后的收藏状态
        return favorites.indexOf(id) >= 0;
    }

    // 获取最近访问记录
    // 返回对象数组，每项包含 title、url、time 字段
    function getRecent() {
        return read(RECENT_KEY, []);
    }

    // 添加最近访问记录：去重后放在最前面，保留最近8条
    // 如果 item 中已有相同 url 的记录，先移除旧记录再将新记录插到头部
    function addRecent(item) {
        if (!item || !item.url) return;
        // 过滤掉相同 url 的旧记录，实现去重
        var recent = getRecent().filter(function (entry) {
            return entry.url !== item.url;
        });
        // 将新记录插入数组头部，确保最近访问排在前面
        recent.unshift({
            title: item.title || "未命名页面",
            url: item.url,
            time: new Date().toISOString()
        });
        // 截断至最近8条，避免占用过多存储空间
        write(RECENT_KEY, recent.slice(0, 8));
    }

    // 将内部方法挂载到 window.StudyStorage 全局对象上
    // 供其他模块（common.js、index.js、resources.js 等）通过 window 调用
    window.StudyStorage = {
        getFavorites: getFavorites,
        isFavorite: isFavorite,
        toggleFavorite: toggleFavorite,
        getRecent: getRecent,
        addRecent: addRecent
    };
})();
