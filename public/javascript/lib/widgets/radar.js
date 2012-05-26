define(function () {
  console.log("loading radar widget module");
  return function (sb) {
    return {
      init : function () {
        console.log("starting up radar widget");
      },
      destroy : function () {
        console.log("stopping radar widget");
      }
    };
  };
});
