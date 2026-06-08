function initMoviePlayer(videoId, buttonId, sourceUrl) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var hls = null;

  if (!video || !button || !sourceUrl) {
    return;
  }

  function hideButton() {
    button.classList.add("is-hidden");
  }

  function showButton() {
    button.classList.remove("is-hidden");
  }

  function playVideo() {
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        showButton();
      });
    }
  }

  function start() {
    hideButton();

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      if (video.src !== sourceUrl) {
        video.src = sourceUrl;
      }
      playVideo();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!hls) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
          hls.loadSource(sourceUrl);
        });
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            showButton();
          }
        });
      } else {
        playVideo();
      }
      return;
    }

    video.src = sourceUrl;
    playVideo();
  }

  button.addEventListener("click", start);
  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });
  video.addEventListener("play", hideButton);
  video.addEventListener("pause", function () {
    if (!video.ended) {
      showButton();
    }
  });
  video.addEventListener("ended", showButton);
}
