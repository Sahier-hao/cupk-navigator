/**
 * cupk.js —— 常用网站页面脚本
 * 功能：顶部搜索框实时过滤下方所有校园入口卡片和分区，
 *       输入关键词后隐藏不匹配的卡片，隐藏完全无匹配的分区标题
 *
 * 设计说明：
 * - 纯客户端实时过滤，无网络请求
 * - 卡片隐藏通过 CSS 类 .is-hidden 控制，搜索框为空时全部显示
 * - 分区标题在分区内所有卡片都被隐藏时一并隐藏，避免显示空分区
 */
document.addEventListener("DOMContentLoaded", function () {
    // 搜索输入框、结果统计文本、所有卡片元素、所有分区容器
    var input = document.querySelector("#cupkSearch");
    var summary = document.querySelector("#cupkSearchSummary");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".cupk-card, .cupk-mini-card"));
    var sections = Array.prototype.slice.call(document.querySelectorAll(".cupk-section"));

    // 统一转小写用于匹配
    // 将文本去除首尾空格后转为小写，实现大小写不敏感的搜索
    function normalize(text) {
        return (text || "").toLowerCase().trim();
    }

    // 过滤卡片：匹配关键词的显示，不匹配的隐藏
    // 遍历所有卡片，检查其文本内容是否包含搜索关键词
    function filterCards() {
        var keyword = normalize(input ? input.value : "");
        var visibleCount = 0;

        // 遍历每张卡片，根据是否包含关键词切换 is-hidden 类
        cards.forEach(function (card) {
            // 关键词为空时全部匹配；否则检查卡片文本中是否包含关键词
            var matched = !keyword || normalize(card.innerText).indexOf(keyword) >= 0;
            card.classList.toggle("is-hidden", !matched);
            if (matched) {
                visibleCount += 1;
            }
        });

        // 如果某个分区下所有卡片都被隐藏，则隐藏整个分区标题
        // 防止出现空白分区仍然显示标题的情况
        sections.forEach(function (section) {
            var visibleCards = section.querySelectorAll(".cupk-card:not(.is-hidden), .cupk-mini-card:not(.is-hidden)");
            section.classList.toggle("is-hidden", keyword && visibleCards.length === 0);
        });

        // 更新搜索结果计数
        // 有关键词时显示匹配数量，无关键词时显示"全部入口"
        if (summary) {
            summary.textContent = keyword ? "找到 " + visibleCount + " 个入口" : "全部入口";
        }
    }

    // 监听输入事件，每次按键都立即执行过滤
    if (input) {
        input.addEventListener("input", filterCards);
    }
});
