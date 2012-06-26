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
      ticksPerPing = Math.floor((1000 / updateInterval) / 2); // about twice per second
      lags = [],
      multiplierState = false;
      multiplierTicksRemaining = 0;
      avgLag = 0;


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
    var data = {};
    if(multiplierState){
      data.stepMultiplier = calculateStepMultiplier();
    }
    CrystaljsApi.Publish("update", data);
    if(tickCount % ticksPerPing === 0){
      CrystaljsApi.Publish("messageToServer", {target: 'loop', type: 'ping', message: Date.now() });
    }
  }

  var calculateStepMultiplier = function () {
    console.log("in csm: " + multiplierTicksRemaining);
    multiplierTicksRemaining--;
    if (multiplierTicksRemaining <= 0){
      multiplierState = false;
      return 1;
    }
    var latency = avgLag / 2,
        multiplier,
        ticksBehind = avgLag / 2 / updateInterval;
    switch(multiplierState){
      case "slowdown":
        multiplier = 1 / ticksBehind;
        break;
      case "fastforward":
        multiplier = ticksBehind;
        break;
      default:
        throw new Error("uknown multiplier state in #calculateStepMultiplier");
    }
    console.log("multiplier: " + multiplier);
    return multiplier;
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

  var listenForStepMultiplier = function () {
    CrystaljsApi.Subscribe("messageToServer", function (data) {
      if(data.target == "game"){
        performSlowdown();
      }
    });
  }

  var storeAverageLag = function () {
    var lagsLength = lags.length;

    if(lagsLength == 0){
      avgLag = 0;
    }else{
      avgLag = _.reduce(lags, function(memo, num){ return memo + num; }, 0) / lagsLength;
    }
    avgLag = Math.round(avgLag * 100) / 100;
  }

  var initialize = function () {
    listenForPong();
    listenForStepMultiplier();
    startedAt = Date.now();
    request(accurateInterval);
  }

  var performSlowdown = function () {
    console.log("performing slowdown");
    multiplierState = "slowdown";
    multiplierTicksRemaining = Math.floor(avgLag / 2 / updateInterval);
  }

  var performFastForward = function () {
    console.log("performing fastforward");
    multiplierState = "fastforward";
    multiplierTicksRemaining = Math.floor(avgLag / 2 / updateInterval);
  }

  return {
    initialize: initialize
  };
});
