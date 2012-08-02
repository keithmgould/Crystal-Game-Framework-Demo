/*
  While Crystal uses Require.JS, Crystal mostly runs with lots of files working in a sordid parallel dance.  So while Require.JS promotes
  modules loading eachother, we have to initialize quite a few at the same time.  This is largely a consequence of Crystal's heavy
  use of the mediator pattern, which allows a lot of crosstalk between modules, albeit in a clean encapsulated way.
*/
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
