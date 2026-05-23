(function () {
    var FAVORITES_KEY = "studyhub:favorites";
    var RECENT_KEY = "studyhub:recent";

    function read(key, fallback) {
        try {
            var raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (error) {
            return fallback;
        }
    }

    function write(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            return false;
        }
    }

    function getFavorites() {
        return read(FAVORITES_KEY, []);
    }

    function isFavorite(id) {
        return getFavorites().indexOf(id) >= 0;
    }

    function toggleFavorite(id) {
        var favorites = getFavorites();
        var index = favorites.indexOf(id);
        if (index >= 0) {
            favorites.splice(index, 1);
        } else {
            favorites.unshift(id);
        }
        write(FAVORITES_KEY, favorites.slice(0, 30));
        return favorites.indexOf(id) >= 0;
    }

    function getRecent() {
        return read(RECENT_KEY, []);
    }

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

    window.StudyStorage = {
        getFavorites: getFavorites,
        isFavorite: isFavorite,
        toggleFavorite: toggleFavorite,
        getRecent: getRecent,
        addRecent: addRecent
    };
})();
