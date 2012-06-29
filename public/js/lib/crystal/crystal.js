define(['crystal/transport', 'crystal/loop'], function (Transport, Loop) {

  var initialize = function () {
    Transport.initialize();   // 1) Initialize crystal transport
    Loop.initialize();        // 2) Initialize crystal loop
  }

  return {
    initialize: initialize
  }
});
