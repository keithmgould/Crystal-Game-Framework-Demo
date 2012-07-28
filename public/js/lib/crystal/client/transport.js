define(['underscore', 'crystal/common/api'], function (_, CrystalApi) {

  var socket = io.connect("collabfighter.local:3000"),
      socketOnLatency   = 250, // Ms
      socketEmitLatency = 250, // Ms
      lastSentAt = -1,
      lastLag = -1,
      current = false;

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
      if(data.type === "pilotControl"){
        console.log("data.type: " + data.type);
       lastSentAt = Date.now();
       data.sentAt = lastSentAt;
       current = false;
      }
      delayedSocketEmit('message', data);
    });

    // Listen for server sending message to client
    delayedSocketOn('message', function (data) {
      var publishTo = "messageFromServer";
      if(data.target){
        publishTo += ":" + data.target;
      }
      data.lag = calculateLastLag(data);
      data.current = current;
      // console.log("data.lag: " + data.lag + ", lastSentAt: " + lastSentAt + ", receivedAt: " + data.receivedAt + ", lastLag: " + lastLag);
      if(data.lag > 0){
        // console.log("lag: " + data.lag);
      }
      CrystalApi.Publish(publishTo, data);
    });
  }

  // if we receive confirmation of a pilot control from the server, store the lag, and keep 
  // it stored until client sends another pilot control.
  var calculateLastLag = function (data) {
    if(lastSentAt && data.receivedAt && lastSentAt === data.receivedAt && current === false){
      // console.log("----------------------------------------------------------------------------");
      // console.log("Date.now: " + Date.now() + ", lastSentAt: " + lastSentAt);
        current = true;
        lastLag = Date.now() - lastSentAt;
    }
    return lastLag;
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
