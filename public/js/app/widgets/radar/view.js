define(['app/constants','core/space', 'backbone', 'text!app/widgets/radar/templates/screen.html'], function (Constants, Space, Backbone, Screen) {

   var canvas,
       ctx,
       canvasWidth,
       canvasHeight,
       scale;

  var radarView = Backbone.View.extend({
    el : $("#radarWidget"),
    initialize : function () {
      scale = Constants.physics.scale;
      this.render();
      canvas = this.$el.find("#radarCanvas")[0];
      ctx = canvas.getContext("2d");
      canvasWidth = ctx.canvas.width;
      canvasHeight = ctx.canvas.height;
      Space.addToLoopCallbacks(this, this.drawElements);
    },
    render : function (event) {
      var coords, data, compiled_template;
      if( typeof Space.getSelfShip() == "object"){
        coords = Space.getSelfShip().get('body').GetPosition();
        data = { xpos : coords.x, ypos : coords.y};
      } else {
        data = { 
          xpos : -1, 
          ypos : -1
        };
      }
      data['canvasHeight'] = Constants.physics.height;
      data['canvasWidth'] = Constants.physics.width;

      compiled_template = _.template(Screen, data);
      this.$el.html(compiled_template);
    },
    drawElements : function () {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      this.drawSelfShip();
      this.drawOthers();
    },
    drawSelfShip : function () {
      var selfShip, xPos, yPos, height, width, halfWidth, halfHeight, angle;
      selfShip = Space.getSelfShip();
      xPos = selfShip.get('xPos');
      yPos = selfShip.get('yPos');
      angle = selfShip.get('angle');
      height = selfShip.get('height');
      width = selfShip.get('width');
      halfHeight = height / 2;
      halfWidth = width / 2;
      ctx.save();
      ctx.translate(xPos * scale, yPos * scale);
      ctx.rotate(angle);
      ctx.translate(-xPos * scale, -yPos * scale);
      ctx.fillStyle = selfShip.get('color');
      ctx.fillRect((xPos - halfWidth) * scale,
                   (yPos - halfHeight) * scale,
                   (halfWidth*2) * scale,
                   (halfHeight*2) * scale);
      ctx.restore();
    },
    drawOthers : function () {
      var that = this;
      $.each(Space.getOtherEntities(), function (i, other) {
        that.drawOther(other);
      });
    },
    drawOther : function (entity)
    {
      var xPos, yPos, height, width, halfWidth, halfHeight, angle;
      xPos = entity.get('xPos');
      yPos = entity.get('yPos');
      angle = entity.get('angle');
      height = entity.get('height');
      width = entity.get('width');
      halfHeight = height / 2;
      halfWidth = width / 2;
      ctx.save();
      ctx.translate(xPos * scale, yPos * scale);
      ctx.rotate(angle);
      ctx.translate(-xPos * scale, -yPos * scale);
      ctx.fillStyle = entity.get('color');
      ctx.fillRect((xPos - halfWidth) * scale,
                   (yPos - halfHeight) * scale,
                   (halfWidth*2) * scale,
                   (halfHeight*2) * scale);
      ctx.restore();
    }
  });
  return radarView;
});
