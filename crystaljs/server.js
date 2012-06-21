/**
 * Crystaljs Main Server Loop.
 */

define(['crystaljs/api'], function (CrystaljsApi) {
  var updateInterval = 1000 / 60,     // how many MS before another call to update()
      tickCount = 0,                  // how many ticks have transpired
      syncRate = 60;                  // how many ticks transpire before another sync broadcast

  var start = function () {
    CrystaljsApi.Publish("start");
    setInterval(update, 1000/60);
  }

  var update = function () {
    CrystaljsApi.Publish("update");
    tickCount++;
    if( tickCount % syncRate === 0){
      CrystaljsApi.Publish("broadcast", {type: 'sync', message : tickCount});
    }
  };

  return {
    start: start
  };

});
