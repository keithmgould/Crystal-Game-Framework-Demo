define(['app/constants', 'core/space'], function (Constants, Space) {

  var socket = io.connect(Constants.server);

  var initLocalSubscriptions = function () {
    Space.mediator.Subscribe("pilotControl", function (data) {
      socket.emit("pilotControl", {d:data.keystroke});
    });

    Space.mediator.Subscribe("requestSelfShip", function () {
      socket.emit("requestSelfShip");
    });
  }

  var initServerSubscriptions = function () {
    
    // we have a ship!
    socket.on('deliverSelfShip', function (data) {
      Space.generateSelfShip(data.x, data.y, data.angle, data.id);
      Space.mediator.Publish('receivedSelfShip', {foo: 'bar'});
    });

    // snapshot update
    socket.on('snapshot', function (data) {
      Space.applySnapshot(data);
    })
  }

  return {
    initialize : function () {
      initLocalSubscriptions();
      initServerSubscriptions();
    }
  };
});
