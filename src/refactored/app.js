window.Liveswitch = window.Liveswitch || {};

((Liveswitch, $) => {
  class ToggleableElement {
    constructor(domHandler) {
      this.domHandler = domHandler;
      this.hidden = true;
      this.domHandler.initializeCloseButton(this.toggle.bind(this));
    }

    toggle() {
      this.hidden = this.domHandler.toggleContainer(this.hidden);
    }
  }
  class ToggleableElementDomHandler {
    constructor(elementClass, closeButtonClass) {
      this.body = $('body').find('.pace__container');
      this.elementClass = elementClass;
      this.closeButtonClass = closeButtonClass;
      this.createDomElements();
    }

    createDomElements() {
      const container = $('<div>', { class: `${this.elementClass} ${this.elementClass}--inactive` });
      const content = $('<div>', { class: 'content' });
      container.append(content);

      this.body.append(container);
      this.container = container;
    }

    initializeCloseButton(callback) {
      this.container.append(`
        <a href="#" class="${this.closeButtonClass}">
          <i class="fa fa-times"></i>
        </a>
      `);
      this.body.on('click', `.${this.closeButtonClass}`, (e) => {
        e.preventDefault();
        callback();
      });
    }

    toggleContainer(hidden) {
      this.container
        .removeClass(hidden ? `${this.elementClass}--inactive` : `${this.elementClass}--active`)
        .addClass(hidden ? `${this.elementClass}--active` : `${this.elementClass}--inactive`);
      return !hidden;
    }
  }
  class Chat {
    constructor(client) {
      this.client = client;
      this.messages = [];
      this.toggleable = new ToggleableElement(new ChatDomHandler());
    }

    setChannel(channel) {
      this.channel = channel;
    }

    toggle() {
      this.toggleable.toggle();
    }

    sendMessage(channel, message) {
      this.messages.push(message);
      this.domHandler.createMessage(message, true);
      channel.sendMessage(message);
    }

    receiveMessage(message) {
      this.messages.push(message);
      this.domHandler.createMessage(message, false);
    }

    watchMessages(client, channel) {
      channel.addOnMessage((remoteClient, message) => {
        if (remoteClient.getUserId() === client.getUserId()) return;
        const name = remoteClient.getUserAlias() != null ? remoteClient.getUserAlias() : remoteClient.getUserId();
        if (this.hidden) {
          this.domHandler.showNotification(`${name}: ${message}`);
        }
        this.receiveMessage(`${name}: ${message}`);
      });
    }
  }
  class ChatDomHandler {
    constructor() {
      this.toggleableElementDomHandler = new ToggleableElementDomHandler('pace-chat', 'pace-chat__close');
      this.messagesContainer = $('.messages').first();
      this.notification = this.createNotification();
    }
  
    initializeCloseButton(callback) {
      this.toggleableElementDomHandler.initializeCloseButton(callback);
    }
  
    toggleContainer(hidden) {
      return this.toggleableElementDomHandler.toggleContainer(hidden);
    }

    createNotification() {
      return $("#notification").kendoNotification({
        position: {
          pinned: true,
          top: 30,
          right: 30
        },
        autoHideAfter: 0,
        stacking: "down",
        templates: [{
          type: "message",
          template: $("#messageTemplate").html()
        }]
      }).data("kendoNotification");
    }

    createMessage(message, own) {
      this.messagesContainer.append(`
        <div class="chat-message">
            <div class="chat-message__wrapper ${own ? 'own' : 'other'}">
              <div class="chat-message__bubble ${own ? 'own' : 'other'}">
                  <span class="chat-message__content">${message}</span>
              </div>
            </div>
        </div>
      `);
    }

    showNotification(message) {
      this.notification.show({ message }, "message");
    }
  }

  class Device {
    constructor() {
      this.toggleable = new ToggleableElement(new DeviceDomHandler());
    }
  
    toggle() {
      this.toggleable.toggle();
    }
  }
  
  class DeviceDomHandler {
    constructor() {
      this.toggleableElementDomHandler = new ToggleableElementDomHandler('pace-device', 'pace-device__close');
    }
  
    initializeCloseButton(callback) {
      this.toggleableElementDomHandler.initializeCloseButton(callback);
    }
  
    toggleContainer(hidden) {
      return this.toggleableElementDomHandler.toggleContainer(hidden);
    }
  }

  class ChatSingleton {
    static getInstance(client) {
      if (!ChatSingleton.instance) {
        ChatSingleton.instance = new Chat(client);
      }
      return ChatSingleton.instance;
    }
  }

  class DeviceSingleton {
    static getInstance() {
      if (!DeviceSingleton.instance) {
        DeviceSingleton.instance = new Device();
      }
      return DeviceSingleton.instance;
    }
  }

  class ScreenMediaFactory {
    static createMedia(hasAudio, layoutManager, onStart, onStop) {
      const mediaConfig = hasAudio
        ? { audioEnabled: true, videoEnabled: true, screenEnabled: true }
        : { audioEnabled: false, videoEnabled: true, screenEnabled: true };
      const media = new Media(mediaConfig);
      media.layoutManager = layoutManager;
      media.onStartCallback = onStart;
      media.onStopCallback = onStop;
      return media;
    }
  }
  class MediaFactory {
    static createMedia(isAudioOnly, layoutManager, onStart, onStop) {
      const mediaConfig = isAudioOnly
        ? { audioEnabled: true, videoEnabled: false, screenEnabled: false }
        : { audioEnabled: false, videoEnabled: true, screenEnabled: false };
      const media = new Media(mediaConfig);
      media.layoutManager = layoutManager;
      media.onStartCallback = onStart;
      media.onStopCallback = onStop;
      return media;
    }
  }
  
  class Media {
    constructor(mediaConfig) {
      this.mediaConfig = mediaConfig;
      this.layoutManager = null;
      this.onStartCallback = null;
      this.onStopCallback = null;

      this.localMedia = this.createLocalMedia();
    }
  
    createLocalMedia() {
      const { audioEnabled, videoEnabled, screenEnabled } = this.mediaConfig;
      return new fm.liveswitch.LocalMedia(audioEnabled, videoEnabled, screenEnabled);
    }

    async startLocalMedia() {
      const promise = new fm.liveswitch.Promise();
    
      if (this.localMedia == null) {
        // Create local media with the configured settings.
        this.localMedia = await this.createLocalMedia();
      }

      // Set local media in the layout if video or screen sharing is enabled.
      const { videoEnabled, screenEnabled } = this.mediaConfig;
      if (videoEnabled || screenEnabled) {
        this.layoutManager.addRemoteMedia(this.localMedia);
      }
    
      // Start capturing local media.
      this.localMedia
        .start()
        .then(() => {
          const { screenEnabled } = this.mediaConfig;
          fm.liveswitch.Log.debug("Media capture started.");
          if (this.onStartCallback) {
            this.onStartCallback();
          }
          if (screenEnabled) {
            this.localMedia.getVideoTracks().forEach(track => {
              track.addOnStopped(() => {
                this.stopLocalMedia();
              });
            })
          }
          promise.resolve(null);
        })
        .fail((ex) => {
          fm.liveswitch.Log.error(ex.message);
          promise.reject(ex);
        });
    
      return promise;
    }
  
    async stopLocalMedia() {
      const promise = new fm.liveswitch.Promise();
      const { videoEnabled, screenEnabled } = this.mediaConfig;
      if (videoEnabled || screenEnabled) {
        this.layoutManager.removeRemoteMedia(this.localMedia);
      }

      // Stop capturing local media.
      const result = await this.localMedia.stop();
      promise.resolve(null);
      if(this.onStopCallback) {
        this.onStopCallback();
      }
      this.localMedia = null;
  
      return promise;
    }
  }

  class MediaMuter {
    constructor(media, type, onMute, onUnmute) {
      this.isMuted = false;
      this.localMedia = media.localMedia;
      this.type = type;
      this.onMute = onMute;
      this.onUnmute = onUnmute;
    }
  
    toggle() {
      this.isMuted = !this.isMuted;
      this.localMedia[`set${this.type}Muted`](this.isMuted);
  
      let success = false;
      if (this.isMuted && this.onMute) {
        this.onMute(this.isMuted);
        success = true;
      } else if (!this.isMuted && this.onUnmute) {
        this.onUnmute(this.isMuted);
        success = true;
      }
  
      return success;
    }
  }
  

  class ScreenMediaMuter {
    constructor(media, type, onStopSharing, onStartSharing) {
      this.isSharing = false;
      this.media = media;
      this.type = type;
      this.onStartSharing = onStartSharing;
      this.onStopSharing = onStopSharing;
    }
  
    async toggle() {
      if (this.media.localMedia.getState() === fm.liveswitch.LocalMediaState.New
        || this.media.localMedia.getState() === fm.liveswitch.LocalMediaState.Stopped) {
        const sharingStarted = await this.startSharing(this.onStartSharing);
        this.isSharing = sharingStarted;
        return sharingStarted;
      } else {
        this.stopSharing(this.onStopSharing);
        this.isSharing = false;
        return true;
      }
    }

    async startSharing(onStartSharing) {
      try {
        await this.media.startLocalMedia();
        onStartSharing && onStartSharing();
        return true;
      } catch (error) {
        console.error("Error starting screen sharing:", error);
        return false;
      }
    }
  
    async stopSharing(onStopSharing) {
      try {
        await this.media.stopLocalMedia();
        onStopSharing && onStopSharing();
        return true;
      } catch (error) {
        console.error("Error stopping screen sharing:", error);
        return false;
      }
    }
  }
  
  class MediaMuterFactory {
    createInstance(media, type, onMute, onUnmute, className = 'MediaMuter') {
      const classesMap = {
        MediaMuter: MediaMuter,
        ScreenMediaMuter: ScreenMediaMuter,
      };

      const InstanceClass = classesMap[className];
      return new InstanceClass(media, type, onMute, onUnmute);
    }
  }

  class ButtonHandler {
    constructor(buttonId, muter, mutedIconClass, unmutedIconClass, shouldChangeUi = true) {
      this.buttonId = buttonId;
      this.muter = muter;
      this.mutedIconClass = mutedIconClass;
      this.unmutedIconClass = unmutedIconClass;
      this.shouldChangeUi = shouldChangeUi;
    }
  
    toggleButtonState() {
      const button = $(`#${this.buttonId}`);
      button.toggleClass('pace-control--muted pace-control--unmuted')
        .find('i')
        .toggleClass(this.mutedIconClass + ' ' + this.unmutedIconClass);
    }
  
    async initialize() {
      $(`#${this.buttonId}`).on('click', async () => {
        const result = await this.muter.toggle();
        if (this.shouldChangeUi && result) {
          this.toggleButtonState();
        }
      });
    }
  }

  window.Liveswitch = window.Liveswitch || {};

((Liveswitch, $) => {
  class WhiteBoardFactory {
    constructor(client) {
      this.channel = null;
      this.stage = null;
      this.layer = null;
      this.tempLayer = null;
      this.isPainting = false;
      this.currentShape = null;
      this.currentTool = 'brush';
      this.currentColor = '#000000';
      this.currentStrokeWidth = 5;
      this.client = client;
      this.hidden = true;
      this.tools = new WhiteBoardTools();
    }

    static getInstance(client) {
      if (!WhiteBoardFactory.instance) {
        WhiteBoardFactory.instance = new WhiteBoardFactory(client);
      }
      return WhiteBoardFactory.instance;
    }

    setChannel(channel) {
      this.channel = channel;
    }

    toggle() {
      const lsChatContainer = $('.pace-chat-container');
      lsChatContainer.toggleClass('pace-chat-container--inactive pace-chat-container--active');
      this.hidden = !this.hidden;
      lsChatContainer.toggle();
    }

    sendDrawing(channel, message, { client, userId }) {
      if (!userId) {
        channel.sendMessage(message);
      } else {
        channel.sendUserMessage(userId, message);
      }
    }

    receiveDrawing() {
      this.channel.addOnMessage((remoteClient, message) => {
        if (remoteClient.getUserId() === this.client.getUserId()) return;
        const drawingData = JSON.parse(message);
        this.drawReceivedData(drawingData);
      });
    }

    drawReceivedData(drawingData) {
      const tool = drawingData.tool;
      if (!this.tools.hasOwnProperty(tool)) {
        console.error("Invalid tool received:", tool);
        return;
      }
      this.tools[tool].received(this, drawingData);
    }

    init(containerId) {
      this.initializeStage(containerId);
      this.toggle();
      this.initializeLayers();
      this.initializeEventHandlers();
    }

    initializeStage(containerId) {
      this.stage = new Konva.Stage({
        container: containerId,
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    initializeLayers() {
      this.layer = new Konva.Layer();
      this.tempLayer = new Konva.Layer();
      this.stage.add(this.layer);
      this.stage.add(this.tempLayer);
    }

    initializeEventHandlers() {
      this.initMouseEvents();
      this.initTouchEvents();
    }

    initMouseEvents() {
      this.stage.on('mousedown', (e) => this.handleStartEvent(e));
      this.stage.on('mousemove', (e) => this.handleDrawEvent(e));
      this.stage.on('mouseup', (e) => this.handleEndEvent(e));
    }

    initTouchEvents() {
      this.stage.on('touchstart', (e) => this.handleStartEvent(e, true));
      this.stage.on('touchmove', (e) => this.handleDrawEvent(e, true));
      this.stage.on('touchend', (e) => this.handleEndEvent(e, true));
    }

    handleStartEvent(e, isTouchEvent = false) {
      if (!this.hidden) {
        if (isTouchEvent) this.prepareTouchEvent(e);
        this.tools[this.currentTool].start(this, e);
        this.isDrawing = true;
      }
    }

    handleDrawEvent(e, isTouchEvent = false) {
      if (!this.hidden && this.isDrawing) {
        if (isTouchEvent) this.prepareTouchEvent(e);
        this.tools[this.currentTool].draw(this, e);
      }
    }

    handleEndEvent(e, isTouchEvent = false) {
if (!this.hidden && this.isDrawing) {
if (isTouchEvent) this.prepareTouchEvent(e);
this.tools[this.currentTool].end(this, e);
this.isDrawing = false;
}
}
) {
if (!this.hidden && this.isDrawing) {
if (isTouchEvent) this.prepareTouchEvent(e);
this.tools[this.currentTool].end(this, e);
this.isDrawing = false;
}
}
  
  $(document).ready(() => {
    const client = 1; // TODO: generate client
  
    const videoLayoutManager = new fm.liveswitch.DomLayoutManager($('.pace__layout-manager').get(0));
    const screenSharingLayoutManager = new fm.liveswitch.DomLayoutManager($('.pace__screen-layout-manager').get(0));
  
    const chat = ChatSingleton.getInstance(client);
    const device = DeviceSingleton.getInstance();
    const audioLocalMedia = MediaFactory.createMedia(true, null);
    const videoLocalMedia = MediaFactory.createMedia(false, videoLayoutManager);
    const screenLocalMedia = ScreenMediaFactory.createMedia(false, screenSharingLayoutManager);
  
    audioLocalMedia.startLocalMedia();
    videoLocalMedia.startLocalMedia();
  
    const mediaMuterFactory = new MediaMuterFactory();
  
    const audioMuter = mediaMuterFactory.createInstance(audioLocalMedia, 'Audio');
    const videoMuter = mediaMuterFactory.createInstance(videoLocalMedia, 'Video', () => {
      videoLocalMedia.stopLocalMedia();
    }, () => {
      videoLocalMedia.startLocalMedia();
    });
    const screenMuter = mediaMuterFactory.createInstance(screenLocalMedia, 'Screen', () => {
      screenLocalMedia.stopLocalMedia();
    }, () => {
      screenLocalMedia.startLocalMedia();
    }, 'ScreenMediaMuter');
  
    const buttonHandlers = [
      new ButtonHandler('pace-audio', audioMuter, 'fa-microphone', 'fa-microphone-slash'),
      new ButtonHandler('pace-video', videoMuter, 'fa-video', 'fa-video-slash'),
      new ButtonHandler('pace-chat', chat, 'fa-comment', 'fa-comment-slash', false),
      new ButtonHandler('pace-device', device, 'fa-cog', 'fa-cog', false),
      new ButtonHandler('pace-screen', screenMuter, 'fa-desktop', 'fa-desktop')
    ];
  
    buttonHandlers.forEach(handler => handler.initialize());
  });
  
  
})(Liveswitch, $);