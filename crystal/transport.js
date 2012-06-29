define(['crystal/api', 'crystal/loop', 'underscore'], function (CrystalApi, crystalLoop, _) {

  var initialize = function (io) {
    listenForApi(io);
    listenForClient(io);
    CrystalApi.Publish("start");
  }

  var listenForApi = function (io) {

    // Listen for Api Broadcast Request
    CrystalApi.Subscribe('broadcast', function (data) {
      var socket, x;
      for(x in io.sockets.sockets){
        socket = io.sockets.sockets[x];
        socket.emit('message', data);
      }
    });

    // Listen for Api sending message to single client
    CrystalApi.Subscribe('messageToClient', function (data) {
      var socket, x;
      // could not get _.find() to work!?
      //socket = _.find(io.sockets.sockets, function (s) {s.id === data.socketId});
      for(x in io.sockets.sockets){
        socket = io.sockets.sockets[x];
        if(socket.id === data.socketId){break;}
      }
      delete data.socketId;
      socket.emit('message', data);
    });

  }

  var listenForClient = function (io) {
    io.sockets.on('connection', function (socket) {
      // Tell API we have a new connection
      CrystalApi.Publish('socketConnected', { socketId: socket.id });

      // Listen for client disconnection.
      socket.on('disconnect', function () {
        CrystalApi.Publish('socketDisconnected', {socketId: socket.id});
      });

      // Listen for client messages
      socket.on('message', function(data) {
        var publishTo = "messageFromClient";
        if(data.target){
          publishTo += ":" + data.target;
        }
        data.socketId = socket.id;
        CrystalApi.Publish(publishTo, data);
      });
    });
  }

  return {
    initialize: initialize
  };

});
