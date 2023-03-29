window.Liveswitch = window.Liveswitch || {};

((Liveswitch, $) => {
  const AudioController = (() => {
    function AudioController(localMedia) {
      this.isMuted = false;
      this.lm = localMedia;
    }
    AudioController.getInstance = function (localMedia) {
      if (AudioController.instance == null) {
        AudioController.instance = new AudioController(localMedia);
      }
      return AudioController.instance;
    };
    AudioController.prototype.toggleMute = function () {
      console.log('audio muted.');
      this.lm.setAudioMuted(!this.isMuted);
      this.isMuted = !this.isMuted;
      return this.isMuted;
    };
    return AudioController;
  })();
  Liveswitch.AudioController = AudioController;
})(Liveswitch, $);