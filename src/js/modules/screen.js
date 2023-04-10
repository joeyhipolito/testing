window.Liveswitch = window.Liveswitch || {};

((Liveswitch, $) => {
  const ScreenFactory = (() => {
    function ScreenFactory(localMedia) {
      this.isSharing = false;
      this.localMedia = localMedia;
      this.screenSharingConnection = null;
    }
    ScreenFactory.getInstance = function (localMedia) {
      if (ScreenFactory.instance == null) {
        ScreenFactory.instance = new ScreenFactory(localMedia);
      }
      return ScreenFactory.instance;
    };

    ScreenFactory.prototype.toggle = function (channel, layoutManager, callback) {
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
    ScreenFactory.prototype.share = function (channel, layoutManager, callback) {
      this.localMedia.start().then(() => {
        const { VideoStream } = fm.liveswitch;
        const videoStream = new VideoStream(this.localMedia);
        this.screenSharingConnection = channel.createSfuUpstreamConnection(null, videoStream);
        this.screenSharingConnection.setMediaId('screen');
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
    ScreenFactory.prototype.stop = function (channel, layoutManager, callback) {
      this.screenSharingConnection.close().then(() => {
        layoutManager.removeRemoteMedia(this.localMedia);
        this.localMedia.stop();
        callback(false);
      });
    };
    return ScreenFactory;
  })();
  Liveswitch.ScreenFactory = ScreenFactory;
})(Liveswitch, $);