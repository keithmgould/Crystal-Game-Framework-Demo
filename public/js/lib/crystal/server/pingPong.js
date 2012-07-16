/* 
  PingPong Keeps track of Lag
*/
define(['crystal/common/api'], function (CrystalApi) {

  var lags, avgLag;

  var initialize = function () {

    // Listen for Pongs
    CrystalApi.Subscribe("messageFromClient:crystal", function (data) {
      if(data.type != "ping"){ return; }
      console.log("We have a ping!");
      CrystalApi.Publish("messageToClient", {
        target: 'crystal',
        type: 'pong',
        message: data.message
      });
    });

  }


  return {
    initialize: initialize
  };
});