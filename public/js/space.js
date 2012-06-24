define(['common/constants', 'common/physics', 'common/entities/ship', 'common/entities/missile', 'common/utility', 'underscore', 'mediator', 'crystaljs/api'], function (Constants, Physics, Ship, Missile, Utility, _, Mediator, CrystaljsApi) {

  var world,
      entities = [],
      selfShip,
      loopCallbacks = [],
      mediator = new Mediator();

  var initPubSub = function () {
    // listen for pilot controls
    mediator.Subscribe('pilotControl', function (data) {
      if(_.isObject(selfShip)){
        // shoot control off to ship for prediction
        selfShip.pilotControl(data.keystroke);
        // tell server for authority
        CrystaljsApi.Publish('messageToServer', {type: 'pilotControl', message: {key: data.keystroke}});
      }else{
        console.log("pilot control but selfship is: " + typeof(selfShip));
      }
    });

    // listen for messages from loop
    CrystaljsApi.Subscribe('update', function (data) {
      update();
    });

    // listen for messages from the server
    CrystaljsApi.Subscribe('messageFromServer', function (data) {
      switch(data.type){
        case "shipDelivery":
          generateSelfShip(data.message);
          break;
        case "sync":
          break;
        case "snapshot":
          applySnapshot(data.message);
          break;
        default:
          throw new Error("we have a message with an unknown type: " + data.type);
      }
    });

  }

  var generateSelfShip = function (data){
    console.log("generating selfship!");
    addShip(true, data.x, data.y, data.angle, data.id);
  }

  var update = function () {
    world.Step(1/60, 10, 10); // Hz, Iteration, Position
    world.ClearForces();
    updateEntities();
    runLoopCallbacks();
  };

  var updateEntities = function () {
    _.each(entities, function(entity){
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
    console.log('adding ship!');
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

  var findEntityById = function (shipId) {
     var ship = _.find(entities, function (entity) {
        return shipId === entity.id;
      });
      return ship;
  }

  var applySnapshot = function (snapshot) {
    console.log('applying a snapshot!');
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
        destroyEntity(entity);
      }
    });
  }

  // remove entity from entities array and from physics engine
  var destroyEntity = function (entity) {
      if(_.isUndefined(entity)){
        throw new Error("entity undefined in Space#destroyEntity");
      }
      console.log("destroying entity with id: " + entity.id);
      console.log('before destroying entity, entity count: ' + entities.length);
      entities = _.without(entities, entity);
      Physics.removeEntity(entity, world);
      console.log('destroyed entity from entities array and world: ' + entity.id);
      console.log('entities count after destroy: ' + entities.length);
  }

  return {
    mediator: mediator,
    getWorld: function () { return world; },
    getEntities: function () { return entities; },
    getSelfShip: function () { return selfShip; },
    hasSelfShip: function () {
      return !(typeof selfShip === 'undefined');
    },
    initialize: function () {
      world = Physics.generateWorld();
      initPubSub();
    },
    addToLoopCallbacks: function (scope, fn) {
      loopCallbacks.push({ scope : scope, fn : fn});
    },
    enableDebugDraw: function (context) {
      Physics.enableDebugDraw(world, context);
    },
    addEnemy: function (xPos, yPos, angle) {
      addShip(false, xPos, yPos, angle);
    },
    applySnapshot: applySnapshot

  };
});
