define(['crystal/client/transport', 'crystal/client/loop','crystal/client/corrector', 'crystal/common/Physics'], function (Transport, Loop, Corrector, Physics) {

  var initialize = function () {
    Loop.initialize();
    Corrector.initialize();
    Transport.initialize();
    Physics.initialize();
  }

  return {
    initialize: initialize
  }
});
