/**
 * common.js —— 全站公共脚本
 * 功能：移动端导航折叠、导航栏实时时钟、返回顶部按钮、
 *       暗色/亮色主题切换、最近访问自动记录、滚动入场动画（IntersectionObserver）
 * 所有页面均需加载本文件
 */
document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");
    var backTop = document.querySelector(".back-top");

    /* ---- SVG 图标辅助函数 ---- */
    function svgIcon(id, size) {
        size = size || 20;
        return '<svg class="svg-icon" width="' + size + '" height="' + size + '" aria-hidden="true">' +
            '<use href="images/icons.svg#' + id + '"/>' +
            '</svg>';
    }

    /* ---- 替换 emoji 按钮为 SVG 图标 ---- */
    if (toggle) { toggle.innerHTML = svgIcon('icon-menu', 22) + '<span class="sr-only">打开导航</span>'; }
    if (backTop) { backTop.innerHTML = svgIcon('icon-arrow-up', 18); }

    /* ---- 导航栏实时时钟 ---- */
    var clockEl = document.createElement("time");
    clockEl.className = "nav-clock";
    clockEl.setAttribute("datetime", "");
    clockEl.setAttribute("aria-label", "当前时间");

    function tick() {
        var now = new Date();
        var hh = String(now.getHours()).padStart(2, "0");
        var mm = String(now.getMinutes()).padStart(2, "0");
        var ss = String(now.getSeconds()).padStart(2, "0");
        var y = now.getFullYear();
        var M = String(now.getMonth() + 1).padStart(2, "0");
        var d = String(now.getDate()).padStart(2, "0");
        var weekDays = ["日", "一", "二", "三", "四", "五", "六"];
        var w = weekDays[now.getDay()];
        clockEl.innerHTML = y + "/" + M + "/" + d + " 周" + w + "&nbsp;" + hh + ":" + mm + ":" + ss;
        clockEl.setAttribute("datetime", now.toISOString());
    }
    tick();
    setInterval(tick, 1000);

    if (nav && nav.parentNode) {
        nav.parentNode.insertBefore(clockEl, nav);
    }

    /* ---- 移动端导航折叠 ---- */
    if (toggle && nav) {
        toggle.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    /* ---- IntersectionObserver 滚动入场动画 ---- */
    var fadeTargets = document.querySelectorAll(
        ".card, .campus-section, .media-section, .tools-section, .timeline-item, " +
        ".campus-image-card, .campus-icon-text-item, .campus-transport-card, " +
        ".resource-library-card, .media-gallery-card, .gpa-calculator, " +
        ".gpa-reference, .hero-slider, .workspace-panel, .resource-category-item, " +
        ".team-avatar, .login-card, .audio-player-card"
    );
    fadeTargets.forEach(function (el) { el.classList.add("fade-up"); });

    if ("IntersectionObserver" in window) {
        var fadeObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("fade-up-visible");
                    fadeObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -30px 0px" });

        // JS 动态分配动画延迟（替代硬编码 CSS nth-child）
        document.querySelectorAll(".fade-up").forEach(function (el) {
            var parent = el.parentNode;
            if (parent) {
                var siblings = Array.prototype.filter.call(parent.children, function (c) {
                    return c.classList.contains("fade-up");
                });
                var idx = siblings.indexOf(el);
                if (idx > 0 && idx <= 20) {
                    el.style.transitionDelay = (idx * 0.05) + "s";
                }
            }
            fadeObserver.observe(el);
        });
    } else {
        document.querySelectorAll(".fade-up").forEach(function (el) {
            el.classList.add("fade-up-visible");
        });
    }

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
                toggle.innerHTML = theme === "dark" ? svgIcon('icon-sun', 18) : svgIcon('icon-moon', 18);
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

    /* ================================================================
     * 跨页面持久化音乐播放器
     * - 页面切换时保持播放进度和状态（localStorage）
     * - 底部固定迷你控制条，可折叠
     * ================================================================ */
    (function () {
        var STORE_KEY = "shiguang_player";
        var playlist = [{ title: "黄昏之时", artist: "兮沐", file: "music/黄昏之时-兮沐.mp3" },
            { title: "Call of Silence", artist: "澤野弘之", file: "music/Call of Silence-澤野弘之.mp3" },
            { title: "magnolia", artist: "Dr.Phonk", file: "music/magnolia-Dr.Phonk.mp3" },
            { title: "诀别书", artist: "Cloudin", file: "music/诀别书-Cloudin.mp3" },
            
        ];

        /* -- 读取/写入持久化状态 -- */
        function loadState() {
            try {
                var raw = localStorage.getItem(STORE_KEY);
                return raw ? JSON.parse(raw) : {};
            } catch (e) { return {}; }
        }

        function saveState(state) {
            try {
                var current = loadState();
                var merged = {};
                for (var k in current) { merged[k] = current[k]; }
                for (var kk in state) { merged[kk] = state[kk]; }
                localStorage.setItem(STORE_KEY, JSON.stringify(merged));
            } catch (e) { /* 忽略存储满等情况 */ }
        }

        var state = loadState();
        if (state.trackIndex === undefined) { state.trackIndex = 0; }
        if (state.volume === undefined) { state.volume = 0.3; }
        if (state.isPlaying === undefined) { state.isPlaying = true; }
        if (state.currentTime === undefined) { state.currentTime = 0; }

        /* -- 创建音频元素 -- */
        var audio = new Audio();
        audio.volume = state.volume;
        audio.preload = "auto";

        /* -- 构建播放器 DOM（右下角浮动小组件） -- */
        var playerBar = document.createElement("div");
        playerBar.className = "music-player music-player-collapsed";
        playerBar.setAttribute("aria-label", "背景音乐播放器");
        playerBar.innerHTML =
            '<button class="mp-toggle" title="展开播放器" aria-label="展开播放器">' + svgIcon('icon-music', 18) + '</button>' +
            '<div class="mp-body">' +
            '  <span class="mp-track">Call of Silence</span>' +
            '  <div class="mp-actions">' +
            '    <button class="mp-btn mp-prev" title="上一首" aria-label="上一首">' + svgIcon('icon-skip-back', 14) + '</button>' +
            '    <button class="mp-btn mp-play" title="播放" aria-label="播放">' + svgIcon('icon-play', 13) + '</button>' +
            '    <button class="mp-btn mp-next" title="下一首" aria-label="下一首">' + svgIcon('icon-skip-forward', 14) + '</button>' +
            '  </div>' +
            '  <input class="mp-progress" type="range" min="0" max="100" step="0.1" value="0" title="进度" aria-label="播放进度" />' +
            '  <input class="mp-volume" type="range" min="0" max="100" step="1" value="30" title="音量" aria-label="音量" />' +
            '  <span class="mp-time">00:00</span>' +
            '</div>';

        document.body.appendChild(playerBar);

        /* -- 缓存 DOM 引用 -- */
        var mpToggle = playerBar.querySelector(".mp-toggle");
        var mpTrack = playerBar.querySelector(".mp-track");
        var mpPlayBtn = playerBar.querySelector(".mp-play");
        var mpPrevBtn = playerBar.querySelector(".mp-prev");
        var mpNextBtn = playerBar.querySelector(".mp-next");
        var mpProgress = playerBar.querySelector(".mp-progress");
        var mpVolume  = playerBar.querySelector(".mp-volume");
        var mpTime = playerBar.querySelector(".mp-time");

        /* -- 辅助：格式化时间 -- */
        function fmtTime(sec) {
            if (isNaN(sec) || sec < 0) { return "00:00"; }
            var m = Math.floor(sec / 60);
            var s = Math.floor(sec % 60);
            return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
        }

        /* -- 加载指定曲目 -- */
        function loadTrack(index) {
            state.trackIndex = (index + playlist.length) % playlist.length;
            var track = playlist[state.trackIndex];
            audio.src = encodeURI(track.file);
            audio.load();
            mpTrack.textContent = track.title;
            mpToggle.innerHTML = svgIcon('icon-music', 18);
            saveState({ trackIndex: state.trackIndex, currentTime: 0 });
        }

        /* -- 播放 -- */
        function play() {
            var track = playlist[state.trackIndex];
            var needLoad = !audio.src || audio.src.indexOf(encodeURI(track.file)) === -1;
            if (needLoad) {
                loadTrack(state.trackIndex);
            }
            audio.play().then(function () {
                state.isPlaying = true;
                mpPlayBtn.innerHTML = svgIcon('icon-pause', 13);
                mpPlayBtn.title = "暂停";
                mpPlayBtn.setAttribute("aria-label", "暂停");
                mpToggle.innerHTML = svgIcon('icon-music', 18);
                saveState({ isPlaying: true });
            }).catch(function () {
                // 浏览器拦截自动播放：首次点击页面任意位置后恢复
                mpToggle.innerHTML = svgIcon('icon-music', 18);
                mpToggle.title = "点击页面任意位置开始播放";
                var resumeOnce = function () {
                    audio.play().then(function () {
                        state.isPlaying = true;
                        mpPlayBtn.innerHTML = svgIcon('icon-pause', 13);
                        mpPlayBtn.title = "暂停";
                        mpPlayBtn.setAttribute("aria-label", "暂停");
                        mpToggle.innerHTML = svgIcon('icon-music', 18);
                        saveState({ isPlaying: true });
                    }).catch(function () {});
                    document.removeEventListener("click", resumeOnce);
                };
                document.addEventListener("click", resumeOnce);
            });
        }

        /* -- 暂停 -- */
        function pause() {
            audio.pause();
            state.isPlaying = false;
            mpPlayBtn.innerHTML = svgIcon('icon-play', 13);
            mpPlayBtn.title = "播放";
            mpPlayBtn.setAttribute("aria-label", "播放");
            mpToggle.innerHTML = svgIcon('icon-music', 18);
            saveState({ isPlaying: false, currentTime: audio.currentTime || 0 });
        }

        /* -- 切换播放/暂停 -- */
        function togglePlay() {
            if (state.isPlaying) { pause(); } else { play(); }
        }

        /* -- 恢复播放（页面切换后） -- */
        function restorePlayback() {
            if (!state.isPlaying) {
                loadTrack(state.trackIndex);
                return;
            }
            loadTrack(state.trackIndex);
            audio.onloadedmetadata = function () {
                if (state.currentTime > 0) {
                    audio.currentTime = state.currentTime;
                }
                play();
            };
            // 如果元数据已缓存，直接触发
            if (audio.readyState >= 1 && state.currentTime > 0) {
                audio.currentTime = state.currentTime;
                play();
            }
        }

        /* -- 事件绑定 -- */
        mpPlayBtn.addEventListener("click", togglePlay);
        mpPrevBtn.addEventListener("click", function () {
            pause();
            loadTrack(state.trackIndex - 1);
            play();
        });
        mpNextBtn.addEventListener("click", function () {
            pause();
            loadTrack(state.trackIndex + 1);
            play();
        });

        // 进度条拖动
        mpProgress.addEventListener("input", function () {
            var pct = parseFloat(mpProgress.value);
            if (!isNaN(audio.duration)) {
                audio.currentTime = (pct / 100) * audio.duration;
            }
        });

        // 音量滑块
        if (mpVolume) {
            mpVolume.value = state.volume * 100;
            mpVolume.addEventListener("input", function () {
                var vol = parseFloat(mpVolume.value) / 100;
                audio.volume = vol;
                saveState({ volume: vol });
            });
        }

        // 折叠/展开
        playerBar.classList.add("music-player-collapsed");
        mpToggle.addEventListener("click", function () {
            playerBar.classList.toggle("music-player-collapsed");
        });

        // 曲目结束自动播放下一首
        audio.addEventListener("ended", function () {
            pause();
            loadTrack(state.trackIndex + 1);
            play();
        });

        // 更新进度条和时间
        audio.addEventListener("timeupdate", function () {
            if (!isNaN(audio.duration)) {
                var pct = (audio.currentTime / audio.duration) * 100;
                mpProgress.value = pct;
                mpTime.textContent = fmtTime(audio.currentTime) + " / " + fmtTime(audio.duration);
            }
            // 持续保存进度（节流：每5秒写一次）
            if (Math.floor(audio.currentTime) % 5 === 0) {
                saveState({ currentTime: audio.currentTime });
            }
        });

        // 音频加载完成时也更新时长
        audio.addEventListener("loadedmetadata", function () {
            mpTime.textContent = "00:00 / " + fmtTime(audio.duration);
        });

        // 播放错误时跳到下一首
        audio.addEventListener("error", function () {
            mpToggle.innerHTML = svgIcon('icon-music', 18);
            mpTrack.textContent = "加载失败…";
            setTimeout(function () {
                loadTrack(state.trackIndex + 1);
                if (state.isPlaying) { play(); }
            }, 1500);
        });

        // 页面卸载时保存最终状态
        window.addEventListener("beforeunload", function () {
            saveState({
                currentTime: audio.currentTime || 0,
                isPlaying: state.isPlaying,
                trackIndex: state.trackIndex
            });
        });

        /* -- 初始化：恢复上次播放状态 -- */
        restorePlayback();
    })();
});
