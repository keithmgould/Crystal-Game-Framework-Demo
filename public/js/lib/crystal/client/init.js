define(['crystal/client/transport',
        'crystal/client/loop',
        'crystal/client/fastforwarder',
        'crystal/common/physics',
        'crystal/client/pingPong',
        'crystal/client/ssapplier',
        'crystal/client/interpolator',
        'crystal/client/predictor'], function (Transport, Loop, Fastforwarder, Physics, PingPong, SSApplier, Interpolator, Predictor) {

  var initialize = function () {
    Transport.initialize();
    Physics.initialize();
    Fastforwarder.initialize();
    Loop.initialize();
    PingPong.initialize();
    SSApplier.initialize();
    Interpolator.initialize();
    Predictor.initialize();
  }

  return {
    initialize: initialize
  }
});
