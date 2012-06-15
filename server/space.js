define(['common/constants', 'common/physics', 'underscore', 'common/entities/ship', 'mediator'], function (Constants, Physics, _, Ship, Mediator) {
  var world,
      entities = [],
      mediator = new Mediator();

  var update = function () {
    // Hz, Iteration, Position
    world.Step(1/60, 10, 10);
    world.ClearForces();
    updateEntities();
    setTimeout( update, 1000/60 );
  };

  var updateEntities = function () {
    _.each(entities, function(entity){
      entity.update();
    });
  };

  var addShip = function (xPos, yPos) {
    var ship = new Ship({ xPos: xPos, yPos: yPos, id: guidGenerator() });
    entities.push(ship);
    Physics.placeEntities([ship], world);
    return ship;
  };

  var findShipById = function (shipId) {
     var ship = _.find(entities, function (entity) {
        return shipId === entity.id;
      });
      return ship;
  }

  // todo: this does not yet find an UNOCCUPIED random space.
  var findRandomUnoccupiedSpace = function () {
    var x = Math.floor((Math.random()*(Constants.physics.width /  Constants.physics.scale))+1),
        y = Math.floor((Math.random()*(Constants.physics.height / Constants.physics.scale))+1);
    return { x: x, y: y};
  }

  var guidGenerator = function () {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
  }

  var initSubscribers = function () {
    mediator.Subscribe("pilotControl", function ( data ) {
      var ship = findShipById(data.shipId);
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
      }
      mediator.Publish('broadcastSnapshot', {from: 'Space#pilotControl'});
    });
  }

  return {
    mediator: mediator,
    generateSpace: function () {
      world = Physics.generateWorld();
      initSubscribers();
      update();
    },
    generateShip: function () {
      var coords = findRandomUnoccupiedSpace();
      var ship = addShip(coords.x, coords.y);
      return ship;
    },
    // remove from entities and from physics engine
    destroyShip : function (shipId) {
      console.log('before destroying ship, entitiy count: ' + entities.length);
      var ship = findShipById(shipId);
      entities = _.without(entities, ship);
      Physics.removeEntity(ship, world);
      console.log('destroyed ship from entities and world: ' + ship.id);
      console.log('entity count after destroy: ' + entities.length);
    },
    findShipById: findShipById,
    generateSnapshot: function (requester) {
      var snapshot = {
        ships : []
      };
      _.each(entities, function (entity) {
        if(entity.get('entityType') === 'Ship'){
          snapshot.ships.push(entity.getSnapshot());
        }else{
          console.log('unknown entity type in generateSnapshot! -- ' + entity.get('entityType'));
        }
      });
      return snapshot;
    }
  };

});
