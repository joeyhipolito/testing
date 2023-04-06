window.Liveswitch = window.Liveswitch || {};

((Liveswitch, $) => {
  const AuthFactory = (() => {
    function AuthFactory() {
      this.joinCallback = () => {}
      this.leaveCallback = () => {}
    }
    AuthFactory.getInstance = function () {
      if (AuthFactory.instance == null) {
        AuthFactory.instance = new AuthFactory();
      }
      return AuthFactory.instance;
    };
    AuthFactory.prototype.join = function () {
    };
    AuthFactory.prototype.leave = function () {
    };
    return AuthFactory;
  })();
  Liveswitch.AuthFactory = AuthFactory;
})(Liveswitch, $);