define(['core/physics', 'app/entities/ship', 'mediator'], function (Physics, Ship, Mediator) {
  // not sure where else to place this?
  // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
  window.requestAnimFrame = (function(){
        return  window.requestAnimationFrame       || 
                window.webkitRequestAnimationFrame || 
                window.mozRequestAnimationFrame    || 
                window.oRequestAnimationFrame      || 
                window.msRequestAnimationFrame     || 
                function(/* function */ callback, /* DOMElement */ element){
                  window.setTimeout(callback, 1000 / 60);
                };
  })();
  // todo: use single var syntax...
  
  var mediator = new Mediator();
  var world;
  var allEntities = [];
  var otherEntities = [];
  var selfShip; // holds the Self (Ship) entity
  var loopCallbacks = [];
  var update = function () {
    requestAnimFrame(update);
    world.Step(1/60, 10, 10);
    world.ClearForces();
    updateAllEntities();
    runLoopCallbacks();
  };

  var updateAllEntities = function () {
    $.each(allEntities, function(i, entity){
      entity.update();
    });
  };

  var runLoopCallbacks = function () {
    $.each(loopCallbacks, function (i, callback) {
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
    getAllEntities : function () { return allEntities; },
    getOtherEntities : function () { return otherEntities; },
    getSelfShip : function () { return selfShip; },
    pubsub : function () {
      console.log("hi from pubsub");
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
            break;
        }


      });
    },
    generateSpace : function () {
      world = Physics.generateWorld();
      this.pubsub();
      requestAnimFrame(update);
    },
    addSelfShip : function (name, xPos, yPos) {
      addShip(name, true, xPos, yPos);
    },
    addEnemy : function (name, xPos, yPos) {
      addShip(name, false, xPos, yPos);
    }

  };
});
