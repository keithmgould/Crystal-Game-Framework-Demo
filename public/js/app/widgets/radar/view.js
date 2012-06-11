define(['app/constants','core/space', 'backbone', 'text!app/widgets/radar/templates/screen.html', 'kinetic'], function (Constants, Space, Backbone, Screen, Kinetic) {

   var stage,
       otherEntitiesLayer,
       selfShipLayer,
       gridLayer,
       kineticObjs = [],
       scale;

  var radarView = Backbone.View.extend({
    el : $("#radarWidget"),
    initialize : function () {
      this.render();
      scale = Constants.physics.scale;
      stage = new Kinetic.Stage({
        container : "radarScreen",
        width: Constants.physics.width,
        height: Constants.physics.height
      });
      selfShipLayer = new Kinetic.Layer();
      otherEntitiesLayer = new Kinetic.Layer();
      gridLayer = new Kinetic.Layer();
      this.placeEntities();
      stage.add(gridLayer);
      stage.add(selfShipLayer);
      stage.add(otherEntitiesLayer);
      Space.addToLoopCallbacks(this, this.updateRadar);
    },
    placeEntities : function () {
     this.placeGrid();
     this.placeSelfShip();
     this.placeOtherEntities();
    },

    render : function (event) {
      var compiled_template = _.template(Screen);
      this.$el.html(compiled_template);
    },
    updateRadar : function () {
      this.updateElements();
      this.updateReadout();
    },
    updateReadout : function () {
      var selfShip = Space.getSelfShip();
      var angle = Math.round(selfShip.get('angle') * 57.2957795 % 360);
      var friendlyAngle;
      var angVel = selfShip.get('body').GetAngularVelocity();
      var linVel = selfShip.get('body').GetLinearVelocity();
      angVel = Math.round(angVel * 100) / 100;
      linVel.cleanX = Math.round(linVel.x * 100) / 100;
      linVel.cleanY = Math.round(linVel.y * 100) / 100;

      if (angle < 0) { friendlyAngle = 360 + angle;} else {friendlyAngle = angle;}
      this.$el.find('#xCoord').html(Math.round(selfShip.get('xPos')));
      this.$el.find('#yCoord').html(Math.round(selfShip.get('yPos')));
      this.$el.find('#angle').html(friendlyAngle);
      this.$el.find('#angVelocity').html(angVel);
      this.$el.find('#linVelocity').html(linVel.cleanX + "," + linVel.cleanY);

    },
    updateElements : function () {
      var that = this;
      $.each(kineticObjs, function (i, obj) {
        if(obj.entity.get('entityType') === "Ship"){
          if(obj.entity.get('selfShip') === true){
          
          }else{
            that.updateOtherShip(obj);
          }
        }else{
          console.log('trying to update an unknown entity in Radar View updateElements');
        }
      });
      selfShipLayer.draw();
      otherEntitiesLayer.draw();
    },
    placeShip : function (entity, x, y, rotation, color, layer) {
      var nose      = { x : 0, y : -(2 * scale)},
          rearLeft  = { x : -(scale / 2), y : 0},
          rearRight = { x : (scale / 2), y : 0},
          screenWidth = Constants.physics.width,
          screenHeight = Constants.physics.height,
          poly;

      poly = new Kinetic.Polygon({
          x: (screenWidth / 2) + ( scale * x ),
          y: (screenHeight / 2) + ( scale * y ),
          fill: color,
          stroke: "black",
          strokeWidth: 1
      });
      poly.setPoints([nose, rearLeft, rearRight]);
      kineticObjs.push({'entity' : entity, knode : poly, layer : layer});
      layer.add(poly);
    },
    placeSelfShip : function () {
      this.placeShip(Space.getSelfShip(), 0, 0, 0, "blue", selfShipLayer);
    },
    placeOtherEntities : function () {
      var that = this;
      $.each(Space.getOtherEntities(), function (i, other) {
        switch(other.get('entityType')) {
          case 'Ship':
            that.placeOtherShip(other);
            break;
          default:
            console.log("unknown entity type in Radar View placeOtherEntities");
            break;
        }

      });
    },
    placeOtherShip : function (entity) {
      var coordsRel = this.calculateRelativeOffsets(entity);
      this.placeShip(entity, coordsRel.x, coordsRel.y, entity.get('angle'), "red", otherEntitiesLayer);
    },
    placeGrid : function () {
      var screenWidth = Constants.physics.width,
          screenHeight = Constants.physics.height,
          circle, widths;

      widths = [0.9, 0.6, 0.3];
      
      $.each(widths, function (i, percent) {
        circle = new Kinetic.Circle({
          x: screenWidth / 2,
          y: screenHeight / 2,
          radius: (screenWidth * percent) / 2,
          stroke: "red",
          strokeWidth: 1
        });
        gridLayer.add(circle);
      });

    },
    updateOtherShip : function (kineticObj) {
      var coordsRel = this.calculateRelativeOffsets(kineticObj.entity),
          screenWidth = Constants.physics.width,
          screenHeight = Constants.physics.height,
          selfShip = Space.getSelfShip();

      kineticObj.knode.setX( (screenWidth / 2) + scale * coordsRel.x );
      kineticObj.knode.setY( (screenHeight / 2) + scale * coordsRel.y );
      kineticObj.knode.setRotation(kineticObj.entity.get('angle') - selfShip.get('angle'));
    },

    calculateRelativeOffsets : function (entity) {
      var selfShip,
          xOther,
          yOther,
          xDif,
          yDif,
          xSelf,
          ySelf,
          xRel,
          yRel,
          geoAngle,
          comboAngle,
          distance;

      selfShip = Space.getSelfShip();
      xSelf = selfShip.get('xPos');
      ySelf = selfShip.get('yPos');
      xOther = entity.get('xPos');
      yOther = entity.get('yPos');
      xDif = xSelf - xOther;
      yDif =  ySelf - yOther;
      geoAngle = Math.atan2(xDif, yDif);
      comboAngle = geoAngle + selfShip.get('angle');
      distance = Math.sqrt(xDif * xDif + yDif * yDif);
      xRel = 0 - distance * Math.sin(comboAngle);
      yRel = 0 - distance * Math.cos(comboAngle);
      return { x : xRel, y : yRel};
    }
  });
  return radarView;
});
