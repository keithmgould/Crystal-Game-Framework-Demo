define(['common/constants', 'common/entities/ship', 'underscore', 'crystal/common/api'], function (Constants, Ship, _, CrystalApi) {
  var entities = [],
      clients = {},
      broadcastSnapshotFlag = false;

  var initialize = function () {
    apiSubscribe();
    CrystalApi.Publish('generateWorld');
  }

  var apiSubscribe = function () {

    // COMMUNICATION API SUBSCRIPTIONS
    CrystalApi.Subscribe('messageFromClient:game', function (message) { handleMessage(message); });
    CrystalApi.Subscribe('socketDisconnected', function (data) { socketDisconnected(data); });

    // GAME LOOP API SUBSCRIPTIONS
    CrystalApi.Subscribe('update', function (data) {updateSpace(data);});
  }

  var broadcastSnapshot = function () {
    CrystalApi.Publish('broadcast', {target: 'crystal', type: 'snapshot', message: generateSnapshot()} );
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
        console.log("received unknown message type: " + data.type);
    }
  }

  var pilotControl = function (data) {
    var ship = clients[data.socketId];
    if(!_.isUndefined(ship)){
      ship.pilotControl(data.message.key);
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
      target: 'game',
      socketId: socketId,
      type: 'shipDelivery',
      message: ship.getSnapshot()
    };
    CrystalApi.Publish('messageToClient', response);
  }

  var updateSpace = function (data) {
    updateEntities();
    // receive 60 ticks / sec, 
    // so % 10 yields 6 broadcasts / sec
    if(data.tickCount % 10 === 0){
      broadcastSnapshot();
    }
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
    var ship = new Ship({ xPos: xPos, yPos: yPos, angle: angle });
    ship.set({id: ship.guidGenerator()}); // todo: handle via initializer inheritance
    entities.push(ship);
    CrystalApi.Publish("addEntity", ship);

    return ship;
  };

  var addMissile = function (ship) {
    var missile = ship.fireMissile();
    missile.set({ id: missile.guidGenerator() }); // todo: handle via initialize inheriteance
    entities.push(missile);
    CrystalApi.Publish("addEntity", missile);
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
    CrystalApi.Publish("removeEntity", entity);
    console.log('destroyed entity from entities and world: ' + entity.id);
    console.log('entity count after destroy: ' + entities.length);
  }

  var socketDisconnected = function (data) {
    var ship = clients[data.socketId];
    if(_.isObject(ship)){
      destroyEntity(ship);
    }
  }

  return {
    initialize: initialize
  };

});
