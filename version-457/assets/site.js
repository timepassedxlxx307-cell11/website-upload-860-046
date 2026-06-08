(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function setupMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".site-nav");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (slides.length === 0) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });

        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        var hero = document.querySelector(".hero");
        if (hero) {
            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
        }
        show(0);
        start();
    }

    function filterCards(scope, query) {
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
        var q = normalize(query);
        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-region"),
                card.getAttribute("data-year"),
                card.textContent
            ].join(" "));
            card.classList.toggle("is-hidden", q !== "" && haystack.indexOf(q) === -1);
        });
    }

    function setupLocalFilters() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
        inputs.forEach(function (input) {
            var scope = document.querySelector("[data-filter-scope]");
            if (!scope) {
                return;
            }
            input.addEventListener("input", function () {
                filterCards(scope, input.value);
            });
        });
    }

    function setupSearchPage() {
        var input = document.querySelector("[data-search-page-input]");
        var scope = document.querySelector("[data-filter-scope]");
        if (!input || !scope) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";
        input.value = q;
        filterCards(scope, q);
        input.addEventListener("input", function () {
            filterCards(scope, input.value);
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupLocalFilters();
        setupSearchPage();
    });
})();
