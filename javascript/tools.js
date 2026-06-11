/**
 * tools.js —— 学习工具箱页面脚本
 *
 * 主要功能模块：
 *   1. 绩点计算器 —— 动态增删课程行（上限12门），百分制转4.0绩点，
 *      加权平均计算，历史记录持久化（保留最近20条）
 *   2. 推荐工具卡片 —— 从 data.js 筛选前6个工具类资源渲染
 *   3. 倒计时 —— 四六级笔试、暑假开始、秋季开学三个关键节点
 *   4. 番茄钟 —— 25~45分钟可调，专注/休息循环，SVG圆环进度 + 通知
 *   5. 体测计算器 —— 按性别/年级选评分表，线性插值算分并评定等级
 */
document.addEventListener("DOMContentLoaded", function () {

    /* ========== 绩点计算器 ========== */
    /* 获取绩点计算器页面中所有需要操作的 DOM 元素引用 */
    var courseList = document.querySelector("#gpaCourseList");
    var addBtn = document.querySelector("#addCourseBtn");
    var calcBtn = document.querySelector("#calcGpaBtn");
    var resetBtn = document.querySelector("#resetGpaBtn");
    var resultDiv = document.querySelector("#gpaResult");
    var gpaValue = document.querySelector("#gpaValue");
    var totalCredits = document.querySelector("#totalCredits");
    var courseCount = document.querySelector("#courseCount");
    var gpaNote = document.querySelector("#gpaNote");

    /**
     * 百分制成绩转绩点的换算函数
     * 采用标准 4.0 绩点算法，将百分制成绩映射为 0~4.0 绩点
     * 95分及以上为满绩 4.0，60分以下为 0 绩点
     * @param {number|string} score - 百分制成绩（0~100）
     * @returns {number} 对应的绩点值，无效输入返回 -1
     */
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

    /**
     * 生成一条课程输入行
     * 创建包含课程名称、百分制成绩、学分输入框和删除按钮的 DOM 元素
     * @param {number} index - 课程序号（保留以支持后续扩展）
     * @returns {HTMLDivElement} 课程输入行的容器 div
     */
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

    /**
     * 绑定删除按钮事件
     * 为所有课程行的删除按钮注册点击事件
     * 删除时至少保留一行，避免界面出现空的课程列表
     */
    function bindRemoveButtons() {
        document.querySelectorAll(".gpa-remove-btn").forEach(function (btn) {
            btn.addEventListener("click", function () {
                var rows = courseList.querySelectorAll(".gpa-course-row");
                if (rows.length <= 1) return; // 至少保留一行
                btn.parentElement.remove();
            });
        });
    }

    /**
     * 初始化课程输入行
     * 清空课程列表容器，创建第一条默认课程行，并绑定删除按钮事件
     */
    function initCourseRows() {
        courseList.innerHTML = "";
        courseList.appendChild(createCourseRow(1));
        bindRemoveButtons();
    }

    /**
     * "添加课程"按钮点击事件
     * 限制最多 12 门课程，超过时弹出提示
     * 添加后重新绑定删除按钮的事件监听
     */
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

    /**
     * "计算绩点"按钮点击事件
     * 遍历所有课程行，校验输入合法性，计算加权平均绩点
     * 根据结果给出评价提示，并将记录存入历史
     */
    if (calcBtn && courseList && resultDiv) {
        calcBtn.addEventListener("click", function () {
            var rows = courseList.querySelectorAll(".gpa-course-row");
            var totalWeighted = 0;   // 绩点 × 学分的总和（加权绩点）
            var totalCredit = 0;     // 学分总和
            var validCount = 0;      // 有效填写的课程数
            var hasError = false;    // 输入错误标记
            var errorMsg = "";       // 错误提示文本

            /* 遍历所有课程行，逐行校验并累计加权值 */
            rows.forEach(function (row) {
                var scoreInput = row.querySelector(".gpa-score");
                var creditInput = row.querySelector(".gpa-credit");

                var score = parseFloat(scoreInput.value);
                var credit = parseFloat(creditInput.value);

                /* 输入验证：空行跳过，非法值停止计算并报错 */
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

                /* 通过校验，计算绩点并累加 */
                var gpa = scoreToGpa(score);
                totalWeighted += gpa * credit;
                totalCredit += credit;
                validCount++;
            });

            /* 有输入错误时显示错误信息 */
            if (hasError) {
                resultDiv.style.display = "block";
                gpaValue.textContent = "--";
                totalCredits.textContent = "--";
                courseCount.textContent = "--";
                gpaNote.textContent = errorMsg;
                gpaNote.style.color = "var(--coral)";
                return;
            }

            /* 无有效输入时提示用户填写 */
            if (validCount === 0) {
                resultDiv.style.display = "block";
                gpaValue.textContent = "--";
                totalCredits.textContent = "--";
                courseCount.textContent = "--";
                gpaNote.textContent = "请至少填写一门课程的成绩和学分。";
                gpaNote.style.color = "var(--muted)";
                return;
            }

            /* 加权平均 GPA = 总加权绩点 / 总学分 */
            var avgGpa = totalWeighted / totalCredit;
            resultDiv.style.display = "block";
            gpaValue.textContent = avgGpa.toFixed(2);
            totalCredits.textContent = totalCredit.toFixed(1);
            courseCount.textContent = validCount;

            /* 根据绩点值分档给出不同的鼓励或提醒文案 */
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

            /* 保存本次计算结果到 localStorage 历史记录 */
            saveGpaHistory({
                date: new Date().toISOString(),
                gpa: avgGpa.toFixed(2),
                credits: totalCredit.toFixed(1),
                courses: validCount
            });
        });
    }

    /* ===== GPA 历史记录 ===== */
    /**
     * 从 localStorage 加载 GPA 计算历史
     * key: "shiguang_gpa_history"，默认返回空数组
     * @returns {Array} 历史记录数组，按时间倒序排列
     */
    function loadGpaHistory() {
        try { return JSON.parse(localStorage.getItem("shiguang_gpa_history") || "[]"); }
        catch (e) { return []; }
    }

    /**
     * 保存一条 GPA 计算记录到历史
     * 新记录插入数组头部，仅保留最近 20 条
     * @param {Object} record - 包含 date、gpa、credits、courses 字段
     */
    function saveGpaHistory(record) {
        var history = loadGpaHistory();
        history.unshift(record);
        if (history.length > 20) history.length = 20;
        try { localStorage.setItem("shiguang_gpa_history", JSON.stringify(history)); }
        catch (e) {}
        renderGpaHistory();
    }

    /**
     * 渲染 GPA 历史记录列表
     * 在页面上显示最近 8 条历史，包含日期、绩点值、课程数和学分
     * 无历史时显示空状态提示
     */
    function renderGpaHistory() {
        var container = document.querySelector("#gpaHistoryList");
        if (!container) return;
        var history = loadGpaHistory();
        if (!history.length) {
            container.innerHTML = '<p class="empty-copy">暂无计算记录。计算绩点后，历史记录会出现在这里。</p>';
            return;
        }
        /* 取最近 8 条记录，每条渲染为包含日期、绩点值、课程数和学分信息的行 */
        container.innerHTML = history.slice(0, 8).map(function (h) {
            var d = new Date(h.date);
            var dateStr = d.getFullYear() + "/" + (d.getMonth()+1) + "/" + d.getDate() + " " +
                String(d.getHours()).padStart(2,"0") + ":" + String(d.getMinutes()).padStart(2,"0");
            return '<div class="gpa-history-row"><span class="gpa-history-date">' + dateStr + '</span>' +
                '<span class="gpa-history-value">' + h.gpa + '</span>' +
                '<span class="gpa-history-meta">' + h.courses + '门课 / ' + h.credits + '学分</span></div>';
        }).join("");
    }

    /* DOM 加载完成后立即渲染一次历史记录 */
    renderGpaHistory();

    /* ===== 重置按钮 ===== */
    /**
     * "清空重置"按钮：恢复为单条课程行，隐藏结果面板
     */
    if (resetBtn) {
        resetBtn.addEventListener("click", function () {
            initCourseRows();
            resultDiv.style.display = "none";
        });
    }

    /* DOM 加载完成后初始化课程列表 */
    if (courseList) {
        initCourseRows();
    }

    /* ========== 推荐工具卡片（引用 data.js 数据） ========== */
    /*
     * 从 window.StudyResources（data.js 定义）中筛选 category 为 "tool" 的资源，
     * 取前 6 条渲染为可点击的推荐卡片
     */
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
    /**
     * 初始化倒计时模块
     * 三个关键时间节点：四六级笔试、暑假开始、秋季开学
     * 每分钟自动刷新，倒计时 7 天内显示警示色
     */
    function initCountdown() {
        /* 定义倒计时目标列表：DOM 元素 ID、目标日期、显示标签 */
        var targets = [
            { id: "cdCET",  date: "2026-06-13", label: "四六级笔试" },
            { id: "cdSummer", date: "2026-07-09", label: "暑假开始" },
            { id: "cdStart", date: "2026-08-31", label: "秋季开学" }
        ];

        /**
         * 更新所有倒计时显示
         * 计算当前时间与目标日期的天数差（取上线，含当日）
         */
        function update() {
            var now = new Date();
            targets.forEach(function (t) {
                var el = document.querySelector("#" + t.id);
                if (!el) return;
                var target = new Date(t.date);
                target.setHours(23, 59, 59, 999);
                var diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
                /* 正数显示天数，0 显示"今"，负数显示"已过" */
                el.textContent = diff > 0 ? diff : (diff === 0 ? "今" : "已过");
                /* 倒计时 7 天以内使用珊瑚色警示，当天添加脉冲动画 */
                if (diff <= 7 && diff > 0) {
                    el.style.color = "var(--coral)";
                    el.classList.remove("countdown-pulse");
                } else if (diff === 0) {
                    el.style.color = "var(--coral)";
                    el.classList.add("countdown-pulse");
                } else {
                    el.style.color = "";
                    el.classList.remove("countdown-pulse");
                }
            });
        }

        /* 立即执行一次，然后每分钟自动更新 */
        update();
        setInterval(update, 60000); // 每分钟更新一次
    }
    initCountdown();

    /* ========== 番茄钟 ========== */
    /*
     * 番茄钟模块：支持 25/30/45 分钟专注时长预设
     * 核心逻辑：专注 25 分钟 → 休息 5 分钟 → 专注 25 分钟 → ...
     * 每 4 轮专注后进入 15 分钟长休息
     * 使用 SVG circle 环形进度条可视化剩余时间
     */
    var pomodoroContainer = document.querySelector("#pomodoro");
    if (pomodoroContainer) {
        /* 获取番茄钟页面所有 DOM 元素引用 */
        var pomodoroTime = document.querySelector("#pomodoroTime");
        var pomodoroStatus = document.querySelector("#pomodoroStatus");
        var pomodoroRounds = document.querySelector("#pomodoroRounds");
        var pomodoroRing = document.querySelector("#pomodoroRing");
        var startBtn = document.querySelector("#pomodoroStart");
        var pauseBtn = document.querySelector("#pomodoroPause");
        var resetBtn2 = document.querySelector("#pomodoroReset");
        var presetBtns = document.querySelectorAll(".pomodoro-preset");

        /* 计算 SVG 环形进度条的周长（半径 88） */
        var circumference = 2 * Math.PI * 88; // 圆环周长
        pomodoroRing.style.strokeDasharray = circumference;
        pomodoroRing.style.strokeDashoffset = "0";

        /* 番茄钟状态变量 */
        var focusMinutes = 25;       // 专注时长（分钟），可被预设按钮修改
        var totalSeconds = focusMinutes * 60; // 当前阶段总秒数
        var remaining = totalSeconds; // 剩余秒数
        var isRunning = false;       // 是否正在计时
        var isBreak = false;         // 是否处于休息阶段
        var currentRound = 1;        // 当前轮次（1~4）
        var intervalId = null;       // setInterval 句柄

        /**
         * 格式化秒数为 mm:ss 格式
         * @param {number} s - 秒数
         * @returns {string} 格式化后的时间字符串
         */
        function formatTime(s) {
            var m = Math.floor(s / 60);
            var sec = s % 60;
            return String(m).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
        }

        /**
         * 更新显示：时间文本、SVG 环形进度、颜色
         * 休息阶段显示蓝色，专注阶段显示珊瑚色
         */
        function updateDisplay() {
            pomodoroTime.textContent = formatTime(remaining);
            var progress = 1 - (remaining / totalSeconds);
            pomodoroRing.style.strokeDashoffset = circumference * (1 - progress);
            pomodoroRing.style.stroke = isBreak ? "var(--blue)" : "var(--coral)";
        }

        /**
         * 停止计时器：清除 interval、恢复按钮状态
         */
        function stopTimer() {
            if (intervalId) { clearInterval(intervalId); intervalId = null; }
            isRunning = false;
            startBtn.disabled = false;
            pauseBtn.disabled = true;
        }

        /**
         * 启动计时器：每秒递减 remaining，到零时自动切换专注/休息阶段
         * 包含轮次管理：4 轮专注后进入长休息
         */
        function startTimer() {
            if (isRunning) return;
            isRunning = true;
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            pomodoroStatus.textContent = isBreak ? "休息中…" : "专注中…";

            intervalId = setInterval(function () {
                remaining--;
                updateDisplay();

                /* 倒计时归零时切换阶段 */
                if (remaining <= 0) {
                    stopTimer();
                    if (isBreak) {
                        /* 休息结束 → 进入下一轮专注 */
                        isBreak = false;
                        remaining = focusMinutes * 60;
                        totalSeconds = remaining;
                        pomodoroStatus.textContent = "休息结束，准备下一轮";
                        pomodoroRounds.textContent = "第 " + (currentRound + 1) + " / 4 轮";
                        updateDisplay();
                        notify("休息结束！准备开始下一轮专注。");
                    } else {
                        /* 专注结束 → 进入休息 */
                        currentRound++;
                        if (currentRound > 4) {
                            /* 完成一轮完整的 4 轮番茄钟 → 长休息 15 分钟 */
                            isBreak = true;
                            remaining = 15 * 60;
                            totalSeconds = remaining;
                            pomodoroStatus.textContent = "四轮完成！长休息";
                            pomodoroRounds.textContent = "完成 4 轮，休息 15 分钟";
                            currentRound = 1;
                            notify("四轮番茄钟完成！休息15分钟吧。");
                        } else {
                            /* 常规轮次 → 短休息 5 分钟 */
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

        /**
         * 发送通知提醒：浏览器通知 + Web Audio 短促提示音
         * @param {string} msg - 通知内容
         */
        function notify(msg) {
            /* 浏览器桌面通知（需用户授权） */
            if ("Notification" in window && Notification.permission === "granted") {
                new Notification("石光驿站 · 番茄钟", { body: msg, icon: "images/中国石油大学矢量标.jpg" });
            }
            /* Web Audio API 生成 800Hz 短促提示音（0.15秒） */
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

        /* 开始按钮：请求通知权限并启动计时器 */
        if (startBtn) {
            startBtn.addEventListener("click", function () {
                if (Notification && Notification.permission === "default") {
                    Notification.requestPermission();
                }
                startTimer();
            });
        }
        /* 暂停按钮：停止计时器 */
        if (pauseBtn) {
            pauseBtn.addEventListener("click", function () {
                stopTimer();
                pomodoroStatus.textContent = "已暂停";
            });
        }
        /* 重置按钮：恢复到初始状态 */
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
        /*
         * 预设时长按钮（25/30/45分钟）
         * 点击时停止当前计时，切换专注时长并重置轮次状态
         */
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

                /* 高亮当前选中的预设按钮 */
                presetBtns.forEach(function (b) { b.classList.remove("active"); });
                btn.classList.add("active");
            });
        });

        updateDisplay();
    }

    /* ========== 体测计算器 ========== */
    /*
     * 体测计算器：依据《国家学生体质健康标准》评分表
     * 支持性别（男/女）和年级段（大一大二/大三大四）切换
     * 包含 7 个项目：BMI、肺活量、50米跑、坐位体前屈、立定跳远、
     * 引体向上（男）/仰卧起坐（女）、1000米跑（男）/800米跑（女）
     * 各项目按权重加权汇总，评定优秀/良好/及格/不及格
     */
    var fitnessCalc = document.querySelector("#fitnessCalc");
    if (fitnessCalc) {
        /* 评分表数据结构：scoreTables[性别][年级] = { 项目名: [[得分, 成绩值], ...] }
         * 数组按成绩值升序排列（成绩越好值越大或越小取决于项目类型） */
        var scoreTables = {
            male: { 1: {}, 3: {} },
            female: { 1: {}, 3: {} }
        };

        /* ---- 男生 大一/大二 评分标准 ---- */
        var m1 = scoreTables.male[1];
        /* BMI：特殊区间评分，17.9~23.9 为满分 100 */
        m1.bmi = [[100,17.9],[100,23.9],[80,17.8],[80,24.0],[80,27.9],[60,28.0]];
        m1.vital = [[100,5040],[95,4920],[90,4800],[85,4550],[80,4300],[78,4180],[76,4060],[74,3940],[72,3820],[70,3700],[68,3580],[66,3460],[64,3340],[62,3220],[60,3100],[50,2940],[40,2780],[30,2620],[20,2460],[10,2300]];
        m1.sprint = [[100,6.7],[95,6.8],[90,6.9],[85,7.0],[80,7.1],[78,7.3],[76,7.5],[74,7.7],[72,7.9],[70,8.1],[68,8.3],[66,8.5],[64,8.7],[62,8.9],[60,9.1],[50,9.3],[40,9.5],[30,9.7],[20,9.9],[10,10.1]];
        m1.reach = [[100,24.9],[95,22.8],[90,20.6],[85,19.0],[80,17.7],[78,16.4],[76,15.1],[74,13.8],[72,12.5],[70,11.2],[68,9.9],[66,8.6],[64,7.3],[62,6.0],[60,4.7],[50,3.4],[40,2.1],[30,0.8],[20,-0.5],[10,-1.8]];
        m1.jump = [[100,273],[95,268],[90,263],[85,256],[80,248],[78,244],[76,240],[74,236],[72,232],[70,228],[68,224],[66,220],[64,216],[62,212],[60,208],[50,203],[40,198],[30,193],[20,188],[10,183]];
        m1.upper = [[100,19],[95,18],[90,17],[85,16],[80,15],[78,14],[76,14],[74,13],[72,13],[70,12],[68,12],[66,11],[64,11],[62,10],[60,10],[50,9],[40,8],[30,7],[20,6],[10,5]];
        /* 1000米跑（单位：秒），如 3'17" = 197s */
        m1.run = [[100,197],[95,202],[90,207],[85,212],[80,222],[78,227],[76,232],[74,237],[72,242],[70,247],[68,252],[66,257],[64,262],[62,267],[60,272],[50,282],[40,292],[30,302],[20,312],[10,322]];

        /* ---- 男生 大三/大四 评分标准（标准略高） ---- */
        var m3 = scoreTables.male[3];
        m3.vital = [[100,5140],[95,5020],[90,4900],[85,4650],[80,4400],[78,4280],[76,4160],[74,4040],[72,3920],[70,3800],[68,3680],[66,3560],[64,3440],[62,3320],[60,3200],[50,3030],[40,2860],[30,2690],[20,2520],[10,2350]];
        m3.sprint = [[100,6.6],[95,6.7],[90,6.8],[85,6.9],[80,7.0],[78,7.2],[76,7.4],[74,7.6],[72,7.8],[70,8.0],[68,8.2],[66,8.4],[64,8.6],[62,8.8],[60,9.0],[50,9.2],[40,9.4],[30,9.6],[20,9.8],[10,10.0]];
        m3.reach = [[100,25.1],[95,23.0],[90,20.8],[85,19.2],[80,17.9],[78,16.6],[76,15.3],[74,14.0],[72,12.7],[70,11.4],[68,10.1],[66,8.8],[64,7.5],[62,6.2],[60,4.9],[50,3.6],[40,2.3],[30,1.0],[20,-0.3],[10,-1.6]];
        m3.jump = [[100,275],[95,270],[90,265],[85,258],[80,250],[78,246],[76,242],[74,238],[72,234],[70,230],[68,226],[66,222],[64,218],[62,214],[60,210],[50,205],[40,200],[30,195],[20,190],[10,185]];
        m3.upper = [[100,20],[95,19],[90,18],[85,17],[80,16],[78,15],[76,15],[74,14],[72,14],[70,13],[68,13],[66,12],[64,12],[62,11],[60,11],[50,10],[40,9],[30,8],[20,7],[10,6]];
        m3.run = [[100,195],[95,200],[90,205],[85,210],[80,220],[78,225],[76,230],[74,235],[72,240],[70,245],[68,250],[66,255],[64,260],[62,265],[60,270],[50,280],[40,290],[30,300],[20,310],[10,320]];

        /* ---- 女生 大一/大二 评分标准 ---- */
        var f1 = scoreTables.female[1];
        f1.vital = [[100,3400],[95,3350],[90,3300],[85,3150],[80,3000],[78,2900],[76,2800],[74,2700],[72,2600],[70,2500],[68,2400],[66,2300],[64,2200],[62,2100],[60,2000],[50,1960],[40,1920],[30,1880],[20,1840],[10,1800]];
        f1.sprint = [[100,7.5],[95,7.6],[90,7.7],[85,8.0],[80,8.3],[78,8.5],[76,8.7],[74,8.9],[72,9.1],[70,9.3],[68,9.5],[66,9.7],[64,9.9],[62,10.1],[60,10.3],[50,10.5],[40,10.7],[30,10.9],[20,11.1],[10,11.3]];
        f1.reach = [[100,25.8],[95,23.8],[90,21.6],[85,20.0],[80,18.6],[78,17.2],[76,15.8],[74,14.4],[72,13.0],[70,11.6],[68,10.2],[66,8.8],[64,7.4],[62,6.0],[60,5.0],[50,4.0],[40,3.0],[30,2.0],[20,1.0],[10,0]];
        f1.jump = [[100,207],[95,202],[90,197],[85,190],[80,183],[78,179],[76,175],[74,171],[72,167],[70,163],[68,159],[66,155],[64,151],[62,147],[60,143],[50,139],[40,135],[30,131],[20,127],[10,123]];
        f1.upper = [[100,56],[95,54],[90,52],[85,49],[80,46],[78,44],[76,42],[74,40],[72,38],[70,36],[68,34],[66,32],[64,30],[62,28],[60,26],[50,24],[40,22],[30,20],[20,18],[10,16]];
        /* 800米跑（单位：秒），如 3'18" = 198s */
        f1.run = [[100,198],[95,203],[90,208],[85,213],[80,223],[78,228],[76,233],[74,238],[72,243],[70,248],[68,253],[66,258],[64,263],[62,268],[60,273],[50,283],[40,293],[30,303],[20,313],[10,323]];

        /* ---- 女生 大三/大四 评分标准 ---- */
        var f3 = scoreTables.female[3];
        f3.vital = [[100,3450],[95,3400],[90,3350],[85,3200],[80,3050],[78,2950],[76,2850],[74,2750],[72,2650],[70,2550],[68,2450],[66,2350],[64,2250],[62,2150],[60,2050],[50,2000],[40,1950],[30,1900],[20,1850],[10,1800]];
        f3.sprint = [[100,7.4],[95,7.5],[90,7.6],[85,7.9],[80,8.2],[78,8.4],[76,8.6],[74,8.8],[72,9.0],[70,9.2],[68,9.4],[66,9.6],[64,9.8],[62,10.0],[60,10.2],[50,10.4],[40,10.6],[30,10.8],[20,11.0],[10,11.2]];
        f3.reach = [[100,26.0],[95,24.0],[90,21.8],[85,20.2],[80,18.8],[78,17.4],[76,16.0],[74,14.6],[72,13.2],[70,11.8],[68,10.4],[66,9.0],[64,7.6],[62,6.2],[60,5.2],[50,4.2],[40,3.2],[30,2.2],[20,1.2],[10,0.2]];
        f3.jump = [[100,208],[95,203],[90,198],[85,191],[80,184],[78,180],[76,176],[74,172],[72,168],[70,164],[68,160],[66,156],[64,152],[62,148],[60,144],[50,140],[40,136],[30,132],[20,128],[10,124]];
        f3.upper = [[100,57],[95,55],[90,53],[85,50],[80,47],[78,45],[76,43],[74,41],[72,39],[70,37],[68,35],[66,33],[64,31],[62,29],[60,27],[50,25],[40,23],[30,21],[20,19],[10,17]];
        f3.run = [[100,196],[95,201],[90,206],[85,211],[80,221],[78,226],[76,231],[74,236],[72,241],[70,246],[68,251],[66,256],[64,261],[62,266],[60,271],[50,281],[40,291],[30,301],[20,311],[10,321]];

        /**
         * 线性插值计算分数
         * 根据成绩值在评分表中的位置，在两相邻标准值间线性插值
         * @param {Array} table - 评分表 [[得分, 标准值], ...]，按标准值升序排列
         * @param {number} value - 输入成绩值
         * @param {boolean} higherIsBetter - true 表示值越大得分越高（如肺活量），
         *                                   false 表示值越小得分越高（如跑步）
         * @returns {number} 插值计算得到的得分
         */
        function calcScore(table, value, higherIsBetter) {
            if (table.length === 0) return 0;
            /* 超出评分表范围的，按边界值给分 */
            if (higherIsBetter) {
                if (value >= table[table.length - 1][1]) return 100;
                if (value <= table[0][1]) return Math.max(0, table[0][0] - 10);
            } else {
                if (value <= table[0][1]) return 100;
                if (value >= table[table.length - 1][1]) return Math.max(0, table[table.length - 1][0] - 10);
            }

            /* 在评分表中查找对应区间，线性插值 */
            for (var i = 0; i < table.length - 1; i++) {
                var lo = table[i], hi = table[i + 1];
                var vLo = lo[1], vHi = hi[1];
                if ((higherIsBetter && value >= vLo && value <= vHi) ||
                    (!higherIsBetter && value >= vHi && value <= vLo)) {
                    var ratio = (value - vLo) / (vHi - vLo);
                    return lo[0] + ratio * (hi[0] - lo[0]);
                }
            }
            return 0;
        }

        /**
         * BMI 评分（特殊处理：区间评分而非线性插值）
         * 17.9~23.9 为满分 100，偏瘦或偏胖逐档扣分
         * @param {number} bmi - BMI 值
         * @returns {number} BMI 得分
         */
        function calcBmi(bmi) {
            if (bmi >= 17.9 && bmi <= 23.9) return 100;
            if (bmi <= 17.8 && bmi >= 17.0) return 80;
            if (bmi >= 24.0 && bmi <= 27.9) return 80;
            if (bmi < 17.0) return 60;
            if (bmi >= 28.0) return 60;
            return 60;
        }

        /* 当前选中的性别和年级（默认男生、大一/大二） */
        var currentGender = "male";
        var currentGrade = "1";

        /* 性别切换按钮事件：更新界面标签和占位符 */
        document.querySelectorAll(".fitness-gender").forEach(function (btn) {
            btn.addEventListener("click", function () {
                currentGender = btn.dataset.gender;
                document.querySelectorAll(".fitness-gender").forEach(function (b) { b.classList.remove("active"); });
                btn.classList.add("active");
                /* 根据性别切换上肢项目和跑步项目的显示文本 */
                document.getElementById("fitUpperLabel").textContent = currentGender === "male" ? "引体向上 (个)" : "仰卧起坐 (个/分钟)";
                document.getElementById("fitRunLabel").textContent = currentGender === "male" ? "1000米 (分:秒)" : "800米 (分:秒)";
                document.getElementById("fitUpper").placeholder = currentGender === "male" ? "10" : "36";
                document.getElementById("fitRunMin").placeholder = currentGender === "male" ? "4" : "3";
            });
        });

        /* 年级段切换下拉框事件 */
        document.getElementById("fitnessGrade").addEventListener("change", function () {
            currentGrade = this.value;
        });

        /* "计算"按钮：读取所有输入，查评分表，计算加权总分 */
        document.getElementById("calcFitnessBtn").addEventListener("click", function () {
            /* 根据当前性别和年级选择对应的评分表 */
            var table = scoreTables[currentGender][currentGrade];
            /* 获取所有项目的用户输入值（身高 cm、体重 kg、肺活量 ml 等） */
            var height = parseFloat(document.getElementById("fitHeight").value);
            var weight = parseFloat(document.getElementById("fitWeight").value);
            var vital = parseFloat(document.getElementById("fitVital").value);
            var sprint = parseFloat(document.getElementById("fitSprint").value);
            var reach = parseFloat(document.getElementById("fitReach").value);
            var jump = parseFloat(document.getElementById("fitJump").value);
            var upper = parseFloat(document.getElementById("fitUpper").value);
            var runMin = parseFloat(document.getElementById("fitRunMin").value);
            var runSec = parseFloat(document.getElementById("fitRunSec").value);

            /* 检查是否所有项目都已填写，任一缺失则提示并中止计算 */
            if (isNaN(height) || isNaN(weight) || isNaN(vital) || isNaN(sprint) ||
                isNaN(reach) || isNaN(jump) || isNaN(upper) || isNaN(runMin) || isNaN(runSec)) {
                alert("请填写所有项目成绩。");
                return;
            }

            /* 计算 BMI 和跑步总秒数 */
            /* 根据身高体重计算 BMI（体重 kg / 身高 m 的平方） */
            var bmi = weight / ((height / 100) * (height / 100));
            /* 将跑步分钟和秒数统一转换为总秒数 */
            var runTotal = runMin * 60 + runSec;

            /* 逐项目查评分表计算得分 */
            var sBmi = calcBmi(bmi);
            var sVital = calcScore(table.vital, vital, true);
            var sSprint = calcScore(table.sprint, sprint, false);
            var sReach = calcScore(table.reach, reach, true);
            var sJump = calcScore(table.jump, jump, true);
            var sUpper = calcScore(table.upper, upper, true);
            var sRun = calcScore(table.run, runTotal, false);

            /* 按权重加权求和：BMI(15%) + 肺活量(15%) + 50m(20%)
             * + 坐位体前屈(10%) + 立定跳远(10%) + 上肢(10%) + 跑步(20%) */
            var total = sBmi * 0.15 + sVital * 0.15 + sSprint * 0.20 + sReach * 0.10 + sJump * 0.10 + sUpper * 0.10 + sRun * 0.20;
            total = Math.round(total * 10) / 10;

            /* 根据总分（0~100）评定四个等级 */
            var grade, gradeColor;
            if (total >= 90) { grade = "优秀"; gradeColor = "var(--success)"; }
            else if (total >= 80) { grade = "良好"; gradeColor = "var(--blue)"; }
            else if (total >= 60) { grade = "及格"; gradeColor = "var(--warning)"; }
            else { grade = "不及格"; gradeColor = "var(--coral)"; }

            /* 准备各项目得分数据用于渲染结果网格 */
            var items = [
                { label: "BMI", score: sBmi, weight: 15, extra: bmi.toFixed(1) },
                { label: "肺活量", score: sVital, weight: 15, extra: vital + "ml" },
                { label: "50米跑", score: sSprint, weight: 20, extra: sprint + "s" },
                { label: "坐位体前屈", score: sReach, weight: 10, extra: reach + "cm" },
                { label: "立定跳远", score: sJump, weight: 10, extra: jump + "cm" },
                { label: currentGender === "male" ? "引体向上" : "仰卧起坐", score: sUpper, weight: 10, extra: upper + "个" },
                { label: currentGender === "male" ? "1000米" : "800米", score: sRun, weight: 20, extra: runMin + "'" + String(runSec).padStart(2, "0") + "\"" }
            ];

            /* 渲染项目得分网格（80分以下标黄，60分以下标红） */
            var gridEl = document.getElementById("fitnessGrid");
            gridEl.innerHTML = items.map(function (it) {
                var cls = it.score >= 80 ? "" : (it.score >= 60 ? "warn" : "fail");
                var color = it.score >= 80 ? "" : (it.score >= 60 ? "color:var(--warning)" : "color:var(--coral)");
                return '<div class="gpa-result-item">' +
                    '<span class="gpa-result-label">' + it.label + ' (' + it.weight + '%)</span>' +
                    '<strong class="gpa-result-value" style="font-size:22px;' + color + '">' + Math.round(it.score) + '</strong>' +
                    '<span style="font-size:12px;color:var(--muted)">' + it.extra + '</span>' +
                    '</div>';
            }).join("") +
            /* 加权总分显示区（带等级颜色） */
            '<div class="gpa-result-item" style="border-left:2px solid var(--coral);padding-left:16px">' +
            '<span class="gpa-result-label">加权总分</span>' +
            '<strong class="gpa-result-value" style="font-size:36px;color:' + gradeColor + '">' + total.toFixed(1) + '</strong>' +
            '<span style="font-size:14px;font-weight:700;color:' + gradeColor + '">' + grade + '</span>' +
            '</div>';

            /* 显示等级对应的鼓励文案 */
            var noteEl = document.getElementById("fitnessNote");
            noteEl.textContent = grade === "不及格" ? "需要加强锻炼哦！体测成绩影响评优和毕业。" :
                grade === "优秀" ? "太棒了！身体素质非常出色！" :
                grade === "良好" ? "不错！继续保持锻炼。" : "及格了，但还有进步空间，加油！";
            noteEl.style.color = gradeColor;

            document.getElementById("fitnessResult").style.display = "block";
        });

        /* "清空"按钮：重置所有输入框并隐藏结果面板 */
        document.getElementById("resetFitnessBtn").addEventListener("click", function () {
            ["fitHeight","fitWeight","fitVital","fitSprint","fitReach","fitJump","fitUpper","fitRunMin","fitRunSec"].forEach(function (id) {
                document.getElementById(id).value = "";
            });
            document.getElementById("fitnessResult").style.display = "none";
        });
    }
});
