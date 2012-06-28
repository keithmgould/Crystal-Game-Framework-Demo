define(['common/constants', 'space', 'kinetic', 'backbone'], function  (Constants, Space, Kinetic, Backbone) {
	var stage,
      selfShipLayer,
      // kineticObjs = [],
      scale;

  var mapView = Backbone.View.extend({
    initialize: function () {
      scale = Constants.physics.scale;
      stage = new Kinetic.Stage({
        container : "mapWidget",
        width: Constants.physics.width,
        height: Constants.physics.height
      });
      selfShipLayer = new Kinetic.Layer();
      stage.add(selfShipLayer);
      this.placeSelfShip();
      Space.addToLoopCallbacks(this, this.drawElements);
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
          stroke: "red",
          strokeWidth: 1,
          rotationDeg: 0,
          draggable: true
      });
      poly.setPoints([nose, rearLeft, rearRight]);
      layer.add(poly);
    },
    placeSelfShip : function () {
      this.placeShip({}, 0, 0, 0, "blue", selfShipLayer);
    },
    drawElements: function () {
      selfShipLayer.draw();
    }
  });
  return mapView;	
});