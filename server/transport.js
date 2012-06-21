define(['common/constants', 'server/space', 'underscore'], function (Constants, Space, _) {

  // Add artificial latency when receiving server messages
  var delayedSocketOn = function (socket, message, fn) {
    socket.on(message, function (data) {
      _.delay(fn, Constants.extraLatency.server, data);
    });
  }

  var initPeriodicSnapshots = function () {
    //setInterval(function () {
      //Space.mediator.Publish('broadcastSnapshot', {from: "PeriodicSnapshot"});
    //}, 1000);
  }

  var initSubscriptions = function (io) {

    // Listen for Snapshot Broadcast Requests (by server)
    Space.mediator.Subscribe('broadcastSnapshot', function (data) {
      console.log("EVENT came from: " + data.from);
      var socketId,
          socket,
          snapshot = Space.generateSnapshot();

      for(socketId in io.sockets.sockets){
        socket = io.sockets.sockets[socketId];
        socket.emit('snapshot', snapshot);
      }
    });

    io.sockets.on('connection', function (socket) {

      // Listen for client ping (used to determine lag)
      delayedSocketOn(socket, 'ping', function (data) {
        socket.emit('pong', {timestamp: data.timestamp});
      });


      // Listen for disconnection.  Destroy ship on disconnect
      socket.on('disconnect', function () {
        socket.get('shipId', function (err, shipId) {
          if(shipId === null){
            console.log("socket with no ship just disconnected...");
          }else{
            console.log('disconnect.  Exploding ship: ' + shipId);
            Space.destroyEntity(shipId);
            Space.mediator.Publish('broadcastSnapshot', {from: "Transport#disconnect"});
          }
        });
      });

      // Listen for clients tapping pilot controls
      socket.on('pilotControl', function (data) {
        socket.get('shipId', function (err, shipId) {
          if(shipId === null){
            console.log("socket with no ship just tried to pilot!?");
          }else{
            data.shipId = shipId;
            Space.mediator.Publish('pilotControl', data);
          }
        });
      });

      // listen for clients requesting a ship
      socket.on('requestSelfShip', function (data) {
        var ship, response;
        console.log("received requestSelfShip");
        socket.get('shipId', function (err, shipId) {
          console.log('shipId: ' + shipId);
          if( shipId === null ){
            console.log("no ship associated with this socket yet...");
            ship = Space.generateShip();
            socket.set('shipId', ship.id, function () {
              console.log("set this socket's shipId to: " + ship.id);
            });
          }else{
           console.log('this socket has a ship with id: ' + shipId);
           ship = Space.findEntityById(shipId);

           // todo: handle if ship not found...
          }
          response = {
            x: ship.get('xPos'),
            y: ship.get('yPos'),
            angle: ship.get('angle'),
            id: ship.id
          };
          socket.emit('deliverSelfShip', response);
          console.log('ABOUT TO BROADCAST SNAPSHOT');
          Space.mediator.Publish('broadcastSnapshot', {from: "Transport#requestSelfShip"});
          console.log('DONE BROADCASTING SNAPSHOT');
        });
      });
    });
  }

  return {
    initialize: function(io) {
      initSubscriptions(io);
      initPeriodicSnapshots();
    }
  };

});
