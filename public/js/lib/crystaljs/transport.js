define(['underscore', 'crystaljs/api'], function (_, CrystaljsApi) {

  var extraLatency = 0,
      socket = io.connect("collabfighter.local:3000");

  // For testing: Add artificial latency when receiving server messages
  var delayedSocketOn = function (message, fn) {
    socket.on(message, function (data) {
      _.delay(fn, extraLatency, data);
    });
  }

  var initialize = function () {
    // Listen for client sending message to server
    CrystaljsApi.Subscribe('messageToServer', function (data) {
      socket.emit('message', data);
    });

    // Listen for server sending message to client
    delayedSocketOn('message', function (data) {
      CrystaljsApi.Publish('messageFromServer', data);
    });
  }

  return {
    initialize: initialize
  };
});
