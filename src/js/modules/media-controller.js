window.Liveswitch = window.Liveswitch || {};

((Liveswitch, $) => {
  const MediaController = (() => {
    function MediaController(localMedia) {
      this.lsContainer = $('#ls-container');
      this.localMedia = localMedia;
      this.audioCtrl = Liveswitch.AudioController.getInstance(localMedia);
      this.videoCtrl = Liveswitch.VideoController.getInstance(localMedia);
      this.chatCtrl = Liveswitch.ChatController.getInstance(localMedia);
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
            <div class="flex items-center justify-center mr-4 w-full mb-4">
              <a id="ls-audio" class="rounded-full border border-white h-12 w-12 flex items-center justify-center cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 stroke-white">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              </a>
              <a id="ls-video" class="rounded-full border border-white h-12 w-12 flex items-center justify-center cursor-pointer ml-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 stroke-white">
                  <path stroke-linecap="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </a>
              
              <a id="ls-chat" class="rounded-full border border-white h-12 w-12 flex items-center justify-center cursor-pointer ml-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 stroke-white">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
              </a>

              <a id="ls-leave" class="rounded-full border border-red-600 bg-red-600 h-12 w-12 flex items-center justify-center cursor-pointer ml-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 stroke-white">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 3.75L18 6m0 0l2.25 2.25M18 6l2.25-2.25M18 6l-2.25 2.25m1.5 13.5c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 014.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 00-.38 1.21 12.035 12.035 0 007.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 011.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 01-2.25 2.25h-2.25z" />
                </svg>
              </a>
            </div>
          </div>
        `).append(`
          <div class="absolute opacity-20 z-0 bottom-0 w-full h-24 bg-gradient-to-b from-transparent via-gray-500 to-black"></div>
        `);
        const audioMuteButton = this.lsContainer.find('#ls-audio');
        const videoMuteButton = this.lsContainer.find('#ls-video');
        const chatToggleButton = this.lsContainer.find('#ls-chat');

        audioMuteButton.on('click', () => {
          this.audioCtrl.toggleMute();
        });
        videoMuteButton.on('click', () => {
          this.videoCtrl.toggleMute();
        });
        chatToggleButton.on('click', () => {
          this.chatCtrl.toggle();
        });
      }
    };
    return MediaController;
  })();
  Liveswitch.MediaController = MediaController;
})(Liveswitch, $);