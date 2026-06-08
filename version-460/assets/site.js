(function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
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
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    document.querySelectorAll('[data-search-scope]').forEach(function (scope) {
        var input = scope.querySelector('[data-search-input]');
        var chips = Array.prototype.slice.call(scope.querySelectorAll('[data-filter]'));
        var items = Array.prototype.slice.call(scope.querySelectorAll('[data-search-item]'));
        var active = '';

        function valueOf(item) {
            return [
                item.getAttribute('data-title') || '',
                item.getAttribute('data-tags') || '',
                item.getAttribute('data-region') || '',
                item.getAttribute('data-type') || '',
                item.getAttribute('data-year') || ''
            ].join(' ').toLowerCase();
        }

        function apply() {
            var query = input ? input.value.trim().toLowerCase() : '';
            items.forEach(function (item) {
                var haystack = valueOf(item);
                var matchedQuery = !query || haystack.indexOf(query) !== -1;
                var matchedFilter = !active || haystack.indexOf(active.toLowerCase()) !== -1;
                item.hidden = !(matchedQuery && matchedFilter);
            });
        }

        if (input) {
            input.addEventListener('input', apply);
        }

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                active = chip.getAttribute('data-filter') || '';
                chips.forEach(function (other) {
                    other.classList.toggle('is-active', other === chip);
                });
                apply();
            });
        });

        apply();
    });

    document.querySelectorAll('.video-frame').forEach(function (frame) {
        var video = frame.querySelector('video');
        var button = frame.querySelector('.play-mask');
        var stream = frame.getAttribute('data-stream');
        var started = false;

        function attach() {
            if (!video || !stream) {
                return;
            }

            frame.classList.add('is-playing');
            video.setAttribute('controls', 'controls');

            if (!started) {
                started = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    video._hls = hls;
                } else {
                    video.src = stream;
                }
            }

            var play = video.play();
            if (play && typeof play.catch === 'function') {
                play.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                attach();
            });
        }

        frame.addEventListener('click', function (event) {
            if (!started && (event.target === frame || event.target === video || event.target.closest('.play-mask'))) {
                attach();
            }
        });
    });
})();
