window.Liveswitch = window.Liveswitch || {};

((Liveswitch, $) => {

  const CmdFactory = (() => {
    function CmdFactory(client) {
      this.client = client;
      this.allowedRequests = new Map();
      this.allowedRequests.set('join', this.requestJoin.bind(this));
      this.allowedCommands = new Map();
      this.allowedCommands.set('join-accepted', this.joinAccepted.bind(this));
    }
    CmdFactory.getInstance = function (client) {
      if (CmdFactory.instance == null) {
        CmdFactory.instance = new CmdFactory(client);
      }
      return CmdFactory.instance;
    };

    CmdFactory.prototype.joinAccepted = function (remoteClient, message, channel, cbs) {
      cbs['join-accepted'](remoteClient, message, channel);
    };

    CmdFactory.prototype.requestJoin = function (clientInfo, message, channel) {
      const userId = clientInfo.getUserId();
      const name = clientInfo.getUserAlias() != null ? clientInfo.getUserAlias() : userId;
      $('<div></div>').kendoDialog({
        width: '400px',
        title: 'Join Request',
        closable: false,
        modal: true,
        content: `${name} wants to join your channel. Do you want to allow them to join?`,
        actions: [
          { text: 'Yes', primary: true, action: () => {
            this.sendCommand('join-accepted', channel, userId);
          } },
          { text: 'No', action: () => { } }
        ]
      }).data('kendoDialog').open();

    };

    CmdFactory.prototype.sendRequest= function (message, channel) {
      channel.sendMessage(message);
    };

    CmdFactory.prototype.sendCommand = function (message, channel, userId) {
      channel.sendUserMessage(userId, message);
    };

    CmdFactory.prototype.watchRequests = function (requests, channel, client) {
      channel.addOnMessage((remoteClient, message) => {
        if(remoteClient.getUserId() === client.getUserId()) return;
        this.allowedRequests.get(requests)(remoteClient, message, channel);
      });
    };

    CmdFactory.prototype.watchCommands = function (commands, channel, client, cbs) {
      channel.addOnUserMessage((remoteClient, message) => {
        for (let i = 0; i < commands.length; i++) {
          if (message === commands[i]) {
            this.allowedCommands.get(commands[i])(client, message, channel, cbs);
          }
        }
      });
    };
    return CmdFactory;
  })();
  Liveswitch.CmdFactory = CmdFactory;
})(Liveswitch, $);