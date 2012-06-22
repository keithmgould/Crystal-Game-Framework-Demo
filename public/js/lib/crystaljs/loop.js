define(['crystaljs/api'], function (CrystaljsApi) {
  var request = window.requestAnimationFrame
                      || window.webkitRequestAnimationFrame
                      || window.mozRequestAnimationFrame;


  var requestFrame = !!request; // force boolean

  var update = function () {
    CrystaljsApi.Publish("update");
    request(update);
  }

  var start = function () {
    update();
  }

  return {
    start: start
  };
});
