(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function text(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var open = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", open ? "false" : "true");
      panel.hidden = open;
    });
  }

  function setupHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }
    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide")) || 0);
        start();
      });
    });
    show(0);
    start();
  }

  function setupFilters() {
    var list = document.querySelector("[data-filter-list]");
    var scope = document.querySelector("[data-filter-scope]");
    if (!list || !scope) {
      return;
    }
    var cards = Array.prototype.slice.call(list.children);
    var keyword = scope.querySelector("[data-filter-keyword]");
    var year = scope.querySelector("[data-filter-year]");
    var region = scope.querySelector("[data-filter-region]");
    var empty = document.querySelector("[data-empty-result]");
    function apply() {
      var q = text(keyword && keyword.value);
      var y = text(year && year.value);
      var r = text(region && region.value);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = text([
          card.getAttribute("data-title"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year")
        ].join(" "));
        var match = (!q || haystack.indexOf(q) !== -1) &&
          (!y || text(card.getAttribute("data-year")) === y) &&
          (!r || text(card.getAttribute("data-region")) === r);
        card.classList.toggle("is-filter-hidden", !match);
        if (match) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }
    [keyword, year, region].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    apply();
  }

  function cardHtml(item) {
    return [
      '<article class="movie-card">',
      '<a class="poster-link" href="' + item.url + '" aria-label="观看' + escapeHtml(item.title) + '">',
      '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="play-chip">立即观看</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<div class="movie-meta-line"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.genre) + '</span></div>',
      '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
      '<p>' + escapeHtml(item.text) + '</p>',
      '<div class="tag-row">' + item.tags.slice(0, 4).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#039;"
      }[char];
    });
  }

  function setupSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var input = document.querySelector("[data-search-input]");
    if (!results || !window.SITE_SEARCH_ITEMS) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (input) {
      input.value = query;
    }
    var q = text(query);
    var items = window.SITE_SEARCH_ITEMS.filter(function (item) {
      if (!q) {
        return true;
      }
      return text([item.title, item.region, item.year, item.genre, item.tags.join(" "), item.text].join(" ")).indexOf(q) !== -1;
    }).slice(0, 120);
    results.innerHTML = items.map(cardHtml).join("");
    var empty = document.querySelector("[data-search-empty]");
    if (empty) {
      empty.hidden = items.length !== 0;
    }
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();
