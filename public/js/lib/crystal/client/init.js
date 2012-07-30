define(['crystal/client/transport',
        'crystal/client/loop',
        'crystal/client/fastforwarder',
        'crystal/common/physics',
        'crystal/client/pingPong',
        'crystal/client/interpolator',
        'crystal/client/predictor'], function (Transport, Loop, Fastforwarder, Physics, PingPong, Interpolator, Predictor) {

  var initialize = function () {
    Transport.initialize();
    Physics.initialize();
    Fastforwarder.initialize();
    Loop.initialize();
    PingPong.initialize();
    Interpolator.initialize();
    Predictor.initialize();
  }

  return {
    initialize: initialize
  }
});
