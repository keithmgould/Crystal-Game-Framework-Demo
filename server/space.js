define(['app/constants', 'core/physics', 'underscore', 'app/entities/ship', 'mediator'], function (Constants, Physics, _, Ship, Mediator) {
  var world,
      entities = [],
      mediator = new Mediator();

  var update = function () {
    // Hz, Iteration, Position
    world.Step(1/60, 5, 2);
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
    var ship = new Ship({ xPos: xPos, yPos : yPos});
    entities.push(ship);
    Physics.placeEntities([ship], world);
    return ship;
  };

  var findShipById = function (shipId) {
     var ship = _.find(entities, function (entity) {
        return shipId === entity.cid;
      });
      return ship;
  }

  // todo: this does not yet find an UNOCCUPIED random space.
  var findRandomUnoccupiedSpace = function () {
    var x = Math.floor((Math.random()*(Constants.physics.width /  Constants.physics.scale))+1),
        y = Math.floor((Math.random()*(Constants.physics.height / Constants.physics.scale))+1);
    return { x: x, y: y};
  }

  var initSubscribers = function () {
    mediator.Subscribe("pilotControl", function ( data ) {
      var ship = findShipById(data.shipId);
      switch(data.keystroke)
      {
        case "left":
          ship.accelerate.rotateLeft.call(selfShip);
          break;
        case "right":
          ship.accelerate.rotateRight.call(selfShip);
          break;
        case "up":
          ship.accelerate.foreward.call(selfShip);
          break;
      }
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
    findShipById: findShipById,

    generateSnapshot: function (requester) {
    
    }
  };

});
