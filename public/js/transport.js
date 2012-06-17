define(['common/constants', 'space', 'underscore'], function (Constants, Space, _) {

  var socket = io.connect(Constants.server),
      messages = [];

  var emitAndEnqueue = function (channel, data) {
    data = data || {};
    var timestamp = Date.now();
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

  // Listen locally for messages to send to clients
  var initLocalSubscriptions = function () {
    Space.mediator.Subscribe("pilotControl", function (data) {
      emitAndEnqueue("pilotControl", {d:data.keystroke});
    });

    Space.mediator.Subscribe("requestSelfShip", function () {
      emitAndEnqueue("requestSelfShip");
    });
  }

  // Add artificial latency when receiving server messages
  var delayedSocketOn = function (message, fn) {
    socket.on(message, function (data) {
      _.delay(fn, Constants.extraLatency.fromServer, data);
    });
  }

  // Listen for server messages
  var initServerSubscriptions = function () {
    // we have a ping response
    delayedSocketOn('pong', function (data) {
      var timeNow, timeDif;
      timeNow = new Date().getTime();
      timeDif = timeNow - data.timestamp;
      Space.setLag(timeDif);
    });

    // we have a ship
    delayedSocketOn('deliverSelfShip', function (data) {
      Space.generateSelfShip(data.x, data.y, data.angle, data.id);
      Space.mediator.Publish('receivedSelfShip', {foo: 'bar'});
    });

    // we have a snapshot
    delayedSocketOn('snapshot', function (data) {
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
