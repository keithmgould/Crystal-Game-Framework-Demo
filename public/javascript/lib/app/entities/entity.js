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

    },
    draw: function(ctx){
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.drawImage(this.img,-(this.width / 2),-(this.height / 2));
      ctx.restore();
    }
  });

  return Entity;
});
