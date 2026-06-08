(function () {
  window.setupMoviePlayer = function (source) {
    var player = document.querySelector("[data-player]");
    if (!player) {
      return;
    }

    var video = player.querySelector("video");
    var overlay = player.querySelector(".player-overlay");
    var button = player.querySelector(".play-action");
    var hls = null;
    var prepared = false;

    function requestPlay() {
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    function prepare() {
      if (prepared) {
        return;
      }
      prepared = true;
      video.controls = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.load();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
          hls.loadSource(source);
        });
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          requestPlay();
        });
        return;
      }

      video.src = source;
      video.load();
    }

    function start() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      prepare();
      requestPlay();
    }

    if (button) {
      button.addEventListener("click", start);
    }
    if (overlay) {
      overlay.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
  };
})();
