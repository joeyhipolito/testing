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
      <div class="absolute top-2 right-4">
        <button class="text-white text-2xl font-bold" id="pace-device-close">
          <i class="fa fa-times"></i>
        </button>
      </div>
      `).on('click', '#pace-device-close', () => {
        this.toggle();
      }).addClass('pt-8')

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
        lsChatContainer.removeClass('-left-96');
        lsChatContainer.addClass('left-0');
        this.hidden = false;
      } else {
        lsChatContainer.addClass('-left-96');
        lsChatContainer.removeClass('left-0');
        this.hidden = true;
      }
    };

    DeviceFactory.prototype.onMicrophoneDeviceChange = function (id) {
      const deviceId = id;
      const deviceName = this.microphoneDevices.find((device) => device.id === deviceId).name;
      this.localMedia.changeAudioSourceInput(
        new fm.liveswitch.SourceInput(deviceId, deviceName)
      );
      $('#selected-microphone-device').text(deviceName);
      $('#show_more_mic').prop('checked', false);
    };

    DeviceFactory.prototype.onVideoDeviceChange = function (id) {
      const deviceId = id;
      const deviceName = this.videoDevices.find((device) => device.id === deviceId).name;
      this.localMedia.changeVideoSourceInput(
        new fm.liveswitch.SourceInput(deviceId, deviceName)
      );
      $('#selected-video-device').text(deviceName);
      $('#show_more_video').prop('checked', false);
    };

    DeviceFactory.prototype.renderMicrophoneSelect = function () {
      const container = $('#pace-device-container');
      container.append(`
      <div class="w-full mx-auto mb-4">
        <h1 class="text-2xl font-bold text-white">Microphone</h1>
        <div class="relative">
          <div class="h-10 bg-white flex border hover:border-gray-200 border-transparent hover:bg-gray-100 rounded-full items-center w-full">
            <label class="pl-4 appearance-none outline-none text-gray-800 w-full whitespace-nowrap overflow-hidden">
              <i class="fa fa-microphone mr-2"></i><span id="selected-microphone-device">${this.defaultMicrophoneDevice}</span> 
            </label>
            <label for="show_more_mic" class="cursor-pointer outline-none focus:outline-none transition-all text-gray-300 hover:text-gray-600">
              <i class="fa fa-chevron-down mr-4"></i>
            </label>
          </div>
          <input type="checkbox" name="show_more_mic" id="show_more_mic" class="hidden peer">
          <div class="absolute rounded shadow bg-white overflow-hidden hidden peer-checked:flex flex-col w-72 mt-1 border border-gray-200 z-10" id="microphone-device-list"></div>
        </div>
      </div>
      `).find('#microphone-device-list').html(this.microphoneDevices.map((device) => {
        return `
        <div class="cursor-pointer group">
          <a data-device-id="${device.id}" class="text-sm block p-2 border-transparent border-l-4 group-hover:border-blue-600 group-hover:bg-gray-100 device">${device.name}</a>
        </div>
        `;
      }).join(''))
        .on('click', '.device', (e) => {
          const deviceId = $(e.currentTarget).data('device-id');
          this.onMicrophoneDeviceChange(deviceId);
        });

    };

    DeviceFactory.prototype.renderVideoSelect = function () {
      const container = $('#pace-device-container');
      container.append(`
      <div class="w-full mx-auto mb-4">
        <h1 class="text-2xl font-bold text-white">Video</h1>
        <div class="relative">
          <div class="h-10 bg-white flex border hover:border-gray-200 border-transparent hover:bg-gray-100 rounded-full items-center w-full">
            <label class="pl-4 appearance-none outline-none text-gray-800 w-full whitespace-nowrap overflow-hidden">
              <i class="fa fa-video mr-2"></i><span id="selected-video-device">${this.defaultVideoDevice}</span>
            </label>
            <label for="show_more_video" class="cursor-pointer outline-none focus:outline-none transition-all text-gray-300 hover:text-gray-600">
              <i class="fa fa-chevron-down mr-4"></i>
            </label>
          </div>
          <input type="checkbox" name="show_more_video" id="show_more_video" class="hidden peer">
          <div class="absolute rounded shadow bg-white overflow-hidden hidden peer-checked:flex flex-col w-72 mt-1 border border-gray-200 z-10" id="video-device-list"></div>
        </div>
      </div>
      `).find('#video-device-list').html(this.videoDevices.map((device) => {
        return `
        <div class="cursor-pointer group">
          <a data-device-id="${device.id}" class="text-sm block p-2 border-transparent border-l-4 group-hover:border-blue-600 group-hover:bg-gray-100 device">${device.name}</a>
        </div>
        `;
      }).join(''))
        .on('click', '.device', (e) => {
          const deviceId = $(e.currentTarget).data('device-id');
          this.onVideoDeviceChange(deviceId);
        });
    };

    

    return DeviceFactory;
  })();
  Liveswitch.DeviceFactory = DeviceFactory;
})(Liveswitch, $);