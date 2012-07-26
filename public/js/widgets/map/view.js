/*
  This view cheats by accessing CrystalJS Directly.  It does for demonstration purposes only.  A view should
  normally only access its Sandbox.
*/
define(['common/constants', 'space', 'kinetic', 'crystal/common/api', 'backbone'], function  (Constants, Space, Kinetic, CrystalApi, Backbone) {
	var scale,
      stage,
      selfShipLayer,
      kineticObjs = {},
      screenWidth, screenHeight;

  var mapView = Backbone.View.extend({
    initialize: function () {
      scale = Constants.physics.scale;
      screenWidth = Constants.physics.width;
      screenHeight = Constants.physics.height;
      stage = new Kinetic.Stage({
        container : "mapWidget",
        width: screenWidth,
        height: screenHeight
      });
      selfShipLayer = new Kinetic.Layer();
      stage.add(selfShipLayer);
      this.placeBackground(selfShipLayer);
      this.placeSelfShip();
      that = this;
      CrystalApi.Subscribe('serverSelfEntitySnapshot', function (data) {
        that.updateFromSnapshot(data, 'ssPoly');
      });

      CrystalApi.Subscribe('serverSelfEntityFutureSnapshot', function (data) {
        that.updateFromSnapshot(data, 'ffPoly');
      });

      CrystalApi.Subscribe('interpolatedSnapshot', function (data) {
        that.updateFromSnapshot(data, 'inPoly');
      });

      Space.addToLoopCallbacks(this, this.drawElements);
    },

    updateFromSnapshot: function (snapshot, kineticObj) {
      var xPos = scale * snapshot.x;
      var yPos = scale * snapshot.y;
      var angle = snapshot.a;
    
      kineticObjs[kineticObj].knode.setX(xPos); 
      kineticObjs[kineticObj].knode.setY(yPos);
      kineticObjs[kineticObj].knode.setRotation(angle);
    },

    placeBackground: function (layer) {
      var rect = new Kinetic.Rect({
        x: 0,
        y: 0,
        width: screenWidth,
        height: screenHeight,
        fill: "black"
      });
      layer.add(rect);
    },

    placeShip: function (x, y, rotation, color, layer) {
      var nose      = { x: 0, y: -20},
          rearLeft  = { x: -5, y: 0},
          rearRight = { x: 5, y: 0},
          poly;

      poly = new Kinetic.Polygon({
          x: (screenWidth / 2) + ( scale * x ),
          y: (screenHeight / 2) + ( scale * y ),
          fill: color,
          stroke: color,
          strokeWidth: 1,
          rotationDeg: 0,
          draggable: false
      });
      poly.setPoints([nose, rearLeft, rearRight]);
      layer.add(poly);
      return poly;
    },
    placeSelfShip : function () {
      // snapshot poly: shows incoming snapshots of selfShip
      var ssPoly = this.placeShip(0, 0, 0, "red", selfShipLayer);
      kineticObjs['ssPoly'] = {knode : ssPoly, layer : selfShipLayer};

      // snapshot poly: shows incoming snapshots of selfShip, fastforwarded
      var ffPoly = this.placeShip(0, 0, 0, "orange", selfShipLayer);
      kineticObjs['ffPoly'] = {knode : ffPoly, layer : selfShipLayer};     
      
      // physics engine poly: shows client physics engine selfShip
      var pePoly = this.placeShip(0, 0, 0, "green", selfShipLayer);
      kineticObjs['pePoly'] = {knode : pePoly, layer : selfShipLayer};

      // physics engine poly: interpolated ship
      var pePoly = this.placeShip(0, 0, 0, "blue", selfShipLayer);
      kineticObjs['inPoly'] = {knode : pePoly, layer : selfShipLayer};

    },
    updateElements: function () {
      var selfShip = Space.getSelfShip();
      if(selfShip){
        var selfSnapshot = selfShip.getSnapshot();
        var xPos =  scale * selfSnapshot.x;
        var yPos = scale * selfSnapshot.y;
        kineticObjs['pePoly'].knode.setX(xPos);
        kineticObjs['pePoly'].knode.setY(yPos);
        kineticObjs['pePoly'].knode.setRotation(selfSnapshot.a);
      }
    },
    drawElements: function () {
      this.updateElements();
      selfShipLayer.draw();
    }
  });
  return mapView;	
});