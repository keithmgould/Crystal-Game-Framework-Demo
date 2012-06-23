define(['underscore', 'crystaljs/api', 'crystaljs/loop'], function (_, CrystaljsApi, CrystaljsLoop) {

  var extraLatency = 20,
      socket = io.connect("collabfighter.local:3000");

  // For testing: Add artificial latency when receiving server messages
  var delayedSocketOn = function (message, fn) {
    socket.on(message, function (data) {
      console.log("about to delay " + extraLatency + " Ms and its now: " + Date.now());
      _.delay(fn, extraLatency, data);
      console.log("but continuing on with by biznass");
    });
  }

  var initialize = function () {
    // Listen for client sending message to server
    CrystaljsApi.Subscribe('messageToServer', function (data) {
      socket.emit('message', data);
    });

    // Listen for server sending message to client
    delayedSocketOn('message', function (data) {
      console.log("done delaying.  its now: " + Date.now());
      data.latency = CrystaljsLoop.estimateLatency(data);
      CrystaljsApi.Publish('messageFromServer', data);
    });
  }

  return {
    initialize: initialize
  };
});
