define(['crystaljs/api', 'underscore'], function (CrystaljsApi, _) {
  var request = window.requestAnimationFrame       ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame    ||
                window.oRequestAnimationFrame      ||
                window.msRequestAnimationFrame     ||
                function( callback ){
                  window.setTimeout(callback, 1000 / 60);
                };

  var requestFrame = !!request, // force boolean
      tickCount = 0,
      updateInterval = 1000 /60,
      startedAt,
      ticksPerPing = Math.floor((1000 / updateInterval) / 2);


  var accurateInterval = function () {
    while(performTickCheck()){
      update();
      tickCount++;
    }
    request(accurateInterval);
  }

  var performTickCheck = function () {
    var nextTickAt = (tickCount * updateInterval) + startedAt;
    return (nextTickAt <= Date.now());
  }

  var update = function () {
    CrystaljsApi.Publish("update");
    if(tickCount % ticksPerPing === 0){
      CrystaljsApi.Publish("messageToServer", {target: 'loop', type: 'ping', message: Date.now() });
    }
  }

  var listenForPong = function () {
    var lag = 0;
    CrystaljsApi.Subscribe("messageFromServer:loop", function (data) {
      if(data.type === "pong"){
        lag = Date.now() - data.message;
        CrystaljsApi.Publish("lag", lag);
      }
    });
  }

  var initialize = function () {
    listenForPong();
    startedAt = Date.now();
    request(accurateInterval);
  }

  return {
    initialize: initialize
  };
});
