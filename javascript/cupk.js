document.addEventListener("DOMContentLoaded", function () {
    var input = document.querySelector("#cupkSearch");
    var summary = document.querySelector("#cupkSearchSummary");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".cupk-card, .cupk-mini-card"));
    var sections = Array.prototype.slice.call(document.querySelectorAll(".cupk-section"));

    function normalize(text) {
        return (text || "").toLowerCase().trim();
    }

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

        sections.forEach(function (section) {
            var visibleCards = section.querySelectorAll(".cupk-card:not(.is-hidden), .cupk-mini-card:not(.is-hidden)");
            section.classList.toggle("is-hidden", keyword && visibleCards.length === 0);
        });

        if (summary) {
            summary.textContent = keyword ? "找到 " + visibleCount + " 个入口" : "全部入口";
        }
    }

    if (input) {
        input.addEventListener("input", filterCards);
    }
});
