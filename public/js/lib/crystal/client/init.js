define(['crystal/client/transport',
        'crystal/client/loop',
        'crystal/client/corrector',
        'crystal/common/physics',
        'crystal/client/pingPong',
        'crystal/client/ssapplier',
        'crystal/client/interpolator'], function (Transport, Loop, Corrector, Physics, PingPong, SSApplier, Interpolator) {

  var initialize = function () {
    Transport.initialize();
    Physics.initialize();
    Corrector.initialize();
    Loop.initialize();
    PingPong.initialize();
    SSApplier.initialize();
    Interpolator.initialize();
  }

  return {
    initialize: initialize
  }
});
