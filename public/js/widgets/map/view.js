/*
  This view cheats by accessing CrystalJS Directly.  It does for demonstration purposes only.  A view should
  normally only access its Sandbox, provided by your Game.  However, this view demonstrates the inner workings 
  of the Crystal framework.
*/
define(['common/constants', 'space', 'kinetic', 'crystal/common/api', 'common/entityLoader', 'backbone', 'underscore'], function  (Constants, Space, Kinetic, CrystalApi, EntityLoader, Backbone, _) {
	var scale,
      stage,
      selfShipLayer,
      othersLayer,
      kineticObjs = { selfShipLayer: {}, othersLayer: {}},
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
      othersLayer = new Kinetic.Layer();
      stage.add(selfShipLayer);
      stage.add(othersLayer);
      this.placeBackground(selfShipLayer);
      that = this;

      Space.addToLoopCallbacks(this, this.drawElements);

      // When we have a self Entity (ship), place it in the canvas.
      Space.mediator.Subscribe("generatedSelfShip", function (selfShip) {
        that.placeSelfShip(selfShip);
      });

      // These subscriptions update location of ships on the map
      CrystalApi.Subscribe('serverSelfEntitySnapshot', function (snapshot) {
        that.updateFromSnapshot(snapshot, 'selfShipLayer','serverPoly');
      });

      CrystalApi.Subscribe('selfEntitySnapshot', function (snapshot) {
        that.updateFromSnapshot(snapshot, 'selfShipLayer','finalPoly');
      });  

      CrystalApi.Subscribe('serverSelfEntityFutureSnapshot', function (snapshot) {
        that.updateFromSnapshot(snapshot, 'selfShipLayer', 'futurePoly');
      });

      CrystalApi.Subscribe('otherEntitiesSnapshot', function (snapshot) {
        that.updateOthersFromSnapshot(snapshot);
      });    

      // These subscriptions toggle visibility of ships on map
      Space.mediator.Subscribe("shipVisibility", function (data) {
        switch(data.ship){
          case "final":
            that.toggleNodeVisibility(kineticObjs["selfShipLayer"]["finalPoly"]);
            break;
          case "server":
            that.toggleNodeVisibility(kineticObjs["selfShipLayer"]["serverPoly"]);
            break;
          case "future":
            that.toggleNodeVisibility(kineticObjs["selfShipLayer"]["futurePoly"]);
            break;
          case "colorChange":
            colorChange = !colorChange;
            break;
          default:
            throw new Error("unknown ship type");
        }
      });

      // These subscriptions change the color based on the mode of the ship
      CrystalApi.Subscribe("crystalDebug", function (data) {
        if(data.type != "updateMethodChange" || colorChange === false){return;}
        var color = data.updateMethod === "snapshots" ? "white" : "green";
        kineticObjs["selfShipLayer"]["finalPoly"].setFill(color);
      });

    },

    toggleNodeVisibility: function (node) {
      if(node.isVisible()){
        node.hide();
      }else{
        node.show();
      }
    },

    updateOthersFromSnapshot: function (snapshots) {
      var that = this;
      var unfoundNodeIds = _.keys(kineticObjs["othersLayer"]); // used for removing unfound nodes
      // update existing entities
      _.each(snapshots, function(snapshot) {
        unfoundNodeIds = _.reject(unfoundNodeIds, function (nodeId) { return nodeId === snapshot.id});
        if(_.isUndefined(kineticObjs["othersLayer"][snapshot.id])){
          var entity = new EntityLoader[snapshot.type]({ xPos: snapshot.x, yPos: snapshot.y, angle: snapshot.a, id: snapshot.id});
          var entityPoly = that.placePolygonEntity(entity, "red", othersLayer);
          kineticObjs["othersLayer"][snapshot.id] = entityPoly;
        }else{
          that.updateFromSnapshot(snapshot, "othersLayer", snapshot.id);
        }
      });
      // remove old entities
      _.each(unfoundNodeIds, function (nodeId) {
        kineticObjs["othersLayer"][nodeId].hide();
        delete kineticObjs["othersLayer"][nodeId];
      });

    },

    updateFromSnapshot: function (snapshot, layer, id) {
      var xPos = scale * snapshot.x;
      var yPos = scale * snapshot.y;
      var angle = snapshot.a;
    
      kineticObjs[layer][id].setX(xPos); 
      kineticObjs[layer][id].setY(yPos);
      kineticObjs[layer][id].setRotation(angle);
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
      var points = entity.getShapePoints(),
          scaledPoints,
          poly;

      
      poly = new Kinetic.Polygon({  
          x: (screenWidth / 2) + ( scale * entity.get('xPos') ),
          y: (screenHeight / 2) + ( scale * entity.get('yPos') ),
          fill: color,
          stroke: color,
          strokeWidth: 1,
          rotationDeg: 0
      });

      scaledPoints = _.map(points, function (point) {
        return { x: point.x * scale, y: point.y * scale};
      });
      poly.setPoints(scaledPoints);

      if(_.isUndefined(entity.get('body')) === false){
        var offsets = entity.get('body').GetLocalCenter();
        poly.setCenterOffset({x: offsets.x * scale, y: offsets.y * scale});
      }

      layer.add(poly);
      return poly;
    },

    placeSelfShip : function (selfShip) {

      // snapshot poly: shows incoming snapshots of selfShip from server
      var serverPoly = this.placePolygonEntity(selfShip, "blue", selfShipLayer);
      serverPoly.hide();
      kineticObjs["selfShipLayer"]["serverPoly"] = serverPoly;

      // future poly: show future rendering of server snapshot
      var futurePoly = this.placePolygonEntity(selfShip, "purple", selfShipLayer);
      futurePoly.hide();
      kineticObjs["selfShipLayer"]["futurePoly"] = futurePoly;

      // final poly: show final rendering of ship
      var finalPoly = this.placePolygonEntity(selfShip, "white", selfShipLayer);
      kineticObjs["selfShipLayer"]["finalPoly"] = finalPoly;
    },

    drawElements: function () {
      selfShipLayer.draw();
      othersLayer.draw();
    }
  });
  return mapView;	
});