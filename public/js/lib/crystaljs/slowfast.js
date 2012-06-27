define(['crystaljs/api', 'underscore'], function (CrystaljsApi, _) {

  var multiplierState = false,
      multiplierTicksRemaining = 0,
      updateInterval;


  var calculateStepMultiplier = function (avgLag) {
    if (multiplierTicksRemaining === 0){
      return 1;
      multiplierState = false;
    }
    console.log("in csm: " + multiplierTicksRemaining);
    var latency = avgLag / 2,
        multiplier,
        ticksBehind = latency / updateInterval;
    switch(multiplierState){
      case "slowdown":
        multiplier = 0.5;
        break;
      case "fastforward":
        multiplier = ticksBehind;
        break;
      default:
        throw new Error("uknown multiplier state in #calculateStepMultiplier");
    }
    console.log("multiplier: " + multiplier);
    multiplierTicksRemaining--;
    return multiplier;
  }

  var listenForRelevantEvents = function () {
    CrystaljsApi.Subscribe("messageToServer", function (data) {
      if(data.target === "game"){
        performSlowdown();
      }
    });

    CrystaljsApi.Subscribe("performFastForward", function (data) {
        performFastForward();
    });
  }

  var performSlowdown = function () {
    console.log("performing slowdown");
    multiplierState = "slowdown";
    multiplierTicksRemaining = Math.floor(avgLag / 2 / updateInterval);
  }

  var performFastForward = function () {
    console.log("staging fastforward");
    multiplierState = "fastforward";
    multiplierTicksRemaining = 1;
  }

  var initialize = function (uI) {
    updateInterval = uI;
    listenForRelevantEvents();
  }

  return {
    initialize: initialize,
    calculateStepMultiplier: calculateStepMultiplier
  };
});
