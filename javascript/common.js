document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");
    var dropdownTriggers = document.querySelectorAll(".dropdown-trigger");
    var backTop = document.querySelector(".back-top");

    if (toggle && nav) {
        toggle.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    dropdownTriggers.forEach(function (trigger) {
        trigger.addEventListener("click", function (event) {
            event.stopPropagation();
            var menu = trigger.nextElementSibling;
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

    document.addEventListener("click", function () {
        document.querySelectorAll(".dropdown.open").forEach(function (menu) {
            menu.classList.remove("open");
        });
    });

    if (backTop) {
        window.addEventListener("scroll", function () {
            backTop.classList.toggle("show", window.scrollY > 360);
        });
        backTop.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    if (window.StudyStorage) {
        window.StudyStorage.addRecent({
            title: document.title.replace(" - 校园学习资源导航站", ""),
            url: location.pathname.split("/").pop() || "index.html"
        });
    }

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
