define(['underscore', 'crystaljs/api', 'crystaljs/loop'], function (_, CrystaljsApi, CrystaljsLoop) {

  var socket = io.connect("collabfighter.local:3000");
  
  // global for easy testing
  socketOnLatency   = 25; // Ms
  socketEmitLatency = 25; // Ms

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
    CrystaljsApi.Subscribe('messageToServer', function (data) {
      delayedSocketEmit('message', data);
    });

    // Listen for server sending message to client
    delayedSocketOn('message', function (data) {
      data.latency = CrystaljsLoop.estimateLatency(data);
      CrystaljsApi.Publish('messageFromServer', data);
    });
  }

  return {
    initialize: initialize
  };
});
