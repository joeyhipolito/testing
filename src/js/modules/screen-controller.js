window.Liveswitch = window.Liveswitch || {};

((Liveswitch, $) => {
  const ScreenController = (() => {
    function ScreenController(localMedia) {
      this.isSharing = false;
      this.localMedia = localMedia;
      this.screenSharingConnection = null;
    }
    ScreenController.getInstance = function (localMedia) {
      if (ScreenController.instance == null) {
        ScreenController.instance = new ScreenController(localMedia);
      }
      return ScreenController.instance;
    };

    ScreenController.prototype.toggle = function (channel, layoutManager, callback) {

      if (this.localMedia.getState() === fm.liveswitch.LocalMediaState.New
        || this.localMedia.getState() === fm.liveswitch.LocalMediaState.Stopped) {
        this.isSharing = true;
        this.share(channel, layoutManager, callback);
      } else {
        this.isSharing = false;
        this.stop(channel, layoutManager, callback);
      }
      return this.isSharing;
      
    };
    ScreenController.prototype.share = function (channel, layoutManager, callback) {
      this.localMedia.start().then(() => {
        const { VideoStream } = fm.liveswitch;
        const videoStream = new VideoStream(this.localMedia);
        this.screenSharingConnection = channel.createSfuUpstreamConnection(null, videoStream, 'screen');
        this.localMedia.getVideoTracks().forEach((track) => {
          track.addOnStopped(() => {
            this.stop(channel, layoutManager, callback);
          });
        });

        layoutManager.addRemoteMedia(this.localMedia);

        callback(true)
        return this.screenSharingConnection.open();
      });
      
    };
    ScreenController.prototype.stop = function (channel, layoutManager, callback) {
      this.screenSharingConnection.close().then(() => {
        layoutManager.removeRemoteMedia(this.localMedia);
        this.localMedia.stop();
        callback(false);
      });
    };
    return ScreenController;
  })();
  Liveswitch.ScreenController = ScreenController;
})(Liveswitch, $);