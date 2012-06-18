define(['common/constants', 'common/physics', 'common/entities/ship', 'mediator', 'underscore'], function (Constants, Physics, Ship, Mediator, _) {

  var mediator = new Mediator(),
      world,
      allEntities = [],
      otherEntities = [],
      selfShip,
      loopCallbacks = [],
      lag,                      // determined by Transport#ping/pong
      updateDifs = [],          // stores update loop timing difs
      timeoutFreq = 1000 / 60;  // initial value only

  var update = function () {
    var startUpdateAt = Date.now();
    // Hz, Iteration, Position
    world.Step(1/60, 10, 10);
    world.ClearForces();
    updateAllEntities();
    runLoopCallbacks();
    storeUpdateDifs(startUpdateAt);
    setTimeout(update, timeoutFreq ); // not using requestAnimFrame while I debug stuff...
  };

  var updateAllEntities = function () {
    _.each(allEntities, function(entity){
      entity.update();
    });
  };

  var storeUpdateDifs = function (startUpdateAt) {
      var dif = Date.now() - startUpdateAt;
      updateDifs.push(dif);
      if(updateDifs.length >= 120){
        updateDifs.shift();
      }
  }

  var getAverageUpdateDifs = function () {
    var total = _.reduce(updateDifs, function(memo, num){ return memo + num; }, 0);
    return total / updateDifs.length;
  }

  var updateTimeoutFreq = function (serverAvgUpdateDif) {
    serverAverageUpateDif = serverAvgUpdateDif;
    if(updateDifs.length < 100){ return; } // wait till we have a decent sample set
    timeoutFreq = serverAvgUpdateDif -  getAverageUpdateDifs();
  }

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
      return ship;
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
    updateTimeoutFreq(snapshot.avgUpdateDifs);
    _.each(snapshot.ships, function (shipSnapshot) {
      console.log('updating from snapshot.  ship: ' + shipSnapshot.id);
      var ship = findShipById(shipSnapshot.id);
      if(typeof ship === "undefined"){
        // must be a new ship.  lets make it!
         ship = addShip(false, shipSnapshot.x, shipSnapshot.y, shipSnapshot.a, shipSnapshot.id);
         console.log('adding ship via snapshot')
      }
      ship.applySnapshot(shipSnapshot);
    });
    // now find all ships that were not in the snapshot and destroy them.
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
      console.log('before destroying ship, otherEntitiy count: ' + otherEntities.length);
      var ship = findShipById(shipId);
      otherEntities = _.without(otherEntities, ship);
      Physics.removeEntity(ship, world);
      console.log('destroyed ship from otherEntities and world: ' + ship.id);
      console.log('otherEntity count after destroy: ' + otherEntities.length);
  }

  return {
    mediator : mediator,
    getAverageUpdateDifs: getAverageUpdateDifs,
    getTimeoutFreq: function () { return timeoutFreq; },
    addToLoopCallbacks : function (scope, fn) {
      loopCallbacks.push({ scope : scope, fn : fn});
    },
    setLag: function (newLag) { lag = newLag; },
    getLag: function () { return lag; },
    getWorld : function () { return world; },
    getAllEntities : function () { return allEntities; },
    getOtherEntities : function () { return otherEntities; },
    getSelfShip : function () { return selfShip; },
    hasSelfShip : function () {
      return !(typeof selfShip === 'undefined');
    },
    generateSpace : function () {
      world = Physics.generateWorld();
      initPubsub();
      update();
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
