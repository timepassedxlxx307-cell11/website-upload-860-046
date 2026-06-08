(function () {
    function each(list, fn) {
        Array.prototype.forEach.call(list, fn);
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slides = document.querySelectorAll("[data-hero-slide]");
        var dots = document.querySelectorAll("[data-hero-dot]");
        if (!slides.length) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            each(slides, function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            each(dots, function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        each(dots, function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        show(0);
        if (slides.length > 1) {
            setInterval(function () {
                show(index + 1);
            }, 5200);
        }
    }

    function setupFilters() {
        each(document.querySelectorAll("[data-filter-scope]"), function (scope) {
            var query = scope.querySelector("[data-filter-query]");
            var year = scope.querySelector("[data-filter-year]");
            var region = scope.querySelector("[data-filter-region]");
            var genre = scope.querySelector("[data-filter-genre]");
            var cards = scope.querySelectorAll("[data-movie-card]");
            var empty = scope.querySelector("[data-empty-state]");
            var params = new URLSearchParams(window.location.search);
            if (query && params.get("q")) {
                query.value = params.get("q");
            }
            function apply() {
                var q = normalize(query && query.value);
                var y = normalize(year && year.value);
                var r = normalize(region && region.value);
                var g = normalize(genre && genre.value);
                var visible = 0;
                each(cards, function (card) {
                    var hay = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags")
                    ].join(" "));
                    var ok = true;
                    if (q && hay.indexOf(q) === -1) {
                        ok = false;
                    }
                    if (y && normalize(card.getAttribute("data-year")) !== y) {
                        ok = false;
                    }
                    if (r && normalize(card.getAttribute("data-region")).indexOf(r) === -1) {
                        ok = false;
                    }
                    if (g && normalize(card.getAttribute("data-genre")).indexOf(g) === -1) {
                        ok = false;
                    }
                    card.hidden = !ok;
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }
            [query, year, region, genre].forEach(function (node) {
                if (node) {
                    node.addEventListener("input", apply);
                    node.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    function setupVideoPlayer(videoId, overlayId, src) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        if (!video || !overlay || !src) {
            return;
        }
        var loaded = false;
        var hlsObject = null;
        function load() {
            if (loaded) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsObject = new window.Hls({ enableWorker: true });
                hlsObject.loadSource(src);
                hlsObject.attachMedia(video);
            } else {
                video.src = src;
            }
            loaded = true;
        }
        function start(event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            load();
            overlay.classList.add("is-hidden");
            var playAction = video.play();
            if (playAction && playAction.catch) {
                playAction.catch(function () {
                    overlay.classList.remove("is-hidden");
                });
            }
        }
        overlay.addEventListener("click", start);
        var button = overlay.querySelector("button");
        if (button) {
            button.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            overlay.classList.add("is-hidden");
        });
        video.addEventListener("ended", function () {
            overlay.classList.remove("is-hidden");
        });
        window.addEventListener("beforeunload", function () {
            if (hlsObject && hlsObject.destroy) {
                hlsObject.destroy();
            }
        });
    }

    window.setupVideoPlayer = setupVideoPlayer;

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
