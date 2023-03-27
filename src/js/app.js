(($, ls) => {

  const getUrlParameter = (sParam) => {
    const sPageURL = decodeURIComponent(window.location.search.substring(1)),
      sURLVariables = sPageURL.split('&'),
      sParameterName = sParam.split('=');
    let i;
    for (i = 0; i < sURLVariables.length; i++) {
      if (sParameterName[0] === sURLVariables[i].split('=')[0]) {
        return sURLVariables[i].split('=')[1] === undefined ? true : sURLVariables[i].split('=')[1];
      }
    }
  };

  const App = (() => {
    function App() {
      this.channelId = getUrlParameter('channelId') || 'liveswitch-channel';
      this.app = ls.MediaStreamingLogic.getInstance(this.channelId);
      this.chatController = ls.ChatController.getInstance();
      this.channels = [];

      this.controls = [
        { id: 'audio', visibility: ['always'] },
        { id: 'video', visibility: ['always'] },
        { id: 'screen', visibility: ['joined', 'allowed'] },
        { id: 'leave', visibility: ['joined'] },
        { id: 'chat', visibility: ['joined'] }
      ];
    }

    App.getInstance = function () {
      if (App.instance == null) {
        App.instance = new App();
      }
      return App.instance;
    };

    App.prototype.init = function () {
      this.app.startLocalMedia().then(() => {
        const mediaCtrl = ls.MediaController.getInstance(this.app.localMedia);
        mediaCtrl.showControls();
        this.hideShowControls();
      });
      
    };

    App.prototype.initChat = function () {

    };


    App.prototype.bindEvents = function () {
      // Bind events.
      $('#ls-join').on('click', (e) => {
        e.preventDefault();
        this.app.joinAsync().then((channels) => {
          this.channels = channels;
          this.chatController.watchMessages(this.app.client, this.channels[0]);
          $('#ls-channel-information').hide();
          this.hideShowControls('joined');
        });
      });
      $('#ls-leave').on('click', () => {
        this.leaveAsync();
      });
      $('#ls-screen-share').on('click', () => {
        // this.startScreenShareAsync();
      });

      $('#send-message-button').on('click', () => {
        const message = $('#message-input').val();
        this.chatController.sendMessage(this.channels[0], message);
        $('#message-input').val('');
      });
    };

    App.prototype.hideShowControls = function (visibility) {
      this.controls.forEach((control) => {
        if (control.visibility.includes(visibility) || control.visibility.includes('always')) {
          $(`#ls-${control.id}`).show();
        } else {
          $(`#ls-${control.id}`).hide();
        }
      });
    };


    return App;
  })();
  
  window.onload = () => {
    const app = App.getInstance();
    app.init();
    app.bindEvents()
  };


})(jQuery, Liveswitch);