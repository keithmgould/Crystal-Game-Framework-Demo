define(["lib/entity"], function (Entity) {
  var Box = Entity.extend({
    init : function(x,y){
      this._super(x,y);
      this.width = 60;
      this.height = 60;
    }
  });

  return Box;

});
