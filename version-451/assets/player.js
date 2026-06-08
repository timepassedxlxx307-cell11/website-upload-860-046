(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('[data-player-cover]');
    var message = player.querySelector('[data-player-message]');
    var source = player.getAttribute('data-play');
    var loaded = false;
    var hls = null;

    if (!video || !source) {
      return;
    }

    var showMessage = function (text) {
      if (!message) {
        return;
      }
      message.textContent = text;
      message.classList.add('is-visible');
    };

    var prepare = function () {
      if (loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showMessage('视频暂时无法播放，请稍后再试');
          }
        });
        return;
      }

      showMessage('视频暂时无法播放，请稍后再试');
    };

    var start = function () {
      prepare();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var playAction = video.play();
      if (playAction && typeof playAction.catch === 'function') {
        playAction.catch(function () {
          if (cover) {
            cover.classList.remove('is-hidden');
          }
        });
      }
    };

    if (cover) {
      cover.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
