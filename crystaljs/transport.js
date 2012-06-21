define(['crystaljs/api', 'underscore'], function (CrystaljsApi, _) {

  var extraLatency = 0; // used to simulate latency when receiving a message.  In MS.

  // Add artificial latency when receiving server messages
  var delayedSocketOn = function (socket, message, fn) {
    socket.on(message, function (data) {
      _.delay(fn, extraLatency, data);
    });
  }

  var initSubscriptions = function (io) {

    // Listen for Api Broadcast Request
    CrystaljsApi.Subscribe('broadcast', function (data) {
      var socketId,
          socket,
          message = data.message;

      for(socketId in io.sockets.sockets){
        socket = io.sockets.sockets[socketId];
        socket.emit(data.type, data.message);
      }
    });

    io.sockets.on('connection', function (socket) {
      // Tell API we have a new connection
      CrystaljsApi.Publish('socketConnected', { socketId: socket.id });

      // Listen for client disconnection.
      delayedSocketOn(socket, 'disconnect', function () {
        CrystaljsApi.Publish('socketDisconnected', {socketId: socket.id});
      });

      // Listen for client ping (used to determine lag)
      delayedSocketOn(socket, 'ping', function (data) {
        socket.emit('pong', {timestamp: data.timestamp});
      });

      // Listen for client messages
      delayedSocketOn(socket, 'message', function(message) {
        CrystaljsApi.Publish('message', message);
      });
    });
  }

  return {
    initialize: function(io) {
      initSubscriptions(io);
    }
  };

});
