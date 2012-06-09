define(['core/space'], function (Space) {
  return {
    initialize : function () {
      
    },
    grabVector : function () {
      var vector = [];
      $.each(Space.getEntities(), function (entity, callback) {
        var obj = {
          id : 'foo',
          type : 'ship',
          xPos : -1,
          yPos : -1,
          angle : -1,
          xSpeed : -1,
          ySpeed : -1,
          rot : -1
        };
        vector.push(obj);
      });
      return vector;
    }
  };
});
