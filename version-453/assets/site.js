(function () {
  var body = document.body;
  var toggle = document.querySelector('[data-mobile-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('is-open');
      body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeIndex = 0;

  function showSlide(nextIndex) {
    if (!slides.length) {
      return;
    }
    activeIndex = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, index) {
      slide.classList.toggle('is-active', index === activeIndex);
    });
    dots.forEach(function (dot, index) {
      dot.classList.toggle('is-active', index === activeIndex);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  showSlide(0);

  var searchInput = document.querySelector('[data-search]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var emptyState = document.querySelector('[data-empty]');

  if (searchInput && cards.length) {
    searchInput.addEventListener('input', function () {
      var query = searchInput.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var value = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags')).toLowerCase();
        var matched = !query || value.indexOf(query) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    });
  }

  function attachStream(video) {
    if (!video || video.dataset.ready === '1') {
      return;
    }

    var src = video.getAttribute('data-src');
    if (!src) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.dataset.ready = '1';
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      video.dataset.ready = '1';
      video._hlsController = hls;
      return;
    }

    video.src = src;
    video.dataset.ready = '1';
  }

  var video = document.querySelector('[data-video]');
  var playButton = document.querySelector('[data-play]');

  if (video) {
    video.addEventListener('click', function () {
      attachStream(video);
      if (video.paused) {
        video.play().catch(function () {});
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (playButton && video.currentTime === 0) {
        playButton.classList.remove('is-hidden');
      }
    });
  }

  if (playButton && video) {
    playButton.addEventListener('click', function () {
      attachStream(video);
      video.play().catch(function () {});
      playButton.classList.add('is-hidden');
    });
  }
})();
