window.Liveswitch = window.Liveswitch || {};

((Liveswitch, $) => {
  const AudioFactory = (() => {
    function AudioFactory(localMedia) {
      this.isMuted = false;
      this.lm = localMedia;
    }
    AudioFactory.getInstance = function (localMedia) {
      if (AudioFactory.instance == null) {
        AudioFactory.instance = new AudioFactory(localMedia);
      }
      return AudioFactory.instance;
    };
    AudioFactory.prototype.toggle = function () {
      console.log('audio muted.');
      this.lm.setAudioMuted(!this.isMuted);
      this.isMuted = !this.isMuted;
      return this.isMuted;
    };
    return AudioFactory;
  })();
  Liveswitch.AudioFactory = AudioFactory;
})(Liveswitch, $);