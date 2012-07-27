define(['crystal/client/transport',
        'crystal/client/loop',
        'crystal/client/snapsorter',
        'crystal/common/physics',
        'crystal/client/pingPong',
        'crystal/client/ssapplier',
        'crystal/client/interpolator'], function (Transport, Loop, SnapSorter, Physics, PingPong, SSApplier, Interpolator) {

  var initialize = function () {
    Transport.initialize();
    Physics.initialize();
    SnapSorter.initialize();
    Loop.initialize();
    PingPong.initialize();
    SSApplier.initialize();
    Interpolator.initialize();
  }

  return {
    initialize: initialize
  }
});
