define(['crystaljs/api', 'crystaljs/loop', 'underscore'], function (CrystaljsApi, CrystaljsLoop, _) {

  var initialize = function (io) {
    listenForApi(io);
    listenForClient(io);
  }

  var listenForApi = function (io) {

    // Listen for Api Broadcast Request
    CrystaljsApi.Subscribe('broadcast', function (data) {
      data.tickCount = CrystaljsLoop.getTickCount();
      var socket, x;
      for(x in io.sockets.sockets){
        socket = io.sockets.sockets[x];
        socket.emit('message', data);
      }
    });

    // Listen for Api sending message to single client
    CrystaljsApi.Subscribe('messageToClient', function (data) {
      var socket, x;
      // could not get _.find() to work!?
      //socket = _.find(io.sockets.sockets, function (s) {s.id === data.socketId});
      for(x in io.sockets.sockets){
        socket = io.sockets.sockets[x];
        if(socket.id === data.socketId){break;}
      }
      socket.emit('message', {tickCount: CrystaljsLoop.getTickCount(), type: data.type, message: data.message});
    });

  }

  var listenForClient = function (io) {
    io.sockets.on('connection', function (socket) {
      // Tell API we have a new connection
      CrystaljsApi.Publish('socketConnected', { socketId: socket.id });

      // Listen for client disconnection.
      socket.on('disconnect', function () {
        CrystaljsApi.Publish('socketDisconnected', {socketId: socket.id});
      });

      // Listen for client messages
      socket.on('message', function(data) {
        data.socketId = socket.id;
        CrystaljsApi.Publish('messageFromClient', data);
      });
    });
  }

  return {
    initialize: initialize
  };

});
