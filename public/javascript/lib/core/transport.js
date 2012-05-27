define(["lib/app/constants", "/socket.io/socket.io.js"], function (Constants, xx) {
  console.log("loading core.transport module");
  var socket = io.connect(Constants.server),
      sendables = ["new-message"];

  return {
    on : function (callback) {
      socket.on("new-message", function (msg) {
        callback({ type : "receive-message", data : msg});
      });
    },
    emit : function (msg) {
      var sendable,
          i = 0;
      for( ; sendable = sendables[i++] ; ){
        if (sendable === msg.type){
          socket.emit(msg.type, msg.data );
        }
      }
    }
  };
});
