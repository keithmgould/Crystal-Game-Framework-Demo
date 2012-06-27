define(['crystaljs/api', 'crystaljs/slowfast', 'underscore'], function (CrystaljsApi, Slowfast, _) {
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
      startedAt,
      ticksPerPing = Math.floor((1000 / updateInterval) / 2); // about twice per second
      lags = [],
      avgLag = 0,
      useSlowfast = true;


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
    if(useSlowfast){
      var data = {stepMultiplier: Slowfast.calculateStepMultiplier(avgLag)};
    }else{
      var data = {};
    }
    CrystaljsApi.Publish("update", data);
    if(tickCount % ticksPerPing === 0){
      CrystaljsApi.Publish("messageToServer", {target: 'loop', type: 'ping', message: Date.now() });
    }
  }

  var listenForPong = function () {
    var lag = 0;
    CrystaljsApi.Subscribe("messageFromServer:loop", function (data) {
      if(data.type === "pong"){
        lag = Date.now() - data.message;
        lags.push(lag);
        if(lags.length > 10) { lags.shift();}
        storeAverageLag();
        CrystaljsApi.Publish("avgLag", avgLag);
      }
    });
  }

  var storeAverageLag = function () {
    var lagsLength = lags.length;
    if(lagsLength === 0){
      avgLag = 0;
    }else{
      avgLag = _.reduce(lags, function(memo, num){ return memo + num; }, 0) / lagsLength;
      avgLag = Math.round(avgLag * 100) / 100;
    }
  }

  var initialize = function () {
    Slowfast.initialize(updateInterval);
    listenForPong();
    startedAt = Date.now();

    // added these two to accomodate dat.gui
    // http://code.google.com/p/dat-gui/
    this.__defineGetter__("useSlowfast", function () {
      return useSlowfast;
    });
    this.__defineSetter__("useSlowfast", function (val) {
      useSlowfast = val;
    });



    request(accurateInterval);
  }

  return {
    initialize: initialize,

  };
});
