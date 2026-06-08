(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector('.mobile-menu-button');
        var nav = document.querySelector('.mobile-nav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        var nextButton = document.querySelector('.hero-next');
        var prevButton = document.querySelector('.hero-prev');
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function next() {
            show(current + 1);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(next, 5000);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                restart();
            });
        });

        if (nextButton) {
            nextButton.addEventListener('click', function () {
                next();
                restart();
            });
        }

        if (prevButton) {
            prevButton.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }

        restart();
    }

    function normalize(value) {
        return String(value || '').toLowerCase();
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function resultCard(item) {
        return [
            '<a class="search-result-card" href="', escapeHtml(item.link), '">',
            '<img src="', escapeHtml(item.cover), '" alt="', escapeHtml(item.title), '" loading="lazy">',
            '<div>',
            '<h3>', escapeHtml(item.title), '</h3>',
            '<p>', escapeHtml(item.region), ' · ', escapeHtml(item.type), ' · ', escapeHtml(item.year), '</p>',
            '</div>',
            '</a>'
        ].join('');
    }

    function openSearchPanel(query) {
        var panel = document.getElementById('search-panel');
        var index = window.SEARCH_INDEX || [];
        if (!panel || !query) {
            return;
        }
        var terms = normalize(query).split(/\s+/).filter(Boolean);
        var results = index.filter(function (item) {
            var text = normalize([
                item.title,
                item.region,
                item.type,
                item.year,
                item.genre,
                item.tags,
                item.oneLine
            ].join(' '));
            return terms.every(function (term) {
                return text.indexOf(term) !== -1;
            });
        }).slice(0, 80);
        var title = results.length ? '搜索结果' : '没有匹配结果';
        var cards = results.map(resultCard).join('');
        panel.innerHTML = [
            '<div class="search-panel-inner">',
            '<div class="search-panel-header">',
            '<div><p class="eyebrow">Search</p><h2>', title, '</h2></div>',
            '<button class="search-panel-close" type="button" aria-label="关闭">×</button>',
            '</div>',
            '<div class="search-results">', cards, '</div>',
            '</div>'
        ].join('');
        panel.classList.add('active');
        var close = panel.querySelector('.search-panel-close');
        if (close) {
            close.addEventListener('click', function () {
                panel.classList.remove('active');
            });
        }
    }

    function setupSearch() {
        var forms = Array.prototype.slice.call(document.querySelectorAll('.site-search-form'));
        forms.forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"]');
                var query = input ? input.value.trim() : '';
                if (query) {
                    openSearchPanel(query);
                }
            });
        });
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                var panel = document.getElementById('search-panel');
                if (panel) {
                    panel.classList.remove('active');
                }
            }
        });
    }

    window.bindMoviePlayer = function (options) {
        var video = document.getElementById(options.videoId);
        var overlay = document.getElementById(options.overlayId);
        var button = document.getElementById(options.buttonId);
        if (!video || !overlay || !button || !options.source) {
            return;
        }
        var initialized = false;

        function load() {
            if (!initialized) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = options.source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(options.source);
                    hls.attachMedia(video);
                } else {
                    video.src = options.source;
                }
                initialized = true;
            }
            overlay.classList.add('hidden');
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        overlay.addEventListener('click', load);
        button.addEventListener('click', function (event) {
            event.stopPropagation();
            load();
        });
        video.addEventListener('click', function () {
            if (video.paused) {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {});
                }
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupSearch();
    });
}());
