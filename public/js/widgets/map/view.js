/*
  This view cheats by accessing CrystalJS Directly.  It does for demonstration purposes only.  A view should
  normally only access its Sandbox.
*/
define(['common/constants', 'space', 'kinetic', 'crystal/common/api', 'backbone', 'underscore'], function  (Constants, Space, Kinetic, CrystalApi, Backbone, _) {
	var scale,
      stage,
      selfShipLayer,
      kineticObjs = {},
      screenWidth, screenHeight,
      colorChange = false;

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
      that = this;

      Space.addToLoopCallbacks(this, this.drawElements);

      Space.mediator.Subscribe("generatedSelfShip", function (selfShip) {
        that.placeSelfShip(selfShip);
      });

      // These subscriptions update location of ships on the map
      CrystalApi.Subscribe('serverSelfEntitySnapshot', function (data) {
        that.updateFromSnapshot(data, 'serverPoly');
      });

      CrystalApi.Subscribe('finalSnapshot', function (data) {
        that.updateFromSnapshot(data, 'finalPoly');
      });

      CrystalApi.Subscribe('serverSelfEntityFutureSnapshot', function (data) {
        that.updateFromSnapshot(data, 'futurePoly');
      });

      // These subscriptions toggle visibility of ships on map
      Space.mediator.Subscribe("shipVisibility", function (data) {
        switch(data.ship){
          case "final":
            that.toggleNodeVisibility(kineticObjs['finalPoly'].knode);
            break;
          case "server":
            that.toggleNodeVisibility(kineticObjs['serverPoly'].knode);
            break;
          case "future":
            that.toggleNodeVisibility(kineticObjs['futurePoly'].knode);
            break;
          case "colorChange":
            colorChange = !colorChange;
            break;
          default:
            throw new Error("unknown ship type");
        }
      });

      // These subscriptions change the color based on the mode of the ship
      CrystalApi.Subscribe("updateMethodChange", function (data) {
        var color;
        if(colorChange === false){return;}
        if(data.use === "snapshots"){
          color = "white";
        }else{
          color = "green";
        }
        kineticObjs['finalPoly'].knode.setFill(color);
      });

    },

    toggleNodeVisibility: function (node) {
      if(node.isVisible()){
        node.hide();
      }else{
        node.show();
      }
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

    placePolygonEntity: function (entity, color, layer) {
      var points = entity.getShapePoints();
      var scaledPoints = [];
      var scaledPoints = _.map(points, function (point) {
        return { x: point.x * scale, y: point.y * scale};
      });

      var offsets = entity.get('body').GetLocalCenter();
      

      poly = new Kinetic.Polygon({
          x: (screenWidth / 2) + ( scale * entity.get('xPos') ),
          y: (screenHeight / 2) + ( scale * entity.get('yPos') ),
          fill: color,
          stroke: color,
          strokeWidth: 1,
          rotationDeg: 0
      });
      poly.setPoints(scaledPoints);
      poly.setCenterOffset({x: offsets.x * scale, y: offsets.y * scale});
      layer.add(poly);
      return poly;
    },
    placeSelfShip : function (selfShip) {

      // snapshot poly: shows incoming snapshots of selfShip from server
      var serverPoly = this.placePolygonEntity(selfShip, "red", selfShipLayer);
      serverPoly.hide();
      kineticObjs['serverPoly'] = {knode : serverPoly, layer : selfShipLayer};

      // future poly: show future rendering of server snapshot
      var futurePoly = this.placePolygonEntity(selfShip, "orange", selfShipLayer);
      futurePoly.hide();
      kineticObjs['futurePoly'] = {knode : futurePoly, layer : selfShipLayer};

      // final poly: show final rendering of ship
      var finalPoly = this.placePolygonEntity(selfShip, "white", selfShipLayer);
      kineticObjs['finalPoly'] = {knode : finalPoly, layer : selfShipLayer};
    },

    drawElements: function () {
      selfShipLayer.draw();
    }
  });
  return mapView;	
});