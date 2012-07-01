define(['crystal/transport', 'crystal/loop','crystal/corrector', '/../../movie.js'], function (Transport, Loop, Corrector, Movie) {

  var initialize = function () {
    Loop.initialize();
    Corrector.initialize();
    Transport.initialize();
  }

  return {
    initialize: initialize
  }
});
