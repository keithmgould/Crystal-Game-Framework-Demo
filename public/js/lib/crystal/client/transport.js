define(['underscore', 'crystal/common/api'], function (_, CrystalApi) {

  var socket = io.connect("collabfighter.local:3000"),
      socketOnLatency   = 250, // Ms
      socketEmitLatency = 250, // Ms
      lastSentAt = -1,
      lastLag = -1;

  // For testing: Add artificial latency when receiving server messages
  var delayedSocketOn = function (message, fn) {
    socket.on(message, function (data) {
      _.delay(fn, socketOnLatency, data);
    });
  }

  // For testing: Add artificial latency when sending server messages
  var delayedSocketEmit = function (message, data) {
    _.delay(function () {
        socket.emit(message, data);
    }, socketEmitLatency);
  }

  var initialize = function () {
    
    // Listen for client sending message to server
    CrystalApi.Subscribe('messageToServer', function (data) {
       lastSentAt = Date.now();
       data.sentAt = lastSentAt;
      delayedSocketEmit('message', data);
    });

    // Listen for server sending message to client
    delayedSocketOn('message', function (data) {
      var publishTo = "messageFromServer";
      if(data.target){
        publishTo += ":" + data.target;
      }
      if(lastSentAt && data.receivedAt && lastSentAt === data.receivedAt && lastLag === -1){
        lastLag = Date.now - lastSentAt;
        data.lag = lastLag;
      }else{
        data.lag = -1;
      }
      data.lag = lastLag;
      CrystalApi.Publish(publishTo, data);
    });
  }

  return {
    initialize: function () {
      initialize();

      // added these to accomodate dat.gui widget
      // http://code.google.com/p/dat-gui/
      this.__defineGetter__("fromServer", function () {
        return socketOnLatency;
      });
      this.__defineSetter__("fromServer", function (val) {
        socketOnLatency = val;
      });
      this.__defineGetter__("toServer", function () {
        return socketEmitLatency;
      });
      this.__defineSetter__("toServer", function (val) {
        socketEmitLatency = val;
      });
    }
  };
});
