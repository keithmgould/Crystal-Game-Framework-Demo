/**
 * Crystaljs Main Server Loop.
 */

define(['crystaljs/api'], function (CrystaljsApi) {
  var updateInterval = 1000 / 60,     // how many MS before another call to update()
      tickCount = 0,                  // how many ticks have transpired
      syncRate = 60,                  // how many ticks transpire before another sync broadcast
      startedAt;                      // Time the loop started

  var start = function () {
    CrystaljsApi.Publish("start");
    startedAt = Date.now();
    accurateInterval();
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
    CrystaljsApi.Publish("update");
    if( tickCount % syncRate === 0){
      CrystaljsApi.Publish("broadcast", {type: 'sync'});
    }
  };

  return {
    start: start,
    getTickCount: function () { return tickCount; }
  };

});
