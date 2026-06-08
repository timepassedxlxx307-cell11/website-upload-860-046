(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-button]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }

    button.addEventListener('click', function () {
      button.classList.toggle('is-open');
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
      return;
    }

    var index = 0;
    var timer = null;

    function activate(nextIndex) {
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
        activate(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var nextIndex = Number(dot.getAttribute('data-hero-dot') || '0');
        activate(nextIndex);
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    start();
  }

  function initCardFilters() {
    var panels = document.querySelectorAll('[data-card-filter]');
    panels.forEach(function (panel) {
      var section = panel.closest('section');
      if (!section) {
        return;
      }

      var input = panel.querySelector('[data-filter-input]');
      var select = panel.querySelector('[data-sort-select]');
      var grid = section.querySelector('[data-card-grid]');
      if (!grid) {
        return;
      }

      var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));

      function normalize(value) {
        return String(value || '').toLowerCase().trim();
      }

      function cardText(card) {
        return normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.textContent
        ].join(' '));
      }

      function applyFilter() {
        var term = normalize(input ? input.value : '');
        cards.forEach(function (card) {
          var show = !term || cardText(card).indexOf(term) !== -1;
          card.hidden = !show;
        });
      }

      function applySort() {
        var mode = select ? select.value : 'default';
        var sorted = cards.slice();
        if (mode === 'views') {
          sorted.sort(function (a, b) {
            return Number(b.getAttribute('data-views') || '0') - Number(a.getAttribute('data-views') || '0');
          });
        } else if (mode === 'date') {
          sorted.sort(function (a, b) {
            return String(b.getAttribute('data-date') || '').localeCompare(String(a.getAttribute('data-date') || ''));
          });
        } else if (mode === 'year') {
          sorted.sort(function (a, b) {
            return Number(b.getAttribute('data-year') || '0') - Number(a.getAttribute('data-year') || '0');
          });
        }
        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      if (input) {
        input.addEventListener('input', applyFilter);
      }
      if (select) {
        select.addEventListener('change', function () {
          applySort();
          applyFilter();
        });
        applySort();
      }
    });
  }

  function initSearchPage() {
    var results = document.querySelector('[data-search-results]');
    if (!results || !window.SEARCH_MOVIES) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var box = document.querySelector('[data-search-box]');
    var category = document.querySelector('[data-search-category]');
    var sort = document.querySelector('[data-search-sort]');

    if (box) {
      box.value = query;
      box.addEventListener('input', render);
    }
    if (category) {
      category.addEventListener('change', render);
    }
    if (sort) {
      sort.addEventListener('change', render);
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function movieText(movie) {
      return normalize([
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.category,
        movie.description,
        (movie.tags || []).join(' ')
      ].join(' '));
    }

    function card(movie) {
      return [
        '<article class="movie-card">',
        '<a class="movie-poster" href="' + escapeHtml(movie.url) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
        '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '<span class="poster-shade"></span>',
        '<span class="duration-badge">' + escapeHtml(movie.duration) + '</span>',
        '<span class="play-badge">▶</span>',
        '</a>',
        '<div class="movie-card-body">',
        '<div class="movie-tags"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span></div>',
        '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
        '<p>' + escapeHtml(movie.description) + '</p>',
        '<div class="movie-meta"><span>' + escapeHtml(movie.genre) + '</span><span>' + escapeHtml(movie.rating) + ' 分</span></div>',
        '</div>',
        '</article>'
      ].join('');
    }

    function render() {
      var term = normalize(box ? box.value : query);
      var chosenCategory = category ? category.value : '';
      var items = window.SEARCH_MOVIES.filter(function (movie) {
        var matchesTerm = !term || movieText(movie).indexOf(term) !== -1;
        var matchesCategory = !chosenCategory || movie.category === chosenCategory;
        return matchesTerm && matchesCategory;
      });

      var sortMode = sort ? sort.value : 'relevance';
      if (sortMode === 'views') {
        items.sort(function (a, b) {
          return Number(b.views || 0) - Number(a.views || 0);
        });
      } else if (sortMode === 'date') {
        items.sort(function (a, b) {
          return String(b.date || '').localeCompare(String(a.date || ''));
        });
      } else if (sortMode === 'year') {
        items.sort(function (a, b) {
          return Number(b.yearNumber || 0) - Number(a.yearNumber || 0);
        });
      }

      if (!items.length) {
        results.innerHTML = '<div class="empty-state"><h2>暂无匹配影片</h2><p>换一个关键词或分类继续浏览。</p></div>';
        return;
      }

      results.innerHTML = items.slice(0, 240).map(card).join('');
    }

    render();
  }

  function initPlayers() {
    var players = document.querySelectorAll('[data-player]');
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var cover = player.querySelector('.player-cover');
      var source = player.getAttribute('data-stream');
      var attached = false;
      var hls = null;

      if (!video || !source) {
        return;
      }

      function attach() {
        if (attached) {
          return;
        }
        attached = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      function start() {
        attach();
        player.classList.add('is-playing');
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            player.classList.remove('is-playing');
          });
        }
      }

      if (cover) {
        cover.addEventListener('click', start);
      }

      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initCardFilters();
    initSearchPage();
    initPlayers();
  });
})();
