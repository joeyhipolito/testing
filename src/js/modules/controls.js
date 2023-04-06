window.Liveswitch = window.Liveswitch || {};

((Liveswitch, $) => {
  const Controls = (() => {
    function Controls({ localMedia, layoutManager, screenMedia = false, screenLayoutManager = false, options = {
      parentContainerSelector: '#pace-parent-manager-container',
      layoutManagerSelector: '#pace-layout-manager',
      screenLayoutManagerSelector: '#pace-screen-layout-manager',
    }}) {

      this.localMedia = localMedia;
      this.screenMedia = screenMedia;
      this.layoutManager = layoutManager;
      this.screenLayoutManager = screenLayoutManager;

      this.layoutManagerContainer = $(options.layoutManagerSelector);
      this.screenLayoutManagerContainer = $(options.screenLayoutManagerSelector);
      // container of layout managers below
      this.parentContainer = $(options.parentContainerSelector);

      this.audio = Liveswitch.AudioFactory.getInstance(localMedia);
      this.video = Liveswitch.VideoFactory.getInstance(localMedia);
      this.chat = Liveswitch.ChatFactory.getInstance(localMedia);
      this.device = Liveswitch.DeviceFactory.getInstance(localMedia);
      this.screenSharing = Liveswitch.ScreenFactory.getInstance(screenMedia);
      // this.authFactory = Liveswitch.AuthFactory.getInstance(localMedia);

      this.channel = null;
    }

    Controls.getInstance = function (localMedia, layoutManager, screenMedia, screenLayoutManager, options) {
      if (Controls.instance == null) {
        Controls.instance = new Controls(localMedia, layoutManager, screenMedia, screenLayoutManager, options);
      }
      return Controls.instance;
    };

    Controls.prototype.setAuth = function (auth) {
      this.auth = auth;
    };

    Controls.prototype.setChannel = function(channel) {
      this.channel = channel;
    };

    Controls.prototype.render = function () {
      this.parentContainer.append(`
      <div class="pace-controls-container">
        <div class="pace-controls-container__wrapper">
          <a id="pace-audio" class="pace-control pace-control--unmuted">
            <i class="fa fa-microphone text-white"></i>
          </a>
          <a id="pace-video"  class="pace-control pace-control--unmuted">
            <i class="fa fa-video text-white"></i>
          </a>
          
          <a id="pace-chat" class="pace-control pace-control--unmuted">
            <i class="fa fa-comment text-white"></i>
          </a>

          <a id="pace-screen" class="pace-control pace-control--unmuted">
            <i class="fa fa-desktop text-white"></i>
          </a>

          <a id="pace-settings" class="pace-control pace-control--unmuted">
            <i class="fa fa-cog text-white"></i>
          </a>
          <a id="pace-leave" class="rounded-full border border-red-600 bg-red-600 h-12 w-12 flex items-center justify-center cursor-pointer ml-4 hover:bg-red-500">
            <i class="fa fa-phone text-white"></i>
          </a>
        </div>
        <div class="absolute opacity-20 z-0 bottom-0 w-full h-24 left-0 right-0 bg-gradient-to-b from-transparent via-gray-500 to-black"></div>
      </div>
      `);

      const microphoneButton = this.parentContainer.find('#pace-audio');
      const videoButton = this.parentContainer.find('#pace-video');
      const chatButton = this.parentContainer.find('#pace-chat');
      const screenButton = this.parentContainer.find('#pace-screen');
      const settingsButton = this.parentContainer.find('#pace-settings');
      const leaveButton = this.parentContainer.find('#pace-leave');


      const mutedClass = 'border-red-600 bg-red-600 hover:bg-red-500';
      const unmutedClass = 'border-white hover:bg-white/20';

      microphoneButton.on('click', () => {
        const muted = this.audio.toggle();
        const mutedIconClass = 'fa-microphone-slash';
        const unmutedIconClass = 'fa-microphone';
        microphoneButton
          .removeClass(muted ? unmutedClass : mutedClass)
          .addClass(muted ? mutedClass : unmutedClass)
          .find('i')
          .removeClass(muted ? unmutedIconClass : mutedIconClass)
          .addClass(muted ? mutedIconClass : unmutedIconClass);
      });
      videoButton.on('click', () => {
        const muted = this.video.toggle();
        const mutedIconClass = 'fa-video-slash';
        const unmutedIconClass = 'fa-video';
        videoButton
          .removeClass(muted ? unmutedClass : mutedClass)
          .addClass(muted ? mutedClass : unmutedClass)
          .find('i')
          .removeClass(muted ? unmutedIconClass : mutedIconClass)
          .addClass(muted ? mutedIconClass : unmutedIconClass);
      });

      screenButton.on('click', () => {
        const screenNotSharingClass = 'hidden w-full';
        const screenSharingClass = 'w-5/6';

        const layoutManagerSharingClass = '';
        const layoutManagerNotSharingClass = '';


        this.screenSharing.toggle(this.channel, this.screenLayoutManager, (isSharing) => {
          const container = $('#pace-screen-layout-manager');
          const mainContainer = $('#pace-layout-manager');

          screenButton
            .removeClass(!isSharing ? mutedClass : unmutedClass)
            .addClass(!isSharing ? unmutedClass : mutedClass);

          
          container
            .removeClass(isSharing ? screenNotSharingClass : screenSharingClass)
            .addClass(isSharing ? screenSharingClass : screenNotSharingClass);

          mainContainer
          .addClass('w-1/5')
          .removeClass('w-full');

          this.layoutManager.setMode(isSharing ? fm.liveswitch.LayoutMode.Inline : fm.liveswitch.LayoutMode.FloatLocal);
          this.localMedia.getViewSink().setViewScale(isSharing ? fm.liveswitch.LayoutScale.Cover : fm.liveswitch.LayoutScale.Contain);
        });
      });
      
      chatButton.on('click', () => {
        this.chat.toggle();
      });
      settingsButton.on('click', () => {
        this.device.toggle();
      });
      leaveButton.on('click', () => {
        this.auth.leave();
      });
    };


    return Controls;
  })();
  Liveswitch.Controls = Controls;
})(Liveswitch, $);