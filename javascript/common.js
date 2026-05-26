/**
 * common.js —— 全站公共脚本
 * 功能：移动端导航折叠、JS下拉菜单（点击展开/点击外部收起）、
 *       返回顶部按钮、暗色/亮色主题切换、最近访问自动记录
 * 所有页面均需加载本文件
 */
document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");
    var dropdownTriggers = document.querySelectorAll(".dropdown-trigger");
    var backTop = document.querySelector(".back-top");

    /* ---- 移动端导航折叠 ---- */
    if (toggle && nav) {
        toggle.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    /* ---- JS下拉菜单：点击展开，点击外部区域收起 ---- */
    dropdownTriggers.forEach(function (trigger) {
        trigger.addEventListener("click", function (event) {
            event.stopPropagation(); // 阻止冒泡到document以免立即收起
            var menu = trigger.nextElementSibling;
            // 关闭其他已打开的下拉菜单，保证同时只有一个展开
            document.querySelectorAll(".dropdown.open").forEach(function (openMenu) {
                if (openMenu !== menu) {
                    openMenu.classList.remove("open");
                }
            });
            if (menu) {
                menu.classList.toggle("open");
            }
        });
    });

    // 点击页面任意空白处收起所有下拉菜单
    document.addEventListener("click", function () {
        document.querySelectorAll(".dropdown.open").forEach(function (menu) {
            menu.classList.remove("open");
        });
    });

    /* ---- 返回顶部按钮：页面滚动超过360px时显示 ---- */
    if (backTop) {
        window.addEventListener("scroll", function () {
            backTop.classList.toggle("show", window.scrollY > 360);
        });
        backTop.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    /* ---- 暗色/亮色主题切换 ---- */
    (function () {
        var THEME_KEY = "studyhub:theme";
        var toggle = document.querySelector(".theme-toggle");

        // 从localStorage读取主题偏好，默认亮色
        function getTheme() {
            try {
                return localStorage.getItem(THEME_KEY) || "light";
            } catch (e) {
                return "light";
            }
        }

        // 设置主题：给html元素加/移除data-theme属性，CSS变量随之切换
        function setTheme(theme) {
            if (theme === "dark") {
                document.documentElement.setAttribute("data-theme", "dark");
            } else {
                document.documentElement.removeAttribute("data-theme");
            }
            if (toggle) {
                toggle.textContent = theme === "dark" ? "☀" : "☾";
                toggle.setAttribute("aria-label", theme === "dark" ? "切换到亮色模式" : "切换到暗色模式");
            }
            try {
                localStorage.setItem(THEME_KEY, theme);
            } catch (e) { }
        }

        setTheme(getTheme());

        if (toggle) {
            toggle.addEventListener("click", function () {
                var current = document.documentElement.hasAttribute("data-theme") ? "dark" : "light";
                setTheme(current === "dark" ? "light" : "dark");
            });
        }
    })();

    /* ---- 自动记录最近访问页面到localStorage ---- */
    if (window.StudyStorage) {
        window.StudyStorage.addRecent({
            title: document.title.replace(" - 石光驿站", ""),
            url: location.pathname.split("/").pop() || "index.html"
        });
    }

    /* ---- 复制按钮通用逻辑（用于笔记模板等页面） ---- */
    document.querySelectorAll("[data-copy]").forEach(function (button) {
        button.addEventListener("click", function () {
            var target = document.querySelector(button.dataset.copy);
            if (!target) return;
            navigator.clipboard.writeText(target.innerText).then(function () {
                button.textContent = "已复制";
                setTimeout(function () {
                    button.textContent = "复制模板";
                }, 1400);
            });
        });
    });
});
