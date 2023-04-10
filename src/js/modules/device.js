window.Liveswitch = window.Liveswitch || {};

((Liveswitch, $) => {
  const DeviceFactory = (() => {
    function DeviceFactory(localMedia) {
      this.hidden = true;
      this.localMedia = localMedia;
      this.defaultMicrophoneDevice = localMedia.getAudioSourceInput().getName();
      this.defaultVideoDevice = localMedia.getVideoSourceInput().getName();
      this.microphoneDevices = [];
      this.videoDevices = [];
      localMedia.getAudioSourceInputs().then((microphoneDevices) => {
        microphoneDevices.map((device) => {
          this.microphoneDevices.push({ id: device.getId(), name: device.getName() });
        });
        this.renderMicrophoneSelect();
      });
      localMedia.getVideoSourceInputs().then((videoDevices) => {
        videoDevices.map((device) => {
          this.videoDevices.push({ id: device.getId(), name: device.getName() });
        });
        this.renderVideoSelect();
      });

      const container = $('#pace-device-container');
      // add close button with font awesome
      container.append(`
      <a class="pace-device__close">
        <i class="fa fa-times"></i>
      </a>
      `).on('click', '.pace-device__close', () => {
        this.toggle();
      });

    }
    DeviceFactory.getInstance = function (localMedia) {
      if (DeviceFactory.instance == null) {
        DeviceFactory.instance = new DeviceFactory(localMedia);
      }
      return DeviceFactory.instance;
    };
    DeviceFactory.prototype.toggle = function () {
      const lsChatContainer = $('#pace-device-container');
      if (this.hidden) {
        lsChatContainer.addClass('pace-device-container--open')
        this.hidden = false;
      } else {
        lsChatContainer.removeClass('pace-device-container--open')
        this.hidden = true;
      }
    };

    DeviceFactory.prototype.onMicrophoneDeviceChange = function (id) {
      const deviceId = id;
      const deviceName = this.microphoneDevices.find((device) => device.id === deviceId).name;
      this.localMedia.changeAudioSourceInput(
        new fm.liveswitch.SourceInput(deviceId, deviceName)
      );
    };

    DeviceFactory.prototype.onVideoDeviceChange = function (id) {
      const deviceId = id;
      const deviceName = this.videoDevices.find((device) => device.id === deviceId).name;
      this.localMedia.changeVideoSourceInput(
        new fm.liveswitch.SourceInput(deviceId, deviceName)
      );
    };

    DeviceFactory.prototype.renderMicrophoneSelect = function () {
      const container = $('#pace-device-container');
      container.append(`
      <div class="pace-device__item">
        <h1>Microphone</h1>
        <div class="relative">
          <input type="checkbox" name="microphone-devices" id="microphone-devices">
        </div>
      </div>
      `);
      $('#microphone-devices').kendoDropDownList({
        dataTextField: 'name',
        dataValueField: 'id',
        valueTemplate: `<i class="fa fa-microphone mr-2"></i><span id="selected-video-device">#:data.name#</span>`,
        dataSource: this.microphoneDevices,
        height: 400,
        select: (e) => {
          this.onMicrophoneDeviceChange(e.dataItem.id);
        }
      });

    };

    DeviceFactory.prototype.renderVideoSelect = function () {
      const container = $('#pace-device-container');
      container.append(`
      <div class="pace-device__item">
        <h1>Video</h1>
        <div class="relative">
          <input type="checkbox" name="video-devices" id="video-devices">
        </div>
      </div>
      `)
      $('#video-devices').kendoDropDownList({
        dataTextField: 'name',
        dataValueField: 'id',
        valueTemplate: `<i class="fa fa-video mr-2"></i><span id="selected-video-device">#:data.name#</span>`,
        dataSource: this.videoDevices,
        height: 400,
        select: (e) => {
          this.onVideoDeviceChange(e.dataItem.id);
        }
      });
    };

    

    return DeviceFactory;
  })();
  Liveswitch.DeviceFactory = DeviceFactory;
})(Liveswitch, $);