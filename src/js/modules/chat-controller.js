window.Liveswitch = window.Liveswitch || {};

((Liveswitch, $) => {
  const ChatController = (() => {
    function ChatController(localMedia) {
      this.lm = localMedia;
      this.messages = [];
      this.hidden = true;
    }
    ChatController.getInstance = function (localMedia) {
      if (ChatController.instance == null) {
        ChatController.instance = new ChatController(localMedia);
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
    ChatController.prototype.sendMessage = function (message) {
    };
    ChatController.prototype.receiveMessage = function (message) {
    };
    ChatController.prototype.createMessage = function (message, own) {
      
    };
    return ChatController;
  })();
  Liveswitch.ChatController = ChatController;
})(Liveswitch, $);