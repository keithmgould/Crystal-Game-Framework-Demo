define(['common/entities/ship', 'common/entities/missile', 'underscore', 'mediator', 'crystal/common/api'], function (Ship, Missile, _, Mediator, CrystalApi) {

  var entities = [],                  // holds all entities
      selfShip,                       // pointer to entity that is our own ship
      loopCallbacks = [],             // lets widgets etc have callbacks during the update method
      mediator = new Mediator(),      // mediator instance used for cross-talk by widgets etc..
      snapshotTank = false;           // Snapshots held here until they are ready to be applied

  
  /**
   * initPubSub
   *
   * both game internal communication, as well as game commuication with crystal framework
   * is done using the mediator pattern.  There are two mediator instances below.  One owned
   * by this Space module, and one owned by crystal.  The initPubSub initializes Publishers
   * and Subscriptions to both mediator instances.
   */

  var initPubSub = function () {
    // listen for pilot controls (from Pilot Widget)
    mediator.Subscribe('pilotControl', function (data) {
      if(_.isObject(selfShip)){
        // tell local ship for prediction
        // selfShip.pilotControl(data.keystroke);
        // tell server.  (This game has an Authorative Server!)
        CrystalApi.Publish('messageToServer', {target: 'game', type: 'pilotControl', message: {key: data.keystroke}});
      }else{
        throw new Error("received pilot control but selfship is: " + typeof(selfShip));
      }
    });

    // listen for messages from crystal's Loop
    CrystalApi.Subscribe('update', function (data) {
      update(data);
    });

    CrystalApi.Subscribe('avgLag', function (alag) {
      avgLag = alag;
    });

    // listen for messages from the server (via crystal's Transport)
    CrystalApi.Subscribe('messageFromServer:game', function (data) {
      switch(data.type){
        case "shipDelivery":
          generateSelfShip(data.message);
          break;
        case "sync":
          break;
        case "snapshot":
          snapshotTank = data.message;
          break;
        default:
          throw new Error("we have a message with an unknown type: " + data.type);
      }
    });

  }

  var requestSelfShip = function () {
    CrystalApi.Publish('messageToServer', {target: 'game', type: 'requestShip', message: {}});
  }

  var generateSelfShip = function (data){
    console.log("generating selfship!");
    addShip(true, data.x, data.y, data.a, data.id);
    CrystalApi.Publish('messageToServer', {target: 'game', type: 'requestSnapshot', message: {}});
  }

  var update = function (data) {
    updateEntities();
    runLoopCallbacks();
    checkForSnapshot();
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
    CrystalApi.Publish("addEntity", ship);
    return ship;
  };

  var addMissileFromSnapshot = function(snapshot) {
    var missile = new Missile({
      xPos: snapshot.xPos,
      yPos: snapshot.yPos,
      id:   snapshot.id,
      ownerId: snapshot.ownerId});
    entities.push(missile);
    CrystalApi.Publish("addEntity", missile);
    return missile;
  }

  var addMissileFromShip = function (ship) {
    var missile = ship.fireMissile();
    missile.set({id: Utility.guidGenerator()});
    entities.push(missile);
    CrystalApi.Publish("addEntity", missile);
    return missile;
  }

  var findEntityById = function (shipId) {
     var ship = _.find(entities, function (entity) {
        return shipId === entity.id;
      });
      return ship;
  }

  var checkForSnapshot = function () {
    var snapshot;
    if(!snapshotTank){
      return;
    }
    snapshot = snapshotTank;
    snapshotTank = false;

    // console.log('applying a snapshot: ' + JSON.stringify(snapshot));

    _.each(snapshot.entities, function (entitySnapshot) {
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

  // remove entity from entities array and from world (physics engine)
  var destroyEntity = function (entity) {
      if(_.isUndefined(entity)){
        throw new Error("entity undefined in Space#destroyEntity");
      }
      entities = _.without(entities, entity);
      CrystalApi.Publish("removeEntity", entity);
  }

  return {
    mediator: mediator,
    getEntities: function () { return entities; },
    getSelfShip: function () { return selfShip; },
    hasSelfShip: function () {
      return !(typeof selfShip === 'undefined');
    },
    initialize: function () {
      initPubSub();
      requestSelfShip();
    },
    addToLoopCallbacks: function (scope, fn) {
      loopCallbacks.push({ scope : scope, fn : fn});
    },
    enableDebugDraw: function (context) {
      CrystalApi.Publish("enableDebugDraw", context);
    }
  };
});
