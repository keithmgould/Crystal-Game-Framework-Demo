define(['crystal/api', 'underscore'], function (CrystalApi, _) {
  var request = window.requestAnimationFrame       ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame    ||
                window.oRequestAnimationFrame      ||
                window.msRequestAnimationFrame     ||
                function( callback ){
                  window.setTimeout(callback, 1000 / 60);
                };

  var tickCount = 0,
      updateInterval = 1000 /60,
      startedAt;

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
    CrystalApi.Publish("update", {});
  }

  var initialize = function () {
    startedAt = Date.now();
    request(accurateInterval);
  }

  return {
    initialize: initialize
  };
});
