define(["ext/class"], function (Class) {
  var Entity = Class.extend({
    init: function(x,y){
      this.x = x;
      this.y = y;
      this.width = 0;
      this.height = 0;
      this.angle = 0;
    },
    update: function(){
      this.x = this.body.GetPosition().x;
      this.y = this.body.GetPosition().y;
      this.angle = this.body.GetAngle();
    }
  });

  return Entity;
});
