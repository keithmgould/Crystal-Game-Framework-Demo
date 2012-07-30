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

      Space.addToLoopCallbacks(this, this.drawElements);

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
          default:
            throw new Error("unknown ship type");
        }
      });

      // These subscriptions change the color based on the mode of the ship
      CrystalApi.Subscribe("updateMethodChange", function (data) {
        var color;
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

      // snapshot poly: shows incoming snapshots of selfShip from server
      var serverPoly = this.placeShip(0, 0, 0, "red", selfShipLayer);
      kineticObjs['serverPoly'] = {knode : serverPoly, layer : selfShipLayer};

      // future poly: show future rendering of server snapshot
      var futurePoly = this.placeShip(0, 0, 0, "orange", selfShipLayer);
      kineticObjs['futurePoly'] = {knode : futurePoly, layer : selfShipLayer};

      // final poly: show final rendering of ship
      var finalPoly = this.placeShip(0, 0, 0, "white", selfShipLayer);
      kineticObjs['finalPoly'] = {knode : finalPoly, layer : selfShipLayer};
      xxxPoly = finalPoly;
    },

    drawElements: function () {
      selfShipLayer.draw();
    }
  });
  return mapView;	
});