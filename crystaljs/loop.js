/**
 * Crystaljs Main Server Loop.
 */

define(['crystaljs/api'], function (CrystaljsApi) {
  var updateInterval = 1000 / 60,     // how many MS before another call to update()
      tickCount = 0,                  // how many ticks have transpired
      startedAt;                      // Time the loop started

  var start = function () {
    startedAt = Date.now();
    listenForPing();
    accurateInterval();
  }

  var listenForPing = function () {
    CrystaljsApi.Subscribe("messageFromClient:loop", function (data) {
      if(data.type === "ping"){
        var response = {
          socketId: data.socketId,
          type: 'pong',
          message: data.message,
          target: 'loop'
        };
        CrystaljsApi.Publish('messageToClient', response);
      }
    });
  }

  var accurateInterval = function () {
    var next, nextTickAt;
    update();
    tickCount++;
    nextTickAt = Math.round((tickCount * updateInterval) + startedAt);
    next = nextTickAt - Date.now();
    if(next < 0) {next = 0;}
    setTimeout(accurateInterval, next);
  }

  var update = function () {
    CrystaljsApi.Publish("update", {tickCount: tickCount});
  };

  return {
    start: start
  };

});
