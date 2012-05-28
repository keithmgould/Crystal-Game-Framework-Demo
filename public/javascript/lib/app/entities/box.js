define(["lib/core/entity", "lib/app/constants"], function (Entity, Constants) {
  var Box = Entity.extend({
    init : function(x,y){
      this._super(x,y);
      this.width = 2;
      this.height = 2;
      this.halfWidth = 1;
      this.halfHeight = 1;
      this.color = "red";
    },
    draw : function (ctx) {
      var scale = Constants.physics.scale;
      ctx.save();
      ctx.translate(this.x * scale, this.y * scale);
      ctx.rotate(this.angle);
      ctx.translate(-(this.x) * scale, -(this.y) * scale);
      ctx.fillStyle = this.color;
      ctx.fillRect((this.x-this.halfWidth) * scale,
                   (this.y-this.halfHeight) * scale,
                   (this.halfWidth*2) * scale,
                   (this.halfHeight*2) * scale);
      ctx.restore();
    }
  });

  return Box;

});
