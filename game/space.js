define(['common/constants', 'common/physics', 'common/entities/ship', 'common/utility', 'underscore', 'crystaljs/api'], function (Constants, Physics, Ship, Utility, _, CrystaljsApi) {
  var world,
      entities = [],
      clients = {};

  var initialize = function () {
    apiSubscribe();
    world = Physics.generateWorld();
  }

  var apiSubscribe = function () {

    // COMMUNICATION API SUBSCRIPTIONS
    CrystaljsApi.Subscribe('socketConnected', function (data) { handleRequestShip(data); });
    CrystaljsApi.Subscribe('messageFromClient', function (message) { handleMessage(message); });
    CrystaljsApi.Subscribe('socketDisconnected', function (data) { socketDisconnected(data); });

    // GAME LOOP API SUBSCRIPTIONS
    CrystaljsApi.Subscribe('update', function (data) {updateSpace(data);});

    // For Testing purposes only...
    CrystaljsApi.Subscribe('broadcast', function (data) {
      console.log("Snapshot: " + JSON.stringify(generateSnapshot()));
    });

  }

  var broadcastSnapshot = function () {
    _.delay(function () {
      CrystaljsApi.Publish('broadcast', {type: 'snapshot', message: generateSnapshot()} );
    }, 20);
  }

  var handleMessage = function (data) {
    switch(data.type){
      case "pilotControl":
        pilotControl(data);
        break;
      case "requestShip":
        handleRequestShip(data);
        break;
      default:
        console.log("received unknown message type: " + data.message);
    }
  }

  var pilotControl = function (data) {
    var ship = clients[data.socketId];
    if(!_.isUndefined(ship)){
      ship.pilotControl(data.message.key);
    broadcastSnapshot();
    }else{
      console.log("got a pilot control for a non-existant ship");
    }

  }

  var handleRequestShip = function (data) {
    var socketId = data.socketId,
        ship     = clients[socketId],
        response;

    if( _.isUndefined(ship) ){
      ship = generateShip();
      clients[socketId] = ship;
    }

    response = {
      socketId: socketId,
      type: 'shipDelivery',
      message: ship.getSnapshot()
    };
    CrystaljsApi.Publish('messageToClient', response);
    broadcastSnapshot();
  }

  var updateSpace = function () {
    world.Step(1/60, 10, 10); // Hz, Iteration, Position
    world.ClearForces();
    updateEntities();
  }

  var updateEntities = function () {
    var response;
    _.each(entities, function(entity){
      response = entity.update();
      if(response.status == 'suicide'){
        console.log("killing: " + entity.id);
        destroyEntity(entity);
      }
    });
  };

  var addShip = function (xPos, yPos, angle) {
    var ship = new Ship({ xPos: xPos, yPos: yPos, id: Utility.guidGenerator(), angle: angle });
    entities.push(ship);
    Physics.placeEntities([ship], world);
    return ship;
  };

  var addMissile = function (ship) {
    var missile = ship.fireMissile();
    missile.set({ id: Utility.guidGenerator() });
    entities.push(missile);
    Physics.placeEntities([missile], world);
  }

  var findEntityById = function (entityId) {
     var entity = _.find(entities, function (entity) {
        return entityId === entity.id;
      });
      return entity;
  }

  // todo: this does not yet find an UNOCCUPIED random space.
  // todo: sometimes this puts a ship in the walls.  fix.
  var findRandomUnoccupiedSpace = function () {
    var x = Math.floor((Math.random()*(Constants.physics.width /  Constants.physics.scale))+1),
        y = Math.floor((Math.random()*(Constants.physics.height / Constants.physics.scale))+1);
    return { x: x, y: y};
  }

  var generateShip = function () {
    var coords = findRandomUnoccupiedSpace(),
        angle  = Math.random() * 2 * Math.PI;
        ship   = addShip(coords.x, coords.y, angle);
    return ship;
  }

  var generateSnapshot = function () {
    var snapshot = {
      entities: []
    };
    _.each(entities, function (entity) {
      snapshot.entities.push(entity.getSnapshot());
    });
    return snapshot;
  }

  var destroyEntity = function (entity) {
    console.log('before destroying entity, entity count: ' + entities.length);
    entities = _.without(entities, entity);
    Physics.removeEntity(entity, world);
    console.log('destroyed entity from entities and world: ' + entity.id);
    console.log('entity count after destroy: ' + entities.length);
  }

  var socketDisconnected = function (data) {
    var ship = clients[data.socketId];
    if(_.isObject(ship)){
      destroyEntity(ship);
      broadcastSnapshot();
    }
  }

  return {
    initialize: initialize
  };

});
