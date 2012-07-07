define(['crystal/client/transport','crystal/client/loop','crystal/client/corrector', 'crystal/common/physics'], function (Transport, Loop, Corrector, Physics) {

  var initialize = function () {
    Transport.initialize();
    Physics.initialize();
    Corrector.initialize();
    Loop.initialize();
  }

  return {
    initialize: initialize
  }
});
