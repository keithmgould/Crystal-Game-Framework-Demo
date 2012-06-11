define(['app/constants','core/space', 'backbone', 'text!app/widgets/radar/templates/screen.html', 'kinetic'], function (Constants, Space, Backbone, Screen, Kinetic) {

   var stage,
       otherEntitiesLayer,
       selfShipLayer,
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
      this.placeEntities();
      stage.add(selfShipLayer);
      stage.add(otherEntitiesLayer);
      Space.addToLoopCallbacks(this, this.updateElements);
    },
    placeEntities : function () {
     this.placeSelfShip();
     this.placeOtherEntities();
    },

    render : function (event) {
      var compiled_template = _.template(Screen);
      this.$el.html(compiled_template);
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
      var nose      = { x : 0, y : -20},
          rearLeft  = { x : -5, y : 0},
          rearRight = { x : 5, y : 0},
          screenWidth = Constants.physics.width,
          screenHeight = Constants.physics.height,
          poly;

      poly = new Kinetic.Polygon({
          x: (screenWidth / 2) + ( scale * x ),
          y: (screenHeight / 2) + ( scale * y ),
          fill: color,
          stroke: "black",
          strokeWidth: 1,
          rotationDeg: 0,
          draggable: true
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
      this.placeShip(entity, coordsRel[0], coordsRel[1], entity.get('angle'), "red", otherEntitiesLayer);
    },
    updateOtherShip : function (kineticObj) {
      var coordsRel = this.calculateRelativeOffsets(kineticObj.entity),
          screenWidth = Constants.physics.width,
          screenHeight = Constants.physics.height,
          selfShip = Space.getSelfShip();

      kineticObj.knode.setX( (screenWidth / 2) + scale * coordsRel[0] );
      kineticObj.knode.setY( (screenHeight / 2) + scale * coordsRel[1] );
      kineticObj.knode.setRotation(0 - selfShip.get('angle'));
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
      yRel = distance * Math.cos(comboAngle);
      if(yDif > 0) { yRel = 0 - yRel; }
      return [xRel, yRel];
    }
  });
  return radarView;
});
