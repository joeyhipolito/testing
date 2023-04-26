window.Liveswitch = window.Liveswitch || {};

((Liveswitch, $) => {
  const WhiteBoardFactory = (() => {
    function WhiteBoardFactory() {
      this.channel = null;
      this.stage = null;
      this.layer = null;
      this.tempLayer = null;
      this.isPainting = false;
      this.currentShape = null;
      this.currentTool = 'brush';
      this.currentColor = '#000000';
      this.currentStrokeWidth = 5;
      this.client = null;
      this.hidden = true;
    }

    WhiteBoardFactory.getInstance = function(client) {
      if (WhiteBoardFactory.instance == null) {
        WhiteBoardFactory.instance = new WhiteBoardFactory();
        WhiteBoardFactory.instance.client = client;
      }
      return WhiteBoardFactory.instance;
    };

    WhiteBoardFactory.prototype.setChannel = function(channel) {
      this.channel = channel;
    };

    WhiteBoardFactory.prototype.toggle = function() {
      const lsChatContainer = $('.pace-chat-container');
      lsChatContainer.toggleClass('pace-chat-container--inactive pace-chat-container--active');
      this.hidden = !this.hidden;
      lsChatContainer.toggle();
    };

    WhiteBoardFactory.prototype.sendDrawing = function(channel, message, { client, userId }) {
      if (!userId) {
        channel.sendMessage(message);
      } else {
        channel.sendUserMessage(userId, message);
      }
    };

    WhiteBoardFactory.prototype.receiveDrawing = function () {
      this.channel.addOnMessage((remoteClient, message) => {
        if (remoteClient.getUserId() === this.client.getUserId()) return;
    
        // Parse the message
        const drawingData = JSON.parse(message);
    
        // Draw the received data on the whiteboard
        this.drawReceivedData(drawingData);
      });
    };

    WhiteBoardFactory.prototype.drawReceivedData = function (drawingData) {
      const tool = drawingData.tool;
    
      if (!tools.hasOwnProperty(tool)) {
        console.error("Invalid tool received:", tool);
        return;
      }
    
      // Call the received method for the specific tool
      tools[tool].received(this, drawingData);
    };

    // Tools
    const tools = {
      brush: {
        start: function (whiteBoard, e) {
          whiteBoard.currentShape = new Konva.Line({
            points: [e.evt.clientX - whiteBoard.stage.x(), e.evt.clientY - whiteBoard.stage.y()],
            stroke: whiteBoard.currentColor,
            strokeWidth: whiteBoard.currentStrokeWidth,
            lineJoin: 'round',
            lineCap: 'round',
            tension: 0.5,
          });
          whiteBoard.tempLayer.add(whiteBoard.currentShape);
        },
      
        draw: function (whiteBoard, e) {
          const newPoints = whiteBoard.currentShape.points().concat([e.evt.clientX - whiteBoard.stage.x(), e.evt.clientY - whiteBoard.stage.y()]);
          whiteBoard.currentShape.points(newPoints);
          whiteBoard.tempLayer.draw();
        },
      
        end: function (whiteBoard, e) {
          whiteBoard.tempLayer.removeChildren();
          whiteBoard.tempLayer.draw();
      
          if (whiteBoard.currentShape) {
            whiteBoard.layer.add(whiteBoard.currentShape);
            whiteBoard.layer.draw();
          }
      
          const message = JSON.stringify({
            tool: 'brush',
            points: whiteBoard.currentShape.points(),
            color: whiteBoard.currentColor,
            strokeWidth: whiteBoard.currentStrokeWidth,
          });
      
          whiteBoard.sendDrawing(whiteBoard.channel, message, { client: whiteBoard.client, userId: null });
      
          whiteBoard.currentShape = null;
        },
      
        received: function (whiteBoard, drawingData) {
          debugger;
          const line = new Konva.Line({
            points: drawingData.points,
            stroke: drawingData.color,
            strokeWidth: drawingData.strokeWidth,
            lineJoin: 'round',
            lineCap: 'round',
            tension: 0.5,
          });
    
          whiteBoard.layer.add(line);
          whiteBoard.layer.draw();
        },
      },
      eraser: {
        start: function(instance, e) {
          const pos = instance.stage.getPointerPosition();
          instance.currentShape = new Konva.Line({
            points: [pos.x, pos.y],
            stroke: '#ffffff',
            strokeWidth: instance.currentStrokeWidth * 2,
            tension: 0.5,
            lineJoin: 'round',
            lineCap: 'round',
          });
          instance.layer.add(instance.currentShape);
        },
        draw: function(instance, e) {
          tools.brush.draw(instance, e);
        },
        end: function(instance, e) {
          tools.brush.end(instance, e);
        },

      },
      rectangle: {
        start: function(instance, e) {
          const pos = instance.stage.getPointerPosition();
          instance.currentShape = new Konva.Rect({
            x: pos.x,
            y: pos.y,
            width: 0,
            height: 0,
            stroke: instance.currentColor,
            strokeWidth: instance.currentStrokeWidth,
          });
          instance.tempLayer.add(instance.currentShape);
        },
        draw: function(instance, e) {
          const pos = instance.stage.getPointerPosition();
          const startPos = {
            x: instance.currentShape.attrs.x,
            y: instance.currentShape.attrs.y,
          };

          instance.currentShape.width(pos.x - startPos.x);
          instance.currentShape.height(pos.y - startPos.y);
          instance.tempLayer.batchDraw();
        },
        end: function(instance, e) {
          instance.tempLayer.removeChildren();
          instance.layer.add(instance.currentShape);
          instance.layer.batchDraw();

          const message = {
            tool: 'rectangle',
            x: instance.currentShape.attrs.x,
            y: instance.currentShape.attrs.y,
            width: instance.currentShape.width(),
            height: instance.currentShape.height(),
            color: instance.currentShape.stroke(),
            strokeWidth: instance.currentShape.strokeWidth(),
          };

          instance.sendDrawing(instance.channel, JSON.stringify(message), null);
        },
      },
      circle: {
        start: function(instance, e) {
          const pos = instance.stage.getPointerPosition();
          instance.currentShape = new Konva.Circle({
            x: pos.x,
            y: pos.y,
            radius: 0,
            stroke: instance.currentColor,
            strokeWidth: instance.currentStrokeWidth,
          });
          instance.tempLayer.add(instance.currentShape);
        },
        draw: function(instance, e) {
          const pos = instance.stage.getPointerPosition();
          const startPos = {
            x: instance.currentShape.attrs.x,
            y: instance.currentShape.attrs.y,
          };

          const radius = Math.sqrt(Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2));
          instance.currentShape.radius(radius);
          instance.tempLayer.batchDraw();
        },
        end: function(instance, e) {
          instance.tempLayer.removeChildren();
          instance.layer.add(instance.currentShape);
          instance.layer.batchDraw();

          const message = {
            tool: 'circle',
            x: instance.currentShape.attrs.x,
            y: instance.currentShape.attrs.y,
            radius: instance.currentShape.radius(),
            color: instance.currentShape.stroke(),
            strokeWidth: instance.currentShape.strokeWidth(),
          };

          instance.sendDrawing(instance.channel, JSON.stringify(message), null);
        },
      },
    };

    // ShapeFactory
    function ShapeFactory(data) {
      this.data = data;
    }

    ShapeFactory.prototype.createShape = function() {
      let shape;

      switch (this.data.tool) {
        case 'brush':
          shape = new Konva.Line({
            points: this.data.points,
            stroke: this.data.color,
            strokeWidth: this.data.strokeWidth,
            tension: 0.5,
            lineJoin: 'round',
            lineCap: 'round',
          });
          break;
        case 'rectangle':
          shape = new Konva.Rect({
            x: this.data.x,
            y: this.data.y,
            width: this.data.width,
            height: this.data.height,
            stroke: this.data.color,
            strokeWidth: this.data.strokeWidth,
          });
          break;
        case 'circle':
          shape = new Konva.Circle({
            x: this.data.x,
            y: this.data.y,
            radius: this.data.radius,
            stroke: this.data.color,
            strokeWidth: this.data.strokeWidth,
          });
          break;
        default:
          return null;
      }
      return shape;
    };

    WhiteBoardFactory.prototype.init = function(containerId) {
      this.stage = new Konva.Stage({
        container: containerId,
        width: window.innerWidth,
        height: window.innerHeight,
      });

      this.toggle();

      this.layer = new Konva.Layer();
      this.tempLayer = new Konva.Layer();
      this.stage.add(this.layer);
      this.stage.add(this.tempLayer);

      

      // Mouse events
      this.stage.on('mousedown', (e) => {
        if (!this.hidden) {
          tools[this.currentTool].start(this, e);
          this.isDrawing = true;
        }
      });

      this.stage.on('mousemove', (e) => {
        if (!this.hidden && this.isDrawing) {
          tools[this.currentTool].draw(this, e);
        }
      });

      this.stage.on('mouseup', (e) => {
        if (!this.hidden && this.isDrawing) {
          tools[this.currentTool].end(this, e);
          this.isDrawing = false;
        }
      });

      // Touch events
      this.stage.on('touchstart', (e) => {
        if (!this.hidden) {
          e.evt.preventDefault();
          const touch = e.evt.changedTouches[0];
          e.evt.clientX = touch.clientX;
          e.evt.clientY = touch.clientY;
          tools[this.currentTool].start(this, e);
          this.isDrawing = true;
        }
      });

      this.stage.on('touchmove', (e) => {
        if (!this.hidden && this.isDrawing) {
          e.evt.preventDefault();
          const touch = e.evt.changedTouches[0];
          e.evt.clientX = touch.clientX;
          e.evt.clientY = touch.clientY;
          tools[this.currentTool].draw(this, e);
        }
      });

      this.stage.on('touchend', (e) => {
        if (!this.hidden && this.isDrawing) {
          e.evt.preventDefault();
          const touch = e.evt.changedTouches[0];
          e.evt.clientX = touch.clientX;
          e.evt.clientY = touch.clientY;
          tools[this.currentTool].end(this, e);
          this.isDrawing = false;
        }
      });

    };

    WhiteBoardFactory.prototype.setTool = function(tool) {
      if (tools.hasOwnProperty(tool)) {
        this.currentTool = tool;
      }
    };

    WhiteBoardFactory.prototype.setColor = function(color) {
      this.currentColor = color;
    };

    WhiteBoardFactory.prototype.setStrokeWidth = function(width) {
      this.currentStrokeWidth = width;
    };

    return WhiteBoardFactory;
  })();
  Liveswitch.WhiteBoardFactory = WhiteBoardFactory;
})(Liveswitch, $);