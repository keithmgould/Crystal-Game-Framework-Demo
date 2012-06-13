define(['app/constants', 'core/physics', 'app/entities/ship', 'mediator', 'underscore'], function (Constants, Physics, Ship, Mediator, _) {
  // todo: use single var syntax...
  
  var mediator = new Mediator();
  var world;
  var allEntities = [];
  var otherEntities = [];
  var selfShip; // holds the Self (Ship) entity
  var loopCallbacks = [];
  var update = function () {
    // Hz, Iteration, Position
    world.Step(1/60, 5, 2);
    world.ClearForces();
    updateAllEntities();
    runLoopCallbacks();
    // if window is defined, we are running on client, and can 
    // leverage requestAnimFrame.  Otherwise we are on server
    // and must resort to a simple setTimeout.
    if( typeof(window) == "object"){
      requestAnimFrame(update);
    }else{
      setTimeout(update, 1000/60 );
    }
  };

  var updateAllEntities = function () {
    _.each(allEntities, function(entity){
      entity.update();
    });
  };

  var runLoopCallbacks = function () {
    _.each(loopCallbacks, function (callback) {
      var fn = callback.fn;
      var scope = callback.scope;
      fn.call(scope);
    });
  };

  var addShip = function (isSelfShip, xPos, yPos, angle, id) {
      var ship = new Ship({ xPos: xPos, yPos : yPos, angle: angle, id: id});
      if(isSelfShip) {
        ship.set({ selfShip : true, color : "blue"});
        selfShip = ship;
      }else{
        ship.set({ color : "red" });
        otherEntities.push(ship);
      }
      allEntities.push(ship);
      Physics.placeEntities([ship], world);
  };

  var initPubsub = function () {
    mediator.Subscribe("pilotControl", function ( data ) {
      switch(data.keystroke)
      {
        case Constants.keystrokes.KEY_LEFT_ARROW:
          selfShip.accelerate.rotateLeft.call(selfShip);
          break;
        case Constants.keystrokes.KEY_RIGHT_ARROW:
          selfShip.accelerate.rotateRight.call(selfShip);
          break;
        case Constants.keystrokes.KEY_UP_ARROW:
          selfShip.accelerate.foreward.call(selfShip);
          break;
      }
    });
  }

  var findShipById = function (shipId) {
     var ship = _.find(allEntities, function (entity) {
        return shipId === entity.id;
      });
      return ship;
  }

  var applySnapshot = function (snapshot) {
    _.each(snapshot.ships, function (shipSnapshot) {
      console.log('updating from snapshot.  ship: ' + shipSnapshot.id);
      var ship = findShipById(shipSnapshot.id);
      if(typeof ship === "undefined"){
        // must be a new ship.  lets make it!
         addShip(false, shipSnapshot.x, shipSnapshot.y, shipSnapshot.a, shipSnapshot.id);
         console.log('adding ship via snapshot')
      }else{
        ship.applySnapshot(shipSnapshot);
      }
    });
    // now find all ships that were not in the snapshot and destroy them.
    //
    var entityIds = _.map(snapshot.ships, function (ship) {
      return ship.id;
    });
    _.each(otherEntities, function (entity) {
      if(_.include(entityIds, entity.id) === false){
        destroyShip(entity.id);
      }
    });
  }

  // remove from entities and from physics engine
  var destroyShip = function (shipId) {
      console.log('before destroying ship, entitiy count: ' + entities.length);
      var ship = findShipById(shipId);
      entities = _.without(entities, ship);
      Physics.removeEntity(ship, world);
      console.log('destroyed ship from entities and world: ' + ship.id);
      console.log('entity count after destroy: ' + entities.length);
  }

  return {
    mediator : mediator,
    addToLoopCallbacks : function (scope, fn) {
      loopCallbacks.push({ scope : scope, fn : fn});
    },
    getWorld : function () { return world },
    getAllEntities : function () { return allEntities; },
    getOtherEntities : function () { return otherEntities; },
    getSelfShip : function () { return selfShip; },
    hasSelfShip : function () {
      return !(typeof selfShip === 'undefined');
    },
    generateSpace : function () {
      world = Physics.generateWorld();
      initPubsub();
      requestAnimFrame(update);
    },
    enableDebugDraw : function (context) {
      Physics.enableDebugDraw(world, context);
    },
    generateSelfShip : function (xPos, yPos, angle, id) {
      if(typeof selfShip == 'undefined'){
        addShip(true, xPos, yPos, angle, id);
      }
    },
    requestSelfShip : function () {
      mediator.Publish('requestSelfShip');
    },
    addEnemy : function (xPos, yPos, angle) {
      addShip(false, xPos, yPos, angle);
    },
    applySnapshot : applySnapshot

  };
});
