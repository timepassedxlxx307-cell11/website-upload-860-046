(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var active = 0;

    var showSlide = function (index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(active + 1);
      }, 6200);
    }
  }

  var filterInput = document.querySelector('[data-filter-input]');

  if (filterInput) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var empty = document.querySelector('[data-filter-empty]');

    var applyFilter = function () {
      var value = filterInput.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var matched = !value || text.indexOf(value) !== -1;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    };

    filterInput.addEventListener('input', applyFilter);
    applyFilter();
  }

  var searchRoot = document.querySelector('[data-search-page]');

  if (searchRoot && window.movieSearchIndex) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var input = searchRoot.querySelector('[data-search-query]');
    var resultBox = searchRoot.querySelector('[data-search-results]');
    var emptyBox = searchRoot.querySelector('[data-search-empty]');

    if (input) {
      input.value = query;
    }

    var render = function (value) {
      var keyword = value.trim().toLowerCase();
      var pool = window.movieSearchIndex;
      var list = keyword
        ? pool.filter(function (item) {
            return item.search.indexOf(keyword) !== -1;
          })
        : pool.slice(0, 36);

      if (!resultBox) {
        return;
      }

      resultBox.innerHTML = list.slice(0, 120).map(function (item) {
        return '<article class="movie-card">' +
          '<a class="poster-link" href="./' + item.url + '">' +
          '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
          '<span class="poster-shade"></span>' +
          '<span class="play-chip">播放</span>' +
          '</a>' +
          '<div class="card-body">' +
          '<a class="category-chip" href="./' + item.categoryUrl + '">' + escapeHtml(item.category) + '</a>' +
          '<h2><a href="./' + item.url + '">' + escapeHtml(item.title) + '</a></h2>' +
          '<p>' + escapeHtml(item.description) + '</p>' +
          '<div class="meta-row"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
          '</div>' +
          '</article>';
      }).join('');

      if (emptyBox) {
        emptyBox.hidden = list.length !== 0;
      }
    };

    if (input) {
      input.addEventListener('input', function () {
        render(input.value);
      });
    }

    render(query);
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
})();
