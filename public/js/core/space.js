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

  var addShip = function (name, isSelfShip, xPos, yPos) {
      var ship = new Ship({ xPos: xPos, yPos : yPos});
      ship.set({name : name});
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

  return {
    mediator : mediator,
    addToLoopCallbacks : function (scope, fn) {
      loopCallbacks.push({ scope : scope, fn : fn});
    },
    getWorld : function () { return world },
    getAllEntities : function () { return allEntities; },
    getOtherEntities : function () { return otherEntities; },
    getSelfShip : function () { return selfShip; },
    pubsub : function () {
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
    },
    generateSpace : function () {
      world = Physics.generateWorld();
      this.pubsub();
      //requestAnimFrame(update);
      update();
    },
    enableDebugDraw : function (context) {
      Physics.enableDebugDraw(world, context);
    },
    addSelfShip : function (name, xPos, yPos) {
      addShip(name, true, xPos, yPos);
    },
    addEnemy : function (name, xPos, yPos) {
      addShip(name, false, xPos, yPos);
    }

  };
});
