define(function () {
  return {
    round: function (floater, deg) {
      var deg = deg || 2,
          multiple = Math.pow(10,deg);
      return Math.round(floater * multiple) / multiple;
    },
    guidGenerator: function () {
      var S4 = function() {
         return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
      };
      return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    }
  }
});

