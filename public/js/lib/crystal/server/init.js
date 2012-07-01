define(['crystal/server/transport', 'crystal/server/loop', 'crystal/common/physics'], function (Transport, Loop, Physics) {
  var initialize = function (io) {
    Transport.initialize(io);
    Loop.start();
    Physics.initialize();  
  }
  return {
    initialize: initialize
  }
});