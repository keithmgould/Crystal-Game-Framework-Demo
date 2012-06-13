define(['app/constants', 'core/space'], function (Constants, Space) {

  var socket = io.connect(Constants.server);

  var initPubSub = function () {
    Space.mediator.Subscribe("transport", function (data) {
      socket.emit("transporty", {my: "transport data"});
    });
  }
  
  return {
    initialize : function () {
      initPubSub();
    }
  };
});
