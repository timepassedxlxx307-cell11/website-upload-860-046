(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function bindMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var mobile = document.querySelector(".mobile-nav");
    if (!toggle || !mobile) {
      return;
    }
    toggle.addEventListener("click", function () {
      toggle.classList.toggle("is-open");
      mobile.classList.toggle("is-open");
    });
  }

  function bindGlobalSearch() {
    var input = document.querySelector(".global-search-input");
    var panel = document.querySelector(".search-results");
    var dataset = window.SEARCH_MOVIES || [];
    if (!input || !panel || !dataset.length) {
      return;
    }

    function render(query) {
      var value = query.trim().toLowerCase();
      if (!value) {
        panel.classList.remove("is-visible");
        panel.innerHTML = "";
        return;
      }
      var items = dataset
        .filter(function (item) {
          var text = [
            item.title,
            item.year,
            item.region,
            item.type,
            item.genre,
            item.category,
          ]
            .join(" ")
            .toLowerCase();
          return text.indexOf(value) !== -1;
        })
        .slice(0, 10);

      if (!items.length) {
        panel.innerHTML = '<div class="empty-result">未找到相关影片</div>';
        panel.classList.add("is-visible");
        return;
      }

      panel.innerHTML = items
        .map(function (item) {
          return (
            '<a class="search-item" href="' +
            escapeHtml(item.href) +
            '"><strong>' +
            escapeHtml(item.title) +
            "</strong><span>" +
            escapeHtml(
              [item.year, item.region, item.type, item.genre].join(" · "),
            ) +
            "</span></a>"
          );
        })
        .join("");
      panel.classList.add("is-visible");
    }

    input.addEventListener("input", function () {
      render(input.value);
    });

    document.addEventListener("click", function (event) {
      if (!panel.contains(event.target) && event.target !== input) {
        panel.classList.remove("is-visible");
      }
    });
  }

  function bindLocalFilter() {
    var input = document.querySelector(".movie-search-local");
    var cards = Array.prototype.slice.call(
      document.querySelectorAll("[data-search]"),
    );
    if (!input || !cards.length) {
      return;
    }
    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        card.style.display = !query || text.indexOf(query) !== -1 ? "" : "none";
      });
    });
  }

  function bindHero() {
    var slides = Array.prototype.slice.call(
      document.querySelectorAll(".hero-slide"),
    );
    if (!slides.length) {
      return;
    }
    var dots = Array.prototype.slice.call(
      document.querySelectorAll(".hero-dot"),
    );
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function restart() {
      window.clearInterval(timer);
      start();
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    start();
  }

  ready(function () {
    bindMenu();
    bindGlobalSearch();
    bindLocalFilter();
    bindHero();
  });
})();

window.RealtimePlayer = {
  init: function (videoUrl, videoId, coverId) {
    function setup() {
      var video = document.getElementById(videoId);
      var cover = document.getElementById(coverId);
      var attached = false;
      var hlsInstance = null;

      if (!video) {
        return;
      }

      function playVideo() {
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {});
        }
      }

      function attach() {
        if (!attached) {
          attached = true;
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = videoUrl;
            video.addEventListener("loadedmetadata", playVideo, { once: true });
          } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls();
            hlsInstance.loadSource(videoUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
          } else {
            video.src = videoUrl;
            video.addEventListener("loadedmetadata", playVideo, { once: true });
          }
        }

        if (cover) {
          cover.classList.add("is-hidden");
        }
        playVideo();
      }

      if (cover) {
        cover.addEventListener("click", attach);
      }

      video.addEventListener("click", function () {
        if (!attached) {
          attach();
          return;
        }
        if (video.paused) {
          playVideo();
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hlsInstance && typeof hlsInstance.destroy === "function") {
          hlsInstance.destroy();
        }
      });
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", setup);
    } else {
      setup();
    }
  },
};
