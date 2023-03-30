window.Liveswitch = window.Liveswitch || {};

((Liveswitch, $) => {
  const ScreenController = (() => {
    function ScreenController(localMedia) {
      this.isMuted = false;
      this.lm = localMedia;
    }
    ScreenController.getInstance = function (localMedia) {
      if (ScreenController.instance == null) {
        ScreenController.instance = new ScreenController(localMedia);
      }
      return ScreenController.instance;
    };
    ScreenController.prototype.share = function (channel) {
      this.lm.start().then(() => {
        const { VideoStream } = fm.liveswitch;
        const videoStream = new VideoStream(this.lm);
        const connection = channel.createSfuUpstreamConnection(null, videoStream, 'screen');
        return connection.open();
      });
      
    };
    return ScreenController;
  })();
  Liveswitch.ScreenController = ScreenController;
})(Liveswitch, $);