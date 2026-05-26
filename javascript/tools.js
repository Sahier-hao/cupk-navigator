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
        });
    }

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
});
