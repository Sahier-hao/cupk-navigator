/**
 * cupk.js —— 常用网站页面脚本
 * 功能：顶部搜索框实时过滤下方所有校园入口卡片和分区，
 *       输入关键词后隐藏不匹配的卡片，隐藏完全无匹配的分区标题
 */
document.addEventListener("DOMContentLoaded", function () {
    var input = document.querySelector("#cupkSearch");
    var summary = document.querySelector("#cupkSearchSummary");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".cupk-card, .cupk-mini-card"));
    var sections = Array.prototype.slice.call(document.querySelectorAll(".cupk-section"));

    // 统一转小写用于匹配
    function normalize(text) {
        return (text || "").toLowerCase().trim();
    }

    // 过滤卡片：匹配关键词的显示，不匹配的隐藏
    function filterCards() {
        var keyword = normalize(input ? input.value : "");
        var visibleCount = 0;

        cards.forEach(function (card) {
            var matched = !keyword || normalize(card.innerText).indexOf(keyword) >= 0;
            card.classList.toggle("is-hidden", !matched);
            if (matched) {
                visibleCount += 1;
            }
        });

        // 如果某个分区下所有卡片都被隐藏，则隐藏整个分区标题
        sections.forEach(function (section) {
            var visibleCards = section.querySelectorAll(".cupk-card:not(.is-hidden), .cupk-mini-card:not(.is-hidden)");
            section.classList.toggle("is-hidden", keyword && visibleCards.length === 0);
        });

        // 更新搜索结果计数
        if (summary) {
            summary.textContent = keyword ? "找到 " + visibleCount + " 个入口" : "全部入口";
        }
    }

    if (input) {
        input.addEventListener("input", filterCards);
    }
});
