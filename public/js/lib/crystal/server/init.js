define(['crystal/server/transport', 'crystal/server/loop', 'crystal/common/physics', 'crystal/server/photographer'], function (Transport, Loop, Physics, Photographer) {
  var initialize = function (io) {
    Transport.initialize(io);
    Physics.initialize();  
    Photographer.initialize();
    Loop.start();
  }
  return {
    initialize: initialize
  }
});