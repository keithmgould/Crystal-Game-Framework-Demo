define(['common/constants', 'space'], function (Constants, Space) {

  var socket = io.connect(Constants.server),
      messages = [];

  var emitAndEnqueue = function (channel, data) {
    data = data || {};
    var timestamp = new Date().getTime();
    data.timestamp = timestamp;
    socket.emit(channel, data);
    messages.push({ timestamp: timestamp, channel: channel, data: data});
    if(messages.length >= 20){
      messages.shift();
    }
  }

  // Once per second, determine the lag
  var initLagEstimate = function () {
    setInterval(function () {
      emitAndEnqueue("ping");
    }, 1000);
  }

  var initLocalSubscriptions = function () {
    Space.mediator.Subscribe("pilotControl", function (data) {
      emitAndEnqueue("pilotControl", {d:data.keystroke});
    });

    Space.mediator.Subscribe("requestSelfShip", function () {
      emitAndEnqueue("requestSelfShip");
    });
  }

  var initServerSubscriptions = function () {
    // we have a ping response
    socket.on('pong', function (data) {
      var timeNow, timeDif;
      timeNow = new Date().getTime();
      timeDif = timeNow - data.timestamp;
      Space.setLag(timeDif);
    });

    // we have a ship
    socket.on('deliverSelfShip', function (data) {
      Space.generateSelfShip(data.x, data.y, data.angle, data.id);
      Space.mediator.Publish('receivedSelfShip', {foo: 'bar'});
    });

    // we have a snapshot
    socket.on('snapshot', function (data) {
      Space.applySnapshot(data);
    })
  }

  return {
    initialize : function () {
      initLagEstimate();
      initLocalSubscriptions();
      initServerSubscriptions();
    }
  };
});
