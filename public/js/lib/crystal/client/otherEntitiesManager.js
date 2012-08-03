/*
  The Developer takes snapshots and 
*/
define(['crystal/common/api'], function (CrystalApi) {
  var initialize = function () {
    CrystalApi.Subscribe('messageFromServer:crystal', function (data) {
      if(data.type != "snapshot") {return;}
    });
  }

  return {
    initialize: initialize
  };
});