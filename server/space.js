define(['common/constants', 'common/physics', 'underscore', 'common/entities/ship', 'mediator', 'common/utility'], function (Constants, Physics, _, Ship, Mediator, Utility) {
  var world,
      entities = [],
      mediator = new Mediator(),
      lastUpdateAt,
      frameTimes = [];

  var generateSpace = function () {
    world = Physics.generateWorld();
    initSubscribers();
    setInterval(update, 1000/60);
  }

  var update = function () {
    // Hz, Iteration, Position
    world.Step(1/60, 10, 10);
    world.ClearForces();
    updateEntities();
  };

  var storeFrameTime = function () {
    var dif,
        now = Date.now();
    if(_.isUndefined(lastUpdateAt)){
      lastUpdateAt = now;
      return;
    }else{
      dif = now - lastUpdateAt;
      lastUpdateAt = now;
      frameTimes.push(dif);
      if(frameTimes.length >= 120){
        frameTimes.shift();
      }
    }
  }

  var getAverageFrameTimes = function () {
    var total = _.reduce(frameTimes, function(memo, num){ return memo + num; }, 0);
    return total / frameTimes.length;
  }

  var updateEntities = function () {
    var response;
    _.each(entities, function(entity){
      response = entity.update();
      if(response.status == 'suicide'){
        console.log("killing: " + entity.id);
        destroyEntity(entity.id);
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
  var findRandomUnoccupiedSpace = function () {
    var x = Math.floor((Math.random()*(Constants.physics.width /  Constants.physics.scale))+1),
        y = Math.floor((Math.random()*(Constants.physics.height / Constants.physics.scale))+1);
    return { x: x, y: y};
  }

  var initSubscribers = function () {
    mediator.Subscribe("pilotControl", function ( data ) {
      var ship = findEntityById(data.shipId);
      // todo: handle ship not found
      // todo: this functionality should maybe be in the ship itself.
      console.log('ship-' + ship.id + " just tapped " + data.d);
      switch(data.d){
        case Constants.keystrokes.KEY_LEFT_ARROW:
          ship.accelerate.rotateLeft.call(ship);
          break;
        case Constants.keystrokes.KEY_RIGHT_ARROW:
          ship.accelerate.rotateRight.call(ship);
          break;
        case Constants.keystrokes.KEY_UP_ARROW:
          ship.accelerate.foreward.call(ship);
          break;
        case Constants.keystrokes.KEY_SPACE_BAR:
          console.log("adding missile!");
          addMissile(ship);
          break;
        default:
          console.log("don't know what to do with this valid key yet...")
      }
      mediator.Publish('broadcastSnapshot', {from: 'Space#pilotControl'});
    });
  }

  var generateShip = function () {
    var coords = findRandomUnoccupiedSpace(),
        angle  = Math.random() * 2 * Math.PI;
    return addShip(coords.x, coords.y, angle);
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

  var destroyEntity = function (entityId) {
    console.log('before destroying entity, entity count: ' + entities.length);
    var entity = findEntityById(entityId);
    if(_.isObject(entity)){
      entities = _.without(entities, entity);
      Physics.removeEntity(entity, world);
      console.log('destroyed entity from entities and world: ' + entity.id);
      console.log('entity count after destroy: ' + entities.length);
    }else{
      throw new Error('could not find entity in Space#destroyEntity');
    }
  }

  return {
    mediator: mediator,
    getAverageFrameTimes: getAverageFrameTimes,
    generateSpace: generateSpace,
    generateShip: generateShip,
    destroyEntity : destroyEntity,
    findEntityById: findEntityById,
    generateSnapshot: generateSnapshot
  };

});
