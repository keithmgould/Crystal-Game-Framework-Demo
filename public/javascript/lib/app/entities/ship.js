define(["lib/core/entity"], function (Entity) {
  var Ship = Entity.extend({
    init: function(x,y){
      this._super(x,y);
      this.width = 60;
      this.height = 60;
      this.img =  new Image();
      this.img.src = "media/singleShip.png";
    },
    thrust: function(){
      power = 20;
      var y = -Math.cos(this.angle).toFixed(2);
      var x = Math.sin(this.angle).toFixed(2);
      this.body.ApplyImpulse(
        new b2Vec2(x * power, y * power),
        this.body.GetWorldCenter()
      );
    },
    rotateRight: function(){
      this.body.ApplyTorque(50);
    },
    rotateLeft: function(){
      this.body.ApplyTorque(-50);
    }
  });
  return Ship;
});
