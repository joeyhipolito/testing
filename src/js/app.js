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
        { id: 'screen', visibility: ['joined'] },
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
        this.mediaCtrl = ls.MediaController.getInstance(this.app.localMedia, this.app.localScreenMedia, {
          logoutCallback: () => {
            this.app.leaveAsync().then(() => {
              this.hideShowControls();
              $('#ls-channel-information').show();
              $('#ls-container')
                .addClass('h-5/6 lg:w-8/12')
                .removeClass('h-full lg:w-full')
                .parent()
                .addClass('h-4/6  md:basis-3/4 pt-10')
                .removeClass('h-full md:basis-full')
                .parent()
                .addClass('md:mx-auto px-2 xl:container')
                .removeClass('md:mx-0 px-0')
              this.channels = [];
            });
          }
        }, this.app.layoutManager);
        this.mediaCtrl.showControls();
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
          this.mediaCtrl.setChannel(this.channels[0]);
          $('#ls-channel-information').hide();
          $('#ls-container')
            .removeClass('h-5/6 lg:w-8/12')
            .addClass('h-full lg:w-full')
            .parent()
            .removeClass('h-4/6  md:basis-3/4 pt-10')
            .addClass('h-full md:basis-full')
            .parent()
            .removeClass('md:mx-auto px-2 xl:container')
            .addClass('md:mx-0 px-0');
          this.hideShowControls('joined');
        });
      });

      $('#send-message-button').on('click', () => {
        const message = $('#message-input').val();
        this.chatController.sendMessage(this.channels[0], message);
        $('#message-input').val('');
      });

      $('#message-input').on('keypress', (e) => {
        if (e.keyCode === 13) {
          const message = $('#message-input').val();
          this.chatController.sendMessage(this.channels[0], message);
          $('#message-input').val('');
        }
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