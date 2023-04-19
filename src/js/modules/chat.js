window.Liveswitch = window.Liveswitch || {};

((Liveswitch, $) => {
  const ChatFactory = (() => {
    function ChatFactory() {
      this.messages = [];
      this.hidden = true;
      this.messagesContainer = $('.messages').first();

      const container = $('.pace-chat-container');
      container.append(`
      <a class="pace-chat__close">
        <i class="fa fa-times"></i>
      </a>
      `).on('click', '.pace-chat__close', () => {
        this.toggle();
      });
    }
    ChatFactory.getInstance = function (client) {
      if (ChatFactory.instance == null) {
        ChatFactory.instance = new ChatFactory();
        this.client = client;
      }
      return ChatFactory.instance;
    };

    ChatFactory.prototype.setChannel = function (channel) {
      this.channel = channel;
    };

    ChatFactory.prototype.toggle = function () {
      const lsChatContainer = $('.pace-chat-container');
      lsChatContainer
        .removeClass(this.hidden ?  'pace-chat-container--inactive' : 'pace-chat-container--active')
        .addClass(this.hidden ? 'pace-chat-container--active' : 'pace-chat-container--inactive');
      this.hidden = !this.hidden;
      if(this.hidden) {
        lsChatContainer.hide();
      } else {
        lsChatContainer.show();
      }
    };
    ChatFactory.prototype.sendMessage = function (channel, message) {
      this.messages.push(message);
      this.createMessage(message, true);
      channel.sendMessage(message);
    };
    ChatFactory.prototype.receiveMessage = function (message) {
      this.messages.push(message);
      this.createMessage(message, false);
    };
    ChatFactory.prototype.watchMessages = function (client, channel) {
      channel.addOnMessage((remoteClient, message) => {
        if(remoteClient.getUserId() === client.getUserId()) return;
        const name = remoteClient.getUserAlias() != null ? remoteClient.getUserAlias() : remoteClient.getUserId();
        this.receiveMessage(`${name}: ${message}`);
      });
    };
    ChatFactory.prototype.createMessage = function (message, own) {
      const containerClasses = own ? ' order-1 items-end' : ' order-2 items-start';
      const messageClasses = own ? ' rounded-br-none bg-blue-600 text-white' : ' rounded-bl-none bg-gray-300 text-gray-600';
      this.messagesContainer.append(`
        <div class="chat-message">
            <div class="chat-message__wrapper ${own ? 'own': 'other'}">
              <div class="chat-message__bubble ${own ? 'own': 'other'}">
                  <span class="chat-message__content">${message}</span>
              </div>
            </div>
        </div>
      `);
    };
    return ChatFactory;
  })();
  Liveswitch.ChatFactory = ChatFactory;
})(Liveswitch, $);