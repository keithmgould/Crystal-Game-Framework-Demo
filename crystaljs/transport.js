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
      var socket, x;
      for(x in io.sockets.sockets){
        socket = io.sockets.sockets[x];
        console.log('trying to send broadcast to socket: ' + socket.id);
        socket.emit(data.type, data.message);
      }
    });

    // Listen for Api sending message to single client
    CrystaljsApi.Subscribe('socketEmitMessage', function (data) {
      var socket, x;
      // could not get _.find() to work!?
      //socket = _.find(io.sockets.sockets, function (s) {s.id === data.socketId});
      for(x in io.sockets.sockets){
        socket = io.sockets.sockets[x];
        if(socket.id === data.socketId){break;}
      }
      socket.emit(data.type, data.message);
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
      delayedSocketOn(socket, 'message', function(data) {
        data.socketId = socket.id;
        CrystaljsApi.Publish('message', data);
      });
    });
  }

  return {
    initialize: function(io) {
      initSubscriptions(io);
    }
  };

});
