define(['crystal/client/transport',
        'crystal/client/loop',
        'crystal/client/corrector',
        'crystal/common/physics',
        'crystal/client/pingPong',
        'crystal/client/photographer',
        'crystal/client/ssapplier'], function (Transport, Loop, Corrector, Physics, PingPong, Photographer, SSApplier) {

  var initialize = function () {
    Transport.initialize();
    Physics.initialize();
    Photographer.initialize();
    Corrector.initialize();
    Loop.initialize();
    PingPong.initialize();
    SSApplier.initialize();
  }

  return {
    initialize: initialize
  }
});
