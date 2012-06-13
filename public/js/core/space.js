define(['core/physics', 'app/entities/ship', 'mediator', 'underscore'], function (Physics, Ship, Mediator, _) {
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

  var addShip = function (isSelfShip, xPos, yPos, angle) {
      var ship = new Ship({ xPos: xPos, yPos : yPos, angle: angle});
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
        case "left":
          selfShip.accelerate.rotateLeft.call(selfShip);
          break;
        case "right":
          selfShip.accelerate.rotateRight.call(selfShip);
          break;
        case "up":
          selfShip.accelerate.foreward.call(selfShip);
          break;
      }
    });
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
    generateSelfShip : function (xPos, yPos, angle) {
      if(typeof selfShip == 'undefined'){
        addShip(true, xPos, yPos, angle);
      }
    },
    requestSelfShip : function () {
      mediator.Publish('requestSelfShip');
    },
    addEnemy : function (xPos, yPos, angle) {
      addShip(false, xPos, yPos, angle);
    }

  };
});
