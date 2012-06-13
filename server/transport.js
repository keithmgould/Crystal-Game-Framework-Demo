define(['server/space'], function (Space) {
  var initSubscriptions = function (io) {
    io.sockets.on('connection', function (socket) {
      
      
      // Listen for Snapshot Broadcast Requests (by server)
      Space.mediator.Subscribe('broadCastSnapshot', function (data) {
        
        var snapshot = Space.generateSnapshot();
      });
      
      // Listen for clients tapping pilot controls
      socket.on('pilotControl', function (data) {
        socket.get('shipId', function (err, shipId) {
          if(shipId === null){
            console.log("socket with no ship just tried to pilot!?");
          }else{
            console.log('ship-' + shipId + " just tapped " + data.d);
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
            socket.set('shipId', ship.cid, function () {
              console.log("set shipId to: " + ship.cid);
            });
          }else{
           console.log('this socket has a ship with id: ' + shipId);
           ship = Space.findShipById(shipId);

           // todo: handle if ship not found...
          }
          response = {
            x: ship.get('xPos'),
            y: ship.get('yPos'),
            angle: ship.get('angle')
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
