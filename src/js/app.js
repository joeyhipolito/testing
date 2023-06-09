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

    const isHost = () => {
      const host = getUrlParameter('host');
      return host === 'true' || host === '1';
    };

  const App = (() => {
    function App() {
      this.channelId = getUrlParameter('channelId') || 'liveswitch-channel';
      this.app = ls.MediaStreamingLogic.getInstance(this.channelId);
      this.chat = ls.ChatFactory.getInstance();
      this.channels = [];
      this.controls = null;
      this.auth = ls.AuthFactory.getInstance(this.app.leaveAsync.bind(this.app));
      this.cmd = ls.CmdFactory.getInstance(this.app.client);
      this.auth.setLeaveCallback(() => {
        $('.pace-channel-waiting').addClass('d-none').hide();
        this.updateContainerUIs();
        this.channels = [];
        this.hideShowControls('always');
      })

      this.controlsPermission = [
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
        const { audioLocalMedia, videoLocalMedia, layoutManager, localScreenMedia, screenLayoutManager } = this.app;
        this.controls = ls.Controls.getInstance({
          videoLocalMedia,
          layoutManager,
          screenMedia: localScreenMedia,
          screenLayoutManager,
          audioLocalMedia
        });

        this.controls.setAuth(this.auth);
        this.controls.render();
        this.hideShowControls();
      });
    };

    App.prototype.bindEvents = function () {
      // Bind events.
      $('#pace-join').on('click', (e) => {
        const useralias = $('#useralias').val();

        e.preventDefault();
        const host = isHost();
        if(host) {
            this.app.joinAsync(useralias, true).then((channels) => {
              this.updateContainerUIs(true);
              this.channels = channels;
              this.controls.setChannel(channels[0]);
              this.chat.setChannel(channels[0]);
              this.chat.watchMessages(this.app.client, this.channels[0]);
              this.cmd.watchRequests('join', channels[1], this.app.client);
              this.cmd.sendCommand('ready', channels[1]);
              this.hideShowControls('joined');

              const whiteBoard = Liveswitch.WhiteBoardFactory.getInstance(this.app.client);

              // Set the whiteboard container
              whiteBoard.init('pace-whiteboard-container');
              whiteBoard.setTool('brush'); // 'brush', 'eraser', 'rectangle', or 'circle'
              whiteBoard.setColor('#000000'); // Replace with the desired color
              whiteBoard.setStrokeWidth(5);
              whiteBoard.setChannel(channels[0]);
              whiteBoard.receiveDrawing();
            });
        } else {
          this.app.joinCmdAsync(useralias).then((channels) => {
            const cmdChannel = channels[0];

            const readyFn = () => {
              this.cmd.sendRequest('join', cmdChannel, this.app.client);
              this.cmd.watchCommands(['join-accepted', 'join-rejected'], channels[0], this.app.client, {
                'join-accepted': () => {
                  this.app.joinChannel(channels[0]).then((channel) => {
                    this.updateContainerUIs(true);
                    this.channels = [channel];
                    this.controls.setChannel(channel);
                    this.chat.setChannel(channel);
                    this.chat.watchMessages(this.app.client, channel);
                    this.hideShowControls('joined');
                    $('.pace-channel-waiting')
                      .addClass('d-none')
                      .hide();
                    const whiteBoard = Liveswitch.WhiteBoardFactory.getInstance(this.app.client);
                    whiteBoard.init('pace-whiteboard-container');
                    whiteBoard.setTool('brush'); // 'brush', 'eraser', 'rectangle', or 'circle'
                    whiteBoard.setColor('#000000'); // Replace with the desired color
                    whiteBoard.setStrokeWidth(5);
                    whiteBoard.setChannel(channel);
                    whiteBoard.receiveDrawing();
                  });
                },
                rejected: () => {}
              });
            };

            $('.pace-channel-information').hide();
            $('.pace-channel-waiting')
              .removeClass('d-none')
              .show()
              .find('span').kendoLoader({
                size: 'medium'
              }).data("kendoLoader");

            let hasHostAndReady = false;
            const existingRemoteClients = cmdChannel.getRemoteClientInfos();
            for(let i = 0; i < existingRemoteClients.length; i++) {
              const client = existingRemoteClients[i];
              if(client.getTag() === 'ready') {
                hasHostAndReady = true;
                break;
              }
            }

            
            if(hasHostAndReady) {
              readyFn();
            } else {
              this.cmd.watchCommands(['ready'], channels[0], this.app.client, {
                'ready': () => {
                  readyFn();
                }
              })
            }
            
            
          });
        }

        
      });

      $('#send-message-button').on('click', () => {
        const message = $('#message-input').val();
        this.chat.sendMessage(this.channels[0], message);
        $('#message-input').val('');
      });

      $('#message-input').on('keypress', (e) => {
        if (e.keyCode === 13) {
          const message = $('#message-input').val();
          this.chat.sendMessage(this.channels[0], message);
          $('#message-input').val('');
        }
      });
    };

    App.prototype.hideShowControls = function (visibility) {
      this.controlsPermission.forEach((control) => {
        if (control.visibility.includes(visibility) || control.visibility.includes('always')) {
          $(`#pace-${control.id}`).show();
        } else {
          $(`#pace-${control.id}`).hide();
        }
      });
    };

    App.prototype.updateContainerUIs = function (isAuthenticated) {
      const html = $('html');
      const body = $('body');
      const parentContainer = $('#pace-parent-manager-container');
      const layoutManager = $('#pace-layout-manager');
      const screenLayoutManager = $('#pace-screen-layout-manager');
      const controlsContainer = $('#pace-controls-container');
      const infoContainer = $('#pace-channel-information');

      if(isAuthenticated)  {
        html.removeClass('unauthenticated');
        infoContainer.hide();
      } else {
        html.addClass('unauthenticated');
        infoContainer.show();
        if(!this.chat.hidden) {
          this.chat.toggle();
        }
      }

      const authenticatedClassBody = 'bg-gray-900';
      const notAuthenticatedClassBody = 'bg-white';
      body
        .removeClass(isAuthenticated ? notAuthenticatedClassBody : authenticatedClassBody)
        .addClass(isAuthenticated ? authenticatedClassBody : notAuthenticatedClassBody);

      const authenticatedClassParent = 'pace-layout-managers__container--connected';
      const notAuthenticatedClassParent = '';
      parentContainer
        .removeClass(isAuthenticated ? notAuthenticatedClassParent : authenticatedClassParent)
        .addClass(isAuthenticated ? authenticatedClassParent : notAuthenticatedClassParent);

      const authenticatedClassLayoutManager = '';
      const notAuthenticatedClassLayoutManager = '';
      layoutManager
        .removeClass(isAuthenticated ? notAuthenticatedClassLayoutManager : authenticatedClassLayoutManager)
        .addClass(isAuthenticated ? authenticatedClassLayoutManager : notAuthenticatedClassLayoutManager);

      const authenticatedClassScreenLayoutManager = '';
      const notAuthenticatedClassScreenLayoutManager = '';
      screenLayoutManager
        .removeClass(isAuthenticated ? notAuthenticatedClassScreenLayoutManager : authenticatedClassScreenLayoutManager)
        .addClass(isAuthenticated ? authenticatedClassScreenLayoutManager : notAuthenticatedClassScreenLayoutManager);

      const authenticatedClassControls = '';
      const notAuthenticatedClassControls = '';
      controlsContainer
        .removeClass(isAuthenticated ? notAuthenticatedClassControls : authenticatedClassControls)
        .addClass(isAuthenticated ? authenticatedClassControls : notAuthenticatedClassControls);

    };


    return App;
  })();
  
  window.onload = () => {
    const app = App.getInstance();
    app.init();
    app.bindEvents()
  };


})(jQuery, Liveswitch);