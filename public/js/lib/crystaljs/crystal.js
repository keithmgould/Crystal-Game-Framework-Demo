define(['crystaljs/transport', 'crystaljs/loop'], function (Transport, Loop) {

  var initialize = function () {
    Transport.initialize();   // 1) Initialize Crystaljs transport
    Loop.initialize();        // 2) Initialize Crystaljs loop
  }

  return {
    initialize: initialize
  }
});
