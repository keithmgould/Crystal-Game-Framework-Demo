define(function () {
  return {
    round: function (floater, deg) {
      var deg = deg || 2,
          multiple = Math.pow(10,deg);
      return Math.round(floater * multiple) / multiple;
    }
  }
});

