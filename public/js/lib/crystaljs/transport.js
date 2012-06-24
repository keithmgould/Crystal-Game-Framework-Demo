define(['underscore', 'crystaljs/api', 'crystaljs/loop'], function (_, CrystaljsApi, CrystaljsLoop) {

  var socket = io.connect("collabfighter.local:3000");

  var initialize = function () {

    // Listen for client sending message to server
    CrystaljsApi.Subscribe('messageToServer', function (data) {
      socket.emit('message', data);
    });

    // Listen for server sending message to client
    socket.on('message', function (data) {
      data.latency = CrystaljsLoop.estimateLatency(data);
      CrystaljsApi.Publish('messageFromServer', data);
    });
  }

  return {
    initialize: initialize
  };
});
