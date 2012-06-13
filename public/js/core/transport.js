define(['app/constants', 'core/space'], function (Constants, Space) {

  var socket = io.connect(Constants.server);

  var initLocalSubscriptions = function () {
    Space.mediator.Subscribe("pilotControl", function (data) {
      switch(data.keystroke)
      {
        case "left":
          socket.emit("pilotControl", {d:"l"});
          break;
        case "right":
          socket.emit("pilotControl", {d:"r"});
          break;
        case "up":
          socket.emit("pilotControl", {d:"u"});
          break;
      }
    });

    Space.mediator.Subscribe("requestSelfShip", function () {
      socket.emit("requestSelfShip");
    });
  }

  var initServerSubscriptions = function () {
    socket.on('deliverSelfShip', function (data) {
      Space.generateSelfShip(data.x, data.y, data.angle);
      Space.mediator.Publish('receivedSelfShip', {foo: 'bar'});
    });
  }

  return {
    initialize : function () {
      initLocalSubscriptions();
      initServerSubscriptions();
    }
  };
});
