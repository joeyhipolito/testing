window.Liveswitch = window.Liveswitch || {};

((Liveswitch, $) => {
  const MediaFactory = (() => {
    function MediaFactory(localMedia, screenMedia, options = {}, layoutManager) {
      this.lsContainer = $('#pace-container');
      this.localMedia = localMedia;
      this.audioCtrl = Liveswitch.AudioFactory.getInstance(localMedia);
      this.videoCtrl = Liveswitch.VideoFactory.getInstance(localMedia);
      this.chatCtrl = Liveswitch.ChatFactory.getInstance(localMedia);
      this.deviceCtrl = Liveswitch.DeviceFactory.getInstance(localMedia);
      this.screenCtrl = Liveswitch.ScreenFactory.getInstance(screenMedia);
      this.logoutCallback = options.logoutCallback || (() => {});
      this.layoutManager = layoutManager;
    }

    MediaFactory.getInstance = function (localMedia, screenMedia, options, layoutManager) {
      if (MediaFactory.instance == null) {
        MediaFactory.instance = new MediaFactory(localMedia,screenMedia, options, layoutManager);
      }
      return MediaFactory.instance;
    };

    MediaFactory.prototype.setChannel = function (channel) {
      this.channel = channel;
    };

    MediaFactory.prototype.showControls = function () {
      if(this.lsContainer.find('#pace-controls').length === 0) {
        this.lsContainer.append(`
          <div id="pace-controls" class="absolute top-0 bottom-0 right-0 left-0 flex z-10 flex-col">
            <div class="flex flex-1 items-end justify-center mr-4 w-full mb-4 self-end">
              <a id="pace-audio" class="rounded-full border border-white h-12 w-12 flex items-center justify-center cursor-pointer hover:bg-white/20">
                <i class="fa fa-microphone text-white"></i>
              </a>
              <a id="pace-video" class="rounded-full border border-white h-12 w-12 flex items-center justify-center cursor-pointer ml-4 hover:bg-white/20">
                <i class="fa fa-video text-white"></i>
              </a>
              
              <a id="pace-chat" class="rounded-full border border-white h-12 w-12 flex items-center justify-center cursor-pointer ml-4 hover:bg-white/20">
                <i class="fa fa-comment text-white"></i>
              </a>

              <a id="pace-screen" class="rounded-full border border-white h-12 w-12 flex items-center justify-center cursor-pointer ml-4 hover:bg-white/20">
                <i class="fa fa-desktop text-white"></i>
              </a>

              <a id="pace-settings" class="rounded-full border border-white h-12 w-12 flex items-center justify-center cursor-pointer ml-4 hover:bg-white/20">
                <i class="fa fa-cog text-white"></i>
              </a>
              <a id="pace-leave" class="rounded-full border border-red-600 bg-red-600 h-12 w-12 flex items-center justify-center cursor-pointer ml-4 hover:bg-red-500">
                <i class="fa fa-phone text-white"></i>
              </a>
            </div>
          </div>
        `).append(`
          <div class="absolute opacity-20 z-0 bottom-0 w-full h-24 bg-gradient-to-b from-transparent via-gray-500 to-black"></div>
        `);
        const audioMuteButton = this.lsContainer.find('#pace-audio');
        const videoMuteButton = this.lsContainer.find('#pace-video');
        const chatToggleButton = this.lsContainer.find('#pace-chat');
        const screenShareButton = this.lsContainer.find('#pace-screen');
        const leaveButton = this.lsContainer.find('#pace-leave');
        const settingsButton = this.lsContainer.find('#pace-settings');

        audioMuteButton.on('click', () => {
          const muted = this.audioCtrl.toggle();
          if(muted) {
            audioMuteButton
              .removeClass('border-white hover:bg-white/20')
              .addClass('border-red-600 bg-red-600 hover:bg-red-500')
              .find('i')
              .removeClass('fa-microphone')
              .addClass('fa-microphone-slash');
          } else {
            audioMuteButton
              .removeClass('border-red-600 bg-red-600 hover:bg-red-500')
              .addClass('border-white hover:bg-white/20')
              .find('i')
              .removeClass('fa-microphone-slash')
              .addClass('fa-microphone');
          }
        });
        videoMuteButton.on('click', () => {
          const muted = this.videoCtrl.toggle();
          if(muted) {
            videoMuteButton
              .removeClass('border-white hover:bg-white/20')
              .addClass('border-red-600 bg-red-600 hover:bg-red-500')
              .find('i')
              .removeClass('fa-video')
              .addClass('fa-video-slash');
          } else {
            videoMuteButton
              .removeClass('border-red-600 bg-red-600 hover:bg-red-500')
              .addClass('border-white hover:bg-white/20')
              .find('i')
              .removeClass('fa-video-slash')
              .addClass('fa-video');
          }
        });
        chatToggleButton.on('click', () => {
          this.chatCtrl.toggle();
        });
        screenShareButton.on('click', () => {
          this.screenCtrl.toggle(this.channel, this.layoutManager, (isSharing) => {
            const container = $('#pace-screen-sharing-container');
            if(isSharing) {
              screenShareButton
                .removeClass('border-white hover:bg-white/20')
                .addClass('border-red-600 bg-red-600 hover:bg-red-500');
              // this.lsContainer
              //   .removeClass('w-full')
              //   .addClass('w-1/6');
              container
                .removeClass('hidden w-full')
                .addClass('w-5/6')
              this.localMedia.getViewSink().setViewScale(fm.liveswitch.LayoutScale.Contain);
            } else {
              screenShareButton
                .removeClass('border-red-600 bg-red-600 hover:bg-red-500')
                .addClass('border-white hover:bg-white/20');
              // this.lsContainer
              //   .addClass('w-full')
              //   .removeClass('w-1/6');
              container
                .addClass('hidden w-full')
                .removeClass('w-5/6')

            }
          });
        });

        leaveButton.on('click', () => {
          this.logoutCallback();
        });

        settingsButton.on('click', () => {
          this.deviceCtrl.toggle();
        });
      }
    };
    return MediaFactory;
  })();
  Liveswitch.MediaFactory = MediaFactory;
})(Liveswitch, $);