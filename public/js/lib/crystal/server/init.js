define(['crystal/server/transport', 
        'crystal/server/loop',
        'crystal/common/physics',
        'crystal/server/photographer',
        'crystal/server/pingPong'], function (Transport, Loop, Physics, Photographer, PingPong) {
  var initialize = function (io) {
    Transport.initialize(io);
    Physics.initialize();  
    Photographer.initialize(true);
    PingPong.initialize();
    Loop.start();
  }
  return {
    initialize: initialize
  }
});