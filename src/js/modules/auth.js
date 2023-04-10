window.Liveswitch = window.Liveswitch || {};

((Liveswitch, $) => {
  const AuthFactory = (() => {
    function AuthFactory(leaveFn) {
      this.leaveFn = leaveFn;
      this.joinCallback = () => {}
      this.leaveCallback = () => {}
    }
    AuthFactory.getInstance = function (leaveFn) {
      if (AuthFactory.instance == null) {
        AuthFactory.instance = new AuthFactory(leaveFn);
      }
      return AuthFactory.instance;
    };
    AuthFactory.prototype.join = function () {
    };
    AuthFactory.prototype.leave = function () {
      this.leaveFn().then(this.leaveCallback)
    };
    AuthFactory.prototype.setLeaveCallback = function (callback) {
      this.leaveCallback = callback;
    };
    return AuthFactory;
  })();
  Liveswitch.AuthFactory = AuthFactory;
})(Liveswitch, $);