window.Liveswitch = window.Liveswitch || {};

((Liveswitch, $) => {
  const MediaController = (() => {
    function MediaController(localMedia) {
      this.lsContainer = $('#ls-container');
      this.localMedia = localMedia;
      this.audioCtrl = Liveswitch.AudioController.getInstance(localMedia);
      this.videoCtrl = Liveswitch.VideoController.getInstance(localMedia);
    }
    MediaController.getInstance = function (localMedia) {
      if (MediaController.instance == null) {
        MediaController.instance = new MediaController(localMedia);
      }
      return MediaController.instance;
    };
    MediaController.prototype.showControls = function () {
      if(this.lsContainer.find('#ls-controls').length === 0) {
        this.lsContainer.append(`
          <div id="ls-controls" class="absolute top-0 bottom-0 right-0 left-0 flex items-end z-10">
            <div class="flex items-center justify-end mr-4 w-1/2 mb-4">
              <a id="audioMuteButton" class="rounded-full border border-white h-12 w-12 flex items-center justify-center cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 stroke-white">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              </a>
            </div>
            <div class="flex items-center justify-start ml-4 w-1/2 mb-4">
              <a id="videoMuteButton" class="rounded-full border border-white h-12 w-12 flex items-center justify-center cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 stroke-white">
                  <path stroke-linecap="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </a>
            </div>
          </div>
        `).append(`
          <div class="absolute opacity-20 z-0 bottom-0 w-full h-24 bg-gradient-to-b from-transparent via-gray-500 to-black"></div>
        `);
        const audioMuteButton = this.lsContainer.find('#audioMuteButton');
        const videoMuteButton = this.lsContainer.find('#videoMuteButton');

        audioMuteButton.on('click', () => {
          this.audioCtrl.toggleMute();
        });
        videoMuteButton.on('click', () => {
          this.videoCtrl.toggleMute();
        });
      }
    };
    return MediaController;
  })();
  Liveswitch.MediaController = MediaController;
})(Liveswitch, $);