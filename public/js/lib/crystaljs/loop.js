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
      serverTickOffset,
      serverTickCount,
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
    CrystaljsApi.Publish("update");
  }

  var estimateLatency = function (data) {
    // in case this is the first message from the server
    if(_.isUndefined(startedAt)){ start(data);}

    var expectedTick = tickCount + serverTickOffset;
    var diff = expectedTick - data.tickCount;
    //console.log('latency in ticks: ' + diff);
    return diff;
  }

  var start = function (data) {
    startedAt = Date.now();
    serverTickOffset = data.tickCount;
    request(accurateInterval);
  }

  return {
    tickCount: tickCount, // for dev only...
    estimateLatency: estimateLatency
  };
});
