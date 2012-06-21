define(['server/space'], function (Space) {

  var start = function () {
    Space.generateSpace();
    setInterval(update, 1000/60);
  }

  var update = function () {
    Space.update();
  };

  return {
    start: start
  };

});
