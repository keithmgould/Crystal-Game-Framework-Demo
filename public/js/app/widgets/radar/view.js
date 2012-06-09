define(['app/constants','core/space', 'backbone', 'text!app/widgets/radar/templates/screen.html', 'kinetic'], function (Constants, Space, Backbone, Screen, Kinetic) {

   var stage,
       canvasWidth,
       canvasHeight,
       scale;

  var radarView = Backbone.View.extend({
    el : $("#radarWidget"),
    initialize : function () {
      scale = Constants.physics.scale;
      //this.render();
      //canvas = this.$el.find("#radarCanvas")[0];
      //ctx = canvas.getContext("2d");
      stage = new Kinetic.Stage({
        container : "radarWidget",
        width: Constants.physics.width,
        height: Constants.physics.height
      });
      //canvasWidth = ctx.canvas.width;
      //canvasHeight = ctx.canvas.height;
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
      stage.clear();
      this.drawSelfShip();
      //this.drawOtherEntities();
    },
    drawSelfShip : function () {
      var selfShip,
          xPos,
          yPos,
          height,
          width,
          halfWidth,
          halfHeight
          angle,
          rounded;

      selfShip = Space.getSelfShip();
      angle = selfShip.get('angle');

      var layer = new Kinetic.Layer();
      var poly = new Kinetic.Polygon({
          points: [73, 192, 73, 160, 340, 23],
          fill: "#00D2FF",
          stroke: "black",
          strokeWidth: 1
      });
      layer.add(poly);
      stage.add(layer);


      //xPos = selfShip.get('xPos');
      //yPos = selfShip.get('yPos');
      //height = selfShip.get('height');
      //width = selfShip.get('width');
      //halfHeight = height / 2;
      //halfWidth = width / 2;
      //ctx.save();
      //rounded = Math.round(xPos * 100)/100 + "," + Math.round(yPos * 100)/100 + "," + Math.round(angle);
      //ctx.fillText(rounded,(xPos + 1) * scale, yPos * scale);
      ////ctx.translate(canvasWidth / 2, canvasHeight / 2);
      ////ctx.rotate(angle);
      ////ctx.translate(-x, -yPos * scale);
      //ctx.fillStyle = selfShip.get('color');
      //ctx.fillRect( (canvasWidth / 2) - halfWidth,
                    //(canvasHeight / 2) - halfHeight,
                   //(halfWidth*2) * scale,
                   //(halfHeight*2) * scale);
      //ctx.restore();
    },
    drawOtherEntitiess : function () {
      var that = this;
      $.each(Space.getOtherEntities(), function (i, other) {
        that.drawOther(other);
      });
    },
    drawOther : function (entity)
    {
      var xPos, yPos, height, width, halfWidth, halfHeight, angle, rounded, selfShip, selfShipAngle;
      selfShip = Space.getSelfShip();
      selfShipAngle = selfShip.get('angle');
      xPos = entity.get('xPos');
      yPos = entity.get('yPos');
      angle = entity.get('angle');
      height = entity.get('height');
      width = entity.get('width');
      halfHeight = height / 2;
      halfWidth = width / 2;
      ctx.save();
      rounded = Math.round(xPos * 100)/100 + "," + Math.round(yPos * 100)/100;
      ctx.fillText(rounded,(xPos + 1) * scale, yPos * scale);
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
