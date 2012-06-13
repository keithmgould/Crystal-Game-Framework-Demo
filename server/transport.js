define(['server/space'], function (Space) {
  var initSubscriptions = function (io) {
    io.sockets.on('connection', function (socket) {
      
      
      // Listen for Snapshot Broadcast Requests (by server)
      Space.mediator.Subscribe('broadcastSnapshot', function (data) {
        socket.get('shipId', function (err, shipId) {
          var snapshot;
          if(shipId === null){
            snapshot = Space.generateSnapshot();
          }else{
            snapshot = Space.generateSnapshot(shipId);
          }
          socket.broadcast.emit('snapshot', snapshot);
          socket.emit('snapshot', snapshot);
        });
      });

      // Listen for disconnection.  Destroy ship on disconnect
      socket.on('disconnect', function () {
        socket.get('shipId', function (err, shipId) {
          if(shipId === null){
            console.log("socket with no ship just disconnected...");
          }else{
            console.log('disconnect.  Exploding ship: ' + shipId);
            Space.destroyShip(shipId);
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
              console.log("set shipId to: " + ship.id);
            });
          }else{
           console.log('this socket has a ship with id: ' + shipId);
           ship = Space.findShipById(shipId);

           // todo: handle if ship not found...
          }
          response = {
            x: ship.get('xPos'),
            y: ship.get('yPos'),
            angle: ship.get('angle'),
            id: ship.id
          };
          socket.emit('deliverSelfShip', response);
        });
      });
    });
  }

  return {
    initialize: function(io) {
      initSubscriptions(io);
    }
  };

});
