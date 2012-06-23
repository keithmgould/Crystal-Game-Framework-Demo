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
    // not ready for nextTick
    var nextTickAt = (tickCount * updateInterval) + startedAt;
    if(nextTickAt > Date.now()){ return false; };

    // all good
    return true;
  }

  var update = function () {
    CrystaljsApi.Publish("update");
  }

  var estimateLatency = function (data) {
    // in case this is the first message from the server
    if(_.isUndefined(startedAt)){ start(data);}
    
    var expectedTick = tickCount + serverTickOffset;
    var diff = expectedTick - data.tickCount;
    console.log('latency in ticks: ' + diff);
    return diff;
  }

  var start = function (data) {
    startedAt = Date.now();
    serverTickOffset = data.tickCount;
    request(accurateInterval);

    //CrystaljsApi.Subscribe('messageFromServer', function (data) {
      //if(data.type === 'sync'){
        //var tickDiff = (serverTickCount - serverTickOffset) - tickCount;
        //console.log("tickDiff: " + tickDiff + ", tickCount: " + tickCount);
      //}
    //});
  }

  return {
    tickCount: tickCount, // for dev only...
    estimateLatency: estimateLatency
  };
});
