window.Liveswitch = window.Liveswitch || {};

((Liveswitch, $) => {
  const VideoController = (() => {
    function VideoController(localMedia) {
      this.isMuted = false;
      this.lm = localMedia;
    }
    VideoController.getInstance = function (localMedia) {
      if (VideoController.instance == null) {
        VideoController.instance = new VideoController(localMedia);
      }
      return VideoController.instance;
    };
    VideoController.prototype.toggleMute = function () {
      console.log('video muted.');
      this.lm.setVideoMuted(!this.isMuted);
      this.isMuted = !this.isMuted;
      return this.isMuted;
    };
    return VideoController;
  })();
  Liveswitch.VideoController = VideoController;
})(Liveswitch, $);