window.Liveswitch = window.Liveswitch || {};

((Liveswitch, $) => {
  const VideoFactory = (() => {
    function VideoFactory(localMedia) {
      this.isMuted = false;
      this.lm = localMedia;
    }
    VideoFactory.getInstance = function (localMedia) {
      if (VideoFactory.instance == null) {
        VideoFactory.instance = new VideoFactory(localMedia);
      }
      return VideoFactory.instance;
    };
    VideoFactory.prototype.toggle = function () {
      console.log('video muted.');
      this.lm.setVideoMuted(!this.isMuted);
      this.isMuted = !this.isMuted;
      return this.isMuted;
    };
    return VideoFactory;
  })();
  Liveswitch.VideoFactory = VideoFactory;
})(Liveswitch, $);