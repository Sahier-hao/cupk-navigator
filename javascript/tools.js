/**
 * tools.js —— 学习工具箱页面脚本
 * 包含绩点计算器（动态增删课程、成绩转绩点、加权平均计算）
 * 以及引用 data.js 渲染推荐工具卡片
 */
document.addEventListener("DOMContentLoaded", function () {

    /* ========== 绩点计算器 ========== */
    var courseList = document.querySelector("#gpaCourseList");
    var addBtn = document.querySelector("#addCourseBtn");
    var calcBtn = document.querySelector("#calcGpaBtn");
    var resetBtn = document.querySelector("#resetGpaBtn");
    var resultDiv = document.querySelector("#gpaResult");
    var gpaValue = document.querySelector("#gpaValue");
    var totalCredits = document.querySelector("#totalCredits");
    var courseCount = document.querySelector("#courseCount");
    var gpaNote = document.querySelector("#gpaNote");

    // 百分制成绩转绩点的换算函数
    function scoreToGpa(score) {
        var s = parseFloat(score);
        if (isNaN(s)) return -1;
        if (s >= 95) return 4.0;
        if (s >= 85) return 3.7;
        if (s >= 75) return 3.0;
        if (s >= 65) return 2.3;
        if (s >= 60) return 1.7;
        if (s >= 0) return 0;
        return -1;
    }

    // 生成一条课程输入行
    function createCourseRow(index) {
        var row = document.createElement("div");
        row.className = "gpa-course-row";
        row.innerHTML =
            '<div class="gpa-field">' +
            '<label>课程名称</label>' +
            '<input type="text" class="gpa-course-name" placeholder="例如：高等数学" />' +
            '</div>' +
            '<div class="gpa-field">' +
            '<label>成绩（百分制）</label>' +
            '<input type="number" class="gpa-score" placeholder="85" min="0" max="100" step="0.5" />' +
            '</div>' +
            '<div class="gpa-field">' +
            '<label>学分</label>' +
            '<input type="number" class="gpa-credit" placeholder="4.0" min="0.5" max="20" step="0.5" />' +
            '</div>' +
            '<button class="gpa-remove-btn" type="button" title="删除此课程">✕</button>';
        return row;
    }

    // 绑定删除按钮事件
    function bindRemoveButtons() {
        document.querySelectorAll(".gpa-remove-btn").forEach(function (btn) {
            btn.addEventListener("click", function () {
                var rows = courseList.querySelectorAll(".gpa-course-row");
                if (rows.length <= 1) return; // 至少保留一行
                btn.parentElement.remove();
            });
        });
    }

    // 初始化：至少有一条课程输入行
    function initCourseRows() {
        courseList.innerHTML = "";
        courseList.appendChild(createCourseRow(1));
        bindRemoveButtons();
    }

    // 添加课程行
    if (addBtn) {
        addBtn.addEventListener("click", function () {
            var rows = courseList.querySelectorAll(".gpa-course-row");
            if (rows.length >= 12) {
                alert("最多支持12门课程，请删除不需要的课程后再添加。");
                return;
            }
            courseList.appendChild(createCourseRow(rows.length + 1));
            bindRemoveButtons();
        });
    }

    // 计算加权平均绩点
    if (calcBtn && courseList && resultDiv) {
        calcBtn.addEventListener("click", function () {
            var rows = courseList.querySelectorAll(".gpa-course-row");
            var totalWeighted = 0;   // 绩点 × 学分的总和
            var totalCredit = 0;     // 学分总和
            var validCount = 0;
            var hasError = false;
            var errorMsg = "";

            rows.forEach(function (row) {
                var scoreInput = row.querySelector(".gpa-score");
                var creditInput = row.querySelector(".gpa-credit");

                var score = parseFloat(scoreInput.value);
                var credit = parseFloat(creditInput.value);

                // 输入验证
                if (isNaN(score) && isNaN(credit)) return; // 空行跳过
                if (isNaN(score)) {
                    hasError = true;
                    errorMsg = "请为每门课程填写成绩（0-100）。";
                    return;
                }
                if (isNaN(credit) || credit <= 0) {
                    hasError = true;
                    errorMsg = "请为每门课程填写有效的学分（大于0）。";
                    return;
                }
                if (score < 0 || score > 100) {
                    hasError = true;
                    errorMsg = "成绩应在0到100之间，请检查后重新计算。";
                    return;
                }

                var gpa = scoreToGpa(score);
                totalWeighted += gpa * credit;
                totalCredit += credit;
                validCount++;
            });

            if (hasError) {
                resultDiv.style.display = "block";
                gpaValue.textContent = "--";
                totalCredits.textContent = "--";
                courseCount.textContent = "--";
                gpaNote.textContent = errorMsg;
                gpaNote.style.color = "var(--coral)";
                return;
            }

            if (validCount === 0) {
                resultDiv.style.display = "block";
                gpaValue.textContent = "--";
                totalCredits.textContent = "--";
                courseCount.textContent = "--";
                gpaNote.textContent = "请至少填写一门课程的成绩和学分。";
                gpaNote.style.color = "var(--muted)";
                return;
            }

            var avgGpa = totalWeighted / totalCredit;
            resultDiv.style.display = "block";
            gpaValue.textContent = avgGpa.toFixed(2);
            totalCredits.textContent = totalCredit.toFixed(1);
            courseCount.textContent = validCount;

            // 根据绩点给出提示
            if (avgGpa >= 3.7) {
                gpaNote.textContent = "绩点很优秀！继续保持当前的学习状态。";
                gpaNote.style.color = "var(--success)";
            } else if (avgGpa >= 3.0) {
                gpaNote.textContent = "绩点良好，还有提升空间，加油！";
                gpaNote.style.color = "var(--blue)";
            } else if (avgGpa >= 2.0) {
                gpaNote.textContent = "绩点一般，建议重点复习低分课程，争取下次提高。";
                gpaNote.style.color = "var(--warning)";
            } else {
                gpaNote.textContent = "需要加倍努力了，可以从整理错题和课后复习开始。";
                gpaNote.style.color = "var(--coral)";
            }

            // 保存计算历史到 localStorage
            saveGpaHistory({
                date: new Date().toISOString(),
                gpa: avgGpa.toFixed(2),
                credits: totalCredit.toFixed(1),
                courses: validCount
            });
        });
    }

    /* ---- GPA 历史记录 ---- */
    function loadGpaHistory() {
        try { return JSON.parse(localStorage.getItem("shiguang_gpa_history") || "[]"); }
        catch (e) { return []; }
    }

    function saveGpaHistory(record) {
        var history = loadGpaHistory();
        history.unshift(record);
        if (history.length > 20) history.length = 20;
        try { localStorage.setItem("shiguang_gpa_history", JSON.stringify(history)); }
        catch (e) {}
        renderGpaHistory();
    }

    function renderGpaHistory() {
        var container = document.querySelector("#gpaHistoryList");
        if (!container) return;
        var history = loadGpaHistory();
        if (!history.length) {
            container.innerHTML = '<p class="empty-copy">暂无计算记录。计算绩点后，历史记录会出现在这里。</p>';
            return;
        }
        container.innerHTML = history.slice(0, 8).map(function (h) {
            var d = new Date(h.date);
            var dateStr = d.getFullYear() + "/" + (d.getMonth()+1) + "/" + d.getDate() + " " +
                String(d.getHours()).padStart(2,"0") + ":" + String(d.getMinutes()).padStart(2,"0");
            return '<div class="gpa-history-row"><span class="gpa-history-date">' + dateStr + '</span>' +
                '<span class="gpa-history-value">' + h.gpa + '</span>' +
                '<span class="gpa-history-meta">' + h.courses + '门课 / ' + h.credits + '学分</span></div>';
        }).join("");
    }

    // 初始化渲染历史记录
    renderGpaHistory();

    // 清空重置
    if (resetBtn) {
        resetBtn.addEventListener("click", function () {
            initCourseRows();
            resultDiv.style.display = "none";
        });
    }

    // 初始化
    if (courseList) {
        initCourseRows();
    }

    /* ========== 推荐工具卡片（引用 data.js 数据） ========== */
    var toolList = document.querySelector("#toolResourceList");
    if (toolList && window.StudyResources) {
        var tools = window.StudyResources.filter(function (item) {
            return item.category === "tool";
        }).slice(0, 6);

        if (tools.length) {
            toolList.innerHTML = tools.map(function (item) {
                var icon = item.icon || "images/icons/" + item.id + ".png";
                var fallback = item.title.slice(0, 1);
                return '<a class="card resource-card" href="' + item.url + '" target="_blank" rel="noopener noreferrer">' +
                    '<div class="resource-card-head">' +
                    '<div class="resource-title-group">' +
                    '<span class="resource-icon"><img src="' + icon + '" alt="" onerror="this.parentNode.textContent=\'' + fallback + '\';"></span>' +
                    '<span class="tag coral">' + item.type + '</span>' +
                    '</div>' +
                    '</div>' +
                    '<h3>' + item.title + '</h3>' +
                    '<p>' + item.description + '</p>' +
                    '<p class="usage-copy">' + item.usage + '</p>' +
                    '</a>';
            }).join("");
        }
    }

    /* ========== 倒计时 ========== */
    function initCountdown() {
        var targets = [
            { id: "cdCET",  date: "2026-06-13", label: "四六级笔试" },
            { id: "cdSummer", date: "2026-07-09", label: "暑假开始" },
            { id: "cdStart", date: "2026-08-31", label: "秋季开学" }
        ];

        function update() {
            var now = new Date();
            targets.forEach(function (t) {
                var el = document.querySelector("#" + t.id);
                if (!el) return;
                var target = new Date(t.date);
                target.setHours(23, 59, 59, 999);
                var diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
                el.textContent = diff > 0 ? diff : (diff === 0 ? "今" : "已过");
                // 小于7天用警示色
                if (diff <= 7 && diff > 0) {
                    el.style.color = "var(--coral)";
                }
            });
        }

        update();
        setInterval(update, 60000); // 每分钟更新一次
    }
    initCountdown();

    /* ========== 番茄钟 ========== */
    var pomodoroContainer = document.querySelector("#pomodoro");
    if (pomodoroContainer) {
        var pomodoroTime = document.querySelector("#pomodoroTime");
        var pomodoroStatus = document.querySelector("#pomodoroStatus");
        var pomodoroRounds = document.querySelector("#pomodoroRounds");
        var pomodoroRing = document.querySelector("#pomodoroRing");
        var startBtn = document.querySelector("#pomodoroStart");
        var pauseBtn = document.querySelector("#pomodoroPause");
        var resetBtn2 = document.querySelector("#pomodoroReset");
        var presetBtns = document.querySelectorAll(".pomodoro-preset");

        var circumference = 2 * Math.PI * 88; // 圆环周长
        pomodoroRing.style.strokeDasharray = circumference;
        pomodoroRing.style.strokeDashoffset = "0";

        var focusMinutes = 25;
        var totalSeconds = focusMinutes * 60;
        var remaining = totalSeconds;
        var isRunning = false;
        var isBreak = false;
        var currentRound = 1;
        var intervalId = null;

        function formatTime(s) {
            var m = Math.floor(s / 60);
            var sec = s % 60;
            return String(m).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
        }

        function updateDisplay() {
            pomodoroTime.textContent = formatTime(remaining);
            var progress = 1 - (remaining / totalSeconds);
            pomodoroRing.style.strokeDashoffset = circumference * (1 - progress);
            pomodoroRing.style.stroke = isBreak ? "var(--blue)" : "var(--coral)";
        }

        function stopTimer() {
            if (intervalId) { clearInterval(intervalId); intervalId = null; }
            isRunning = false;
            startBtn.disabled = false;
            pauseBtn.disabled = true;
        }

        function startTimer() {
            if (isRunning) return;
            isRunning = true;
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            pomodoroStatus.textContent = isBreak ? "休息中…" : "专注中…";

            intervalId = setInterval(function () {
                remaining--;
                updateDisplay();

                if (remaining <= 0) {
                    stopTimer();
                    if (isBreak) {
                        // 休息结束，进入下一轮专注
                        isBreak = false;
                        remaining = focusMinutes * 60;
                        totalSeconds = remaining;
                        pomodoroStatus.textContent = "休息结束，准备下一轮";
                        pomodoroRounds.textContent = "第 " + (currentRound + 1) + " / 4 轮";
                        updateDisplay();
                        notify("休息结束！准备开始下一轮专注。");
                    } else {
                        // 专注结束，进入休息
                        currentRound++;
                        if (currentRound > 4) {
                            // 四轮完成，长休息
                            isBreak = true;
                            remaining = 15 * 60;
                            totalSeconds = remaining;
                            pomodoroStatus.textContent = "四轮完成！长休息";
                            pomodoroRounds.textContent = "完成 4 轮，休息 15 分钟";
                            currentRound = 1;
                            notify("四轮番茄钟完成！休息15分钟吧。");
                        } else {
                            isBreak = true;
                            remaining = 5 * 60;
                            totalSeconds = remaining;
                            pomodoroStatus.textContent = "休息一下";
                            pomodoroRounds.textContent = "第 " + currentRound + " / 4 轮";
                            notify("专注结束！休息5分钟。");
                        }
                        updateDisplay();
                    }
                }
            }, 1000);
        }

        function notify(msg) {
            // 浏览器通知
            if ("Notification" in window && Notification.permission === "granted") {
                new Notification("石光驿站 · 番茄钟", { body: msg, icon: "images/中国石油大学矢量标.jpg" });
            }
            // 短促提示音
            try {
                var ctx = new (window.AudioContext || window.webkitAudioContext)();
                var osc = ctx.createOscillator();
                var gain = ctx.createGain();
                osc.connect(gain); gain.connect(ctx.destination);
                osc.frequency.value = 800;
                gain.gain.value = 0.15;
                osc.start(); osc.stop(ctx.currentTime + 0.15);
            } catch (e) {}
        }

        if (startBtn) {
            startBtn.addEventListener("click", function () {
                if (Notification && Notification.permission === "default") {
                    Notification.requestPermission();
                }
                startTimer();
            });
        }
        if (pauseBtn) {
            pauseBtn.addEventListener("click", function () {
                stopTimer();
                pomodoroStatus.textContent = "已暂停";
            });
        }
        if (resetBtn2) {
            resetBtn2.addEventListener("click", function () {
                stopTimer();
                isBreak = false;
                currentRound = 1;
                remaining = focusMinutes * 60;
                totalSeconds = remaining;
                pomodoroStatus.textContent = "准备开始";
                pomodoroRounds.textContent = "第 1 / 4 轮";
                startBtn.textContent = "开始专注";
                updateDisplay();
            });
        }
        presetBtns.forEach(function (btn) {
            btn.addEventListener("click", function () {
                stopTimer();
                isBreak = false;
                currentRound = 1;
                focusMinutes = parseInt(btn.getAttribute("data-minutes"));
                remaining = focusMinutes * 60;
                totalSeconds = remaining;
                pomodoroStatus.textContent = "准备开始";
                pomodoroRounds.textContent = "第 1 / 4 轮";
                startBtn.textContent = "开始专注";
                updateDisplay();

                presetBtns.forEach(function (b) { b.classList.remove("active"); });
                btn.classList.add("active");
            });
        });

        updateDisplay();
    }
});
