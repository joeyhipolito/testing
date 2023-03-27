window.Liveswitch = window.Liveswitch || {};

((Liveswitch, $) => {
  const ChatController = (() => {
    function ChatController() {
      this.messages = [];
      this.hidden = true;
      this.messagesContainer = $('#messages');
    }
    ChatController.getInstance = function (client) {
      if (ChatController.instance == null) {
        ChatController.instance = new ChatController();
        this.client = client;
      }
      return ChatController.instance;
    };
    ChatController.prototype.toggle = function () {
      const lsChatContainer = $('#ls-chat-container');
      if (this.hidden) {
        lsChatContainer.removeClass('-right-96');
        lsChatContainer.addClass('right-0');
        this.hidden = false;
      } else {
        lsChatContainer.addClass('-right-96');
        lsChatContainer.removeClass('right-0');
        this.hidden = true;
      }
    };
    ChatController.prototype.sendMessage = function (channel, message) {
      this.messages.push(message);
      this.createMessage(message, true);
      channel.sendMessage(message);
    };
    ChatController.prototype.receiveMessage = function (message) {
      this.messages.push(message);
      this.createMessage(message, false);
    };
    ChatController.prototype.watchMessages = function (client, channel) {
      channel.addOnMessage((remoteClient, message) => {
        if(remoteClient.getUserId() === client.getUserId()) return;
        const name = remoteClient.getUserAlias() != null ? remoteClient.getUserAlias() : remoteClient.getUserId();
        this.receiveMessage(`${name}: ${message}`);
      });
    };
    ChatController.prototype.createMessage = function (message, own) {
      const containerClasses = own ? ' order-1 items-end' : ' order-2 items-start';
      const messageClasses = own ? ' rounded-br-none bg-blue-600 text-white' : ' rounded-bl-none bg-gray-300 text-gray-600';
      this.messagesContainer.append(`
        <div class="chat-message">
            <div class="flex items-end ${own ? 'justify-end': ''}">
              <div class="flex flex-col space-y-2 text-xs max-w-xs mx-2 ${containerClasses}">
                  <div><span class="px-4 py-2 rounded-lg inline-block  ${messageClasses}">${message}</span></div>
              </div>
            </div>
        </div>
      `);
    };
    return ChatController;
  })();
  Liveswitch.ChatController = ChatController;
})(Liveswitch, $);