define(['common/constants', 'common/physics', 'common/entities/ship', 'common/entities/missile', 'mediator', 'common/utility', 'underscore'], function (Constants, Physics, Ship, Missile, Mediator, Utility, _) {

  var mediator = new Mediator(),
      world,
      entities = [],
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
    updateEntities();
    runLoopCallbacks();
    storeUpdateDifs(startUpdateAt);
    setTimeout(update, timeoutFreq ); // not using requestAnimFrame while I debug stuff...
  };

  var updateEntities = function () {
    _.each(entities, function(entity){
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
      }
      entities.push(ship);
      Physics.placeEntities([ship], world);
      return ship;
  };

  var addMissileFromSnapshot = function(snapshot) {
    var missile = new Missile({
      xPos: snapshot.xPos,
      yPos: snapshot.yPos,
      id:   snapshot.id,
      ownerId: snapshot.ownerId});
    entities.push(missile);
    Physics.placeEntities([missile], world);
    return missile;
  }

  var addMissileFromShip = function (ship) {
    var missile = ship.fireMissile();
    missile.set({id: Utility.guidGenerator()});
    entities.push(missile);
    Physics.placeEntities([missile], world);
    return missile;
  }

  var initPubsub = function () {
    // todo: remove this once its moved to ship entity
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
        case Constants.keystrokes.KEY_SPACE_BAR:
          addMissileFromShip(selfShip);
          break;
        default:
          console.log("don't know what to do with this valid key yet...")
      }
    });
  }

  var findEntityById = function (shipId) {
     var ship = _.find(entities, function (entity) {
        return shipId === entity.id;
      });
      return ship;
  }

  var applySnapshot = function (snapshot) {
    updateTimeoutFreq(snapshot.avgUpdateDifs);
    _.each(snapshot.entities, function (entitySnapshot) {
      //console.log('updating from snapshot.  id: ' + entitySnapshot.id);
      var entity = findEntityById(entitySnapshot.id);
      if(typeof entity === "undefined"){
         switch(entitySnapshot.type) {
          case "Ship":
            entity = addShip(false, entitySnapshot.x, entitySnapshot.y, entitySnapshot.a, entitySnapshot.id);
            console.log('adding ship via snapshot')
            break;
          case "Missile":
            console.log('adding missile via snapshot');
            entity = addMissileFromSnapshot(entitySnapshot);
            break;
          default:
            throw new Error("trying to apply snapshot but no entity found and snapshot.type not supported: " + entitySnapshot.type);
         }
      }
      entity.applySnapshot(entitySnapshot);
    });
    // now find all ships that were not in the snapshot and destroy them.
    var entityIds = _.map(snapshot.entities, function (entity) {
      return entity.id;
    });
    _.each(entities, function (entity) {
      if(_.include(entityIds, entity.id) === false){
        destroyEntity(entity.id);
      }
    });
  }

  // remove from entities array and from physics engine
  var destroyEntity = function (entityId) {
      if(_.isUndefined(entityId)){
        throw new Error("entityId undefined in Space#destroyEntity");
      }
      console.log("destroying entity with id: " + entityId);
      console.log('before destroying entity, entity count: ' + entities.length);
      var entity = findEntityById(entityId);
      entities = _.without(entities, entity);
      Physics.removeEntity(entity, world);
      console.log('destroyed entity from entities array and world: ' + entity.id);
      console.log('entities count after destroy: ' + entities.length);
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
    getEntities : function () { return entities; },
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
      console.log("we have a ship!");
      if(typeof selfShip == 'undefined'){
        addShip(true, xPos, yPos, angle, id);
      }
    },
    requestSelfShip : function () {
      console.log("requesting ship!");
      mediator.Publish('requestSelfShip');
    },
    addEnemy : function (xPos, yPos, angle) {
      addShip(false, xPos, yPos, angle);
    },
    applySnapshot : applySnapshot

  };
});
