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
      this.localMedia = null;
      this.layoutManager = null;
      this.onStartCallback = null;
      this.onStopCallback = null;
    }
  
    createLocalMedia() {
      const { audioEnabled, videoEnabled, screenEnabled } = this.mediaConfig;
      return new fm.liveswitch.LocalMedia(audioEnabled, videoEnabled, screenEnabled);
    }
  
    createLocalMedia() {
      const { audioEnabled, videoEnabled, screenEnabled } = this.mediaConfig;
      return new fm.liveswitch.LocalMedia(audioEnabled, videoEnabled, screenEnabled);
    }
  
    startLocalMedia() {
      const promise = new fm.liveswitch.Promise();
    
      if (this.localMedia == null) {
        // Create local media with the configured settings.
        this.localMedia = this.createLocalMedia();
    
        // Set local media in the layout if video or screen sharing is enabled.
        const { videoEnabled, screenEnabled } = this.mediaConfig;
        if (videoEnabled || screenEnabled) {
          this.layoutManager.setLocalMedia(this.localMedia);
        }
      }
    
      // Start capturing local media.
      this.localMedia
        .start()
        .then(() => {
          fm.liveswitch.Log.debug("Media capture started.");
          if (this.onStartCallback) {
            this.onStartCallback();
          }
          promise.resolve(null);
        })
        .fail((ex) => {
          fm.liveswitch.Log.error(ex.message);
          promise.reject(ex);
        });
    
      return promise;
    }
  
    stopLocalMedia() {
      const promise = new fm.liveswitch.Promise();
  
      // Stop capturing local media.
      this.localMedia
        .stop()
        .then(() => {
          fm.liveswitch.Log.debug("Media capture stopped.");
          if (this.onStopCallback) {
            this.onStopCallback();
          }
          promise.resolve(null);
        })
        .fail((ex) => {
          fm.liveswitch.Log.error(ex.message);
          promise.reject(ex);
        });
  
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

    toggleMute() {
      this.isMuted = !this.isMuted;
      this.localMedia[`set${this.type}Muted`](this.isMuted);

      if (this.isMuted && this.onMute) {
        this.onMute();
      } else if (!this.isMuted && this.onUnmute) {
        this.onUnmute();
      }

      return this.isMuted;
    }
  }

  class MediaMuterFactory {
    createInstance(media, type, onMute, onUnmute) {
      return new MediaMuter(media, type, onMute, onUnmute);
    }
  }

  $(document).ready(() => {
    const client = 1;
    const chat = ChatSingleton.getInstance(client);

    // Toggle chat visibility
    $('#toggleChatButton').on('click', function() {
      chat.toggle();
    });
  
    const device = DeviceSingleton.getInstance();
  
    // Toggle device visibility
    $('#toggleDeviceButton').on('click', function() {
      device.toggle();
    });

    const layoutManager = new fm.liveswitch.DomLayoutManager($('.pace__layout-manager').get(0));

    const audio = MediaFactory.createMedia(true, null);
    const video = MediaFactory.createMedia(false, layoutManager);

    video.startLocalMedia();
    audio.startLocalMedia();

    const mediaMuterFactory = new MediaMuterFactory();

    const onAudioMute = () => console.log("Audio muted");
    const onAudioUnmute = () => console.log("Audio unmuted");
    const audioMuter = mediaMuterFactory.createInstance(audio, 'Audio', onAudioMute, onAudioUnmute);
    

    const onVideoMute = () => console.log("Video muted");
    const onVideoUnmute = () => console.log("Video unmuted");
    const videoMuter = mediaMuterFactory.createInstance(video, 'Video', onVideoMute, onVideoUnmute);
    

    $('#pace-audio').on('click', function() {
      audioMuter.toggleMute();
    });

    $('#pace-video').on('click', function() {
      videoMuter.toggleMute();
    });
  });
})(Liveswitch, $);