window.Liveswitch = window.Liveswitch || {};

((Liveswitch, $) => {
  const MediaStreamingLogic = (() => {
    
    function MediaStreamingLogic(channelId) {

      //Replace the following with the values from the LiveSwitch Console
      this.applicationId = '155d1675-12cc-448b-b4ca-cc02021635dc';
      this.sharedSecret = '8ef496f0bef14aa69c9b367546ce3ead4bc488c8458b463ebe739417e3f2b759';

      this.streamingContainer = $('#pace-layout-manager');
      this.screenSharingContainer = $('#pace-screen-layout-manager');

      this.textContainer = $('#pace-text-container');

      this.channelId = channelId || 'liveswitch-channel';
      this.gatewayUrl = 'https://cloud.liveswitch.io/';
      this.reRegisterBackoff = 200;
      this.maxRegisterBackoff = 60000;
      this.unregistering = false;

      this.layoutManager = new fm.liveswitch.DomLayoutManager(this.streamingContainer.get(0));
      this.screenLayoutManager = new fm.liveswitch.DomLayoutManager(this.screenSharingContainer.get(0)); 
      // this.layoutManager.setMode(fm.liveswitch.LayoutMode.Inline);
      this.downstreamConnections = {};

      this.localMedia = null;

      // Create a new local media for screen capturing.
      this.localScreenMedia = new fm.liveswitch.LocalMedia(false, true, true);
      this.localScreenMedia.setAudioMuted(true);

      this.remoteMedia = [];
      this.remoteScreenMedia = [];

      this.useralias = null;
      // Log to console.
      fm.liveswitch.Log.registerProvider(new fm.liveswitch.ConsoleLogProvider(fm.liveswitch.LogLevel.Debug));
    }
    MediaStreamingLogic.getInstance = function (channelId) {
      if (MediaStreamingLogic.instance == null) {
        MediaStreamingLogic.instance = new MediaStreamingLogic(channelId);
      }
      return MediaStreamingLogic.instance;
    };

    MediaStreamingLogic.prototype.getToken = function(channelClaims) {
      return fm.liveswitch.Token.generateClientRegisterToken(
        this.applicationId,
        this.client.getUserId(),
        this.client.getDeviceId(),
        this.client.getId(),
        null,
        channelClaims,
        this.sharedSecret
      );
    };

    MediaStreamingLogic.prototype.getClient = function () {
      // Allow re-register.
      this.unregistering = false;
      if (!this.client) {
        this.client = new fm.liveswitch.Client(this.gatewayUrl, this.applicationId);
        this.client.addOnStateChange(() => {
          // Write registration state to log.
          fm.liveswitch.Log.debug(
            `Client is ${new fm.liveswitch.ClientStateWrapper(
              this.client.getState()
            )}.`
          );
  
          if (
            this.client.getState() === fm.liveswitch.ClientState.Unregistered &&
            !this.unregistering
          ) {
            fm.liveswitch.Log.debug(
              `Registering with backoff = ${this.reRegisterBackoff}.`
            );
  
            // Re-register after a backoff.
            setTimeout(() => {
              // Incrementally increase register backoff to prevent runaway process.
              if (this.reRegisterBackoff <= this.maxRegisterBackoff) {
                this.reRegisterBackoff += this.reRegisterBackoff;
              }
  
              // Register client with token.
              this.client
                .register(token)
                .then((channels) => {
                  // Reset re-register backoff after successful registration.
                  this.reRegisterBackoff = 200;
                  this.onClientRegistered(channels);
                  promise.resolve(channels);
                })
                .fail((ex) => {
                  fm.liveswitch.Log.error("Failed to register with Gateway.");
                  promise.reject(ex);
                });
            }, this.reRegisterBackoff);
          }
        });
      }
      return this.client;
    };

    MediaStreamingLogic.prototype.joinCmdAsync = function (useralias) {
      this.useralias = useralias;
      const promise = new fm.liveswitch.Promise();
      client = this.getClient();
      client.setUserAlias(useralias);

      // Generate a token (do this on the server to avoid exposing your shared secret).
      const token = this.getToken([new fm.liveswitch.ChannelClaim(this.channelId + '_cmd')]);

      // Register client with token.
      client
        .register(token)
        .then((channels) => {
          this.onClientRegistered(channels);
          promise.resolve(channels);
        })
        .fail((ex) => {
          fm.liveswitch.Log.error("Failed to register with Gateway.");
          promise.reject(ex);
        });

      return promise;
    };

    MediaStreamingLogic.prototype.joinChannel = function() {
      const promise = new fm.liveswitch.Promise();
      const token = this.getToken([new fm.liveswitch.ChannelClaim(this.channelId)]);
      this.client.join(this.channelId, token)
        .then((channel) => {
          this.channel = channel;
          // Open a new SFU upstream connection.
          this.upstreamConnection = this.openSfuUpstreamConnection(this.localMedia);

          // Open a new SFU downstream connection when a remote upstream connection is opened.
          this.channel.addOnRemoteUpstreamConnectionOpen((remoteConnectionInfo) =>
            this.openSfuDownstreamConnection(remoteConnectionInfo)
          );
          promise.resolve(channel);
        });

      return promise;

    };

    MediaStreamingLogic.prototype.joinAsync = function (useralias, host) {
      this.useralias = useralias;
      const promise = new fm.liveswitch.Promise();
      client = this.getClient();
      client.setUserAlias(useralias);
      if (host) {
        debugger;
        client.setTag('ready');
      }

      // Generate a token (do this on the server to avoid exposing your shared secret).
      const token = this.getToken([new fm.liveswitch.ChannelClaim(this.channelId), new fm.liveswitch.ChannelClaim(this.channelId + '_cmd')]);


      // Register client with token.
      client
        .register(token)
        .then((channels) => {
          this.onHostClientRegistered(channels);
          promise.resolve(channels);
        })
        .fail((ex) => {
          fm.liveswitch.Log.error("Failed to register with Gateway.");
          promise.reject(ex);
        });

      return promise;
    };

    MediaStreamingLogic.prototype.leaveAsync = function () {
      // Disable re-register.
      this.unregistering = true;
      return this.client
        .unregister()
        .then(() => {
          this.resetLayoutScale();
          for (const i in this.remoteMedia) {
            if(this.remoteMedia[i].mediaId === 'screen') {
              this.screenLayoutManager.removeRemoteMedia(this.remoteMedia[i]);
              const parent = $('#pace-parent-manager-container');
              parent.removeClass('screen-sharing');
            } else {
              this.layoutManager.removeRemoteMedia(this.remoteMedia[i]);
            }
          }
          this.remoteMedia = [];
        })
        .fail(() => fm.liveswitch.Log.error("Unregistration failed."));
    };

    MediaStreamingLogic.prototype.onClientRegistered = function (channels) {
      // Store our channel reference.

      this.cmdChannel = channels[0];

      // Open a new SFU upstream connection.
      // this.upstreamConnection = this.openSfuUpstreamConnection(this.localMedia);

      // // Open a new SFU downstream connection when a remote upstream connection is opened.
      // this.channel.addOnRemoteUpstreamConnectionOpen((remoteConnectionInfo) =>
      //   this.openSfuDownstreamConnection(remoteConnectionInfo)
      // );
    };

    MediaStreamingLogic.prototype.onHostClientRegistered = function (channels) {
      this.channel = channels[0];
      this.cmdChannel = channels[1];

      // Open a new SFU upstream connection.
      this.upstreamConnection = this.openSfuUpstreamConnection(this.localMedia);

      // Open a new SFU downstream connection when a remote upstream connection is opened.
      this.channel.addOnRemoteUpstreamConnectionOpen((remoteConnectionInfo) =>
        this.openSfuDownstreamConnection(remoteConnectionInfo)
      );

    };

    MediaStreamingLogic.localMedia = undefined;

    MediaStreamingLogic.prototype.startLocalMedia = function () {
      const promise = new fm.liveswitch.Promise();

      if (this.localMedia == null) {
        // Create local media with audio and video enabled.
        const audioEnabled = true;
        const videoEnabled = true;
        this.localMedia = new fm.liveswitch.LocalMedia(
          audioEnabled,
          videoEnabled
        );

        // Set local media in the layout.
        this.layoutManager.setLocalMedia(this.localMedia);
      }

      // Start capturing local media.
      this.localMedia
        .start()
        .then(() => {
          fm.liveswitch.Log.debug("Media capture started.");
          promise.resolve(null);
        })
        .fail((ex) => {
          fm.liveswitch.Log.error(ex.message);
          promise.reject(ex);
        });

      return promise;
    };

    MediaStreamingLogic.prototype.stopLocalMedia = function () {
      const promise = new fm.liveswitch.Promise();

      // Stop capturing local media.
      this.localMedia
        .stop()
        .then(() => {
          fm.liveswitch.Log.debug("Media capture stopped.");
          promise.resolve(null);
        })
        .fail((ex) => {
          fm.liveswitch.Log.error(ex.message);
          promise.reject(ex);
        });

      return promise;
    };

    MediaStreamingLogic.upstreamConnection = undefined;

    MediaStreamingLogic.prototype.openSfuUpstreamConnection = function (localMedia) {
      // Create audio and video streams from local media.
      const audioStream = new fm.liveswitch.AudioStream(localMedia);
      const videoStream = new fm.liveswitch.VideoStream(localMedia);

      // Create a SFU upstream connection with local audio and video.
      const connection = this.channel.createSfuUpstreamConnection(
        audioStream,
        videoStream
      );

      connection.addOnStateChange((conn) => {
        fm.liveswitch.Log.debug(
          `Upstream connection is ${new fm.liveswitch.ConnectionStateWrapper(
            conn.getState()
          ).toString()}.`
        );
      });

      connection.open();

      return connection;
    };

    MediaStreamingLogic.prototype.openSfuDownstreamConnection = function (remoteConnectionInfo) {
      // Create remote media.
      const remoteMedia = new fm.liveswitch.RemoteMedia();
      const audioStream = new fm.liveswitch.AudioStream(remoteMedia);
      const videoStream = new fm.liveswitch.VideoStream(remoteMedia);
      
      // Add remote media to the layout.
      // if(remoteConnectionInfo.getMediaId() !== 'screen') {
      //   remoteMedia.getViewSink().setViewScale(fm.liveswitch.LayoutScale.Cover);
      // }
      remoteMedia.getViewSink().setViewScale(fm.liveswitch.LayoutScale.Contain);
      
      if(remoteConnectionInfo.getMediaId() === 'screen') {
        const container = $('#pace-screen-layout-manager');
        const parent = $('#pace-parent-manager-container');


        parent.addClass('screen-sharing');
        container.removeClass('d-none');

        this.layoutManager.setMode(fm.liveswitch.LayoutMode.Inline);
        this.localMedia.getViewSink().setViewScale(fm.liveswitch.LayoutScale.Cover);
        remoteMedia.mediaId = 'screen';
        this.screenLayoutManager.addRemoteMedia(remoteMedia);

      } else {
        this.layoutManager.addRemoteMedia(remoteMedia);
      }
      
      // Create a SFU downstream connection with remote audio and video.
      const connection = this.channel.createSfuDownstreamConnection(
        remoteConnectionInfo,
        audioStream,
        videoStream
      );

      // Store the downstream connection.
      this.downstreamConnections[connection.getId()] = connection;

      connection.addOnStateChange((conn) => {
        fm.liveswitch.Log.debug(
          `Downstream connection is ${new fm.liveswitch.ConnectionStateWrapper(
            conn.getState()
          ).toString()}.`
        );

        // Remove the remote media from the layout and destroy it if the remote is closed.
        if (conn.getRemoteClosed()) {
          delete this.downstreamConnections[connection.getId()];
          this.layoutManager.removeRemoteMedia(remoteMedia);
          remoteMedia.destroy();
          
          if(remoteConnectionInfo.getMediaId() === 'screen') {
            const container = $('#pace-screen-layout-manager');
            const parent = $('#pace-parent-manager-container');

            parent.removeClass('screen-sharing');
            container.addClass('d-none');

            this.layoutManager.setMode(fm.liveswitch.LayoutMode.FloatLocal);
            this.screenLayoutManager.removeRemoteMedia(remoteMedia);
          }

          this.resetLayoutScale();
        }
      });

      this.remoteMedia.push(remoteMedia);
      this.resetLayoutScale();

      connection.open();
      return connection;
    };

    MediaStreamingLogic.prototype.openCmdSfuDownstreamConnection = function (remoteConnectionInfo) {
    };

    
    MediaStreamingLogic.downstreamConnections = {};
    MediaStreamingLogic.prototype.resetLayoutScale = function () {
      if(
        this.remoteMedia.filter(x => x.mediaId !== 'screen').length > 0 &&
        (this.localScreenMedia || this.remoteMedia.filter(x => x.mediaId === 'screen').length > 0)
      ) {
        this.remoteMedia.forEach(x => {
          if(x.mediaId !== 'screen') {
            x.getViewSink().setViewScale(fm.liveswitch.LayoutScale.Contain);
          }
        });
        this.localMedia.getViewSink().setViewScale(fm.liveswitch.LayoutScale.Contain);
      }  else {
        this.remoteMedia.forEach(x => {
          x.getViewSink().setViewScale(fm.liveswitch.LayoutScale.Contain);
        });
      }
      
    };

    return MediaStreamingLogic;
  })();
  Liveswitch.MediaStreamingLogic = MediaStreamingLogic;
})(Liveswitch, jQuery);


