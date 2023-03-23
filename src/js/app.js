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
  const channelId = getUrlParameter('channelId');
  const app = ls.MediaStreamingLogic.getInstance(channelId);
  
  window.onload = () => {
    app.startLocalMedia().then(() => {
      const mediaCtrl = ls.MediaController.getInstance(app.localMedia);
      mediaCtrl.showControls();
    });
  };


})(jQuery, Liveswitch);